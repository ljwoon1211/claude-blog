# Fix Hydration Error in Root Layout

## 개요

브라우저 확장 프로그램(예: ColorZilla)이 `<body>` 태그에 속성(`cz-shortcut-listen="true"`)을 주입하면서 발생하는 React Hydration Error를 해결합니다.

## 문제 원인

Next.js 서버 렌더링 결과와 브라우저(클라이언트) 환경에서 DOM 요소의 속성이 불일치할 때 발생하는 에러입니다. 이미 `<html>` 태그에는 `suppressHydrationWarning`이 적용되어 있으나, 확장 프로그램이 `<body>` 태그에 속성을 주입하므로 `<body>` 태그에도 해당 속성이 필요합니다.

## 작업 계획

1. **대상 파일**: `src/app/layout.tsx`
2. **수정 내용**: `RootLayout` 컴포넌트의 `<body>` 태그에 `suppressHydrationWarning` 속성을 추가합니다.
   - 기존: `<body className="...">`
   - 변경: `<body className="..." suppressHydrationWarning>`
3. **결과 확인**: 개발 서버에서 Hydration Error 콘솔 에러가 사라졌는지 확인합니다.

현재 브라우저 익스텐션으로 인한 속성 주입 에러가 명확하므로, 계획 문서를 작성했습니다. 승인해주시면 바로 작업을 진행하겠습니다!
