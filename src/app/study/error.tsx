'use client';

import { useEffect } from 'react';

import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/shared/ui/button';

export default function StudyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Study Error:', error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-screen-md px-4 py-32 text-center">
      <AlertTriangle className="text-destructive mx-auto mb-4 h-12 w-12" />
      <h2 className="mb-2 text-2xl font-bold">
        스터디 게시글을 불러오지 못했습니다
      </h2>
      <p className="text-muted-foreground mb-8">
        {error.message || '데이터를 가져오는 중 문제가 발생했습니다.'}
      </p>
      <Button onClick={() => reset()}>
        <RefreshCw className="mr-2 h-4 w-4" /> 다시 시도
      </Button>
    </div>
  );
}
