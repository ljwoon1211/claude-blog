import { Skeleton } from '@/shared/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16 md:px-8">
      <Skeleton className="mb-8 h-10 w-48" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
