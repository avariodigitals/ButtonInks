import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/wordpress';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') ?? undefined;
    const page     = parseInt(searchParams.get('page') ?? '1');
    const perPage  = parseInt(searchParams.get('per_page') ?? '20');
    const search   = searchParams.get('search') ?? undefined;

    const params: Record<string, string> = { status: 'publish' };
    if (category) params.category = category;
    if (search)   params.search   = search;

    const products = await getProducts(page, perPage, params);
    return NextResponse.json(products);
  } catch (error: unknown) {
    console.error('API Products List Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
