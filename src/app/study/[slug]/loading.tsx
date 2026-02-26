import { Skeleton } from '@/shared/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto max-w-screen-md px-4 py-16">
      <Skeleton className="mb-4 h-12 w-3/4" />
      <Skeleton className="mb-8 h-4 w-32" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="my-8 h-[300px] w-[80%]" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  );
}
