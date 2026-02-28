# UI 디자인 시스템 적용 계획

## Context

`docs/design/blog-design-system.pen.pen` 디자인 시스템 문서를 기반으로 블로그의 Home, PostList, PostDetail 페이지 UI를 수정/생성합니다. 현재 코드는 Geist 폰트와 기본 스타일을 사용하고 있으나, 디자인은 Fraunces + Pretendard + IBM Plex Mono 폰트 체계와 정교한 레이아웃을 정의합니다.

---

## 1단계: 기초 설정 (폰트, CSS 변수)

### 1-1. 폰트 변경

- **파일**: `src/app/layout.tsx`
- Geist Sans/Mono → **Fraunces** (display), **IBM Plex Mono** (code) via `next/font/google`
- **Pretendard** (UI/body): `pretendard` npm 패키지 설치 후 CSS import
- CSS 변수: `--font-display`, `--font-ui`, `--font-mono`

```
pnpm add pretendard
```

### 1-2. CSS 변수 추가

- **파일**: `src/app/globals.css`
- 누락된 디자인 토큰 추가:

| 변수               | Light   | Dark    | 용도             |
| ------------------ | ------- | ------- | ---------------- |
| `--accent-hover`   | #1B64DA | #6AADFF | 버튼 hover       |
| `--accent-tint`    | #EBF3FE | #1E2F4A | Badge 배경       |
| `--bg-surface`     | #F5F3EF | #2B3542 | Footer 배경      |
| `--text-tertiary`  | #8B95A1 | #8B95A1 | 약한 텍스트      |
| `--text-disabled`  | #B0B8C1 | #4E5968 | 비활성           |
| `--text-on-accent` | #FFFFFF | #FFFFFF | 액센트 위 텍스트 |
| `--positive`       | #34C759 | #30D158 | 성공             |
| `--warning`        | #FF9500 | #FFB340 | 경고             |
| `--border-subtle`  | #F0EDE8 | #2B3542 | 약한 보더        |
| `--radius-button`  | 24px    | -       | 버튼 라디우스    |
| `--radius-pill`    | 28px    | -       | 검색 인풋        |

- `@theme inline` 블록에 새 변수 매핑 추가
- 폰트 변수 매핑: `--font-sans` → `--font-ui`, `--font-mono` → `--font-mono`, `--font-display` 추가

---

## 2단계: 공통 컴포넌트 수정

### 2-1. Header 수정

- **파일**: `src/shared/layout/header.tsx`
- 네비게이션 텍스트 색상: `text-muted-foreground` → `text-tertiary` (디자인: $text-tertiary)
- 로고: Fraunces 18px 600 (`font-display`)
- 네비 간격: logo-nav gap 48px, nav items gap 32px
- 패딩: `px-[80px]` (Desktop), 반응형으로 조정
- Avatar: accent-tint 배경 (40x40)
- ThemeToggle: IconContainer/Small 스타일 (32x32, bg-surface, radius-sm)

### 2-2. Footer 수정

- **파일**: `src/shared/layout/footer.tsx`
- `bg-accent` → `bg-surface` (새 변수)
- justify-between 레이아웃 (왼쪽: copyright, 오른쪽: GitHub/RSS 링크)
- padding [24px, 80px], 반응형 조정
- 텍스트: text-tertiary, Pretendard 13px

### 2-3. PostCard 수정

- **파일**: `src/features/post/components/post-card.tsx`
- cornerRadius: `rounded-xl` (radius-xl = 20px)
- border: `border border-border-primary`
- Thumbnail: bg-muted, h-[200px]
- Content padding: 20px (p-5)
- Tags: Badge/Accent 스타일 (accent-tint 배경, radius-lg)
- Title: Pretendard 18px 600, letterSpacing -0.3, lineHeight 1.4
- Meta: text-tertiary 13px, gap 8px
- hover 효과 유지

### 2-4. TagChip 스타일 미세 조정

- **파일**: `src/shared/ui/tag-chips.tsx`
- Active: `bg-primary text-white` (accent + text-on-accent)
- Default: `bg-card border border-border` (border-primary)
- radius: radius-button (24px) → 이미 rounded-full이므로 유지

---

## 3단계: Home 페이지 수정

### 3-1. HeroSection 수정

