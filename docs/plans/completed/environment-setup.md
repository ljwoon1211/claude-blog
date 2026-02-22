# 환경설정 Phase 1~3

## 개요

- **목적**: CLAUDE.md에 정의된 기술 스택에 맞는 폴더 구조·의존성·테스트 환경 구축
- **선행 작업**: project-setup (Next.js 16 초기화), eslint-prettier-config
- **우선순위**: P0 (필수) — 기능 개발 전 완료 필요

## 요구사항

### 기능 요구사항

- [x] FR-1: FSD 레이어 폴더 구조 (shared, entities, features, widgets, pages)
- [x] FR-2: DDD 백엔드 폴더 구조 (domains, server/orpc, server/db)
- [x] FR-3: `.env.example` 환경변수 템플릿
- [x] FR-4: i18n 메시지 파일 (ko.json, en.json)
- [x] FR-5: shadcn/ui 초기화 + FSD 경로 매핑
- [x] FR-6: 백엔드 의존성 (oRPC, Drizzle, Supabase, Zod)
- [x] FR-7: 프론트엔드 의존성 (TanStack Query, Zustand, next-intl, react-hook-form)
- [x] FR-8: Vitest + Playwright + Sentry 테스트/모니터링 환경
- [x] FR-9: package.json 스크립트 정비 (test, db, ui)

## 기술 설계

### Phase 1: 폴더 스캐폴딩

```
src/
├── app/providers/, styles/, store/   # FSD app 레이어
├── pages/, widgets/, features/       # FSD 조합 레이어
├── entities/                         # FSD 도메인 UI
├── shared/ui/, api/, lib/, config/   # FSD 공유
├── domains/                          # DDD 백엔드
├── server/orpc/, server/db/          # 서버 인프라
└── messages/ko.json, en.json         # i18n
```

### Phase 2: 설치된 패키지

| 패키지                | 버전    | 용도                |
| --------------------- | ------- | ------------------- |
| @orpc/server          | 1.13.5  | 타입 안전 API 서버  |
| @orpc/client          | 1.13.5  | API 클라이언트      |
| @orpc/zod             | 1.13.5  | oRPC Zod 통합       |
| drizzle-orm           | 0.45.1  | ORM                 |
| drizzle-kit           | 0.31.9  | 마이그레이션 도구   |
| @supabase/supabase-js | 2.97.0  | Supabase 클라이언트 |
| zod                   | 4.3.6   | 스키마 검증         |
| @tanstack/react-query | 5.90.21 | 서버 상태 관리      |
| zustand               | 5.0.11  | 클라이언트 상태     |
| next-intl             | 4.8.3   | i18n                |
| react-hook-form       | 7.71.2  | 폼 관리             |
| @hookform/resolvers   | 5.2.2   | Zod 연동            |
| shadcn (CLI)          | 3.8.5   | UI 컴포넌트         |

### Phase 3: 테스트/모니터링 설정

| 도구             | 버전    | 설정 파일              |
| ---------------- | ------- | ---------------------- |
| vitest           | 4.0.18  | `vitest.config.ts`     |
| @playwright/test | 1.58.2  | `playwright.config.ts` |
| @sentry/nextjs   | 10.39.0 | `.env.local`에서 DSN   |

### shadcn/ui FSD 경로 매핑 (components.json)

```json
{
  "components": "@/shared/ui",
  "utils": "@/shared/lib/utils",
  "ui": "@/shared/ui",
  "lib": "@/shared/lib",
  "hooks": "@/shared/hooks"
}
```

## 작업 분해 (WBS)

1. [x] CLAUDE.md, project-setup.md 기술 스택 분석
2. [x] FSD/DDD 디렉토리 생성 + barrel export (index.ts)
3. [x] .env.example, i18n 메시지 파일 생성
4. [x] oRPC context, DB index 기초 파일 생성
5. [x] shadcn/ui init + FSD 경로 재매핑 + utils.ts 이동
6. [x] 백엔드 의존성 설치 (oRPC, Drizzle, Supabase, Zod)
7. [x] 프론트엔드 의존성 설치 (TanStack Query, Zustand, etc.)
8. [x] Vitest 설치 + vitest.config.ts + tests/setup.ts
9. [x] Playwright 설치 + playwright.config.ts
10. [x] Sentry 설치
11. [x] package.json 스크립트 추가 (test, db, ui)
12. [x] 매 단계 typecheck 통과 확인

## 검증 기준

- [x] `pnpm typecheck` 에러 없음 (Phase 1, 2, 3 각각 확인)

## 이슈 및 해결

| 이슈                                | 원인                                     | 해결                 |
| ----------------------------------- | ---------------------------------------- | -------------------- |
| `@orpc/next` peer dependency 불일치 | v0.27.0만 존재, @orpc/server v1과 비호환 | 패키지 제거          |
| shadcn/ui 경로가 FSD 구조와 불일치  | 기본값이 `@/components/ui`, `@/lib`      | components.json 수정 |
