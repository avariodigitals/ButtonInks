import { NextResponse } from 'next/server';
import { getProductVariations } from '@/lib/wordpress';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    const variations = await getProductVariations(productId);
    return NextResponse.json(variations);
  } catch (error: unknown) {
    console.error('Variations API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch variations' },
      { status: 500 }
    );
  }
}
