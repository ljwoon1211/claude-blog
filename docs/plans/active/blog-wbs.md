# 기술 블로그 WBS (Work Breakdown Structure)

> **[필수/중요] 이 문서는 `blog-prd.md`(제품 요구사항)뿐만 아니라, `CLAUDE.md`(프로젝트 컨벤션 및 룰)를 반드시!! 함께 확인하고 바탕으로 삼아야 합니다. CLAUDE.md의 룰(oRPC 사용, proxy.ts 등)을 절대 무시하지 마세요.**
>
> 이 문서는 위 두 가지 문서를 바탕으로 작성된 작업 분해 구조도 및 구현 로드맵입니다.

## 구현 우선순위

### Phase 1: 핵심 기능 (P0)

1. [ ] DB 스키마 설계 및 마이그레이션 (posts, tags, post_tags, images, slug_redirects)
2. [ ] 어드민 인증 (Supabase Auth) + `/login` 페이지
3. [ ] 게시글 CRUD API (oRPC) — 슬러그 리다이렉트 포함
4. [ ] 태그 시스템 API
5. [ ] 이미지 업로드/삭제 API (Cloudflare R2) + 라이프사이클 관리
6. [ ] tiptap 에디터 UI (이미지/YouTube/코드블록 확장 + 30초 자동저장)
7. [ ] 게시글 목록 페이지 (태그 필터 + 검색 + 무한스크롤)
8. [ ] 게시글 상세 페이지 (tiptap 렌더링 + TOC + 공유)
9. [ ] 홈 페이지 (랜딩)
10. [ ] 자기소개 페이지 (tiptap 편집 가능)
11. [ ] SEO (메타태그, OG, sitemap.xml, robots.txt)
12. [ ] 다크모드 (CSS 변수 기반 설계)
13. [ ] 반응형 디자인
14. [ ] 로딩 상태 (스켈레톤 UI, 스피너)
15. [ ] 에러 핸들링 (404, 500, error.tsx, 토스트)

### Phase 2: 사용자 경험 (P1)

16. [ ] 댓글 시스템 (giscus) 연동
17. [ ] 회고 섹션
18. [ ] 캐싱 적용 (`use cache` + revalidation)

### Phase 3: 부가 기능 (P2)

19. [ ] 고아 이미지 정리 Cron (Inngest)
20. [ ] RSS 피드
21. [ ] 검색 고도화 (Full-Text Search)
22. [ ] 조회수 / 인기글 집계
