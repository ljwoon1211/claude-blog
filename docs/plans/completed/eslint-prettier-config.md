# ESLint + TypeScript + Prettier + Tailwind 설정

## 개요

- **목적**: Next.js 16 프로젝트에 코드 품질 도구(ESLint, Prettier)와 TypeScript strict 설정 최적화
- **대상 사용자**: 개발자 (본인)
- **우선순위**: P0 (필수) — 코드 일관성 및 품질의 기반

## 요구사항

### 기능 요구사항

- [ ] FR-1: ESLint flat config — `next/core-web-vitals` + `typescript-eslint/recommended` + Prettier 통합
- [ ] FR-2: Prettier — 싱글 쿼트, 세미콜론, trailing comma (code-conventions.md 기준)
- [ ] FR-3: import 순서 자동 정렬 — React → 외부 라이브러리 → `@/` 내부 모듈 → 상대 경로
- [ ] FR-4: 미사용 import 자동 제거
- [ ] FR-5: Tailwind 클래스 논리 오류 검사
- [ ] FR-6: TypeScript strict 설정 강화
- [ ] FR-7: `lint`, `lint:fix`, `format`, `format:check`, `typecheck` npm 스크립트 추가
- [ ] FR-8: 커밋 시 자동 lint/format 강제 (husky + lint-staged)

### 비기능 요구사항

- [ ] NFR-1: ESLint + Prettier 충돌 없음 (eslint-config-prettier로 해결)
- [ ] NFR-2: 에디터 저장 시 자동 포맷팅 가능한 구조

## 기술 설계

### 설치할 패키지

| 패키지                                  | 용도                              |
| --------------------------------------- | --------------------------------- |
| `prettier`                              | 코드 포맷터                       |
| `eslint-config-prettier`                | ESLint ↔ Prettier 충돌 방지       |
| `@trivago/prettier-plugin-sort-imports` | Prettier에서 import 순서 정렬     |
| `prettier-plugin-tailwindcss`           | Tailwind 클래스 자동 정렬         |
| `eslint-plugin-unused-imports`          | 미사용 import 자동 제거           |
| `eslint-plugin-tailwindcss`             | Tailwind 클래스 논리 오류 검사    |
| `husky`                                 | Git hooks 관리                    |
| `lint-staged`                           | 커밋 시 staged 파일만 lint/format |

### 수정할 파일

| 파일                | 변경 내용                                                        |
| ------------------- | ---------------------------------------------------------------- |
| `eslint.config.mjs` | typescript-eslint + prettier + unused-imports + tailwindcss 추가 |
| `.prettierrc`       | [NEW] 포맷 규칙 정의                                             |
| `.prettierignore`   | [NEW] 포맷 제외 경로                                             |
| `.lintstagedrc.js`  | [NEW] lint-staged 설정                                           |
| `tsconfig.json`     | strict 옵션 강화 (noUncheckedIndexedAccess 등)                   |
| `package.json`      | scripts 추가 (lint:fix, format, typecheck)                       |

### ESLint Config 구조 (eslint.config.mjs)

```javascript
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,        // Prettier 충돌 방지 (반드시 마지막)
  globalIgnores([...]),
]);
```

### Prettier Config (.prettierrc)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 80,
  "plugins": [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss"
  ],
  "importOrder": [
    "^react",
    "^next",
    "<THIRD_PARTY_MODULES>",
    "^@/(.*)$",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

### TypeScript 강화 옵션

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": false,
    "forceConsistentCasingInFileNames": true
  }
}
```

## 작업 분해 (WBS)

1. [ ] 패키지 설치 (prettier, eslint-config-prettier, 플러그인들, husky, lint-staged)
2. [ ] `.prettierrc` 생성
3. [ ] `.prettierignore` 생성
4. [ ] `eslint.config.mjs` 수정 (unused-imports, tailwindcss 플러그인 포함)
5. [ ] `tsconfig.json` strict 옵션 강화
6. [ ] `package.json` scripts 고도화
7. [ ] husky + lint-staged 설정
8. [ ] `pnpm lint` + `pnpm format` + `pnpm typecheck` 실행 검증
9. [ ] `pnpm build` 정상 빌드 확인

## 검증 기준

- [ ] `pnpm lint` — 오류 없이 통과
- [ ] `pnpm format` — 전체 코드 포맷팅 성공
- [ ] `pnpm typecheck` — 타입 체크 통과
- [ ] `pnpm build` — 프로덕션 빌드 성공
