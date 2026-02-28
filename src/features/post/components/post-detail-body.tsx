'use client';

import { TableOfContents, extractTocItems } from './table-of-contents';
import { TiptapRenderer } from './tiptap-renderer';

interface PostDetailBodyProps {
  content: unknown;
}

export function PostDetailBody({ content }: PostDetailBodyProps) {
  const tocItems = extractTocItems(content);

  return (
    <div className="mx-auto flex max-w-[1440px] justify-center gap-12 px-4 py-8 md:px-16 lg:px-[120px]">
      <TableOfContents items={tocItems} />
      <div className="max-w-[720px] min-w-0 flex-1">
        <TiptapRenderer
          content={content}
          headingIds={tocItems.map((item) => ({
            id: item.id,
            text: item.text,
          }))}
        />
      </div>
    </div>
  );
}
