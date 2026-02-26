# Phase 1-A: 백엔드 인프라 기반

## 개요

모든 백엔드 도메인 작업의 전제 조건이 되는 인프라를 구성한다.
DB 커넥션 활성화, oRPC Context 확장, auth 미들웨어, 서버 컴포넌트용 클라이언트를 설정한다.

## 선행 조건

- [x] Phase 1-1: DB 스키마 설계 및 마이그레이션 (완료)
- [x] Phase 1-2: 어드민 인증 + /login 페이지 (완료)

---

## 작업 내용

### 1. DB 커넥션 활성화

**파일**: `src/server/db/index.ts`

- 현재 주석 처리된 코드를 활성화 + 수정
- Drizzle 인스턴스에 schema 전달 (relational queries 활용)
- `DB` 타입 export

```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '@/shared/db/schema';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
export type DB = typeof db;
```

### 2. Drizzle Relations 정의

**파일**: `src/shared/db/schema.ts`

- `relations()` 함수로 테이블 간 관계 정의
- posts ↔ postTags (one-to-many)
- posts ↔ images (one-to-many)
- posts ↔ slugRedirects (one-to-many)
- tags ↔ postTags (one-to-many)
- postTags → posts, tags (many-to-one)

### 3. oRPC Context 확장

**파일**: `src/server/orpc/context.ts`

- Context 타입에 `db`, `headers` 추가
- `createContext(request: Request)` 형태로 변경

```ts
export type Context = {
  db: DB;
  headers: Headers;
};

export function createContext(request: Request): Context {
  return {
    db,
    headers: request.headers,
  };
}
```

**파일**: `src/app/api/rpc/[[...orpc]]/route.ts`

- 각 HTTP 메서드 핸들러에서 `createContext(request)` 전달

### 4. auth 미들웨어 + protectedProcedure

**파일**: `src/server/orpc/middleware/auth.ts`

- oRPC 미들웨어 패턴:
  - Supabase `createClient()` → `getUser()` 호출
  - 세션 없으면 `ORPCError('UNAUTHORIZED')` throw
  - 성공 시 `next({ context: { ...context, user } })`
- `protectedProcedure` export

```ts
import { ORPCError } from '@orpc/server';

import { createClient } from '@/shared/lib/supabase/server';

import { os } from '../index';

export const authMiddleware = os.middleware(async ({ context, next }) => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ORPCError('UNAUTHORIZED', {
      message: '인증이 필요합니다.',
    });
  }

  return next({
    context: { ...context, user },
  });
});

export const protectedProcedure = os.use(authMiddleware);
```

### 5. 서버 컴포넌트용 oRPC 클라이언트

**파일**: `src/shared/api/orpc.server.ts` (신규)

- `createRouterClient` 활용
- Server Component에서 직접 oRPC 프로시저 호출 가능

```ts
import { createRouterClient } from '@orpc/server';

import { appRouter } from '@/server/orpc';
import { createContext } from '@/server/orpc/context';

export const serverOrpc = createRouterClient(appRouter, {
  context: createContext,
});
```

---

## 수정 대상 파일 목록

| 파일                                   | 작업                                  |
| -------------------------------------- | ------------------------------------- |
| `src/server/db/index.ts`               | 주석 해제 + schema 연동               |
| `src/shared/db/schema.ts`              | relations 정의 추가                   |
| `src/server/orpc/context.ts`           | Context 타입 확장, createContext 수정 |
| `src/server/orpc/index.ts`             | os.$context 타입 확인                 |
| `src/app/api/rpc/[[...orpc]]/route.ts` | createContext(request) 전달           |
| `src/server/orpc/middleware/auth.ts`   | 신규 - auth 미들웨어                  |
| `src/shared/api/orpc.server.ts`        | 신규 - 서버 컴포넌트 클라이언트       |

## 검증

- `pnpm typecheck` 통과
- `pnpm lint` 통과
- DB 커넥션: Drizzle Studio (`pnpm db:studio`)에서 테이블 조회 확인
- oRPC Context: 기존 `auth.login` 프로시저가 정상 동작하는지 확인
- auth 미들웨어: 비인증 상태에서 protected 엔드포인트 호출 시 UNAUTHORIZED 에러 확인
