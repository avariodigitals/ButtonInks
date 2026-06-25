import { NextRequest, NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth   = Buffer.from(
      `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString('base64');

    const url = new URL(`${WP_BASE_URL}/wc/v3/products/${id}/reviews`);
    url.searchParams.set('per_page', '10');
    url.searchParams.set('status',   'approved');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (!res.ok) return NextResponse.json([], { status: res.status });
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (err: unknown) {
    console.error('Reviews API error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
