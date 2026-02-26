# Phase 3: 부가 기능 (P2)

## 개요

고아 이미지 정리 Cron, RSS 피드, 검색 고도화(Full-Text Search), 조회수/인기글 집계를 구현한다.

## 선행 조건

- [x] Phase 2 전체 완료

---

## 작업 내용

### 1. 고아 이미지 정리 Cron (WBS #19)

**신규 의존성**: `inngest`

**파일:**

```
src/server/inngest/
├── client.ts                      # Inngest 클라이언트 초기화
└── functions/
    └── cleanup-orphan-images.ts   # 매일 1회 cron 함수
src/app/api/inngest/route.ts       # Inngest serve endpoint
```

**구현:**

- 매일 00:00 (KST) 실행
- 조건: `postId IS NULL AND createdAt < now() - interval '24 hours'`
- R2에서 일괄 삭제 + DB 레코드 삭제
- 삭제 건수 로깅
- 환경변수: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`

### 2. RSS 피드 (WBS #20)

**파일**: `src/app/feed.xml/route.ts`

**구현:**

- 발행된 게시글 목록 → RSS 2.0 XML 생성
- Content-Type: `application/xml; charset=utf-8`
- 항목: title, link, description (content에서 텍스트 추출, 200자), pubDate, category
- `<head>`에 RSS 링크 추가: `<link rel="alternate" type="application/rss+xml" ... />`

### 3. 검색 고도화 - Full-Text Search (WBS #21)

**마이그레이션:**

- `posts` 테이블에 `search_vector` tsvector 컬럼 추가
- GIN 인덱스 생성
- 트리거: INSERT/UPDATE 시 search_vector 자동 갱신
- 한국어: `pg_trgm` 확장 활용 (trigram 유사도)

**코드 수정:**

- `src/domains/post/infrastructure/repositories/drizzle-post-repository.ts`
  - `list-posts` 유스케이스에서 검색 로직: `ilike` → `to_tsquery` + `ts_rank` 정렬
- `src/shared/db/schema.ts`: search_vector 컬럼 추가
- Drizzle 마이그레이션 생성 + 적용

### 4. 조회수 / 인기글 집계 (WBS #22)

**DDD 구조:**

```
src/domains/analytics/
├── domain/
│   └── entities/view-count.ts     # ViewCount 타입
├── application/
│   └── use-cases/
│       ├── increment-view.ts      # 조회수 증가
│       └── get-popular-posts.ts   # 인기글 조회
└── infrastructure/
    └── redis-view-counter.ts      # Upstash Redis INCR 기반
```

**구현:**

- Upstash Redis: `INCR post:views:{postId}` (조회수 카운터)
- 중복 방지: IP 또는 fingerprint 기반 (24시간 내 중복 제외)
- 인기글: `ZRANGEBYSCORE` 또는 일별 집계 후 정렬
- 게시글 상세 접근 시 카운트 증가
- 홈 페이지에 인기글 섹션 추가 가능

**oRPC 라우터 추가:**

- `post.incrementView`: `{ postId }` → void (공개, rate limited)
- `post.popular`: `{ period?, limit? }` → Post[] (공개)

---

## 수정/생성 대상 파일

| 파일                                 | 작업                               |
| ------------------------------------ | ---------------------------------- |
| `src/server/inngest/**`              | 신규 - Inngest 클라이언트 + 함수   |
| `src/app/api/inngest/route.ts`       | 신규 - Inngest API 엔드포인트      |
| `src/app/feed.xml/route.ts`          | 신규 - RSS 피드                    |
| `src/shared/db/schema.ts`            | 수정 - search_vector 컬럼          |
| `supabase/migrations/`               | 신규 - FTS 마이그레이션            |
| `src/domains/post/infrastructure/**` | 수정 - FTS 검색 로직               |
| `src/domains/analytics/**`           | 신규 - 조회수 도메인               |
| `src/server/orpc/routers/post.ts`    | 수정 - incrementView, popular 추가 |
| `src/app/layout.tsx`                 | 수정 - RSS 링크 추가               |

## 검증

- Inngest: 대시보드에서 cron 실행 확인, 고아 이미지 삭제 로그
- RSS: `/feed.xml` 접근 → 유효한 XML 확인 (RSS 검증기)
- FTS: 한글 검색어 → 관련 게시글 반환 확인
- 조회수: 게시글 접근 → Redis에서 카운트 증가 확인
- 인기글: 여러 게시글 접근 후 인기순 정렬 확인
- `pnpm db:generate` + `pnpm db:migrate` (FTS 마이그레이션)
- `pnpm build` 성공
