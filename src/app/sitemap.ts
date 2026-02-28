import { MetadataRoute } from 'next';

import { serverOrpc } from '@/shared/api/orpc.server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const postsData = await serverOrpc.post.list({ limit: 50 });
  const posts = postsData?.posts ?? [];

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `https://ljwoon.com/${post.category}/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: 'https://ljwoon.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://ljwoon.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://ljwoon.com/portfolio',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://ljwoon.com/study',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...postEntries,
  ];
}
