import { NextRequest, NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

const wcAuth = () =>
  Buffer.from(
    `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
  ).toString('base64');

// GET — fetch approved reviews for a product
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url    = new URL(`${WP_BASE_URL}/wc/v3/products/${id}/reviews`);
    url.searchParams.set('per_page', '20');
    url.searchParams.set('status',   'approved');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${wcAuth()}`, Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    // Always return 200 with an empty array on non-OK — WooCommerce may 404
    // for products with no reviews, and echoing that status causes noisy
    // browser console errors even though the UI handles it gracefully.
    if (!res.ok) return NextResponse.json([]);
    const data: unknown = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (err: unknown) {
    console.error('Reviews GET error:', err);
    return NextResponse.json([], { status: 500 });
  }
}

// POST — submit a new review
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }                   = await params;
    const body: unknown            = await req.json();
    const { reviewer, reviewer_email, review, rating } =
      body as { reviewer: string; reviewer_email: string; review: string; rating: number };

    // Basic validation
    if (!reviewer?.trim() || !reviewer_email?.trim() || !review?.trim() || !rating) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    const res = await fetch(`${WP_BASE_URL}/wc/v3/products/${id}/reviews`, {
      method:  'POST',
      headers: {
        Authorization:  `Basic ${wcAuth()}`,
        'Content-Type': 'application/json',
        Accept:         'application/json',
      },
      body: JSON.stringify({
        product_id:     parseInt(id),
        reviewer,
        reviewer_email,
        review,
        rating,
        status:         'approved',
      }),
    });

    const data: unknown = await res.json();
    if (!res.ok) {
      const msg = (data as { message?: string }).message ?? 'Failed to submit review.';
      return NextResponse.json({ error: msg }, { status: res.status });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error('Reviews POST error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
