import { Badge } from '@/shared/ui/badge';

interface EditorMenuBarProps {
  isSaving: boolean;
  lastSavedAt: Date | null;
}

export function EditorMenuBar({ isSaving, lastSavedAt }: EditorMenuBarProps) {
  return (
    <div className="prose prose-zinc dark:prose-invert flex max-w-none items-center justify-between p-2 text-sm">
      <div className="px-2 font-semibold">내용 작성</div>
      <div className="flex items-center gap-2">
        {isSaving ? (
          <Badge
            variant="secondary"
            className="text-muted-foreground animate-pulse"
          >
            저장 중...
          </Badge>
        ) : lastSavedAt ? (
          <Badge
            variant="outline"
            className="text-muted-foreground border-transparent"
          >
            자동 저장됨 ({lastSavedAt.toLocaleTimeString()})
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-muted-foreground border-transparent"
          >
            임시 저장 대기 중
          </Badge>
        )}
      </div>
    </div>
  );
}
