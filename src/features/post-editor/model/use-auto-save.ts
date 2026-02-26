import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  interval?: number; // 단위: ms (기본 30초)
}

export function useAutoSave({
  content,
  onSave,
  interval = 30000,
}: UseAutoSaveProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const contentRef = useRef(content);

  // 컨텐츠가 변경되면 최신값을 ref에 저장하고 변경됨(dirty)으로 표시
  useEffect(() => {
    if (contentRef.current !== content) {
      contentRef.current = content;
      setIsDirty(true);
    }
  }, [content]);

  useEffect(() => {
    const timer = setInterval(async () => {
      // 변경된 사항이 없거나 저장 중이면 스킵
      if (!isDirty || isSaving) return;

      setIsSaving(true);
      try {
        await onSave(contentRef.current);
        setLastSavedAt(new Date());
        setIsDirty(false); // 저장 완료시 dirty 상태 해제
      } catch (error) {
        console.error('자동 저장 실패:', error);
      } finally {
        setIsSaving(false);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isDirty, isSaving, interval, onSave]);

  return { isDirty, lastSavedAt, isSaving };
}
