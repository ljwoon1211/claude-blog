type TiptapNode = {
  type?: string;
  text?: string;
  content?: TiptapNode[];
};

export function extractTextFromTiptap(node: unknown, maxLength = 200): string {
  const texts: string[] = [];

  function walk(n: TiptapNode) {
    if (n.text) {
      texts.push(n.text);
    }
    if (Array.isArray(n.content)) {
      for (const child of n.content) {
        walk(child);
      }
    }
  }

  walk(node as TiptapNode);
  const full = texts.join(' ').replace(/\s+/g, ' ').trim();
  return full.length > maxLength ? `${full.slice(0, maxLength)}...` : full;
}
