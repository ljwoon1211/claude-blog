import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

export const defaultExtensions = [
  StarterKit.configure({
    heading: {
      levels: [2, 3, 4],
    },
  }),
  Image.configure({
    inline: true,
    HTMLAttributes: {
      class: 'rounded-md max-w-full my-4 border object-cover',
    },
  }),
  Youtube.configure({
    nocookie: true,
    HTMLAttributes: {
      class: 'w-full aspect-video rounded-md my-4',
    },
  }),
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: {
      class: 'rounded-md p-4 bg-zinc-900 text-zinc-50 overflow-x-auto my-4',
    },
  }),
  Placeholder.configure({
    placeholder: '내용을 입력하세요...',
    emptyEditorClass:
      'is-editor-empty text-muted-foreground placeholder:text-muted-foreground',
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class:
        'text-primary underline underline-offset-4 decoration-primary/50 hover:decoration-primary',
    },
  }),
];
