# Fix oRPC Initialization Error Plan

## 증상

- 앱 실행 시 `ReferenceError: Cannot access 'os' before initialization` 에러 발생.
- 에러 발생 위치: `src/server/orpc/routers/auth.ts:13:27`

## 원인 파악

- `auth.ts`에서 `os` 객체를 초기화 전에 접근하고 있음.
- `os` 객체를 가져오는(import) 방식에 문제가 있거나 순환 참조(circular dependency)가 발생했을 가능성이 높음.

## 해결 계획

1. `src/server/orpc/routers/auth.ts` 파일 확인
2. `src/server/orpc/index.ts`, `src/shared/api/orpc.server.ts` 등의 관련 파일 import 구조 확인
3. import 순서 조정 또는 oRPC 라우터 정의 방식 수정을 통해 순환 참조 제거
4. 에러 해결 여부 확인

## 진행 상황

- [ ] 계획 수립
- [ ] 관련 파일(auth.ts, os 객체 선언부 등) 코드 분석
- [ ] 코드 수정 (순환 참조 또는 초기화 문제 해결)
- [ ] 정상 동작 확인
