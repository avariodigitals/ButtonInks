import { NextResponse } from 'next/server';
import { getProducts, WP_BASE_URL } from '@/lib/wordpress';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') ?? undefined;
    const page     = parseInt(searchParams.get('page')     ?? '1');
    const perPage  = parseInt(searchParams.get('per_page') ?? '20');
    const search   = searchParams.get('search')  ?? undefined;
    const include  = searchParams.get('include') ?? undefined;

    const url = new URL(`${WP_BASE_URL}/wc/v3/products`);
    url.searchParams.set('page',     String(page));
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('status',   'publish');
    if (category) url.searchParams.set('category', category);
    if (search)   url.searchParams.set('search',   search);
    if (include)  url.searchParams.set('include',  include);

    const auth = Buffer.from(
      `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString('base64');

    const wpRes = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      next: { revalidate: 60 },
    });

    if (!wpRes.ok) {
      // Fallback through the lib helper
      const params: Record<string, string> = { status: 'publish' };
      if (category) params.category = category;
      if (search)   params.search   = search;
      if (include)  params.include  = include;
      const products = await getProducts(page, perPage, params);
      return NextResponse.json(products);
    }

    const products   = await wpRes.json();
    const totalPages = wpRes.headers.get('X-WP-TotalPages') ?? '1';
    const total      = wpRes.headers.get('X-WP-Total')      ?? String(products.length);

    const res = NextResponse.json(products);
    res.headers.set('X-WP-TotalPages', totalPages);
    res.headers.set('X-WP-Total',      total);
    return res;
  } catch (error: unknown) {
    console.error('API Products List Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
