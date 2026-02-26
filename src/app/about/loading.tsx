import { Skeleton } from '@/shared/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto max-w-screen-md px-4 py-16">
      <Skeleton className="mb-4 h-12 w-3/4" />
      <div className="space-y-4 py-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="mt-8 h-[200px] w-full" />
      </div>
    </div>
  );
}
