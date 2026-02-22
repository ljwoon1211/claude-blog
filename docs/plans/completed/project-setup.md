# 프로젝트 환경설정

## 개요

- **목적**: Next.js 16 + pnpm 기반 개발 블로그 프로젝트 초기 환경 구축
- **대상 사용자**: 개발자 (본인)
- **우선순위**: P0 (필수) — 모든 기능 개발의 전제 조건

## 요구사항

### 기능 요구사항

- [x] FR-1: Next.js 16 (App Router, Turbopack) 프로젝트 초기화
- [x] FR-2: TypeScript strict 모드 설정
- [x] FR-3: Tailwind CSS v4 스타일링 환경
- [x] FR-4: ESLint 코드 품질 도구
- [x] FR-5: `src/` 디렉토리 구조 + `@/*` 경로 별칭
- [x] FR-6: pnpm 패키지 매니저 사용

### 비기능 요구사항

- [x] NFR-1: 개발 서버 Cold Start < 3초
- [x] NFR-2: 기존 프로젝트 설정 파일(CLAUDE.md, .claude/) 보존

## 기술 설계

### 사용 도구

- `pnpm create next-app@latest` CLI로 프로젝트 스캐폴딩
- Context7을 통한 Next.js 16 최신 문서 참조

### 설치된 패키지

| 패키지               | 버전   | 용도                |
| -------------------- | ------ | ------------------- |
| next                 | 16.1.6 | 프레임워크          |
| react                | 19.2.3 | UI 라이브러리       |
| react-dom            | 19.2.3 | DOM 렌더링          |
| typescript           | 5.9.3  | 타입 시스템         |
| tailwindcss          | 4.2.0  | CSS 프레임워크      |
| @tailwindcss/postcss | 4.2.0  | PostCSS 플러그인    |
| eslint               | 9.39.3 | 린터                |
| eslint-config-next   | 16.1.6 | Next.js ESLint 규칙 |

### 생성된 설정 파일

| 파일                 | 핵심 설정                         |
| -------------------- | --------------------------------- |
| `tsconfig.json`      | `strict: true`, `@/*` → `./src/*` |
| `next.config.ts`     | 기본 설정 (Turbopack 내장)        |
| `postcss.config.mjs` | `@tailwindcss/postcss` 플러그인   |
| `eslint.config.mjs`  | `eslint-config-next` 기반         |

## 작업 분해 (WBS)

1. [x] CLAUDE.md, project-setup.md 기술 스택 확인
2. [x] Context7로 Next.js 16 최신 설치 CLI 확인
3. [x] 기존 파일 백업 (CLAUDE.md, .claude/, docs/)
4. [x] `pnpm create next-app@latest` 실행
5. [x] 기존 파일 복원
6. [x] Tailwind CSS 4.0.0 → 4.2.0 호환성 수정
7. [x] TypeScript, ESLint 등 devDependencies 최신 버전 업그레이드
8. [x] 개발 서버 실행 및 HTTP 200 검증

## 검증 기준

- [x] `pnpm dev` → localhost:3000 → HTTP 200 정상 응답
- [x] `tsconfig.json` strict 모드 및 path alias 확인
- [x] 기존 프로젝트 파일 보존 확인

## 이슈 및 해결

| 이슈                                                | 원인                                               | 해결                 |
| --------------------------------------------------- | -------------------------------------------------- | -------------------- |
| `Missing field 'negated' on ScannerOptions.sources` | `@tailwindcss/postcss@4.0.0` Turbopack 호환성 버그 | 4.2.0으로 업그레이드 |
| ESLint peer dependency 경고                         | ESLint 10.x가 eslint-config-next 미지원            | ESLint 9.x로 롤백    |
