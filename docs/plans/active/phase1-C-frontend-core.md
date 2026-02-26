# Phase 1-C: 프론트엔드 코어

## 개요

tiptap 에디터, 게시글 작성/수정, 목록(무한스크롤), 상세(TOC/공유) 페이지를 구현한다.
FSD 구조(entities → features → widgets → pages)를 따른다.

## 선행 조건

- [x] Phase 1-A: 백엔드 인프라
- [x] Phase 1-B: 백엔드 도메인 (Post/Tag/Image API)

---

## 작업 내용

### 1. tiptap 에디터 UI (WBS #6)

**신규 의존성:**

- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`
- `@tiptap/extension-image`, `@tiptap/extension-youtube`
- `@tiptap/extension-code-block-lowlight`, `lowlight`
- `@tiptap/extension-placeholder`, `@tiptap/extension-link`

**FSD 구조:**

```
src/features/post-editor/
├── ui/
│   ├── post-editor.tsx           # tiptap 에디터 메인 컴포넌트
│   ├── editor-toolbar.tsx        # 서식 툴바 (bold, italic, heading, list, link, image, youtube, code)
│   └── editor-menu-bar.tsx       # 상단 메뉴바 (저장 상태 표시)
├── model/
│   ├── use-editor-setup.ts       # tiptap 초기화 훅 (확장 설정)
│   └── use-auto-save.ts          # 30초 자동저장 훅 (onUpdate → dirty → interval → API)
├── lib/
│   └── extensions.ts             # tiptap 확장 설정 모음
└── index.ts
```

**기능 상세:**

- StarterKit: heading(h2,h3,h4), bold, italic, strike, list, blockquote
- Image: 드래그앤드롭/클립보드 붙여넣기 → `upload.image` API → URL 삽입
- Youtube: URL 붙여넣기 → 자동 임베드 (nocookie 모드)
- CodeBlockLowlight: 언어 선택 드롭다운 + 복사 버튼
- Placeholder: "내용을 입력하세요..."
- Link: 하이퍼링크 추가/편집
- 자동저장: `onUpdate` → dirty flag → 30초 interval → `post.update` API → "자동 저장됨 (HH:MM)" 토스트

### 2. 게시글 작성/수정 페이지

**App Router:**

```
src/app/write/page.tsx              # 새 글 작성 (어드민 전용)
src/app/edit/[id]/page.tsx          # 글 수정 (어드민 전용)
```

**FSD 구조:**

```
src/features/tag-input/
├── ui/tag-input.tsx               # 태그 입력 (콤마/엔터 구분, 기존 태그 자동완성)
└── index.ts

src/features/post-form/
├── ui/post-form.tsx               # 제목, 카테고리, 태그, 에디터, 썸네일, 발행 버튼
├── model/post-form.schema.ts      # Zod 스키마 (제목 필수, 카테고리 필수 등)
├── api/use-create-post.ts         # useMutation 훅 (orpcQuery)
├── api/use-update-post.ts         # useMutation 훅 (orpcQuery)
└── index.ts
```

**기능:**

- 제목 입력 → 자동 슬러그 생성 미리보기
- 카테고리 선택 (portfolio/study/retrospective)
- 태그 입력: 콤마/엔터로 구분, 기존 태그 자동완성 (tag.list API)
- 임시저장 관리: [임시저장 불러오기] 버튼 → 모달 (미발행 글 목록)
- 확인 모달: 게시, 삭제, 임시저장 불러오기/삭제

**필요 shadcn/ui 컴포넌트:**

- Dialog (확인 모달)
- Select (카테고리 선택)
- Badge (태그 표시)
- Textarea (제목 입력)

### 3. 게시글 목록 페이지 (WBS #7)

**App Router:**

```
src/app/portfolio/page.tsx          # 포트폴리오 목록
src/app/study/page.tsx              # 공부 목록
```

**FSD 구조:**

```
src/entities/post/
├── ui/post-card.tsx               # 게시글 카드 (썸네일, 제목, 태그, 날짜)
├── model/post.types.ts            # Post 프론트엔드 타입
└── index.ts

src/features/post-filter/
├── ui/tag-filter.tsx              # 태그 칩 필터 바 (상단)
└── index.ts

src/features/post-search/
├── ui/search-input.tsx            # 검색 인풋 (debounce 적용)
└── index.ts

src/widgets/post-feed/
├── ui/post-feed.tsx               # 카드 그리드 + 무한스크롤
├── api/use-infinite-posts.ts      # useInfiniteQuery + Intersection Observer
└── index.ts
```

**기능:**

- 태그 필터: URL 쿼리 `?tag=xxx` → 서버에서 필터링
- 검색: URL 쿼리 `?q=xxx` → debounce 300ms → 서버 검색
- 무한스크롤: Intersection Observer → `fetchNextPage`
- 그리드: 1열(모바일) → 2열(태블릿) → 3열(데스크톱)
- 어드민이면 [새 글 작성] 버튼 표시
- Server Component에서 초기 데이터 fetch → hydration (prefetch)

### 4. 게시글 상세 페이지 (WBS #8)

**App Router:**

```
src/app/portfolio/[slug]/page.tsx   # 포트폴리오 상세
src/app/study/[slug]/page.tsx       # 공부 상세
```

**FSD 구조:**

```
src/widgets/post-detail/
├── ui/post-detail.tsx             # tiptap JSON → 읽기 전용 렌더링
└── index.ts

