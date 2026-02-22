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
src/server/orpc/routers/
├── index.ts          # appRouter (모든 라우터 합성)
├── post.ts           # 포스트 관련 프로시저
├── user.ts           # 사용자 관련 프로시저
└── comment.ts        # 댓글 관련 프로시저
```

라우터는 plain JS 객체로 구성:

```ts
import { z } from 'zod';

import { GetPostsUseCase } from '@/domains/post/application/get-posts';

import { os } from '../orpc-setup';

export const postRouter = {
  list: os
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().default(10),
      }),
    )
    .handler(async ({ input, context }) => {
      const useCase = new GetPostsUseCase(/* inject repo */);
      return useCase.execute(input);
    }),

  getBySlug: os
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input, context }) => {
      // DDD 유스케이스 호출
    }),
};
```

### 미들웨어

```
src/server/orpc/middleware/
├── auth.ts           # 인증 확인
├── rate-limit.ts     # Upstash rate limiting
└── logging.ts        # 요청 로깅
```

```ts
import { os } from '../orpc-setup';

export const authMiddleware = os.middleware(async ({ context, next }) => {
  const session = await getSession(context.request);
  if (!session) throw new Error('Unauthorized');
  return next({ context: { ...context, session } });
});

// 인증 필요한 프로시저에 적용
export const protectedProcedure = os.use(authMiddleware);
```

---

## DDD 도메인 구조

```
src/domains/{domain}/
├── domain/               # 핵심 비즈니스 로직
│   ├── entities/         # 엔티티 (Post, User)
│   ├── value-objects/    # 값 객체 (Slug, Email)
│   ├── repositories/     # 저장소 인터페이스
│   └── events/           # 도메인 이벤트
│
├── application/          # 애플리케이션 서비스
│   ├── use-cases/        # 유스케이스 (CreatePost, GetPosts)
│   ├── commands/         # 커맨드 (입력 DTO)
│   └── queries/          # 쿼리 (조회 DTO)
│
└── infrastructure/       # 기술 구현
    ├── repositories/     # Drizzle 저장소 구현체
    └── mappers/          # 엔티티 ↔ DB 매핑
```

### 레이어 규칙

| 레이어             | 참조 가능              | 참조 금지                                    |
| ------------------ | ---------------------- | -------------------------------------------- |
| **domain**         | 없음 (순수 TypeScript) | application, infrastructure, 외부 라이브러리 |
| **application**    | domain                 | infrastructure, 외부 라이브러리              |
| **infrastructure** | domain, application    | -                                            |

### 예시: Post 도메인

```ts
// domain/entities/post.ts — 순수 TypeScript, 외부 의존 없음
export class Post {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly slug: Slug,
    public readonly content: string,
    public readonly status: PostStatus,
    public readonly createdAt: Date,
  ) {}

  publish(): Post {
    if (this.status !== 'draft')
      throw new Error('Only draft posts can be published');
    return new Post(
      this.id,
      this.title,
      this.slug,
      this.content,
      'published',
      this.createdAt,
    );
  }
}

// domain/repositories/post-repository.ts — 인터페이스만 정의
export interface PostRepository {
  findBySlug(slug: Slug): Promise<Post | null>;
  findAll(options: { cursor?: string; limit: number }): Promise<Post[]>;
  save(post: Post): Promise<void>;
}

// application/use-cases/create-post.ts — domain만 참조
export class CreatePostUseCase {
  constructor(private readonly postRepo: PostRepository) {}

  async execute(command: CreatePostCommand): Promise<Post> {
    const slug = Slug.create(command.title);
    const post = new Post(
      generateId(),
      command.title,
      slug,
      command.content,
      'draft',
      new Date(),
    );
    await this.postRepo.save(post);
    return post;
  }
}

// infrastructure/repositories/drizzle-post-repository.ts — Drizzle 구현체
export class DrizzlePostRepository implements PostRepository {
  constructor(private readonly db: DrizzleDB) {}

  async findBySlug(slug: Slug): Promise<Post | null> {
    const row = await this.db.query.posts.findFirst({
      where: eq(posts.slug, slug.value),
    });
    return row ? PostMapper.toDomain(row) : null;
  }
}
```

---

## Drizzle ORM + Supabase

### 설정

```
src/server/db/
├── index.ts          # DB 커넥션 (drizzle + postgres)
├── schema/           # 테이블 스키마
│   ├── posts.ts
│   ├── users.ts
│   └── comments.ts
└── migrations/       # 자동 생성 마이그레이션
```

### 스키마 정의

```ts
// src/server/db/schema/posts.ts
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
