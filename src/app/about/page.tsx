import Link from 'next/link';

import { Post } from '@/domains/post/types';
import { serverOrpc } from '@/shared/api/orpc.server';
import { Button } from '@/shared/ui/button';

export default async function AboutPage() {
  const postResult = await serverOrpc.post.getBySlug({ slug: 'about' });

  if (!postResult || 'redirect' in postResult) {
    return (
      <div className="container mx-auto max-w-screen-md py-32 text-center">
        <h1 className="mb-4 text-3xl font-bold">About page not initialized</h1>
        <p className="text-muted-foreground mb-8">
          Admin needs to create an &quot;about&quot; page post.
        </p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  const post = postResult as Post;

  // TODO: Add strict checking for admin status via Auth/Supabase session later.

  return (
    <div className="container mx-auto max-w-screen-md px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        {/* Placeholder for Edit button (only visible to admin) */}
        {/*
        <Button variant="outline" size="sm" asChild>
          <Link href={`/editor/${post.id}`}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
        */}
      </div>
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        {/* Placeholder: Needs tiptap HTML generator or renderer component */}
        {typeof post.content === 'object' ? (
          <p>
            Tiptap Content Structure Placeholder. The content should be rendered
            by a Tiptap viewer.
          </p>
        ) : (
          <div>{String(post.content)}</div>
        )}
      </div>
    </div>
  );
}
