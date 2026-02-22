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
│   ├── (blog)/                       # 블로그 라우트 그룹
│   │   ├── page.tsx                  # 홈
│   │   └── posts/[slug]/page.tsx     # 포스트 상세
│   ├── (admin)/                      # 관리자 라우트 그룹
│   ├── rpc/[[...rest]]/route.ts      # oRPC 핸들러
│   ├── api/                          # 기타 API Routes (업로드 등)
│   ├── layout.tsx                    # 루트 레이아웃
│   └── proxy.ts                      # Next.js 16 미들웨어 (구 middleware.ts)
│
├── src/
│   ├── app/                          # FSD: 전역 설정
│   │   ├── providers/                # QueryClientProvider, ThemeProvider 등
│   │   ├── styles/                   # 전역 CSS, 테마
│   │   └── store/                    # 전역 Zustand 스토어
│   │
│   ├── pages/                        # FSD: 페이지 컴포지션
│   │   └── home/                     # 홈 페이지 조합 로직
│   │
│   ├── widgets/                      # FSD: 복합 UI 블록
│   │   ├── header/                   # 헤더
│   │   ├── footer/                   # 푸터
│   │   └── post-feed/                # 포스트 피드
│   │
│   ├── features/                     # FSD: 사용자 기능
│   │   ├── post-create/              # 포스트 작성
│   │   ├── post-search/              # 포스트 검색
│   │   └── auth/                     # 인증 기능
│   │
│   ├── entities/                     # FSD: 비즈니스 도메인 UI
│   │   ├── post/                     # PostCard, PostPreview 등
│   │   ├── user/                     # UserAvatar, UserProfile 등
│   │   └── comment/                  # CommentItem 등
│   │
│   ├── shared/                       # FSD: 공유
│   │   ├── api/                      # oRPC 클라이언트 (orpc.ts, orpc.server.ts)
│   │   ├── ui/                       # shadcn/ui 래핑 컴포넌트
│   │   ├── lib/                      # 유틸리티 함수
│   │   └── config/                   # 설정 상수
│   │
│   ├── domains/                      # DDD: 백엔드 도메인
│   │   ├── post/
│   │   │   ├── domain/               # 엔티티, 값 객체, 저장소 인터페이스
│   │   │   ├── application/          # 유스케이스, 커맨드, 쿼리
│   │   │   └── infrastructure/       # Drizzle 저장소 구현체
│   │   ├── user/
│   │   ├── comment/
│   │   └── media/
│   │
│   ├── server/                       # 서버 공통
│   │   ├── orpc/                     # oRPC 라우터, 미들웨어, 컨텍스트
│   │   │   ├── routers/
│   │   │   ├── middleware/
│   │   │   └── context.ts
│   │   └── db/                       # Drizzle 설정, 스키마
│   │       ├── index.ts
│   │       ├── schema/
│   │       └── migrations/
│   │
│   └── messages/                     # i18n 메시지
│       ├── ko.json
│       └── en.json
│
├── tests/                            # 테스트
│   ├── unit/
│   ├── integration/
│   └── e2e/
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
3. 백엔드(도메인 → oRPC) → 프론트엔드(엔티티 → 피처 → 위젯) 순서로 구현
4. 테스트 작성 및 검증
5. 완료 시: `active/` → `completed/`로 이동, CHANGELOG.md 업데이트
