# Code Conventions

## 명명 규칙

| 대상            | 규칙                      | 예시                                    |
| --------------- | ------------------------- | --------------------------------------- |
| 파일명          | kebab-case                | `post-card.tsx`, `use-auth.ts`          |
| 컴포넌트        | PascalCase (named export) | `export function PostCard()`            |
| 함수/변수       | camelCase                 | `getUserById`, `isLoading`              |
| 타입/인터페이스 | PascalCase                | `type PostDetail`, `interface UserRepo` |
| 상수            | UPPER_SNAKE_CASE          | `MAX_POST_LENGTH`, `API_BASE_URL`       |
| 경로 별칭       | `@/*` → `./src/*`         | `import { Button } from '@/shared/ui'`  |
| oRPC 라우터     | camelCase                 | `postRouter`, `userRouter`              |
| DB 스키마       | snake_case (테이블/컬럼)  | `blog_posts`, `created_at`              |

---

## 컴포넌트 작성 규칙

```tsx
// named export 사용 (default export 금지)
export function PostCard({ title, slug }: PostCardProps) {
  return <article>...</article>;
}
```

- Server Component 기본, 클라이언트 필요 시에만 `'use client'`
- Props 타입은 컴포넌트 파일 상단에 정의
- children 패턴 우선, render props는 필요할 때만

---

## ESLint / Prettier

- ESLint: `next/core-web-vitals` + `typescript-eslint/recommended`
- Prettier: 싱글 쿼트, 세미콜론, trailing comma
- import 순서: React → 외부 라이브러리 → `@/` 내부 모듈 → 상대 경로

---

## Git 컨벤션

### 브랜치

```
main              # 프로덕션
develop           # 개발 통합
feat/{feature}    # 기능 개발
fix/{issue}       # 버그 수정
refactor/{scope}  # 리팩토링
```

### 커밋 메시지

```
feat: 포스트 CRUD API 추가
fix: 댓글 페이지네이션 오류 수정
refactor: oRPC 미들웨어 구조 개선
docs: API 문서 업데이트
test: 포스트 생성 유스케이스 테스트 추가
chore: 의존성 업데이트
```

### PR

- 제목: 70자 이내
- 본문: Summary + Test Plan
- 리뷰 후 Squash Merge

---

## 금지 사항

| 금지                              | 이유                     | 대안                       |
| --------------------------------- | ------------------------ | -------------------------- |
| `any` 타입                        | 타입 안전성 위반         | `unknown` + 타입 가드      |
| `console.log` 커밋                | 프로덕션 로그 오염       | 로거 사용 또는 제거        |
| shadcn/ui 기본 컴포넌트 직접 수정 | 업데이트 시 덮어씌워짐   | `src/shared/ui/`에 래핑    |
| Zod 검증 없이 API 입력 사용       | 보안/안정성              | oRPC 프로시저에 Zod 스키마 |
| 하드코딩 문자열 (UI 텍스트)       | 다국어 대응 불가         | next-intl 메시지 키        |
| Server Actions 사용               | 프로젝트 아키텍처 일관성 | oRPC 프로시저              |
| FSD 같은 레이어 간 참조           | FSD 원칙 위반            | 하위 레이어로 이동         |
| domain 레이어에서 외부 의존       | DDD 원칙 위반            | 인터페이스로 추상화        |

---

## 보안 체크리스트

- [ ] **SQL Injection**: Drizzle ORM 파라미터화 쿼리 사용 (raw SQL 금지)
- [ ] **XSS**: 사용자 입력 sanitize, `dangerouslySetInnerHTML` 사용 시 DOMPurify
- [ ] **CSRF**: 토큰 검증 적용
- [ ] **인증**: 모든 보호 API에 oRPC 인증 미들웨어 적용
- [ ] **환경변수**: 민감 정보는 `.env.local`에만, `NEXT_PUBLIC_` 접두사 주의
- [ ] **Rate Limiting**: Upstash Redis로 API 호출 제한
- [ ] **파일 업로드**: MIME 타입 검증, 파일 크기 제한

---

## 주석 원칙

- "무엇(what)"이 아닌 "왜(why)"만 작성
- 자명한 코드에는 주석 불필요
- JSDoc은 public API 함수에만 작성
- TODO는 이슈 번호와 함께 (`// TODO(#123): ...`)
