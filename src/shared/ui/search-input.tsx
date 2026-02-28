'use client';

import * as React from 'react';

import { Search } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface SearchInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  containerClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div
        className={cn(
          'bg-card border-border rounded-pill flex items-center gap-3 border px-4 py-3',
          containerClassName,
        )}
      >
        <Search className="text-text-tertiary size-4 shrink-0" />
        <input
          ref={ref}
          type="text"
          className={cn(
            'text-foreground placeholder:text-text-tertiary w-full bg-transparent text-sm outline-none',
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
SearchInput.displayName = 'SearchInput';
