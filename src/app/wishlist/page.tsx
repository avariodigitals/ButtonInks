"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart, ShoppingCart, Trash2, ArrowLeft, Loader2, RefreshCw, Package,
} from 'lucide-react';
import { WPProduct } from '@/lib/wordpress';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';

function getToken(): string | null {
  try { return localStorage.getItem('bi_token'); } catch { return null; }
}

export default function WishlistPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  const [loading, setLoading]         = useState(true);
  const [productIds, setProductIds]   = useState<number[]>([]);
  const [products, setProducts]       = useState<WPProduct[]>([]);
  const [removing, setRemoving]       = useState<number | null>(null);
  const [addingId, setAddingId]       = useState<number | null>(null);

  // ── Fetch wishlist IDs from plugin, then fetch product details ───────────
  const loadWishlist = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/login?redirect=/wishlist'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const ids: number[] = Array.isArray(data) ? data : (data.wishlist ?? []);
      setProductIds(ids);

      if (ids.length === 0) { setProducts([]); return; }

      // Fetch each product detail
      const settled = await Promise.allSettled(
        ids.map(id => fetch(`/api/products/${id}`).then(r => r.json()))
      );
      const loaded = settled
        .filter((r): r is PromiseFulfilledResult<WPProduct> => r.status === 'fulfilled' && !r.value?.error)
        .map(r => r.value);
      setProducts(loaded);
    } catch {
      showNotification({ title: 'Error', message: 'Could not load wishlist.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [router, showNotification]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  // ── Remove from wishlist ──────────────────────────────────────────────────
  const handleRemove = async (productId: number) => {
    const token = getToken();
    if (!token) return;
    setRemoving(productId);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, action: 'remove' }),
      });
      if (res.ok) {
        setProductIds(prev => prev.filter(id => id !== productId));
        setProducts(prev => prev.filter(p => p.id !== productId));
        showNotification({ title: 'Removed', message: 'Item removed from wishlist.', type: 'info' });
      }
    } finally {
      setRemoving(null);
    }
  };

  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = async (product: WPProduct) => {
    setAddingId(product.id);
    try {
      await addToCart({
        id:       product.id,
        name:     product.name,
        price:    parseFloat(product.price) || 0,
        quantity: 1,
        image:    product.images?.[0]?.src ?? '',
        slug:     product.slug,
        category: product.categories?.[0]?.slug ?? 'all',
      });
      showNotification({ title: 'Added to cart', message: product.name, type: 'success' });
    } finally {
      setAddingId(null);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="w-full bg-white border-b border-gray-200 py-12 px-6">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-4">
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-48 h-8 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3.5 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">

      {/* ── Header ── */}
      <div className="w-full bg-white border-b border-gray-200 py-12 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-4">
          <Link href="/categories" className="flex items-center gap-2 text-green-700 font-bold text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Heart className="w-8 h-8 text-green-700 fill-green-700" />
              <h1 className="text-4xl font-bold font-['Outfit'] text-slate-900">My Wishlist</h1>
              {productIds.length > 0 && (
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                  {productIds.length}
                </span>
              )}
            </div>
            <button
              onClick={loadWishlist}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12">

        {/* ── Empty state ── */}
        {products.length === 0 ? (
          <div className="w-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-gray-200" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-slate-900">Your wishlist is empty</h2>
              <p className="text-slate-500 max-w-sm">Save your favourite products here to keep track of them for your next project.</p>
            </div>
            <Link href="/categories" className="px-8 py-4 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-900/10">
              Explore Products
            </Link>
          </div>
        ) : (

          /* ── Product grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md hover:border-green-200 transition-all flex flex-col">

                {/* Image */}
                <Link href={`/products/${product.categories?.[0]?.slug ?? 'all'}/${product.slug}`} className="relative aspect-square bg-gray-50 overflow-hidden block">
                  {product.images?.[0]?.src ? (
                    <Image
                      src={product.images[0].src}
                      alt={product.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-200" />
                    </div>
                  )}
                  {product.on_sale && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      Sale
                    </span>
                  )}
                </Link>

                {/* Info */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex-1">
                    <Link href={`/products/${product.categories?.[0]?.slug ?? 'all'}/${product.slug}`}>
                      <h3 className="font-bold text-zinc-900 text-sm leading-snug hover:text-green-700 transition-colors line-clamp-2">{product.name}</h3>
                    </Link>
                    {product.categories?.[0] && (
                      <p className="text-xs text-zinc-400 mt-1">{product.categories[0].name}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-green-700">
                      ${parseFloat(product.price || '0').toFixed(2)}
                    </span>
                    {product.on_sale && product.regular_price && (
                      <span className="text-xs text-zinc-400 line-through">
                        ${parseFloat(product.regular_price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
                    >
                      {addingId === product.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <ShoppingCart className="w-3.5 h-3.5" />}
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      disabled={removing === product.id}
                      className="p-2.5 border border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500 text-zinc-400 rounded-xl transition-all"
                      aria-label="Remove from wishlist"
                    >
                      {removing === product.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
