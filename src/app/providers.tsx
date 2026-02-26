'use client';

import { useState } from 'react';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { TooltipProvider } from '@/shared/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