src/widgets/toc/
├── ui/table-of-contents.tsx       # heading 기반 TOC 사이드바
├── model/use-active-heading.ts    # Intersection Observer로 현재 섹션 추적
└── index.ts

src/features/post-share/
├── ui/share-buttons.tsx           # 링크 복사 + X(Twitter) + LinkedIn 공유
└── index.ts
```

**기능:**

- tiptap JSON → 읽기 전용 에디터 (`editable: false`)
- YouTube: `react-lite-youtube-embed`로 lazy loading 최적화 (신규 의존성)
- slug_redirects 체크: Server Component에서 `post.getBySlug` → redirect 시 `redirect()` 호출
- TOC: h2/h3 추출 → 데스크톱 우측 사이드바 / 모바일 상단 토글
- 스크롤 위치 → 현재 섹션 하이라이트
- 공유: 클립보드 복사 + SNS 공유 (URL 파라미터 방식)
- 어드민이면 [수정]/[삭제] 인라인 버튼
- `generateMetadata()` 동적 메타태그 (SEO)

---

## 신규 의존성

| 패키지                                  | 용도                   |
| --------------------------------------- | ---------------------- |
| `@tiptap/react`                         | tiptap React 바인딩    |
| `@tiptap/starter-kit`                   | 기본 확장 번들         |
| `@tiptap/pm`                            | ProseMirror 코어       |
| `@tiptap/extension-image`               | 이미지 노드            |
| `@tiptap/extension-youtube`             | YouTube 임베드         |
| `@tiptap/extension-code-block-lowlight` | 코드 블록 + 하이라이팅 |
| `@tiptap/extension-placeholder`         | 빈 에디터 힌트         |
| `@tiptap/extension-link`                | 하이퍼링크             |
| `lowlight`                              | 신택스 하이라이팅 엔진 |
| `react-lite-youtube-embed`              | YouTube lazy loading   |

## 추가 필요 shadcn/ui 컴포넌트

- `dialog` (확인 모달)
- `select` (카테고리 선택)
- `badge` (태그 표시)
- `textarea` (제목 입력)
- `dropdown-menu` (코드 블록 언어 선택)
- `separator` (구분선)
- `toggle` (에디터 툴바 버튼)
- `tooltip` (툴바 버튼 힌트)
- `scroll-area` (TOC 스크롤)

## 수정/생성 대상 파일

| 파일                                | 작업                     |
| ----------------------------------- | ------------------------ |
| `src/features/post-editor/**`       | 신규 - tiptap 에디터     |
| `src/features/post-form/**`         | 신규 - 게시글 폼         |
| `src/features/tag-input/**`         | 신규 - 태그 입력         |
| `src/features/post-filter/**`       | 신규 - 태그 필터         |
| `src/features/post-search/**`       | 신규 - 검색              |
| `src/features/post-share/**`        | 신규 - 공유 버튼         |
| `src/entities/post/**`              | 신규 - PostCard, 타입    |
| `src/widgets/post-feed/**`          | 신규 - 목록 + 무한스크롤 |
| `src/widgets/post-detail/**`        | 신규 - 상세 렌더링       |
| `src/widgets/toc/**`                | 신규 - TOC 사이드바      |
| `src/app/write/page.tsx`            | 신규 - 작성 페이지       |
| `src/app/edit/[id]/page.tsx`        | 신규 - 수정 페이지       |
| `src/app/portfolio/page.tsx`        | 신규 - 포트폴리오 목록   |
| `src/app/portfolio/[slug]/page.tsx` | 신규 - 포트폴리오 상세   |
| `src/app/study/page.tsx`            | 신규 - 공부 목록         |
| `src/app/study/[slug]/page.tsx`     | 신규 - 공부 상세         |

## 검증

- `pnpm dev`에서 에디터 동작 확인
- 게시글 생성 → 목록에 표시 → 상세 페이지 접근 플로우
- 이미지 업로드 (드래그앤드롭, 클립보드) → 에디터 내 표시
- YouTube URL 붙여넣기 → 임베드 렌더링
- 코드 블록 → 신택스 하이라이팅
- 30초 자동저장 동작 확인
- 태그 필터 + 검색 동작
- 무한스크롤 동작
- TOC 사이드바 + 스크롤 하이라이트
- 공유 버튼 (링크 복사)
- 슬러그 리다이렉트 (이전 URL → 현재 URL 이동)
- `pnpm typecheck` + `pnpm lint` 통과
