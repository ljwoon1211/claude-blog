# Project Setup

## 기술 스택 상세

### Core

- **Next.js 16**: App Router, Turbopack 기본, `proxy.ts` (구 middleware.ts)
- **React 19.2**: Server Components, use() hook, Actions
- **TypeScript**: strict 모드, `@/*` → `./src/*` 경로 별칭
- **pnpm**: 패키지 매니저

### Backend

- **oRPC**: 타입 안전 API (`app/rpc/[[...rest]]/route.ts`)
- **Drizzle ORM**: PostgreSQL 스키마, 마이그레이션
- **Supabase**: PostgreSQL, Auth, Storage
- **Upstash Redis**: Rate limiting, 캐싱
- **Inngest**: 백그라운드 작업, 이벤트 드리븐
- **Cloudflare R2**: 이미지/파일 스토리지

### Frontend

- **shadcn/ui**: 컴포넌트 라이브러리 (래핑하여 사용)
- **Tailwind CSS**: 스타일링
- **TanStack Query**: 서버 상태 관리
- **Zustand**: 클라이언트 상태 관리
- **react-hook-form + Zod**: 폼 관리
- **next-intl**: 다국어 (한국어 + 영어)
- **Pretendard**: 기본 폰트

### Testing

- **Vitest**: 단위/통합 테스트
- **React Testing Library**: 컴포넌트 테스트
- **MSW**: API 모킹
- **Playwright**: E2E 테스트
- **Sentry**: 에러 모니터링

### Deploy

- **Vercel**: Next.js 호스팅
- **Cloudflare**: R2, CDN

---

## 통합 폴더 구조

```
project-root/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # 홈
│   ├── about/page.tsx                # 소개
│   ├── portfolio/[slug]/page.tsx     # 포트폴리오 상세
│   ├── study/[slug]/page.tsx         # 스터디 상세
│   ├── login/page.tsx                # 로그인
│   ├── api/rpc/[[...orpc]]/route.ts  # oRPC 핸들러
│   ├── layout.tsx                    # 루트 레이아웃
│   └── providers.tsx                 # 전역 프로바이더
│
├── src/
│   ├── app/                          # Next.js App Router 페이지
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   └── ...                       # 라우트별 page/loading/error
│   │
│   ├── features/                     # 기능 중심 프론트엔드
│   │   ├── auth/
│   │   │   ├── components/login-form.tsx
│   │   │   ├── hooks/use-login.ts
│   │   │   └── schemas/login.schema.ts
│   │   ├── post/
│   │   │   ├── components/           # post-card, post-editor, editor-toolbar 등
│   │   │   ├── hooks/               # use-auto-save, use-editor-setup
│   │   │   └── lib/extensions.ts
│   │   └── home/
│   │       └── components/           # hero-section, recent-posts-section
│   │
│   ├── shared/                       # 공유
│   │   ├── api/                      # oRPC 클라이언트 (orpc.ts, orpc.server.ts)
│   │   ├── ui/                       # shadcn/ui 래핑 컴포넌트
│   │   ├── lib/                      # 유틸리티 함수
│   │   ├── layout/                   # Header, Footer, MobileNav
│   │   └── db/schema.ts             # Drizzle 스키마
│   │
│   ├── domains/                      # 백엔드 도메인 (플랫 구조)
│   │   ├── post/
│   │   │   ├── types.ts             # 엔티티, DTO, Repository 인터페이스
│   │   │   ├── repository.ts        # Drizzle 구현체 + 매퍼
│   │   │   ├── slug.ts              # 슬러그 값 객체
│   │   │   └── use-cases/           # create, update, delete, list, get-by-slug
│   │   ├── image/
│   │   │   ├── types.ts
│   │   │   ├── repository.ts
│   │   │   ├── storage.ts           # R2 스토리지 연동
│   │   │   └── use-cases/           # presign, confirm, delete, sync
│   │   └── tag/
│   │       ├── types.ts
│   │       ├── repository.ts
│   │       └── use-cases/list-tags.ts
│   │
│   ├── server/                       # 서버 공통
│   │   ├── orpc/
│   │   │   ├── index.ts
│   │   │   ├── base.ts
│   │   │   ├── context.ts
│   │   │   ├── middleware.ts         # 인증 미들웨어
│   │   │   └── routers/             # auth, post, tag, upload
│   │   └── db/index.ts              # DB 커넥션
│   │
│   ├── proxy.ts                      # Next.js 16 프록시 (구 middleware.ts)
│   └── messages/                     # i18n 메시지 (ko.json, en.json)
│
├── docs/                             # 프로젝트 문서
│   └── plans/
│       ├── active/                   # 진행 중 기능 계획
│       └── completed/                # 완료된 기능 계획
│
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── .env.local                        # 환경변수 (Git 제외)
└── .env.example                      # 환경변수 템플릿
```

---

## 환경변수 템플릿

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
NEXT_PUBLIC_R2_PUBLIC_URL=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 개발 워크플로우

### 초기 세팅

```bash
pnpm install
cp .env.example .env.local    # 환경변수 설정
pnpm db:migrate               # DB 마이그레이션
pnpm dev                      # 개발 서버 시작
```

### 작업 프로세스

1. `docs/plans/active/{feature}.md`에 기능 계획 작성
2. `docs/plans/completed/` 확인하여 기존 구현과 충돌 방지
3. 백엔드(types → repository → use-cases → oRPC) → 프론트엔드(shared → features) 순서로 구현
4. 테스트 작성 및 검증
5. 완료 시: `active/` → `completed/`로 이동, CHANGELOG.md 업데이트
