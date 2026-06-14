import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/wordpress';

export async function GET() {
  try {
    const products = await getProducts(1, 20);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('API Products List Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
