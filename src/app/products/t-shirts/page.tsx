"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, Filter, ChevronDown, Star,
  SlidersHorizontal, X, ArrowUpDown, Loader2, Package,
} from 'lucide-react';
import { WPProduct } from '@/lib/wordpress';

// ── Price helpers ─────────────────────────────────────────────────────────────
function stripTags(html: string) { return html.replace(/<[^>]*>/g, ''); }
function extractAmount(html: string): number | null {
  const m = stripTags(html).match(/\$([\d,]+\.?\d*)/);
  if (!m) return null;
  const v = parseFloat(m[1].replace(/,/g, ''));
  return v > 0 ? v : null;
}
function parsePriceHtml(h: string): { regular: number | null; current: number | null } {
  if (!h) return { regular: null, current: null };
  const del = h.match(/<del[^>]*>([\s\S]*?)<\/del>/i);
  const ins = h.match(/<ins[^>]*>([\s\S]*?)<\/ins>/i);
  if (del && ins) return { regular: extractAmount(del[1]), current: extractAmount(ins[1]) };
  return { regular: null, current: extractAmount(h) };
}
const fmtPrice = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

// ── Sub-category fallback images ──────────────────────────────────────────────
const FALLBACK_IMAGES: Record<string, string> = {
  "Men's T-Shirt":   "https://central.buttoninks.com/wp-content/uploads/2026/06/4eaa81fd3f8803cade95bdbc610dba5e45973afd.png",
  "Women's T-Shirt": "https://central.buttoninks.com/wp-content/uploads/2026/06/7a4596b8d8979fd598a6e8b40d2a292364de6b00.png",
  "Kids":            "https://central.buttoninks.com/wp-content/uploads/2026/06/2ab084396e36a5f4a5c851ba84842287549d7268.png",
  "Crew Neck":       "https://central.buttoninks.com/wp-content/uploads/2026/06/eb946d3fd8aec044d6bd8fcbbf3a8ac9d2cb5e1c.png",
  "V-Neck":          "https://central.buttoninks.com/wp-content/uploads/2026/06/dff4c6cee9fe84c6072352d6b6e281addb70a751.png",
};

// wpImage comes from WC category data when available; falls back to FALLBACK_IMAGES
const subCategories: { name: string; slug: string; wpImage?: string }[] = [
  { name: "Men's T-Shirt",   slug: "mens-t-shirt"   },
  { name: "Women's T-Shirt", slug: "womens-t-shirt" },
  { name: "Kids",            slug: "kids-t-shirt"   },
  { name: "Crew Neck",       slug: "crew-neck"      },
  { name: "V-Neck",          slug: "v-neck"         },
];

function subCatImage(sub: { name: string; wpImage?: string }): string {
  return sub.wpImage || FALLBACK_IMAGES[sub.name] || "https://placehold.co/283x287";
}

// ── WC category slug for "t-shirts" — WooCommerce uses the slug or ID
// We search by the "custom-t-shirts" category slug that exists on the site.
// The API accepts a category name search string; we use the slug directly.
const TSHIRT_CATEGORY_SLUG = "custom-t-shirts";

const filterGroups = [
  { title: "Featured",    options: ["Best Sellers", "New Arrivals", "Better by Design"] },
  { title: "Gender",      options: ["Men", "Women", "Unisex"] },
  { title: "Collar",      options: ["Crew Neck", "V-Neck", "U-Neck", "Wide Neck"] },
  { title: "Material",    options: ["100% Cotton", "Cotton/Poly Blend", "Performance Poly", "Tri-Blend"] },
  { title: "Price Range", options: ["Under $10", "$10–$20", "$20–$35", "$35+"] },
];

