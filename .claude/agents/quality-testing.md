# Quality & Testing Guide

## 테스트 전략 개요

| 레벨                | 도구         | 범위                           | 위치                 |
| ------------------- | ------------ | ------------------------------ | -------------------- |
| **단위 테스트**     | Vitest       | 유틸리티, 도메인 로직, 훅      | `tests/unit/`        |
| **컴포넌트 테스트** | Vitest + RTL | React 컴포넌트 렌더링/인터랙션 | `tests/unit/`        |
| **통합 테스트**     | Vitest + MSW | API 호출 포함 기능 테스트      | `tests/integration/` |
| **E2E 테스트**      | Playwright   | 사용자 시나리오 전체 흐름      | `tests/e2e/`         |

---

## Vitest 단위/통합 테스트

### 설정

```ts
// vitest.config.ts
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

### 도메인 로직 테스트

```ts
// tests/unit/domains/post/post.test.ts
import { describe, expect, it } from 'vitest';

import { Post } from '@/domains/post/domain/entities/post';

describe('Post', () => {
  it('draft 상태에서 publish 가능', () => {
    const post = new Post('1', 'Title', slug, 'Content', 'draft', new Date());
    const published = post.publish();
    expect(published.status).toBe('published');
  });

  it('published 상태에서 publish 시 에러', () => {
    const post = new Post(
      '1',
      'Title',
      slug,
      'Content',
      'published',
      new Date(),
    );
    expect(() => post.publish()).toThrow();
  });
});
```

### 컴포넌트 테스트 (RTL)

```tsx
// tests/unit/entities/post/post-card.test.tsx
import { render, screen } from '@testing-library/react';

import { PostCard } from '@/entities/post';

describe('PostCard', () => {
  it('제목과 요약을 표시', () => {
    render(<PostCard title="Test Post" summary="Summary" slug="test" />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });
});
```

---

## MSW (API 모킹)

### 핸들러 설정

```ts
// tests/mocks/handlers.ts
import { HttpResponse, http } from 'msw';

export const handlers = [
  http.post('/rpc/post/list', () => {
    return HttpResponse.json({
      posts: [{ id: '1', title: 'Test Post', slug: 'test-post' }],
      nextCursor: null,
    });
  }),
];
```

### 통합 테스트에서 사용

```ts
// tests/integration/features/post-search.test.tsx
import { setupServer } from 'msw/node';

import { handlers } from '../../mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PostSearch', () => {
  it('검색 결과를 표시', async () => {
    // 컴포넌트 렌더링 + API 호출 검증
  });
});
```

---

## Playwright E2E 테스트

### 설정

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  baseURL: 'http://localhost:3000',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: true,
  },
});
```

### E2E 테스트 작성

```ts
// tests/e2e/blog.spec.ts
import { expect, test } from '@playwright/test';

test.describe('블로그', () => {
  test('홈에서 포스트 목록 표시', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('article')).toHaveCount(10);
  });

  test('포스트 상세 페이지 이동', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Test Post').click();
    await expect(page).toHaveURL(/\/posts\/.+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
```

---

## Sentry 에러 모니터링

### 설정

- `@sentry/nextjs` 패키지 사용
- 클라이언트/서버 각각 초기화
- 소스맵 업로드 (빌드 시)

### 에러 바운더리

```tsx
// 전역 에러 바운더리 적용
// app/global-error.tsx (Next.js 기본)
// 커스텀 에러 바운더리는 widgets 레벨에서 적용
```

### 커스텀 에러 리포팅

```ts
import * as Sentry from '@sentry/nextjs';

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { domain: 'post', operation: 'create' },
  });
  throw error;
}
```

---

## 테스트 우선순위

### 필수 테스트 (Must)

- 도메인 엔티티/값 객체 로직
- 유스케이스 (비즈니스 규칙)
- 핵심 사용자 플로우 E2E (포스트 CRUD)

### 권장 테스트 (Should)

- oRPC 프로시저 입출력 검증
- 주요 컴포넌트 렌더링
- 폼 유효성 검사

### 선택 테스트 (Nice to Have)

- 스타일/레이아웃 스냅샷
- 성능 벤치마크
- 접근성 (a11y) 검증

---

## 명령어

```bash
pnpm test                 # Vitest 전체 실행
pnpm test -- --watch      # Watch 모드
pnpm test -- --coverage   # 커버리지 리포트
pnpm test:e2e             # Playwright E2E
pnpm test:e2e -- --ui     # Playwright UI 모드
```
