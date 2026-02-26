import { Loader2 } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

const sizeClasses = {
  sm: 'size-4',
  default: 'size-6',
  lg: 'size-8',
  icon: 'size-10',
};

export function Spinner({
  className,
  size = 'default',
  ...props
}: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        'text-muted-foreground animate-spin',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
