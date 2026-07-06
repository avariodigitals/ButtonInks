import { NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page    = searchParams.get('page')     ?? '1';
    const perPage = searchParams.get('per_page') ?? '12';

    const url = new URL(`${WP_BASE_URL}/wp/v2/posts`);
    url.searchParams.set('page',          page);
    url.searchParams.set('per_page',      perPage);
    url.searchParams.set('status',        'publish');
    url.searchParams.set('_embed',        '1'); // includes featured image + categories

    const res = await fetch(url.toString(), {
      cache: 'no-store', // always fresh — new posts show immediately
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: res.status });
    }

    const posts = await res.json();
    const totalPages = res.headers.get('X-WP-TotalPages') ?? '1';
    const total      = res.headers.get('X-WP-Total')      ?? String(posts.length);

    const response = NextResponse.json(posts);
    response.headers.set('X-WP-TotalPages', totalPages);
    response.headers.set('X-WP-Total',      total);
    return response;
  } catch (error: unknown) {
    console.error('Blog API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
