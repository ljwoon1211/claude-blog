# 신규 블로그 디자인 시스템 적용 (shadcn/ui 기반)

`docs/design/blog-design-system.pen.pen`에 정의된 새로운 디자인 시스템을 **shadcn/ui** 생태계 기반에서 동작하도록 적용합니다.

## 목표

- `.pen` 파일의 디자인 토큰(색상, 폰트, Radius 등)을 `globals.css`의 **shadcn/ui CSS 변수**(`--background`, `--primary`, `--border`, `--radius` 등)로 매핑
- 기존 `src/shared/ui`의 **shadcn/ui 컴포넌트는 그대로 유지**하면서, 디자인 시스템의 시각적 형태에 맞게 CSS와 `tailwind.config.ts`(또는 내부 클래스) 기반으로 커스텀
- `TopNavigation`, `PostCard` 등 복합 컴포넌트를 위젯 레벨에서 구현

## 작업 내용

### 1. shadcn/ui 테마 변수 재설정 (`globals.css`)

- `.pen` 디자인의 색상 토큰(`$bg-page`, `$accent`, `$text-primary` 등)을 shadcn/ui 가 사용하는 기본 변수인 `--background`, `--foreground`, `--primary`, `--muted` 등에 맞춰 1:1로 매핑 (Light/Dark 모드 모두 지원)
- 컴포넌트 라운딩 수치 (`$radius-button`, `$radius-md`)를 shadcn의 `--radius` 변수로 통합 적용

### 2. shadcn/ui 공통 컴포넌트 스타일 점검 (`src/shared/ui`)

- **Button**: shadcn/ui의 버튼 variants를 재활용하되, `.pen` 디자인의 `Primary`, `Secondary`, `Ghost`, `Destructive` 디자인과 완전히 동일하게 보이도록 `globals.css` 토큰 연동
- **Input / Badge**: shadcn/ui `Input`, `Badge` 컴포넌트를 베이스로 두고 디자인에 맞게 `cva(class-variance-authority)` 테마 조율
- 컴포넌트를 완전히 새로 만드는 것이 아니라, **shadcn/ui 의 코어를 유지하며 껍데기(디자인)만 교체**

### 3. 복합 위젯 구성 (`src/widgets`)

- 위에서 재설정한 shadcn/ui 컴포넌트(`Button`, `Input`, `Badge`, `Avatar`)를 조립하여 `TopNavigation`, `PostCard` 위젯 화면 구성

## 검증 방법

- `pnpm lint`를 통한 검사
- `localhost:3000`에서 브라우저를 열어 다크/라이트 모드 전환 시 shadcn/ui 컴포넌트들이 .pen 파일 디자인처럼 나오는지 시각적 검증
