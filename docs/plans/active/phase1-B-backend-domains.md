# Phase 1-B: 백엔드 도메인 (DDD + oRPC)

## 개요

Post, Tag, Image 도메인을 DDD 구조(Type + 순수 함수 기반)로 구현하고, oRPC 라우터를 통해 API를 노출한다.
게시글 CRUD, 태그 시스템, 이미지 업로드/삭제, 슬러그 리다이렉트를 포함한다.

## 선행 조건

- [x] Phase 1-A: 백엔드 인프라 기반 (DB 커넥션, Context, auth 미들웨어)

---

## 작업 내용

### 1. Post 도메인 (WBS #3: 게시글 CRUD API)

**디렉토리 구조:**

```
src/domains/post/
├── domain/
│   ├── entities/post.ts          # Post, CreatePostInput, UpdatePostInput 타입
│   ├── value-objects/slug.ts     # slugify 함수 (한글 지원)
│   └── repositories/post-repository.ts  # PostRepository interface
├── application/
│   └── use-cases/
│       ├── create-post.ts        # 게시글 생성 + 태그 연결 + 이미지 postId 연결
│       ├── update-post.ts        # 수정 + 슬러그 변경 감지 → redirect 저장 + 이미지 diff 정리
│       ├── delete-post.ts        # 삭제 + 연결된 이미지 R2 삭제
│       ├── get-post-by-slug.ts   # 조회 + slug_redirects 체크
│       └── list-posts.ts         # 목록 (cursor 페이지네이션 + 태그 필터 + 검색)
└── infrastructure/
    ├── repositories/drizzle-post-repository.ts
    └── mappers/post-mapper.ts
```

**DDD 스타일 (Type + 순수 함수):**

```ts
// domain/entities/post.ts — 순수 TypeScript, 외부 의존 없음
export type Post = {
  id: string;
  title: string;
  slug: string;
  content: unknown; // tiptap JSON
  category: 'portfolio' | 'study' | 'retrospective' | 'page';
  thumbnail: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  tags: Tag[];
};

export type CreatePostInput = {
  title: string;
  content: unknown;
  category: Post['category'];
  tags: string[];
  published: boolean;
  thumbnail?: string;
};

// domain/value-objects/slug.ts
export function createSlug(title: string): string {
  /* 한글 지원 slugify */
}
export function isValidSlug(slug: string): boolean {
  /* 검증 */
}
```

**oRPC 라우터**: `src/server/orpc/routers/post.ts`

| 프로시저         | 입력                                                             | 인증               | 핵심 로직                                                                    |
| ---------------- | ---------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `post.list`      | `{ category, tag?, q?, cursor?, limit? }`                        | 공개               | cursor 기반 페이지네이션 (createdAt+id), ilike 검색, 태그 JOIN 필터          |
| `post.getBySlug` | `{ slug }`                                                       | 공개               | posts 조회 → 없으면 slug_redirects 조회 → `{ redirect: true, newSlug }` 반환 |
| `post.create`    | `{ title, content, category, tags[], published, thumbnail? }`    | protectedProcedure | 슬러그 자동생성, 태그 upsert, 이미지 postId 연결                             |
| `post.update`    | `{ id, title?, content?, slug?, tags?, published?, thumbnail? }` | protectedProcedure | 슬러그 변경 시 redirect 생성, 이미지 diff 정리                               |
| `post.delete`    | `{ id }`                                                         | protectedProcedure | CASCADE 삭제 + 이미지 R2 삭제                                                |

**Cursor 페이지네이션:**

- 커서: `{ createdAt: string, id: string }` (ISO 날짜 + UUID)
- 정렬: 최신순 `desc(createdAt), desc(id)`
- WHERE: `or(lt(createdAt, cursor.createdAt), and(eq(createdAt, cursor.createdAt), lt(id, cursor.id)))`
- 응답: `{ posts[], nextCursor: { createdAt, id } | null }`

**슬러그 리다이렉트:**

- `update-post`: slug 변경 감지 → `slug_redirects` INSERT (oldSlug → postId)
- `get-post-by-slug`: posts 조회 실패 → slug_redirects에서 oldSlug 검색 → `{ redirect: true, slug: currentSlug }` 반환

### 2. Tag 도메인 (WBS #4: 태그 시스템 API)

**디렉토리 구조:**

