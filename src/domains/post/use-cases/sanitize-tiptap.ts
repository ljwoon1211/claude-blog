const DANGEROUS_PROTOCOLS = /^\s*(javascript|data\s*:|vbscript)\s*:/i;

/**
 * TipTap JSON에서 위험한 프로토콜(javascript:, vbscript:, data:)을 재귀적으로 제거한다.
 * Link mark의 href, Image/iframe node의 src 등을 검사한다.
 */
export function sanitizeTiptapContent(
  node: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...node };

  // 노드 attrs의 href/src 검사
  if (result.attrs && typeof result.attrs === 'object') {
    const attrs = { ...(result.attrs as Record<string, unknown>) };

    if (
      typeof attrs.href === 'string' &&
      DANGEROUS_PROTOCOLS.test(attrs.href)
    ) {
      attrs.href = '';
    }
    if (typeof attrs.src === 'string' && DANGEROUS_PROTOCOLS.test(attrs.src)) {
      attrs.src = '';
    }

    result.attrs = attrs;
  }

  // marks 배열의 attrs.href 검사 (Link mark)
  if (Array.isArray(result.marks)) {
    result.marks = result.marks.map((mark: unknown) => {
      if (!mark || typeof mark !== 'object') return mark;
      const m = mark as Record<string, unknown>;
      if (!m.attrs || typeof m.attrs !== 'object') return m;

      const markAttrs = m.attrs as Record<string, unknown>;
      if (
        typeof markAttrs.href === 'string' &&
        DANGEROUS_PROTOCOLS.test(markAttrs.href)
      ) {
        return { ...m, attrs: { ...markAttrs, href: '' } };
      }
      return m;
    });
  }

  // 자식 노드 재귀 처리
  if (Array.isArray(result.content)) {
    result.content = result.content.map((child: unknown) => {
      if (!child || typeof child !== 'object') return child;
      return sanitizeTiptapContent(child as Record<string, unknown>);
    });
  }

  return result;
}
