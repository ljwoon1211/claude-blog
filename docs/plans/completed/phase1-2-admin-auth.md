# Phase 1 - 2. 어드민 인증 (Supabase Auth) + `/login` 페이지

## 개요

어드민(블로그 주인) 전용 로그인 기능 및 인증된 사용자 세션 관리 로직을 구현합니다.
Supabase Auth를 사용하여 이메일/비밀번호 방식을 구현하며, `/login` 페이지는 외부에 링크를 노출하지 않고 직접 URL을 입력해서만 접근 가능하도록 구성합니다.

## 작업 내용

### 1. Supabase Client 유틸리티 설정

- `ssr` 환경(서버 컴포넌트, 서버 액션, 라우트 핸들러)용 Supabase 클라이언트 유틸리티 작성 (`src/shared/lib/supabase/server.ts`)
- `browser` 환경(클라이언트 컴포넌트)용 Supabase 클라이언트 유틸리티 작성 (`src/shared/lib/supabase/client.ts`)
- `proxy.ts` 환경용 Supabase 클라이언트 유틸리티 작성 (세션 갱신 및 라우트 보호 처리용)

### 2. 미들웨어 (Route Protection) 설정

- `proxy.ts` 작성
- `/login` 경로 접근 시:
  - 이미 로그인된 상태(어드민)이면 홈(`/`) 또는 이전 페이지로 리다이렉트
  - 비로그인 상태면 그대로 로그인 페이지 표출
- API(oRPC) 핸들러 등 어드민 전용 기능에 대한 세션 확인 로직은 oRPC Context 레벨에서 처리할 예정 (이번 단계에서는 로그인 상태 유지 및 세션 갱신만 처리)

### 3. 로그인 페이지 UI 및 액션 (`/login`)

- 로그인 폼 UI 구현 (이메일 및 비밀번호 입력 필드, submit 버튼)
  - `react-hook-form` + `zod` 기반 유효성 검사 적용
  - `lucide-react`를 활용한 간단한 디자인
- 클라이언트 컴포넌트에서 oRPC 클라이언트(`src/shared/api/orpc.ts` 또는 TanStack Query 훅)를 호출하여 인증 진행
  - 인증 관련 oRPC 라우터/프로시저 구현 (예: `auth.login`)
- 성공 시 홈(`/`)으로 리다이렉트 (추후 이전 페이지 리다이렉트 로직 보강 가능)
- 실패 시 토스트/에러메시지 노출

## 검토 및 승인 요청 (User Review Required)

- `blog-prd.md`의 규칙에 어긋나는 부분 없이 위 방향대로 진행하면 될지 확인 부탁드립니다.
- 승인 시, 작성한 유틸리티 코드 및 `/login` 페이지 뼈대 작성을 바로 진행하겠습니다.
