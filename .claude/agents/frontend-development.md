# Frontend Development Guide

## Features-based 구조

```
src/
├── app/          # Next.js App Router (라우팅, layout, providers)
├── features/     # 기능 중심 슬라이스 (auth/, post/, home/)
└── shared/       # 공유 UI, API 클라이언트, 유틸리티, 레이아웃
```

### 구조 규칙

| 규칙                                   | 설명                                                      |
| -------------------------------------- | --------------------------------------------------------- |
| **의존 방향: app → features → shared** | 역방향 참조 금지                                          |
| **features 간 cross-import 금지**      | `features/auth/`에서 `features/post/` 직접 import 금지    |
| **공통 코드는 shared/로**              | 여러 feature에서 쓰이는 컴포넌트/훅은 `shared/`에 배치    |
| **레이아웃은 shared/layout/**          | Header, Footer 등 전역 레이아웃은 `shared/layout/`에 위치 |

### 디렉토리별 역할

**app/** — Next.js App Router

- 라우팅, layout, loading, error 페이지
- `providers.tsx`: QueryClientProvider, ThemeProvider, IntlProvider
- Server Component에서 데이터 페칭 후 feature 컴포넌트에 전달

**features/** — 기능 슬라이스

- 하나의 기능 도메인을 위한 UI + 로직 묶음
- `features/auth/`: 로그인 폼, 인증 훅, 스키마
- `features/post/`: 포스트 카드, 에디터, 자동저장 훅
- `features/home/`: 히어로 섹션, 최근 포스트 섹션

**shared/** — 공유

- `api/`: oRPC 클라이언트 (`orpc.ts`, `orpc.server.ts`)
- `ui/`: shadcn/ui 래핑 컴포넌트
- `lib/`: 유틸리티 함수 (날짜 포맷, 문자열 처리)
- `layout/`: Header, Footer, MobileNav 등 전역 레이아웃
- `db/`: Drizzle 스키마

### 슬라이스 내부 구조 (세그먼트)

```
src/features/post/
├── components/           # UI 컴포넌트
│   ├── post-card.tsx
│   ├── post-editor.tsx
│   ├── editor-toolbar.tsx
│   └── editor-menu-bar.tsx
├── hooks/                # 커스텀 훅
│   ├── use-auto-save.ts
│   └── use-editor-setup.ts
├── schemas/              # Zod 스키마 (폼 검증 등)
└── lib/                  # 유틸리티, 확장 설정
    └── extensions.ts
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
// features/post/hooks/use-post-list.ts
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
// features/post/hooks/use-post-store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface PostCreateStore {
  isDraftSaved: boolean;
  draftData: Record<string, any>;
  setDraftSaved: (saved: boolean) => void;
  updateDraftField: (field: string, value: any) => void;
}

export const usePostCreateStore = create<PostCreateStore>()(
  immer((set) => ({
    isDraftSaved: false,
    draftData: {},
    setDraftSaved: (saved) => set({ isDraftSaved: saved }),
    updateDraftField: (field, value) =>
      set((state) => {
        state.draftData[field] = value;
      }),
  })),
);
```

- 객체나 배열 등 복잡한 상태를 업데이트할 때는 `immer` 미들웨어 필수 사용
- 전개 연산자(`...`)나 깊은 복사 금지

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
