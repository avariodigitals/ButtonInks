import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/wordpress';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(parseInt(id));

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("API Product fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
