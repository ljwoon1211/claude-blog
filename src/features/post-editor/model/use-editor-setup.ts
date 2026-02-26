import { UseEditorOptions, useEditor } from '@tiptap/react';

import { defaultExtensions } from '../lib/extensions';

type UseEditorSetupProps = Omit<UseEditorOptions, 'extensions'>;

export function useEditorSetup({ ...options }: UseEditorSetupProps = {}) {
  const editor = useEditor({
    extensions: defaultExtensions,
    editorProps: {
      attributes: {
        class:
          'min-h-[500px] w-full p-4 focus:outline-none max-w-none prose prose-zinc dark:prose-invert',
      },
    },
    ...options,
  });

  return editor;
}
