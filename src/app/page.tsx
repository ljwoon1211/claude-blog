import { Post } from '@/domains/post/types';
import { HeroSection } from '@/features/home/components/hero-section';
import { RecentPostsSection } from '@/features/home/components/recent-posts-section';
import { serverOrpc } from '@/shared/api/orpc.server';

export default async function Home() {
  const [portfolioData, studyData] = await Promise.all([
    serverOrpc.post.list({ limit: 3, category: 'portfolio' }),
    serverOrpc.post.list({ limit: 3, category: 'study' }),
  ]);

  const recentPortfolios = (portfolioData?.posts ?? []) as Post[];
  const recentStudies = (studyData?.posts ?? []) as Post[];

  return (
    <div className="flex flex-col gap-16 pt-8 pb-16 md:pt-16">
      <HeroSection />
      <RecentPostsSection
        title="Recent Portfolios"
        viewAllHref="/portfolio"
        posts={recentPortfolios}
        emptyMessage="No portfolios to display."
      />
      <RecentPostsSection
        title="Recent Studies"
        viewAllHref="/study"
        posts={recentStudies}
        emptyMessage="No study notes to display."
      />
    </div>
  );
}
