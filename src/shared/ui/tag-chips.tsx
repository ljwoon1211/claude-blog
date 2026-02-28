import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

export interface TagChipProps extends React.ComponentProps<typeof Button> {
  active?: boolean;
}

export const TagChip = React.forwardRef<HTMLButtonElement, TagChipProps>(
  ({ active, className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={active ? 'default' : 'secondary'}
        className={cn(
          'h-[36px] rounded-full px-4 py-2 font-medium',
          !active &&
            'bg-accent text-muted-foreground hover:bg-muted hover:text-foreground border-transparent',
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
TagChip.displayName = 'TagChip';

export function TagChips({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {children}
    </div>
  );
}
