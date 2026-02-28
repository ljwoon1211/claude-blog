'use client';

import { useEffect } from 'react';

import { EditorContent, useEditor } from '@tiptap/react';

import { defaultExtensions } from '../lib/extensions';

interface TiptapRendererProps {
  content: unknown;
  headingIds?: { id: string; text: string }[];
}

export function TiptapRenderer({ content, headingIds }: TiptapRendererProps) {
  const editor = useEditor({
    extensions: defaultExtensions,
    content: content as Record<string, unknown>,
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose-article focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (!editor || !headingIds?.length) return;

    const headings = editor.view.dom.querySelectorAll('h2, h3, h4');
    let counter = 0;
    headings.forEach((heading) => {
      const item = headingIds?.[counter];
      if (item) {
        heading.id = item.id;
        counter++;
      }
    });
  }, [editor, headingIds]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
