"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { WPProduct } from '@/lib/wordpress';

export default function WishlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WPProduct[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('bi_token');
    if (!token) {
      router.push('/login?redirect=wishlist');
      return;
    }

    // In a real app, we would fetch product details for the saved IDs
    // For now, we'll show an empty state or sample data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-700 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full bg-white border-b border-gray-200 py-12 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-4">
          <Link href="/categories" className="flex items-center gap-2 text-green-700 font-bold text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <div className="flex items-center gap-4">
            <Heart className="w-8 h-8 text-green-700 fill-green-700" />
            <h1 className="text-4xl font-bold font-['Outfit'] text-slate-900">My Wishlist</h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12">
        {wishlistItems.length === 0 ? (
          <div className="w-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center gap-6">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-gray-200" />
             </div>
             <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-slate-900">Your wishlist is empty</h2>
                <p className="text-slate-500 max-w-sm">Save your favorite products here to keep track of them for your next project.</p>
             </div>
             <Link href="/categories" className="px-8 py-4 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-900/10">
                Explore Products
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Real items would be mapped here */}
          </div>
        )}
      </div>
    </main>
  );
}
