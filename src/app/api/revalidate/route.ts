/**
 * On-Demand Revalidation Webhook
 * 
 * WordPress can call this endpoint when content is published/updated to
 * immediately invalidate cached data without waiting for TTL expiry.
 * 
 * Usage from WordPress:
 * POST https://yoursite.com/api/revalidate
 * Headers: { "x-revalidate-secret": "your-secret-token" }
 * Body: { "type": "product"|"post"|"category", "slug": "...", "id": 123 }
 */

import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Verify secret token to prevent unauthorized revalidation
    const secret = req.headers.get('x-revalidate-secret');
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { type, slug, id } = body;

    // Revalidate based on content type
    switch (type) {
      case 'product':
        revalidateTag('products', {});
        if (slug) revalidateTag(`product-${slug}`, {});
        if (id) revalidateTag(`product-${id}`, {});
        revalidatePath('/api/products-list', 'page');
        revalidatePath('/api/search', 'page');
        break;

      case 'post':
        revalidateTag('blog-posts', {});
        if (slug) {
          revalidateTag(`blog-post-${slug}`, {});
          revalidatePath(`/api/blog/${slug}`, 'page');
        }
        revalidatePath('/api/blog', 'page');
        revalidatePath('/api/search', 'page');
        break;

      case 'category':
        revalidateTag('categories', {});
        revalidatePath('/api/products-list', 'page');
        break;

      case 'all':
        revalidateTag('products', {});
        revalidateTag('blog-posts', {});
        revalidateTag('categories', {});
        revalidatePath('/api/products-list', 'page');
        revalidatePath('/api/blog', 'page');
        revalidatePath('/api/search', 'page');
        break;

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ 
      revalidated: true, 
      type, 
      slug, 
      id,
      timestamp: new Date().toISOString() 
    });
  } catch (error: unknown) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Revalidation failed' },
      { status: 500 }
    );
  }
}
