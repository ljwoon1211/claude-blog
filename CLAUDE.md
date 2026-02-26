# Dev Blog - Development Guide

> 개발 블로그 프로젝트
> Quick Start: `pnpm dev` → http://localhost:3000

---

## 문서 구조

### Agents (역할별 가이드)

| 문서                                                           | 설명                          | 핵심 키워드                        |
| -------------------------------------------------------------- | ----------------------------- | ---------------------------------- |
| [planning](.claude/agents/planning.md)                         | 기능 기획, 요구사항 분석, PRD | 스토리, WBS, 우선순위              |
| [frontend-development](.claude/agents/frontend-development.md) | FSD 구조, 컴포넌트, 상태관리  | shadcn/ui, Zustand, TanStack Query |
| [backend-api](.claude/agents/backend-api.md)                   | oRPC, DDD, 인프라 통합        | Drizzle, Supabase, Inngest         |
| [quality-testing](.claude/agents/quality-testing.md)           | 테스트 전략, 모니터링         | Vitest, Playwright, Sentry         |

### Skills (규칙 및 설정)

| 문서                                                   | 설명                           | 핵심 키워드                |
| ------------------------------------------------------ | ------------------------------ | -------------------------- |
| [code-conventions](.claude/skills/code-conventions.md) | 코딩 규칙, Git, 보안           | ESLint, 명명규칙, 금지사항 |
| [project-setup](.claude/skills/project-setup.md)       | 기술 스택, 폴더 구조, 환경변수 | FSD+DDD, pnpm, .env        |

---

## Tech Stack Overview

| 영역         | 기술                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| **Core**     | Next.js 16 + React 19 + TypeScript (strict) + pnpm                      |
| **Backend**  | oRPC + Drizzle ORM + Supabase + Upstash Redis + Inngest + Cloudflare R2 |
| **Frontend** | shadcn/ui + Tailwind CSS + TanStack Query + Zustand + next-intl         |
| **Testing**  | Vitest + Playwright + MSW                                               |
| **Deploy**   | Vercel + Cloudflare                                                     |

---

## Critical Rules

> 하위 문서를 읽지 않아도 반드시 지켜야 할 규칙

### 아키텍처 의존 방향

```
FSD (프론트엔드): app → pages → widgets → features → entities → shared
DDD (백엔드):    domain(순수 TS, 외부 의존 금지) ← application ← infrastructure
```

- 같은 FSD 레이어의 슬라이스 간 cross-import 금지
- 모든 슬라이스는 `index.ts` (public API)를 통해서만 외부 노출

### 이름 충돌 주의

| 경로                             | 역할                                       | 혼동 금지           |
| -------------------------------- | ------------------------------------------ | ------------------- |
| `app/`                           | Next.js App Router (라우팅, layout, route) | `src/app/`과 다름   |
| `src/app/`                       | FSD app 레이어 (providers, styles, store)  | `app/`과 다름       |
| `src/entities/`                  | FSD — 도메인 UI 표현 (PostCard 등)         | DDD entities와 다름 |
| `src/domains/*/domain/entities/` | DDD — 비즈니스 엔티티 (순수 TS)            | FSD entities와 다름 |

### 작업 프로세스 (필수)

- 모든 작업(기능 개발, 환경설정, 리팩토링 등)은 `docs/plans/active/{task}.md`에 계획 문서를 먼저 작성한 후 진행
- 완료 시 `docs/plans/active/` → `docs/plans/completed/`로 이동

### 금지 사항

- `any` 타입 → `unknown` + 타입 가드
- `console.log` 커밋 → 로거 또는 Sentry
- Server Actions → oRPC 프로시저만 사용
- Zod 검증 없는 API 입력 → `.input(schema)` 필수
- shadcn/ui 기본 컴포넌트 직접 수정 → `src/shared/ui/`에 래핑
- 하드코딩 문자열 (UI 텍스트) → next-intl 메시지 키
- raw SQL → Drizzle ORM 파라미터화 쿼리
- 구조분해할당이나 전개 연산자(Spread)를 이용한 복잡한 객체 복사 → `immer` 사용

