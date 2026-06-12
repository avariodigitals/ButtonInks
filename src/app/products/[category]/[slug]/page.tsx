import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getProductBySlug } from '@/lib/wordpress';
import ProductDetailView from '@/components/ProductDetailView';

interface Props {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return {
    title: product ? `${product.name} | ButtonInks` : 'Product Not Found',
    description: product?.short_description.replace(/<[^>]*>?/gm, '') || 'Custom printing services',
  };
}

export default async function DynamicProductPage({ params }: Props) {
  const { category, slug } = await params;

  // Fetch product data on the server
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-4 bg-white">
        <h2 className="text-2xl font-bold font-['Outfit']">Product Not Found</h2>
        <p className="text-gray-500">The product you are looking for might have been moved or removed.</p>
        <Link href="/categories" className="text-green-700 font-bold hover:underline">Return to Categories</Link>
      </div>
    );
  }

  // Pass data to the interactive Client View
  return (
    <main className="w-full bg-white">
      <ProductDetailView product={product} categorySlug={category} />
    </main>
  );
}
