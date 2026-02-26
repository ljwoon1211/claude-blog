'use client';

import { useEffect } from 'react';

import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/shared/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service like Sentry
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="bg-destructive/10 text-destructive rounded-full p-6">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight">
        문제가 발생했습니다.
      </h2>
      <p className="text-muted-foreground mt-4 max-w-sm">
        {error.message ||
          '예상치 못한 오류가 발생했습니다. 나중에 다시 시도해 주세요.'}
      </p>
      <Button className="mt-8" onClick={() => reset()}>
        <RefreshCw className="mr-2 h-4 w-4" /> 다시 시도
      </Button>
    </div>
  );
}