- **파일**: `src/features/home/components/hero-section.tsx`
- "Devlog." 타이틀: Fraunces 56px, letterSpacing -2px, text-center
- 서브타이틀: Pretendard 18px, text-secondary, letterSpacing -0.3
- CTA 버튼: "글 둘러보기", primary 스타일 (accent bg, text-on-accent)
- 패딩: 80px, gap 20px
- 반응형: Tablet 40px/padding 60px 32px, Mobile 32px/padding 48px 16px

### 3-2. RecentPostsSection 수정

- **파일**: `src/features/home/components/recent-posts-section.tsx`
- 제목: "최근 글" (한국어로 변경)
- "전체 보기 →" 링크 (text-tertiary)
- 그리드: gap-24 (6 → 24px = gap-6 유지)
- 패딩: `px-[80px]` (Desktop), 반응형
- **하나의 섹션으로 통합** (카테고리 구분 없이 최근 글 3개 표시)
- `serverOrpc.post.list({ limit: 3 })` 호출 (카테고리 필터 없이)

### 3-3. AboutTeaser 섹션 생성

- **파일**: `src/features/home/components/about-teaser.tsx` (새 파일)
- Avatar/Large (64x64, accent-tint 배경) + Info 영역
- 이름: "안녕하세요, 개발자 JW입니다 👋" (Pretendard 18px 600)
- 설명: 2줄 텍스트 (Pretendard 15px, text-secondary, lineHeight 1.6)
- "더 알아보기 →" 링크 (accent 색상, 14px 500)
- gap 32px, padding [48px, 80px]
- 반응형: Tablet gap-20 padding-32, Mobile vertical 레이아웃

### 3-4. Home page 조합 수정

- **파일**: `src/app/page.tsx`
- 구성: HeroSection → RecentPostsSection (통합) → AboutTeaser → Footer
- RecentPostsSection을 하나로 합치고 최근 글 3개 표시

---

## 4단계: PostList 페이지 생성

### 4-1. PostList 레이아웃 컴포넌트

- **파일**: `src/features/post/components/post-list-view.tsx` (새 파일)
- 구성: TagFilter + SearchInput + CardGrid
- TagFilter: TagChips 컴포넌트 활용 (전체, Next.js, React 등 태그)
- SearchInput: pill 형태 (radius-pill), search 아이콘, 480px max-width
- CardGrid: 3열 그리드, gap 24px
- 반응형: Tablet 2열 gap-20, Mobile 1열 gap-16
- 패딩: Desktop `px-[80px]`, Tablet 32px, Mobile 16px

### 4-2. Portfolio 목록 페이지

- **파일**: `src/app/portfolio/page.tsx` (새 파일)
- Server Component, `serverOrpc.post.list({ category: 'portfolio' })` 호출
- PostListView 렌더링

### 4-3. Study 목록 페이지

- **파일**: `src/app/study/page.tsx` (새 파일)
- Server Component, `serverOrpc.post.list({ category: 'study' })` 호출
- PostListView 렌더링

### 4-4. SearchInput 컴포넌트

- **파일**: `src/shared/ui/search-input.tsx` (새 파일)
- pill 형태 인풋 (radius-pill, bg-card, border border-primary)
- Search 아이콘 (lucide search)
- placeholder: "검색어를 입력하세요..."

---

## 5단계: PostDetail 페이지 생성

### 5-1. ArticleHeader 컴포넌트

- **파일**: `src/features/post/components/article-header.tsx` (새 파일)
- 카테고리 뱃지 (accent bg, text-on-accent, radius-button)
- 제목: Fraunces 36px, letterSpacing -1, text-center, max-width 800px
- 메타: Avatar + 날짜 + 읽기 시간 (text-tertiary, gap 16)
- 패딩: [48px, 240px], gap 16px
- 반응형: Tablet [40px, 64px] 28px, Mobile [32px, 16px] 24px

### 5-2. TableOfContents 컴포넌트

- **파일**: `src/features/post/components/table-of-contents.tsx` (새 파일)
- "목차" 라벨 (text-tertiary, 12px, 600, letterSpacing 1)
- 구분선
- 항목 목록 (text-secondary 14px, 활성 항목 accent 색상)
- sticky positioning (top: 100px)
- width: 200px
- Desktop만 표시 (lg:block hidden)

### 5-3. TiptapRenderer 컴포넌트

