# Frontend Development Guide

## FSD (Feature-Sliced Design) 레이어 구조

```
src/
├── app/          # 전역 providers, styles, store
├── pages/        # 페이지 컴포지션 (라우트별 조합)
├── widgets/      # 복합 UI 블록 (header/, post-feed/, sidebar/)
├── features/     # 사용자 기능 단위 (post-create, post-search, auth)
├── entities/     # 비즈니스 도메인 UI (post/PostCard, user/UserAvatar)
└── shared/       # 공유 유틸리티, API 클라이언트, 공통 UI
```

### FSD 규칙

| 규칙                                  | 설명                                                          |
| ------------------------------------- | ------------------------------------------------------------- |
| **상위 → 하위만 참조**                | widgets → features, entities, shared (역방향 금지)            |
| **같은 레이어 슬라이스 간 참조 금지** | `features/auth/`에서 `features/post-create/` 직접 import 금지 |
| **Public API**                        | 각 슬라이스는 `index.ts`를 통해서만 외부 노출                 |
| **슬라이스 독립성**                   | 각 슬라이스는 독립 배포 가능한 단위                           |

### 레이어별 역할

**app/** — 전역 설정

- `providers/`: QueryClientProvider, ThemeProvider, IntlProvider
- `styles/`: 전역 CSS, Tailwind 기본 설정
- `store/`: 앱 전역 Zustand 스토어

**pages/** — 페이지 컴포지션

- Next.js `app/` 라우트에서 호출되는 페이지 조합 컴포넌트
- widgets와 features를 조합하여 완성된 페이지 구성
- 비즈니스 로직 없이 조합만 담당

**widgets/** — 복합 UI 블록

- 여러 entities/features를 조합한 독립적 UI 블록
- 예: `header/` (로고 + 네비게이션 + 사용자 메뉴)
- 예: `post-feed/` (PostCard 목록 + 페이지네이션 + 필터)

**features/** — 사용자 기능

- 하나의 완결된 사용자 인터랙션 단위
- 예: `post-create/` (작성 폼 + 제출 로직 + 유효성 검사)
- 예: `post-search/` (검색 입력 + 결과 표시 + 필터)

**entities/** — 비즈니스 도메인 UI

- 도메인 모델의 UI 표현
- 예: `post/` → `PostCard`, `PostPreview`, `PostMeta`
- 예: `user/` → `UserAvatar`, `UserBadge`

**shared/** — 공유

- `api/`: oRPC 클라이언트 (`orpc.ts`, `orpc.server.ts`)
- `ui/`: shadcn/ui 래핑 컴포넌트
- `lib/`: 유틸리티 함수 (날짜 포맷, 문자열 처리)
- `config/`: 상수, 환경변수 타입

### 슬라이스 내부 구조

```
src/features/post-create/
├── ui/                   # 컴포넌트
│   └── post-create-form.tsx
├── model/                # 로직, 훅, 스토어
│   ├── use-create-post.ts
│   └── store.ts
├── api/                  # API 호출 (TanStack Query)
│   └── queries.ts
└── index.ts              # Public API (외부 노출 항목)
```

---

## Server / Client 컴포넌트

### 기본 원칙

- **Server Component 기본**: 모든 컴포넌트는 기본적으로 Server Component
- **`'use client'` 최소화**: 인터랙션이 필요한 최소 범위에만 적용
- **경계 설계**: Server → Client 경계는 가능한 하위 컴포넌트에 배치

### 패턴

```tsx
// Server Component (기본) — 데이터 페칭, 레이아웃
export async function PostPage({ slug }: { slug: string }) {
  const post = await serverOrpc.post.getBySlug({ slug });
  return (
    <article>
      <h1>{post.title}</h1>
      <PostContent content={post.content} />
      <LikeButton postId={post.id} /> {/* Client boundary */}
    </article>
  );
}

// Client Component — 인터랙션 필요 시에만
('use client');
export function LikeButton({ postId }: { postId: string }) {
  const { mutate } = useCreateLike();
  return <button onClick={() => mutate({ postId })}>Like</button>;
}
```

---

## 상태 관리

### 서버 상태: TanStack Query + oRPC

```ts
// features/post-search/api/queries.ts
import { useQuery } from '@tanstack/react-query';

import { orpc } from '@/shared/api/orpc';

export function usePostList(cursor?: string) {
  return useQuery({
    queryKey: ['posts', 'list', cursor],
    queryFn: () => orpc.post.list({ cursor, limit: 10 }),
  });
}
```

### 클라이언트 상태: Zustand

```ts
// features/post-create/model/store.ts
import { create } from 'zustand';

interface PostCreateStore {
  isDraftSaved: boolean;
  setDraftSaved: (saved: boolean) => void;
}

export const usePostCreateStore = create<PostCreateStore>((set) => ({
  isDraftSaved: false,
  setDraftSaved: (saved) => set({ isDraftSaved: saved }),
}));
```

### 폼 상태: react-hook-form + Zod

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export function usePostForm() {
  return useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: '', content: '', tags: [] },
  });
}
```

---

## shadcn/ui 사용

### 래핑 패턴

shadcn/ui 기본 컴포넌트를 직접 수정하지 않고, `src/shared/ui/`에서 래핑:

```tsx
// src/shared/ui/button.tsx — 프로젝트 맞춤 래핑
import {
  type ButtonProps,
  Button as ShadcnButton,
} from '@/components/ui/button';

export function Button({ children, ...props }: ButtonProps) {
  return <ShadcnButton {...props}>{children}</ShadcnButton>;
}
```

### 컴포넌트 추가

```bash
pnpm ui:add button    # shadcn/ui 컴포넌트 추가
```

추가된 컴포넌트는 `src/components/ui/`에 생성됨 → `src/shared/ui/`에서 래핑하여 사용

---

## 다국어 (next-intl)

### 설정

- 지원 언어: 한국어 (`ko`), 영어 (`en`)
- 메시지 파일: `src/messages/ko.json`, `src/messages/en.json`

### 메시지 구조

```json
{
  "common": {
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다"
  },
  "post": {
    "title": "제목",
    "create": "새 글 작성",
    "readMore": "더 읽기"
  },
  "nav": {
    "home": "홈",
    "about": "소개"
  }
}
```

### 사용법

```tsx
import { useTranslations } from 'next-intl';

export function PostCard() {
  const t = useTranslations('post');
  return <a>{t('readMore')}</a>;
}
```

---

## 폰트

- **기본 폰트**: Pretendard (한글/영문 통합)
- `next/font`를 통해 최적화 로딩
- Tailwind에서 `font-sans`로 참조
