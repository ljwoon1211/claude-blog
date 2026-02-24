# Phase 1 - 1. DB 스키마 설계 및 마이그레이션

## 개요

블로그 운영에 필요한 핵심 데이터베이스 테이블들을 Drizzle ORM을 기반으로 설계 및 생성합니다. Supabase PostgreSQL을 사용하며, `blog-prd.md`에 명시된 데이터 모델을 따릅니다.

## 대상 테이블

1. `posts` (게시글 및 페이지)
2. `tags` (태그)
3. `post_tags` (게시글-태그 N:N 매핑)
4. `images` (이미지 라이프사이클 관리)
5. `slug_redirects` (슬러그 변경 이력 관리)

## 상세 스키마 설계

### 1. `posts` 테이블

- `id`: UUID (PK, 기본값 gen_random_uuid())
- `title`: varchar(255) (NOT NULL)
- `slug`: varchar(255) (NOT NULL, UNIQUE)
- `content`: jsonb (NOT NULL)
- `category`: pgEnum ('portfolio', 'study', 'retrospective', 'page') (NOT NULL)
- `thumbnail`: varchar(512)
- `published`: boolean (NOT NULL, 기본값 false)
- `createdAt`: timestamp (NOT NULL, 기본값 now())
- `updatedAt`: timestamp (NOT NULL, 기본값 now())
- `authorId`: UUID (NOT NULL, FK -> auth.users.id)

### 2. `tags` 테이블

- `id`: UUID (PK, 기본값 gen_random_uuid())
- `name`: varchar(100) (NOT NULL, UNIQUE)
- `slug`: varchar(100) (NOT NULL, UNIQUE)

### 3. `post_tags` 테이블

- `postId`: UUID (NOT NULL, FK -> posts.id, CASCADE DELETE)
- `tagId`: UUID (NOT NULL, FK -> tags.id, CASCADE DELETE)
- PK: (postId, tagId)

### 4. `images` 테이블

- `id`: UUID (PK, 기본값 gen_random_uuid())
- `url`: varchar(512) (NOT NULL)
- `key`: varchar(255) (NOT NULL, UNIQUE - R2 오브젝트 키)
- `postId`: UUID (FK -> posts.id, SET NULL - 게시글 미연결 시 고아 이미지 처리)
- `createdAt`: timestamp (NOT NULL, 기본값 now())

### 5. `slug_redirects` 테이블

- `id`: UUID (PK, 기본값 gen_random_uuid())
- `oldSlug`: varchar(255) (NOT NULL, UNIQUE)
- `postId`: UUID (NOT NULL, FK -> posts.id, CASCADE DELETE)
- `createdAt`: timestamp (NOT NULL, 기본값 now())

## 작업 순서 (WBS)

1. `src/shared/db/schema.ts` 등에 위 5개 테이블 및 관계(Relations)에 대한 Drizzle 스키마 정의.
2. `category` Enum 정의.
3. `drizzle-kit generate` 실행하여 마이그레이션 SQL 생성.
4. `drizzle-kit push` 혹은 `migrate` 스크립트를 실행하여 Supabase DB 반영 유효성 확인.

## 검토 및 승인 요청 (User Review Required)

- `blog-prd.md` 기반으로 작성한 위 스키마 설계가 의도하신 내용과 일치하는지 확인해주세요.
- Drizzle 스키마 작성 및 DB 푸시 작업을 시작해도 될지 승인 부탁드립니다.
