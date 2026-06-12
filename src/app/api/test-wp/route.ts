import { NextResponse } from 'next/server';
import { getProductCategories, getProducts } from '@/lib/wordpress';

export async function GET() {
  try {
    const categories = await getProductCategories();
    const products = await getProducts(1, 1);

    return NextResponse.json({
      success: true,
      categoriesCount: categories.length,
      firstCategory: categories[0] || null,
      productsCount: products.length,
      firstProduct: products[0] || null,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