```
src/domains/tag/
├── domain/
│   ├── entities/tag.ts           # Tag 타입
│   └── repositories/tag-repository.ts
├── application/
│   └── use-cases/list-tags.ts    # 카테고리별 태그 + postCount 집계
└── infrastructure/
    └── repositories/drizzle-tag-repository.ts
```

**oRPC 라우터**: `src/server/orpc/routers/tag.ts`

| 프로시저   | 입력            | 인증 | 핵심 로직                                                       |
| ---------- | --------------- | ---- | --------------------------------------------------------------- |
| `tag.list` | `{ category? }` | 공개 | 카테고리 필터 시 해당 카테고리 게시글의 태그만 + COUNT(\*) 집계 |

- 태그 생성은 별도 API 없음 → `post.create`/`post.update` 시 자동 upsert
- 태그 upsert: `INSERT ... ON CONFLICT(name) DO NOTHING` + SELECT

### 3. Image 도메인 (WBS #5: 이미지 업로드/삭제 API)

**디렉토리 구조:**

```
src/domains/image/
├── domain/
│   ├── entities/image.ts         # Image 타입, UploadConstraints
│   └── repositories/image-repository.ts
├── application/
│   └── use-cases/
│       ├── upload-images.ts      # 파일 검증 → R2 업로드 → DB 저장 (postId: null)
│       ├── delete-image.ts       # R2 삭제 → DB 삭제
│       └── sync-post-images.ts   # 게시글 content에서 이미지 URL 추출 → DB 비교 → 미사용 삭제
└── infrastructure/
    ├── repositories/drizzle-image-repository.ts
    └── storage/r2-storage.ts     # Cloudflare R2 S3 호환 클라이언트
```

**oRPC 라우터**: `src/server/orpc/routers/upload.ts`

| 프로시저        | 입력                 | 인증               | 핵심 로직                                                |
| --------------- | -------------------- | ------------------ | -------------------------------------------------------- |
| `upload.image`  | `FormData (files[])` | protectedProcedure | 파일 검증 (10MB, jpg/png/webp/gif) → R2 업로드 → DB 저장 |
| `upload.delete` | `{ imageId }`        | protectedProcedure | DB에서 key 조회 → R2 삭제 → DB 삭제                      |

**R2 연동** (`@aws-sdk/client-s3` 사용):

```ts
// infrastructure/storage/r2-storage.ts
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

**이미지 라이프사이클:**

- 업로드 시: `postId: null`로 DB 저장
- 게시글 저장 시: content JSON에서 이미지 URL 추출 → 해당 이미지의 `postId` 연결
- 게시글 수정 시: content에서 제거된 이미지 → R2 + DB 삭제
- 게시글 삭제 시: 연결된 모든 이미지 R2 + DB 삭제

### 4. appRouter 통합

**파일**: `src/server/orpc/index.ts`

```ts
export const appRouter = os.router({
  auth: authRouter,
  post: postRouter,
  tag: tagRouter,
  upload: uploadRouter,
});
```

---

## 신규 의존성

| 패키지                     | 용도                             |
| -------------------------- | -------------------------------- |
| `@aws-sdk/client-s3`       | Cloudflare R2 S3 호환 클라이언트 |
| `slugify` (또는 직접 구현) | 한글 지원 슬러그 생성            |

## 환경변수 (R2)

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

## 수정/생성 대상 파일

| 파일                                | 작업                         |
| ----------------------------------- | ---------------------------- |
| `src/domains/post/**`               | 신규 - Post DDD 도메인 전체  |
| `src/domains/tag/**`                | 신규 - Tag DDD 도메인 전체   |
| `src/domains/image/**`              | 신규 - Image DDD 도메인 전체 |
| `src/server/orpc/routers/post.ts`   | 신규 - Post oRPC 라우터      |
| `src/server/orpc/routers/tag.ts`    | 신규 - Tag oRPC 라우터       |
| `src/server/orpc/routers/upload.ts` | 신규 - Upload oRPC 라우터    |
| `src/server/orpc/index.ts`          | 수정 - 라우터 통합           |

## 검증

- `pnpm typecheck` 통과
- `pnpm lint` 통과
- Drizzle Studio에서 데이터 CRUD 확인
- post.list: 빈 목록 반환 확인
- post.create → post.getBySlug 플로우 확인
- post.update로 slug 변경 → 이전 slug로 getBySlug → redirect 정보 확인
- upload.image → R2에 파일 저장 확인
- upload.delete → R2에서 파일 삭제 확인
- tag.list → 카테고리별 태그 목록 + count 확인
