'use client';

import { EditorContent } from '@tiptap/react';

import { useAutoSave } from '../hooks/use-auto-save';
import { useEditorSetup } from '../hooks/use-editor-setup';
import { EditorMenuBar } from './editor-menu-bar';
import { EditorToolbar } from './editor-toolbar';

interface PostEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onAutoSave?: (content: string) => Promise<void>;
  autoSaveInterval?: number;
}

export function PostEditor({
  initialContent = '',
  onContentChange,
  onAutoSave,
  autoSaveInterval = 30000,
}: PostEditorProps) {
  // 에디터 생성
  const editor = useEditorSetup({
    content: initialContent,
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML());
    },
  });

  // 자동저장 기능 셋업 (onAutoSave 가 있을 때만)
  const autoSaveHandler = async (content: string) => {
    if (onAutoSave) {
      await onAutoSave(content);
    }
  };

  const { isSaving, lastSavedAt } = useAutoSave({
    content: editor?.getHTML() ?? initialContent,
    onSave: autoSaveHandler,
    interval: autoSaveInterval,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="bg-background flex flex-col rounded-md border shadow-sm">
      {onAutoSave && (
        <EditorMenuBar isSaving={isSaving} lastSavedAt={lastSavedAt} />
      )}
      <EditorToolbar editor={editor} />
      <div className="h-full min-h-[500px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