- **파일**: `src/features/post/components/tiptap-renderer.tsx` (새 파일)
- **Client Component 방식 채택** (사용자 확인)
- 'use client', `useEditor({ editable: false, content })` 사용
- `EditorContent` 렌더링
- `src/features/post/lib/extensions.ts`의 기존 확장 설정 재활용
- prose 스타일링: Pretendard 16px, lineHeight 1.75
- H2: Fraunces 24px 500, letterSpacing -0.5
- CodeBlock: bg #1E1E2E, radius-md, padding 20px
- 추가 패키지 불필요 (기존 @tiptap/react 활용)

### 5-4. TagsAndShare 컴포넌트

- **파일**: `src/features/post/components/tags-and-share.tsx` (새 파일)
- justify-between 레이아웃
- 왼쪽: 태그 뱃지들 (Badge/Accent)
- 오른쪽: 공유 버튼 (IconContainer/Small, share-2 아이콘)

### 5-5. PostDetail 페이지

- **파일**: `src/app/portfolio/[slug]/page.tsx` (새 파일)
- **파일**: `src/app/study/[slug]/page.tsx` (새 파일)
- Server Component, `serverOrpc.post.getBySlug()` 호출
- 구성: ArticleHeader → BodyWrapper (TOC + TiptapRenderer) → TagsAndShare → Divider → Footer
- BodyWrapper: TOC(200px) + ArticleContent(720px), gap 48px, padding [32px, 120px]
- 반응형: Tablet/Mobile TOC 숨김, 패딩 축소

---

## 수정 파일 요약

| 구분   | 파일                                                    | 변경                 |
| ------ | ------------------------------------------------------- | -------------------- |
| 기초   | `src/app/globals.css`                                   | 색상/폰트 변수 추가  |
| 기초   | `src/app/layout.tsx`                                    | 폰트 설정 변경       |
| 공통   | `src/shared/layout/header.tsx`                          | 디자인 토큰 적용     |
| 공통   | `src/shared/layout/footer.tsx`                          | 레이아웃 + 링크 추가 |
| 공통   | `src/features/post/components/post-card.tsx`            | 카드 스타일 조정     |
| 공통   | `src/shared/ui/tag-chips.tsx`                           | 미세 스타일 조정     |
| Home   | `src/features/home/components/hero-section.tsx`         | 디자인 적용          |
| Home   | `src/features/home/components/recent-posts-section.tsx` | 한국어 + 스타일      |
| Home   | `src/features/home/components/about-teaser.tsx`         | **새 파일**          |
| Home   | `src/app/page.tsx`                                      | 구성 변경            |
| List   | `src/features/post/components/post-list-view.tsx`       | **새 파일**          |
| List   | `src/shared/ui/search-input.tsx`                        | **새 파일**          |
| List   | `src/app/portfolio/page.tsx`                            | **새 파일**          |
| List   | `src/app/study/page.tsx`                                | **새 파일**          |
| Detail | `src/features/post/components/article-header.tsx`       | **새 파일**          |
| Detail | `src/features/post/components/table-of-contents.tsx`    | **새 파일**          |
| Detail | `src/features/post/components/tiptap-renderer.tsx`      | **새 파일**          |
| Detail | `src/features/post/components/tags-and-share.tsx`       | **새 파일**          |
| Detail | `src/app/portfolio/[slug]/page.tsx`                     | **새 파일**          |
| Detail | `src/app/study/[slug]/page.tsx`                         | **새 파일**          |

---

## 재사용할 기존 코드

- `src/shared/lib/utils.ts` → `cn()` 유틸리티
- `src/shared/ui/badge.tsx` → Badge 컴포넌트
- `src/shared/ui/tag-chips.tsx` → TagChip/TagChips
- `src/shared/ui/button.tsx` → Button 컴포넌트
- `src/shared/ui/avatar.tsx` → Avatar 컴포넌트
- `src/shared/ui/skeleton.tsx` → 로딩 스켈레톤
- `src/shared/api/orpc.server.ts` → 서버 데이터 페칭
- `src/features/post/lib/extensions.ts` → Tiptap 확장 설정
- `src/domains/post/types.ts` → Post 타입 정의

---

## 검증 방법

1. `pnpm dev` → http://localhost:3000 접속하여 Home 페이지 확인
2. `/portfolio` → PostList 페이지 태그 필터, 검색, 카드 그리드 확인
3. `/portfolio/[slug]` → PostDetail 페이지 TOC, 본문, 태그 확인
4. 반응형 테스트: DevTools에서 1440px, 768px, 375px 확인
5. 다크 모드 토글 테스트
6. `pnpm typecheck` → 타입 에러 없음 확인
7. `pnpm lint` → ESLint 통과 확인
