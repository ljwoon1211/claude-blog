---
description: 커밋 메시지 생성 및 커밋 실행
---

# 커밋 메시지 생성

## 1. 스테이징 확인

// turbo

```bash
git status --short
```

스테이징된 파일이 없으면 사용자에게 알리고 중단.

## 2. 변경사항 분석

// turbo

```bash
git diff --staged
```

## 3. 커밋 메시지 작성

`.claude/skills/code-conventions.md`의 **커밋 메시지** 섹션 규칙을 반드시 따른다:

- **형식**: `<type>(<scope>): <subject>`
- **type**: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `chore`, `ci`, `revert`
- **scope**: 변경 범위 (선택, 소문자) — 예: `post`, `auth`, `db`
- **subject**: **한국어**로 작성, 명령형 현재 시제, 마침표 없음, 50자 이내
- **body**: **한국어**로 작성, 변경 이유가 명확하지 않은 경우에만 추가 (72자 줄바꿈)
- Breaking Change가 있으면 `!` 접미사 + `BREAKING CHANGE:` footer
- type, scope는 영어 그대로 사용

### 판단 기준

- 변경 파일 1~3개 & 단일 목적 → subject만
- 변경 파일 4개 이상 or 복합 변경 → body 포함
- 여러 목적의 변경이 섞여 있으면 → 커밋 분리 제안

## 4. 사용자 확인

생성한 커밋 메시지를 사용자에게 보여주고 승인을 받는다.
수정 요청이 있으면 반영한다.

## 5. 커밋 실행

승인된 메시지로 커밋:

```bash
git commit -m "<승인된 메시지>"
```

body가 있는 경우:

```bash
git commit -m "<subject>" -m "<body>"
```