// ── Collapsible filter group ──────────────────────────────────────────────────
function FilterGroup({ title, options }: { title: string; options: string[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="py-3 border-t border-green-900/5 flex flex-col gap-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex justify-between items-center w-full py-1"
      >
        <span className="text-neutral-900 text-xs font-bold font-['Inter'] uppercase tracking-wider">
          {title}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="flex flex-col gap-2 mt-2.5">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-green-700 focus:ring-green-500 shrink-0" />
              <span className="text-neutral-700 text-xs font-normal font-['Inter'] leading-5 group-hover:text-green-700 transition-colors">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-green-700" />
          <span className="text-neutral-900 text-base font-bold font-['Inter']">Filters</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>
      {filterGroups.map(g => <FilterGroup key={g.title} {...g} />)}
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-100" />
      <div className="p-3.5 flex flex-col gap-2.5">
        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-8 w-16 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Live product card ─────────────────────────────────────────────────────────
function ProductCard({ product }: { product: WPProduct }) {
  const categorySlug = product.categories?.[0]?.slug ?? 'all';
  const href = product.slug && product.categories?.[0]?.slug
    ? `/products/${categorySlug}/${product.slug}`
    : null;
  const image = product.images?.[0]?.src;
  const isNew = product.acf?.enable_designer || product.acf?.enable_upload;

  if (!href) return null;

  return (
    <Link
      href={href}
      className="bg-white rounded-2xl shadow-[0px_2px_8px_0px_rgba(13,27,46,0.06)] outline outline-[1.31px] outline-offset-[-1.31px] outline-slate-900/5 flex flex-col overflow-hidden group active:scale-[0.98] transition-all hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        {product.on_sale && parseFloat(product.regular_price || '0') > parseFloat(product.price || '0') && parseFloat(product.price || '0') > 0 && (
          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">Sale</span>
        )}
        {isNew && !(product.on_sale && parseFloat(product.regular_price || '0') > parseFloat(product.price || '0') && parseFloat(product.price || '0') > 0) && (
          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-green-700 text-white text-[10px] font-bold rounded-full">Custom</span>
        )}
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-200" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3.5 flex flex-col gap-2 border-t border-zinc-100">
        <h3 className="text-slate-900 text-sm font-semibold font-['Outfit'] leading-5 line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        {parseFloat(product.average_rating) > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s}
                  className="w-3 h-3"
                  fill={s <= Math.round(parseFloat(product.average_rating)) ? "#ea580c" : "none"}
                  stroke="#ea580c"
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-slate-400 text-[11px] font-normal font-['Inter']">
              {product.average_rating} ({product.rating_count.toLocaleString()})
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex justify-between items-center pt-0.5">
          <div className="flex flex-col">
            {(() => {
              const { regular, current } = parsePriceHtml(product.price_html || '');
              const displayCurrent = current ?? (parseFloat(product.price || '0') > 0 ? parseFloat(product.price) : null);
              return (
                <div className="flex flex-wrap items-baseline gap-1">
                  {regular && (
                    <span className="text-gray-400 text-xs font-normal line-through font-['Inter']">{fmtPrice(regular)}</span>
                  )}
                  <span className={`text-sm font-bold font-['Outfit'] ${regular ? 'text-green-700' : 'text-slate-900'}`}>
                    {displayCurrent ? fmtPrice(displayCurrent) : 'Get a quote'}
                  </span>
                </div>
              );
            })()}
            {product.acf?.bulk_pricing?.[0] && (
              <span className="text-gray-400 text-[10px] font-['Inter']">
                min {product.acf.bulk_pricing[0].min_qty}
              </span>
            )}
          </div>
          <span className="px-3.5 py-2 bg-green-700 group-hover:bg-green-800 rounded-xl text-white text-xs font-bold font-['Inter'] transition-colors shadow-sm shadow-green-900/20">
            Shop
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TshirtsPage() {
  const [filterOpen,      setFilterOpen]      = useState(false);
  const [sortOpenMobile,  setSortOpenMobile]  = useState(false);
  const [sortOpenDesktop, setSortOpenDesktop] = useState(false);

  // ── Live WP products ────────────────────────────────────────────────────
  const [products,  setProducts]  = useState<WPProduct[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      // First try fetching by category slug
      const res = await fetch(
        `/api/products-list?category=${TSHIRT_CATEGORY_SLUG}&per_page=24`
      );
      const data = await res.json();

      if (res.ok && Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback: search for "t-shirt" keyword
        const fallbackRes = await fetch('/api/products-list?search=t-shirt&per_page=24');
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok && Array.isArray(fallbackData)) {
          setProducts(fallbackData);
        } else {
          setProducts([]);
        }
      }
    } catch {
      setLoadError(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <main className="w-full flex flex-col items-center bg-white">

      {/* ── Hero ── */}
      <section className="w-full bg-emerald-50 px-4 sm:px-6 py-10 sm:py-14 flex flex-col items-center gap-4">
        <nav className="flex items-center gap-1 flex-wrap justify-center">
          <Link href="/" className="text-emerald-500 text-xs sm:text-sm font-medium font-['Inter'] hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0" />
          <Link href="/categories" className="text-emerald-500 text-xs sm:text-sm font-medium font-['Inter'] hover:underline">Categories</Link>
          <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-zinc-500 text-xs sm:text-sm font-medium font-['Inter']">T-Shirts</span>
        </nav>

        <h1 className="text-center text-green-600 text-4xl sm:text-5xl lg:text-6xl font-bold font-['Outfit'] leading-tight">
          T-Shirts
        </h1>

        <p className="max-w-md text-center text-zinc-500 text-sm sm:text-base font-normal font-['Inter'] leading-relaxed px-2">
          Professional custom t-shirts with embroidery and print options. Premium quality, bulk pricing, fast delivery.
        </p>

        {/* Live product count badge — only shown once WP has enough products */}
        {!loading && products.length > 10 && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter']">
            {products.length} products available
          </span>
        )}
      </section>

      {/* ── Sub-category scroll row ── */}
      <div className="w-full max-w-[1280px] px-4 sm:px-6 pt-6 sm:pt-10">
        <div className="relative">
          <div className="absolute right-0 top-0 bottom-4 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none sm:hidden" />
          <div className="overflow-x-auto no-scrollbar pb-2">
            <div className="flex gap-3 sm:gap-5 min-w-max">
              {subCategories.map(sub => (
                <Link
                  key={sub.name}
                  href={`/categories?category=${sub.slug}`}
                  className="flex flex-col items-center gap-2 group focus:outline-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={subCatImage(sub)}
                    alt={sub.name}
                    className="w-[200px] sm:w-[200px] lg:w-[220px] aspect-[4/5] object-cover rounded-2xl border-2 border-transparent group-hover:border-green-500 group-focus:border-green-500 transition-all shadow-sm group-hover:shadow-md"
                  />
                  <span className="text-xs sm:text-sm font-medium font-['Outfit'] text-neutral-800 group-hover:text-green-700 transition-colors text-center max-w-[200px] sm:max-w-[200px] leading-tight">
                    {sub.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky toolbar ── */}
      <div className="lg:hidden w-full sticky top-[64px] z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-2 shadow-sm mt-2">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
        </button>
        <button
          onClick={() => setSortOpenMobile(v => !v)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200 text-zinc-700 rounded-xl text-xs font-bold active:scale-95 transition-all"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          Sort
        </button>
      </div>

      {/* ── Sort sheet (mobile) ── */}
      {sortOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setSortOpenMobile(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />
            <p className="text-sm font-bold text-zinc-900 mb-4 font-['Inter']">Sort By</p>
            {['Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Best Rated'].map(opt => (
              <button
                key={opt}
                onClick={() => setSortOpenMobile(false)}
                className="w-full text-left py-3.5 text-sm text-zinc-700 border-b border-gray-100 last:border-0 font-['Inter'] hover:text-green-700 transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="w-full max-w-[1280px] px-4 sm:px-6 py-6 sm:py-10 flex gap-8 items-start">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-60 xl:w-64 shrink-0 sticky top-24">
          <div className="w-full p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <FilterContent />
          </div>
        </aside>

        {/* Product grid column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 sm:gap-6">

          {/* Results bar — desktop */}
          <div className="hidden sm:flex justify-between items-center">
            <p className="text-sm font-normal font-['Inter'] text-gray-600">
              {loading
                ? <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin text-green-700" /> Loading products from WordPress…</span>
                : <><strong className="text-zinc-900">{products.length}</strong> {products.length === 1 ? 'product' : 'products'} found</>
              }
            </p>
            <div className="relative">
              <button
                onClick={() => setSortOpenDesktop(v => !v)}
                className="px-3 py-2 bg-white rounded-lg border border-gray-200 flex items-center gap-2 text-xs font-medium text-gray-600 hover:border-green-500 hover:text-green-700 transition-all"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort: Most Popular
                <ChevronDown className="w-3 h-3" />
              </button>
              {sortOpenDesktop && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-gray-100 shadow-xl z-20 overflow-hidden">
                  {['Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Best Rated'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSortOpenDesktop(false)}
                      className="w-full text-left px-4 py-2.5 text-xs text-zinc-700 hover:bg-green-50 hover:text-green-700 font-['Inter'] transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Loading skeletons ── */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* ── Error state ── */}
          {!loading && loadError && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-red-300" />
              </div>
              <p className="text-zinc-500 font-semibold font-['Inter']">Could not load products right now.</p>
              <button
                onClick={fetchProducts}
                className="px-5 py-2.5 bg-green-700 text-white text-sm font-bold rounded-xl hover:bg-green-800 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !loadError && products.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-gray-200" />
              </div>
              <p className="text-zinc-500 font-semibold font-['Inter']">No t-shirt products available yet.</p>
              <Link href="/categories" className="px-5 py-2.5 bg-green-700 text-white text-sm font-bold rounded-xl hover:bg-green-800 transition-colors">
                Browse all categories
              </Link>
            </div>
          )}

          {/* ── Live product grid ── */}
          {!loading && !loadError && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {filterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] flex flex-col max-h-[88dvh]">
            <div className="flex justify-center pt-4 pb-2 shrink-0">
              <div className="w-10 h-1.5 bg-gray-200 rounded-full" />
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-4 no-scrollbar">
              <FilterContent onClose={() => setFilterOpen(false)} />
            </div>
            <div className="px-6 pb-6 pt-3 shrink-0 border-t border-gray-100">
              <button
                onClick={() => setFilterOpen(false)}
                className="w-full py-4 bg-green-700 hover:bg-green-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all"
              >
                {loading ? 'Loading…' : `Show ${products.length} Results`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
