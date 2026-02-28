// 한글 지원 슬러그 생성 — 순수 함수

export function createSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isValidSlug(slug: string): boolean {
  if (slug.length === 0 || slug.length > 255) return false;
  return /^[\p{L}\p{N}][\p{L}\p{N}-]*[\p{L}\p{N}]$|^[\p{L}\p{N}]$/u.test(slug);
}
