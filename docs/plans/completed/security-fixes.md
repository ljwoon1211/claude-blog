# 보안 취약점 수정 계획

## 개요

코드 보안 감사에서 발견된 CRITICAL(3건) + IMPORTANT(5건) 취약점을 수정한다.

## 수정 항목

### CRITICAL

1. **LIKE 패턴 이스케이프**: `repository.ts`의 `ilike` 검색에서 `%`, `_` 이스케이프
2. **Rate Limiting**: `@upstash/ratelimit`로 로그인, 조회수, 공개 API에 제한 적용
3. **업로드 확장자 화이트리스트**: `presign-upload.ts`에서 확장자 검증 강화

### IMPORTANT

4. **게시글 소유권 검증**: `update`, `delete` 시 `authorId` 일치 확인
5. **content 필드 검증**: `z.unknown()` → TipTap JSON 기본 구조 Zod 스키마
6. **publicUrl 서버 생성**: `upload.confirm`에서 클라이언트 전달 대신 서버에서 key 기반 생성
7. **Security Headers**: `next.config.ts`에 CSP, HSTS 등 보안 헤더 추가
8. **IP Spoofing 방어**: Vercel 환경에 맞는 IP 추출 로직 개선

## 변경 파일

- `src/domains/post/repository.ts`
- `src/domains/image/use-cases/presign-upload.ts`
- `src/server/orpc/routers/post.ts`
- `src/server/orpc/routers/upload.ts`
- `src/server/orpc/middleware.ts`
- `src/shared/lib/rate-limit.ts` (신규)
- `next.config.ts`
