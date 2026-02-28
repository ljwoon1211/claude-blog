import { Post } from '@/domains/post/types';
import { AboutTeaser } from '@/features/home/components/about-teaser';
import { HeroSection } from '@/features/home/components/hero-section';
import { RecentPostsSection } from '@/features/home/components/recent-posts-section';
import { serverOrpc } from '@/shared/api/orpc.server';

export default async function Home() {
  const recentData = await serverOrpc.post.list({ limit: 3 });
  const recentPosts = (recentData?.posts ?? []) as Post[];

  return (
    <div className="flex flex-col gap-8 pb-16 md:gap-12">
      <HeroSection />
      <RecentPostsSection posts={recentPosts} />
      <AboutTeaser />
    </div>
  );
}
