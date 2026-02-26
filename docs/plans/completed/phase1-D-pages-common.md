# Phase 1-D: 추가 페이지 & 공통 UI

## 개요

홈 페이지, 자기소개 페이지, SEO, 다크모드, 반응형, 레이아웃(헤더/푸터), 로딩 상태, 에러 핸들링을 구현한다.

## 선행 조건

- [x] Phase 1-C: 프론트엔드 코어 (에디터, 목록, 상세 페이지)

---

## 작업 내용

### 1. 레이아웃 & 네비게이션

**FSD 구조:**

```
src/widgets/header/
├── ui/header.tsx                  # 사이트 헤더 (로고 + 네비게이션 + 다크모드 토글)
├── ui/mobile-nav.tsx              # 모바일 햄버거 메뉴
└── index.ts

src/widgets/footer/
├── ui/footer.tsx                  # 사이트 푸터 (저작권, 소셜 링크)
└── index.ts
```

**네비게이션 메뉴:**

- 홈, 자기소개, 포트폴리오, 공부
- 모바일: 햄버거 메뉴 (Sheet 컴포넌트)
- 데스크톱: 수평 네비게이션

**파일**: `src/app/layout.tsx` 수정 — Header/Footer 래핑

### 2. 홈 페이지 (WBS #9)

**파일**: `src/app/page.tsx` (재작성)

- 히어로 섹션: 간단한 소개 + CTA
- 최신 글: 카테고리별 최신 2~3개 (Server Component → `orpc.server.ts`)
- 포트폴리오 하이라이트
- PostCard 재사용 (`src/entities/post/`)

### 3. 자기소개 페이지 (WBS #10)

**파일**: `src/app/about/page.tsx` (신규)

- `posts` 테이블에서 `category='page'`, `slug='about'` 조회 (Server Component)
- tiptap JSON → 읽기 전용 렌더링 (post-detail 위젯 재사용)
- 어드민이면 [수정] 버튼 → tiptap 에디터 모드 전환
- about 데이터 없으면 빈 상태 UI

### 4. SEO (WBS #11)

**파일:**

```
src/app/layout.tsx                  # 기본 메타태그 (사이트 이름, 설명)
src/app/portfolio/[slug]/page.tsx   # generateMetadata() — 동적 메타 + OG
src/app/study/[slug]/page.tsx       # generateMetadata() — 동적 메타 + OG
src/app/sitemap.ts                  # sitemap.xml 동적 생성 (모든 발행 게시글)
src/app/robots.ts                   # robots.txt
```

- Open Graph: 제목, 설명 (content에서 추출), 썸네일 이미지
- Twitter Card: summary_large_image
- 구조화 데이터: JSON-LD (BlogPosting)

### 5. 다크모드 (WBS #12)

**파일:**

```
src/app/layout.tsx                  # ThemeProvider 래핑
src/shared/ui/theme-toggle.tsx      # 다크모드 토글 버튼 (신규)
src/app/globals.css                 # CSS 변수 기반 테마 확인/보완
```

- `next-themes` ThemeProvider (이미 설치됨)
- 시스템 설정 연동 + 수동 토글 (라이트/다크/시스템)
- 헤더에 토글 버튼 배치
- Toaster에 이미 `next-themes` 연동됨 (`sonner.tsx`)

### 6. 반응형 디자인 (WBS #13)

- 모바일 우선 (min-width breakpoints)
- Tailwind: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- 게시글 그리드: 1열 → 2열 → 3열
- 네비게이션: 모바일 햄버거 / 데스크톱 수평
- TOC: 모바일 토글 / 데스크톱 사이드바
- 에디터: 모바일 반응형 툴바

### 7. 로딩 상태 (WBS #14)

**파일:**

```
src/shared/ui/skeleton.tsx          # 스켈레톤 컴포넌트 (신규, shadcn/ui)
src/shared/ui/spinner.tsx           # 스피너 컴포넌트 (신규)
src/app/portfolio/loading.tsx       # 포트폴리오 목록 로딩
src/app/portfolio/[slug]/loading.tsx # 포트폴리오 상세 로딩
src/app/study/loading.tsx           # 공부 목록 로딩
src/app/study/[slug]/loading.tsx    # 공부 상세 로딩
src/app/about/loading.tsx           # 자기소개 로딩
```

- PostCard 스켈레톤 (그리드 형태)
- 상세 페이지 스켈레톤 (제목 + 본문 영역)
- 무한스크롤 하단 스피너
- 에디터 자동저장 상태 표시: "저장 중..." → "자동 저장됨 (HH:MM)"

### 8. 에러 핸들링 (WBS #15)

**파일:**

```
src/app/not-found.tsx               # 404 커스텀 페이지
src/app/error.tsx                   # 전역 에러 바운더리 ('use client')
src/app/portfolio/error.tsx         # 라우트별 에러
src/app/study/error.tsx             # 라우트별 에러
```

- 404: "페이지를 찾을 수 없습니다" + 홈 이동 링크 + 검색 제안
- 500: "문제가 발생했습니다" + 재시도 버튼 + `reset()` 호출
- API 에러: sonner 토스트 알림 (에러 메시지 + 재시도)
- 인증 만료: oRPC 에러 인터셉트 → /login 리다이렉트

---

## 추가 필요 shadcn/ui 컴포넌트

- `skeleton` (로딩 스켈레톤)
- `sheet` (모바일 네비게이션)
- `navigation-menu` (데스크톱 네비)
- `avatar` (자기소개 프로필)

## 수정/생성 대상 파일

| 파일                             | 작업                                 |
| -------------------------------- | ------------------------------------ |
| `src/widgets/header/**`          | 신규 - 헤더 + 모바일 네비            |
| `src/widgets/footer/**`          | 신규 - 푸터                          |
| `src/shared/ui/theme-toggle.tsx` | 신규 - 다크모드 토글                 |
| `src/shared/ui/skeleton.tsx`     | 신규 - 스켈레톤 (shadcn)             |
| `src/shared/ui/spinner.tsx`      | 신규 - 스피너                        |
| `src/app/layout.tsx`             | 수정 - ThemeProvider + Header/Footer |
| `src/app/page.tsx`               | 재작성 - 홈 페이지                   |
| `src/app/about/page.tsx`         | 신규 - 자기소개                      |
| `src/app/sitemap.ts`             | 신규 - sitemap.xml                   |
| `src/app/robots.ts`              | 신규 - robots.txt                    |
| `src/app/not-found.tsx`          | 신규 - 404                           |
| `src/app/error.tsx`              | 신규 - 에러 바운더리                 |
| `src/app/*/loading.tsx`          | 신규 - 라우트별 로딩                 |
| `src/app/*/error.tsx`            | 신규 - 라우트별 에러                 |
| `src/app/globals.css`            | 수정 - 다크모드 CSS 변수 확인        |

## 검증

- 모든 페이지 접근 확인 (/, /about, /portfolio, /study)
- 다크모드 토글 동작 + 시스템 설정 연동
- 반응형: 모바일(375px) / 태블릿(768px) / 데스크톱(1280px) 레이아웃
- 로딩 스켈레톤: 느린 네트워크에서 표시 확인
- 404 페이지: 존재하지 않는 URL 접근
- 에러 바운더리: API 에러 시 토스트 표시
- SEO: `<head>` 메타태그 확인, /sitemap.xml 접근
- `pnpm build` 성공 (SSG/ISR 확인)
- `pnpm typecheck` + `pnpm lint` 통과
