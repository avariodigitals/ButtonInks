import { NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

export const revalidate = 300; // 5-minute ISR at the route level

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const url = new URL(`${WP_BASE_URL}/wp/v2/posts`);
    url.searchParams.set('slug',    slug);
    url.searchParams.set('status',  'publish');
    url.searchParams.set('_embed',  '1');

    const res = await fetch(url.toString(), { 
      next: { revalidate: 300, tags: ['blog-posts', `blog-post-${slug}`] } // 5min cache
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch post' }, { status: res.status });
    }

    const posts = await res.json() as unknown[];
    if (!posts.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(posts[0]);
  } catch (error: unknown) {
    console.error('Blog post API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
