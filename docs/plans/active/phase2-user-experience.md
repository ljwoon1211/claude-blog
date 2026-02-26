# Phase 2: 사용자 경험 (P1)

## 개요

댓글 시스템(giscus), 회고 섹션, 캐싱 전략을 적용하여 사용자 경험을 향상한다.

## 선행 조건

- [x] Phase 1 전체 완료

---

## 작업 내용

### 1. 댓글 시스템 - giscus (WBS #16)

**신규 의존성**: `@giscus/react`

**FSD 구조:**

```
src/features/comment/
├── ui/giscus-comments.tsx         # giscus 래퍼 컴포넌트 ('use client')
└── index.ts
```

**구현:**

- GitHub Discussions 기반 댓글
- `next-themes` useTheme()으로 다크모드 자동 연동
- 게시글 상세 페이지 하단 배치
- 환경변수: `NEXT_PUBLIC_GISCUS_REPO`, `NEXT_PUBLIC_GISCUS_REPO_ID`, `NEXT_PUBLIC_GISCUS_CATEGORY`, `NEXT_PUBLIC_GISCUS_CATEGORY_ID`
- mapping: `pathname` (게시글 URL 기반)

### 2. 회고 섹션 (WBS #17)

**App Router:**

```
src/app/retrospective/page.tsx          # 회고 목록
src/app/retrospective/[slug]/page.tsx   # 회고 상세
src/app/retrospective/loading.tsx       # 로딩
src/app/retrospective/error.tsx         # 에러
```

- 기존 post-feed 위젯 재사용 (`category: 'retrospective'`)
- post-detail 위젯 재사용
- 헤더 네비게이션에 "회고" 메뉴 추가
- 월간/분기 회고 → 태그로 구분 (예: "2026-Q1", "2026-02")

### 3. 캐싱 적용 (WBS #18)

**Next.js 16 `use cache` + on-demand revalidation:**

```
src/app/portfolio/page.tsx          # 'use cache' 적용
src/app/study/page.tsx              # 'use cache' 적용
src/app/[category]/[slug]/page.tsx  # 'use cache' 적용
```

- 어드민 CUD 작업 시: `revalidateTag('posts')`, `revalidatePath('/portfolio')` 등
- oRPC 라우터에서 `next/cache` import → CUD 프로시저에 revalidate 추가

**Upstash Redis (태그 목록 캐싱):**

**신규 의존성**: `@upstash/redis`

```
src/shared/lib/redis.ts             # Upstash Redis 클라이언트
```

- 태그 목록: Redis 캐시 (10분 TTL)
- 환경변수: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

---

## 수정/생성 대상 파일

| 파일                                | 작업                    |
| ----------------------------------- | ----------------------- |
| `src/features/comment/**`           | 신규 - giscus 댓글      |
| `src/app/retrospective/**`          | 신규 - 회고 페이지      |
| `src/widgets/header/ui/header.tsx`  | 수정 - 회고 메뉴 추가   |
| `src/app/portfolio/page.tsx`        | 수정 - use cache 적용   |
| `src/app/study/page.tsx`            | 수정 - use cache 적용   |
| `src/app/*/[slug]/page.tsx`         | 수정 - use cache 적용   |
| `src/server/orpc/routers/post.ts`   | 수정 - revalidate 추가  |
| `src/shared/lib/redis.ts`           | 신규 - Redis 클라이언트 |
| `src/domains/tag/infrastructure/**` | 수정 - Redis 캐시 적용  |

## 검증

- giscus 댓글: 게시글 상세 하단에서 GitHub 로그인 후 댓글 작성
- giscus 다크모드: 테마 토글 시 댓글 영역 테마 변경 확인
- 회고 목록/상세: /retrospective 접근 + 기존 위젯 재사용 확인
- 캐싱: Network 탭에서 캐시 HIT 확인, 글 수정 후 즉시 반영 확인
- Redis: tag.list 첫 호출 후 두 번째 호출 속도 비교
- `pnpm build` 성공
