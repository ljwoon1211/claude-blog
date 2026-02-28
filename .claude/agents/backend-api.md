# Backend API Guide

## oRPC 구조

### 서버 핸들러

```
app/rpc/[[...rest]]/route.ts
```

```ts
import { RPCHandler } from '@orpc/server/fetch';

import { appRouter } from '@/server/orpc/routers';

const handler = new RPCHandler(appRouter);

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: '/rpc',
    context: {
      /* request context */
    },
  });
  return response ?? new Response('Not Found', { status: 404 });
}

export { handleRequest as GET, handleRequest as POST };
```

### 클라이언트 (브라우저)

```
src/shared/api/orpc.ts
```

```ts
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';

import type { AppRouter } from '@/server/orpc/routers';

const link = new RPCLink({
  url: '/rpc',
});

export const orpc = createORPCClient<AppRouter>(link);
```

### 서버 클라이언트 (Server Component / Route Handler)

```
src/shared/api/orpc.server.ts
```

```ts
import { createRouterClient } from '@orpc/server';

import { appRouter } from '@/server/orpc/routers';

export const serverOrpc = createRouterClient(appRouter, {
  context: {
    /* server-side context */
  },
});
```

### 라우터 구조

```
src/server/orpc/
├── index.ts          # appRouter (모든 라우터 합성)
├── base.ts           # oRPC 설정 (os)
├── context.ts        # 요청 컨텍스트 타입
├── middleware.ts      # 인증 미들웨어 (protectedProcedure)
└── routers/
    ├── auth.ts       # 인증 프로시저
    ├── post.ts       # 포스트 프로시저
    ├── tag.ts        # 태그 프로시저
    └── upload.ts     # 이미지 업로드 프로시저
```

라우터 예시:

```ts
import { z } from 'zod';

import { DrizzlePostRepository } from '@/domains/post/repository';
import { listPosts } from '@/domains/post/use-cases/list-posts';

import { os } from '../base';

export const postRouter = os.router({
  list: os
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().default(10),
      }),
    )
    .handler(async ({ input, context }) => {
      const repo = new DrizzlePostRepository(context.db);
      return listPosts(repo, input);
    }),
});
```

### 미들웨어

```
src/server/orpc/middleware.ts
```

```ts
import { os } from './base';

export const authMiddleware = os.middleware(async ({ context, next }) => {
  const session = await getSession(context.request);
  if (!session) throw new Error('Unauthorized');
  return next({ context: { ...context, session } });
});

// 인증 필요한 프로시저에 적용
export const protectedProcedure = os.use(authMiddleware);
```

---

## 도메인 구조 (플랫)

```
src/domains/{domain}/
├── types.ts          # 타입, 인터페이스 (엔티티, DTO, Repository 인터페이스)
├── repository.ts     # Drizzle 저장소 구현체 (+ toDomain 매퍼 내장)
├── slug.ts           # 값 객체 (post 도메인 예시)
├── storage.ts        # 외부 스토리지 연동 (image 도메인 예시)
└── use-cases/        # 유스케이스 (비즈니스 로직)
    ├── create-post.ts
    ├── update-post.ts
    └── list-posts.ts
```

### 파일별 역할

| 파일              | 역할                                    | 의존 규칙                         |
| ----------------- | --------------------------------------- | --------------------------------- |
| **types.ts**      | 엔티티 타입, DTO, Repository 인터페이스 | 순수 TS, 외부 의존 없음           |
| **repository.ts** | Drizzle 구현체 + DB↔도메인 매퍼         | types.ts + Drizzle 참조           |
| **use-cases/**    | 비즈니스 로직 (함수형)                  | types.ts만 참조 (repository 주입) |
| **slug.ts 등**    | 값 객체, 유틸리티                       | 순수 TS                           |
| **storage.ts**    | 외부 서비스 연동 (R2 등)                | 환경변수 + SDK                    |

### 구현 순서

```
types.ts → repository.ts → use-cases/ → oRPC 라우터
```

### 예시: Post 도메인

```ts
// domains/post/repository.ts — Drizzle 구현체
import { createSlug } from '../slug';
// domains/post/use-cases/create-post.ts — types만 참조, repo는 주입
import type { CreatePostInput, Post, PostRepository } from '../types';
import type { Post, PostRepository } from './types';

// domains/post/types.ts — 순수 TypeScript
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  category: PostCategory;
  published: boolean;
  createdAt: Date;
}

export interface PostRepository {
  findBySlug(slug: string): Promise<Post | null>;
  findAll(options: ListPostsOptions): Promise<ListPostsResult>;
  create(input: CreatePostInput): Promise<Post>;
}

function toDomain(row: typeof posts.$inferSelect): Post {
  return { id: row.id, title: row.title /* ... */ };
}

export class DrizzlePostRepository implements PostRepository {
  constructor(private readonly db: DrizzleDB) {}

  async findBySlug(slug: string): Promise<Post | null> {
    const row = await this.db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    });
    return row ? toDomain(row) : null;
  }
}

export async function createPost(
  repo: PostRepository,
  input: CreatePostInput,
  authorId: string,
): Promise<Post> {
  const slug = createSlug(input.title);
  return repo.create({ ...input, slug, authorId });
}
```

---

## Drizzle ORM + Supabase

### 설정

```
src/shared/db/schema.ts    # 테이블 스키마 (단일 파일)
src/server/db/index.ts     # DB 커넥션
```

### 스키마 정의

```ts
// src/shared/db/schema.ts
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### 마이그레이션 명령어

```bash
pnpm db:generate      # 스키마 변경 → 마이그레이션 파일 생성
pnpm db:migrate       # 마이그레이션 적용
pnpm db:studio        # Drizzle Studio (DB 브라우저)
```

---

## 인프라 통합

### Inngest (백그라운드 작업)

- 이벤트 드리븐 아키텍처
- 포스트 발행 시 알림 전송, 이미지 최적화 등
- 트랜잭션 실패 시 자동 롤백/재시도

### Upstash Redis (캐싱 / Rate Limiting)

- API rate limiting (미들웨어)
- 인기 포스트 캐싱
- 세션 스토어

### Cloudflare R2 (파일 스토리지)

- 이미지/파일 업로드
- presigned URL 방식
- CDN을 통한 퍼블릭 접근
