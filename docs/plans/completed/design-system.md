# 디자인 시스템 구현 계획 — Pencil MCP (.pen)

## 개요

블로그 PRD 기반으로 **Pretendard + Fraunces 폰트**, **토스 블루 악센트**, **북유럽 노르딕 디자인** 컨셉의 디자인 시스템을 Pencil MCP `.pen` 파일로 구현합니다.

> [!IMPORTANT]
> 노르딕 미니멀리즘의 따뜻한 여백과 소프트 라운딩 + 토스의 깔끔한 블루 악센트를 융합합니다.

---

## 디자인 컨셉

### 핵심 키워드

| 요소       | 컨셉                                                  |
| ---------- | ----------------------------------------------------- |
| **폰트**   | Pretendard (UI 전체) + Fraunces (디스플레이 제목)     |
| **악센트** | 토스 블루 `#3182F6` — CTA, 링크, 인터랙티브 요소      |
| **배경**   | 따뜻한 크림 `#FAF8F5` (Light) / 다크 `#191F28` (Dark) |
| **형태**   | 큰 코너 라디우스(16~24px), 필 버튼, Subtle 보더       |
| **반응형** | Mobile(375px) / Tablet(768px) / Desktop(1440px)       |

---

## 컬러 시스템

### Light Mode

```
Page Background:       #FAF8F5   따뜻한 크림
Card Background:       #FFFFFF   순백
Surface:               #F5F3EF   표면 틴트
Surface Muted:         #F0EDE8   음소거 표면

Accent Primary:        #3182F6   토스 블루 (CTA, 링크)
Accent Hover:          #1B64DA   토스 블루 호버
Accent Tint:           #3182F615 토스 블루 15% (뱃지 배경)
Accent Light:          #EBF3FE   토스 블루 라이트 배경

Text Primary:          #191F28   토스 스타일 메인 텍스트
Text Secondary:        #4E5968   보조 텍스트
Text Tertiary:         #8B95A1   3차 텍스트
Text Disabled:         #B0B8C1   비활성 텍스트

Border Primary:        #E8E4DF   카드 테두리 (노르딕 웜 그레이)
Border Subtle:         #F0EDE8   구분선

Positive:              #34C759   성공
Warning:               #FF9500   경고
Destructive:           #E54D2E   위험/삭제
```

### Dark Mode

```
Page Background:       #191F28   토스 다크 배경
Card Background:       #212A36   다크 카드
Surface:               #2B3542   다크 표면
Surface Muted:         #36414E   다크 음소거 표면

Accent Primary:        #4B96FF   다크모드 블루 (밝기 보정)
Accent Hover:          #6AADFF   다크모드 블루 호버
Accent Tint:           #4B96FF20 다크모드 블루 틴트
Accent Light:          #1E2F4A   다크모드 블루 배경

Text Primary:          #F2F4F6   다크모드 메인 텍스트
Text Secondary:        #B0B8C1   다크모드 보조 텍스트
Text Tertiary:         #8B95A1   다크모드 3차 텍스트
Text Disabled:         #4E5968   다크모드 비활성

Border Primary:        #36414E   다크모드 테두리
Border Subtle:         #2B3542   다크모드 구분선

Positive:              #30D158   다크 성공
Warning:               #FFB340   다크 경고
Destructive:           #FF6B6B   다크 위험
```

---

## 타이포그래피

| 용도          | 폰트          | 크기 | 굵기           | 자간   |
| ------------- | ------------- | ---- | -------------- | ------ |
| 페이지 타이틀 | Fraunces      | 40px | Normal (400)   | -1px   |
| 섹션 타이틀   | Fraunces      | 24px | Normal (400)   | -0.5px |
| 카드 타이틀   | Pretendard    | 18px | SemiBold (600) | -0.3px |
| 본문          | Pretendard    | 15px | Regular (400)  | 0      |
| 네비게이션    | Pretendard    | 14px | Medium (500)   | 0      |
| 버튼          | Pretendard    | 14px | Medium (500)   | 0      |
| 라벨/캡션     | Pretendard    | 13px | Medium (500)   | 0      |
| 뱃지          | Pretendard    | 12px | Medium (500)   | 0      |
| 코드/데이터   | IBM Plex Mono | 14px | Medium (500)   | 0      |

> **Fraunces**: 구글 폰트로 무료 오픈소스(SIL Open Font License). 상업적 사용 가능.

---

## 코너 라디우스

```
8px   — 로고 아이콘, 차트 바
12px  — 아이콘 컨테이너, 작은 요소
16px  — 뱃지, 배너
20px  — 카드, 테이블, 모달
24px  — 버튼 (필 형태)
28px  — 검색 인풋 (필 형태)
9999px — 아바타 (원형)
```

---

## 인터랙션 상태