### 구현 순서 원칙

```
백엔드 먼저: domain → application → infrastructure → oRPC 라우터
프론트 이후: entities → features → widgets → pages
```

### oRPC 사용처 구분

| 용도                     | 파일                            | API                            |
| ------------------------ | ------------------------------- | ------------------------------ |
| 서버 핸들러              | `app/rpc/[[...rest]]/route.ts`  | `RPCHandler`                   |
| 브라우저 클라이언트      | `src/shared/api/orpc.ts`        | `RPCLink` + `createORPCClient` |
| 서버 컴포넌트 클라이언트 | `src/shared/api/orpc.server.ts` | `createRouterClient`           |

### Next.js 16 주의사항

- **`proxy.ts`**: `middleware.ts` 대신 사용 (Next.js 16 변경)
- **Turbopack**: 기본 번들러 (webpack 플러그인 호환성 확인 필요)
- **`use cache`**: 새로운 캐싱 디렉티브 (기존 fetch 캐싱 방식 변경)
- **Server Component 기본**: 모든 컴포넌트는 기본 SC, `'use client'`는 최소 범위에만

---

## Common Workflows

### 새 기능 기획

1. [planning.md](.claude/agents/planning.md) 참고하여 `docs/plans/active/{feature}.md` 작성
2. `docs/plans/completed/` 확인하여 중복/충돌 방지
3. PRD 템플릿에 따라 요구사항 정리

### UI 컴포넌트 추가

1. [frontend-development.md](.claude/agents/frontend-development.md)에서 FSD 레이어 확인
2. shadcn/ui 기반으로 `src/shared/ui/`에 래핑 컴포넌트 생성
3. 해당 FSD 레이어 슬라이스에 조합

### API 엔드포인트 추가

1. [backend-api.md](.claude/agents/backend-api.md)에서 oRPC 패턴 확인
2. DDD 도메인 구조에 따라 유스케이스 → 라우터 → 프로시저 순서로 구현
3. Zod 스키마로 입출력 검증

### 블로그 포스트 기능

1. 도메인: `src/domains/post/` (DDD 구조)
2. API: `src/server/orpc/routers/post.ts` (oRPC 프로시저)
3. UI: `src/entities/post/`, `src/features/post-*/`, `src/widgets/post-feed/`

---

## Quick Commands

```bash
# 개발
pnpm dev              # 개발 서버 (Turbopack)
pnpm build            # 프로덕션 빌드
pnpm lint             # ESLint
pnpm typecheck        # TypeScript 타입 체크

# 테스트
pnpm test             # Vitest 단위 테스트
pnpm test:e2e         # Playwright E2E 테스트

# DB
pnpm db:generate      # Drizzle 마이그레이션 생성
pnpm db:migrate       # 마이그레이션 적용
pnpm db:studio        # Drizzle Studio

# 코드 생성
pnpm ui:add           # shadcn/ui 컴포넌트 추가
```

---

## Finding Information

| 찾고 싶은 것         | 참고 문서                                                         |
| -------------------- | ----------------------------------------------------------------- |
| 폴더 구조, 환경변수  | [project-setup.md](.claude/skills/project-setup.md)               |
| 명명 규칙, 금지 사항 | [code-conventions.md](.claude/skills/code-conventions.md)         |
| oRPC 엔드포인트 패턴 | [backend-api.md](.claude/agents/backend-api.md)                   |
| 컴포넌트 작성법, FSD | [frontend-development.md](.claude/agents/frontend-development.md) |
| 테스트 작성법        | [quality-testing.md](.claude/agents/quality-testing.md)           |
| 기능 기획 프로세스   | [planning.md](.claude/agents/planning.md)                         |
| 기능 계획 문서       | `docs/plans/active/` 또는 `docs/plans/completed/`                 |
