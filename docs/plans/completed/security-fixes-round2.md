# 보안 취약점 추가 수정 계획 (5건)

## Context

이전 보안 감사에서 12건 수정 완료 후, 최종 스캔에서 발견된 5건의 추가 보안 이슈를 수정한다.

---

## 1. CSP(Content-Security-Policy) 헤더 추가

**파일**: `next.config.ts`

기존 securityHeaders 배열에 CSP 헤더를 추가한다.

외부 리소스 도메인:

- **Giscus**: `giscus.app` (script, frame, connect)
- **R2 이미지**: `process.env.R2_PUBLIC_URL`에서 origin 추출 (img)
- **YouTube**: `youtube-nocookie.com` (frame — TipTap Youtube 확장)
- **인라인 스타일**: `'unsafe-inline'` 필요 (Tailwind CSS, TipTap)
- **인라인 스크립트**: `'unsafe-inline'` 필요 (Next.js hydration)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://giscus.app;
  style-src 'self' 'unsafe-inline';
  img-src 'self' {R2_ORIGIN} data: blob:;
  frame-src https://giscus.app https://www.youtube-nocookie.com;
  connect-src 'self' https://giscus.app;
  font-src 'self';
```

개발 환경에서는 `'unsafe-eval'`을 script-src에 추가 (Turbopack HMR).

---

## 2. publicApiRateLimit 공개 엔드포인트 적용

**파일**: `src/server/orpc/routers/post.ts`, `src/server/orpc/routers/tag.ts`

이미 정의된 `publicApiRateLimit`(10초당 30회)을 공개 엔드포인트에 적용:

- `post.list` (L80)
- `post.getBySlug` (L95)
- `post.popular` (L234)
- `tag.list` (L16)

패턴 (viewRateLimit 참고):

```typescript
const ip = extractClientIp(context.headers);
const { success } = await publicApiRateLimit.limit(ip);
if (!success)
  throw new ORPCError('TOO_MANY_REQUESTS', {
    message: '요청이 너무 많습니다.',
  });
```

**주의**: `serverOrpc`에서 호출 시 `context.headers`가 undefined → IP가 `'unknown'` → 서버 컴포넌트 호출이 모두 같은 버킷에 몰림. 따라서 headers가 없으면 rate limiting을 건너뛰도록 한다.

```typescript
if (context.headers) {
  const ip = extractClientIp(context.headers);
  const { success } = await publicApiRateLimit.limit(ip);
  if (!success) throw new ORPCError('TOO_MANY_REQUESTS', ...);
}
```

---

## 3. TipTap content의 javascript: 프로토콜 차단

### 3-1. 서버 측 sanitization (주 방어선)

**파일**: `src/domains/post/use-cases/sanitize-tiptap.ts` (신규)

TipTap JSON을 재귀적으로 순회하며 위험한 프로토콜을 제거하는 유틸리티:

- `node.attrs.href` / `node.attrs.src` 검사 (노드 속성)
- `node.marks[].attrs.href` 검사 (링크 마크)
- 차단 대상: `javascript:`, `data:text/html`, `vbscript:`

**적용 위치**: `src/server/orpc/routers/post.ts`

- `create` 핸들러: content 저장 전 sanitize
- `update` 핸들러: content 저장 전 sanitize

### 3-2. 클라이언트 측 방어 (보조 방어선)

**파일**: `src/features/post/lib/extensions.ts`

Link 확장에 `validate` 옵션 추가:

```typescript
Link.configure({
  openOnClick: false,
  validate: (url) => !url.startsWith('javascript:'),
  // ...
});
```

---

## 4. serverOrpc 인증 컨텍스트 안전장치

**파일**: `src/shared/api/orpc.server.ts`

현재 상태: `createContext()` 호출 시 request 미전달 → headers undefined.

- 공개 엔드포인트만 사용하므로 현재는 안전
- 하지만 실수로 protectedProcedure 호출 시 인증은 Supabase cookie로 동작하나, rate limiting이 'unknown' IP로 몰림

수정: JSDoc으로 사용 제약 명시 + 이슈 2에서 headers 체크로 rate limiting 안전하게 처리 (중복 작업 아님).

---

## 5. images 테이블 uploadedBy 컬럼 추가

### 5-1. 스키마 변경

**파일**: `src/shared/db/schema.ts`

- images 테이블에 `uploadedBy: uuid('uploaded_by')` 추가 (nullable — 기존 데이터 호환)

### 5-2. 타입 변경

**파일**: `src/domains/image/types.ts`

- `Image` 타입에 `uploadedBy: string | null` 추가
- `ImageRepository.create` input에 `uploadedBy?: string` 추가

### 5-3. Repository 변경

**파일**: `src/domains/image/repository.ts`

- `create()` 메서드에 `uploadedBy` 파라미터 추가

### 5-4. Use-case 변경

**파일**: `src/domains/image/use-cases/confirm-upload.ts`

- `confirmUpload()`에 `uploadedBy` 파라미터 추가

### 5-5. 라우터 변경

**파일**: `src/server/orpc/routers/upload.ts`

- `confirm` 핸들러: `context.user.id`를 `confirmUpload`에 전달
- `delete` 핸들러: postId 없는 이미지는 `uploadedBy === context.user.id` 검증

### 5-6. DB 마이그레이션

- `pnpm db:generate` → `pnpm db:migrate`

---

## 검증

1. `pnpm typecheck` — 타입 에러 없음
2. `pnpm lint` — lint 에러 없음
3. 계획 문서 `docs/plans/active/` → `docs/plans/completed/` 이동
