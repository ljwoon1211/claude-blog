import { eq } from 'drizzle-orm';

import { db } from '@/server/db';
import * as schema from '@/shared/db/schema';
import { extractTextFromTiptap } from '@/shared/lib/tiptap-utils';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000';
const SITE_TITLE = 'Devlog.';
const SITE_DESCRIPTION =
  '기술을 탐구하고, 배움을 기록하고, 성장을 공유하는 공간';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function categoryToPath(category: string): string {
  const map: Record<string, string> = {
    study: 'study',
    portfolio: 'portfolio',
    retrospective: 'retrospective',
  };
  return map[category] ?? 'study';
}

export async function GET() {
  const posts = await db.query.posts.findMany({
    where: eq(schema.posts.published, true),
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    limit: 50,
    with: { postTags: { with: { tag: true } } },
  });

  const items = posts
    .map((post) => {
      const path = categoryToPath(post.category);
      const link = `${SITE_URL}/${path}/${post.slug}`;
      const description = extractTextFromTiptap(post.content);
      const pubDate = new Date(post.createdAt).toUTCString();
      const categories = post.postTags
        .map((pt) => `      <category>${escapeXml(pt.tag.name)}</category>`)
        .join('\n');

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
${categories}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko</language>
    <atom:link href="${escapeXml(SITE_URL)}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
