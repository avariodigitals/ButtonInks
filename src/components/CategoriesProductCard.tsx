"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Heart, Loader2 } from 'lucide-react';
import { WPProduct, decodeHTMLEntities } from '@/lib/wordpress';

function getToken(): string | null {
  try { return localStorage.getItem('bi_token'); } catch { return null; }
}

// ── Price helpers (same logic as ProductCard) ─────────────────────────────────
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function extractAmount(html: string): number | null {
  const match = stripTags(html).match(/\$([\d,]+\.?\d*)/);
  if (!match) return null;
  const val = parseFloat(match[1].replace(/,/g, ''));
  return val > 0 ? val : null;
}

function parsePriceHtml(priceHtml: string): { regular: number | null; current: number | null } {
  if (!priceHtml) return { regular: null, current: null };
  const delMatch = priceHtml.match(/<del[^>]*>([\s\S]*?)<\/del>/i);
  const insMatch = priceHtml.match(/<ins[^>]*>([\s\S]*?)<\/ins>/i);
  if (delMatch && insMatch) {
    return { regular: extractAmount(delMatch[1]), current: extractAmount(insMatch[1]) };
  }
  return { regular: null, current: extractAmount(priceHtml) };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function CategoriesProductCard({
  product,
  index,
}: {
  product: WPProduct;
  index: number;
}) {
  const router = useRouter();
  const href   = `/products/${product.categories[0]?.slug || 'all'}/${product.slug}`;

  const [wishlisted,       setWishlisted]       = useState(false);
  const [wishlistLoading,  setWishlistLoading]  = useState(false);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = getToken();
    if (!token) { router.push(`/login?redirect=${encodeURIComponent(href)}`); return; }
    setWishlistLoading(true);
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: product.id, action: wishlisted ? 'remove' : 'add' }),
      });
      setWishlisted(v => !v);
    } finally { setWishlistLoading(false); }
  };

  return (
    <Link
      href={href}
      className="bg-white rounded-2xl shadow-[0px_2px_8px_0px_rgba(13,27,46,0.04)] outline outline-[1.31px] outline-offset-[-1.31px] outline-slate-900/5 flex flex-col overflow-hidden group hover:shadow-2xl transition-all duration-500 active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] p-4 flex items-center justify-center bg-white overflow-hidden">
        {product.on_sale && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full z-10 shadow-lg">SALE</span>
        )}
        {index === 0 && !product.on_sale && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-green-700 text-white text-[10px] font-black rounded-full z-10 shadow-lg">BEST SELLER</span>
        )}
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-90
            ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-zinc-400 hover:text-red-500 hover:bg-white'}`}
        >
          {wishlistLoading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-white' : ''}`} />
          }
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
          src={product.images[0]?.src || 'https://placehold.co/400x300?text=ButtonInks'}
          alt={decodeHTMLEntities(product.name)}
        />
      </div>

      {/* Details */}
      <div className="p-4 sm:p-6 bg-white border-t border-zinc-100 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            {decodeHTMLEntities(product.categories[0]?.name || 'Printing')}
          </span>
          <h3 className="text-slate-900 text-base sm:text-lg font-bold font-['Outfit'] leading-tight group-hover:text-green-700 transition-colors line-clamp-1">
            {decodeHTMLEntities(product.name)}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(Number(product.average_rating || 4.5)) ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
            ))}
          </div>
          <span className="text-zinc-500 text-xs font-bold font-['Inter']">{product.average_rating || '4.5'}</span>
        </div>

        <div className="flex justify-between items-end mt-1">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-1.5">
              {(() => {
                const { regular, current } = parsePriceHtml(product.price_html || '');
                const displayCurrent = current ?? (parseFloat(product.price || '0') > 0 ? parseFloat(product.price) : null);
                return (
                  <>
                    {regular && (
                      <span className="text-gray-400 text-sm font-normal line-through font-['Inter']">
                        {fmt(regular)}
                      </span>
                    )}
                    <span className={`text-lg sm:text-xl font-black font-['Outfit'] ${regular ? 'text-green-700' : 'text-slate-900'}`}>
                      {displayCurrent ? fmt(displayCurrent) : 'Get a quote'}
                    </span>
                  </>
                );
              })()}
            </div>
            <span className="text-gray-400 text-[10px] font-medium font-['Inter']">Free Shipping over $75</span>
          </div>
          <span className="px-4 sm:px-6 py-3 bg-green-700 group-hover:bg-green-800 text-white text-xs font-bold font-['Inter'] rounded-xl shadow-xl shadow-green-700/20 transition-all uppercase tracking-widest whitespace-nowrap min-h-[44px] flex items-center">
            Shop Now
          </span>
        </div>
      </div>
    </Link>
  );
}
