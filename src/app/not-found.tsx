import Link from 'next/link';

import { Home } from 'lucide-react';

import { Button } from '@/shared/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-primary/20 text-9xl font-extrabold tracking-tight">
        404
      </h1>
      <h2 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
        Page Not Found
      </h2>
      <p className="text-muted-foreground mt-4 sm:text-lg">
        요청하신 페이지를 찾을 수 없습니다. URL을 확인해 주세요.
      </p>
      <div className="mt-10 flex gap-4">
        <Button asChild size="lg">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            홈으로 가기
          </Link>
        </Button>
        {/* 추후 검색 컴포넌트/경로가 있다면 연결 */}
        {/* <Button variant="outline" size="lg" asChild>
          <Link href="/search">
            <Search className="mr-2 h-4 w-4" />
            검색하기
          </Link>
        </Button> */}
      </div>
    </div>
  );
}