| 상태               | 변화                                                 |
| ------------------ | ---------------------------------------------------- |
| **Hover**          | 배경 밝기 -5%, 또는 `accent-hover` 색상              |
| **Active/Pressed** | 배경 밝기 -10%, scale(0.98)                          |
| **Focus**          | `2px solid accent` 포커스 링 + `2px offset` (접근성) |
| **Disabled**       | `opacity: 0.4`, 커서 `not-allowed`                   |

### 포커스 링 스타일 (WAI-ARIA)

```
Light Mode:  2px solid #3182F6, offset 2px, border-radius inherit
Dark Mode:   2px solid #4B96FF, offset 2px, border-radius inherit
```

- 키보드 탐색 시(`focus-visible`)만 표시, 마우스 클릭 시 숨김
- 모든 인터랙티브 요소(버튼, 인풋, 링크, 태그)에 일관 적용

---

## Design → Code 네이밍 규칙

Pencil `.pen` 변수명과 Tailwind CSS 변수(`globals.css`)를 1:1 매핑합니다.

| .pen 변수         | CSS 변수           | Tailwind 사용                    |
| ----------------- | ------------------ | -------------------------------- |
| `$bg-page`        | `--bg-page`        | `bg-[var(--bg-page)]`            |
| `$bg-card`        | `--bg-card`        | `bg-[var(--bg-card)]`            |
| `$accent`         | `--accent`         | `text-[var(--accent)]`           |
| `$text-primary`   | `--text-primary`   | `text-[var(--text-primary)]`     |
| `$border-primary` | `--border-primary` | `border-[var(--border-primary)]` |
| `$radius-card`    | `--radius-card`    | `rounded-[var(--radius-card)]`   |
| `$font-display`   | `--font-display`   | `font-[var(--font-display)]`     |
| `$font-ui`        | `--font-ui`        | `font-[var(--font-ui)]`          |

> **네이밍 원칙**: `$` prefix → `--` CSS custom property로 직접 변환 가능하도록 kebab-case 통일

---

## 반응형 브레이크포인트

| 뷰포트      | 너비   | 컨텐츠 패딩 | 카드 그리드 | 네비게이션             |
| ----------- | ------ | ----------- | ----------- | ---------------------- |
| **Mobile**  | 375px  | 16px        | 1열         | 햄버거 메뉴            |
| **Tablet**  | 768px  | 32px        | 2열         | 축소 네비              |
| **Desktop** | 1440px | 80px        | 3열         | 풀 네비 + TOC 사이드바 |

---

## 구현할 컴포넌트 목록

### Phase 1: 기본 토큰 & 기초 컴포넌트

1. **Design Tokens** — Variables + 다크모드 테마 축
2. **Button** — Primary(토스 블루), Secondary(Outlined), Ghost, Destructive
3. **Input** — Text Input, Search Input
4. **Badge** — Positive, Neutral, Accent, Destructive
5. **Avatar** — 이니셜, 이미지 플레이스홀더
6. **Icon Container** — 아이콘 래퍼 (44x44)

### Phase 2: 복합 컴포넌트

7. **Top Navigation** — 로고 + 네비 링크 + 검색 + 다크모드 토글
8. **Post Card** — 썸네일 + 제목 + 태그 + 날짜 (목록 페이지용)
9. **Tag Chip** — 태그 필터 칩
10. **Toast** — 성공/에러/경고

### Phase 3: 레이아웃 프레임

11. **Mobile Layout** (375px)
12. **Tablet Layout** (768px)
13. **Desktop Layout** (1440px)

### Phase 4: 페이지 디자인 (9 스크린)

14. **Home** — Desktop / Tablet / Mobile
15. **Post List** — Desktop / Tablet / Mobile
16. **Post Detail** — Desktop / Tablet / Mobile

---

## 작업 순서 (Pencil MCP)

### Step 1: 변수(Variables) 설정

- `set_variables`로 라이트/다크 색상 토큰, 타이포, 스페이싱 정의
- 테마 축: `mode: ["light", "dark"]`

### Step 2: 기초 컴포넌트 생성

- `batch_design`으로 `reusable: true` 컴포넌트 생성
- 캔버스 좌측에 컴포넌트 라이브러리 영역 배치
- 각 컴포넌트 완성 후 `get_screenshot`으로 검증

### Step 3: 복합 컴포넌트 조합

- 기초 컴포넌트를 `ref`로 참조하여 조합
- Navigation, Post Card 등 생성

### Step 4: 반응형 페이지 디자인

- Desktop → Tablet → Mobile 순서로 디자인
- 뷰포트별 별도 프레임으로 배치

---

## 검증 계획

### 시각적 검증 (Pencil MCP)

- 각 컴포넌트마다 `get_screenshot`으로 화면 확인
- `snapshot_layout`으로 오버랩/클리핑 문제 검증
- 다크모드 테마 전환 테스트

### 사용자 수동 검증

- Pencil 에디터에서 `.pen` 파일 열어 확인
- 컴포넌트 인스턴스 정상 동작 확인
- 다크모드 테마 전환 시 색상 변수 적용 확인
