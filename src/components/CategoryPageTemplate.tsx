"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, Filter, ChevronDown,
  Star, Heart, SlidersHorizontal, X, ArrowUpDown, Loader2, Package,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WPProduct } from '@/lib/wordpress';

import Pagination from '@/components/Pagination';

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

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SubCategory {
  name: string;
  slug: string;
  wpImage?: string;    // set when WP category has an image — overrides fallback
  fallback?: string;   // static fallback image URL
}

export interface FilterGroup {
  title: string;
  options: string[];
}

export interface CategoryPageConfig {
  title: string;
  subtitle: string;
  breadcrumb: string;          // label shown in breadcrumb trail
  wpCategorySlug: string;      // WooCommerce category slug to fetch products
  searchFallback: string;      // keyword to fall back to if category returns nothing
  subCategories: SubCategory[];
  filterGroups: FilterGroup[];
}

// ── Shared sort options ───────────────────────────────────────────────────────
const SORT_OPTIONS = [
  'Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Best Rated',
];

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

// ── Collapsible filter group ──────────────────────────────────────────────────
function FilterGroupItem({ title, options }: FilterGroup) {
  const [open, setOpen] = useState(true);
  return (
    <div className="py-3 border-t border-green-900/5 flex flex-col gap-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex justify-between items-center w-full py-1"
      >
        <span className="text-neutral-900 text-xs font-bold font-['Inter'] uppercase tracking-wider">{title}</span>
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

function FilterPanel({ groups, onClose }: { groups: FilterGroup[]; onClose?: () => void }) {
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
      {groups.map(g => <FilterGroupItem key={g.title} {...g} />)}
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: WPProduct }) {
  const router = useRouter();
  const categorySlug = product.categories?.[0]?.slug ?? 'all';
  const href  = `/products/${categorySlug}/${product.slug}`;
  const image = product.images?.[0]?.src;
  const rating = parseFloat(product.average_rating);

  const [wishlisted,      setWishlisted]      = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try { const t = localStorage.getItem('bi_token'); if (!t) { router.push(`/login?redirect=${encodeURIComponent(href)}`); return; }
      setWishlistLoading(true);
      await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify({ product_id: product.id, action: wishlisted ? 'remove' : 'add' }) });
      setWishlisted(v => !v);
    } finally { setWishlistLoading(false); }
  };

  return (
    <Link
      href={href}
      className="bg-white rounded-2xl shadow-[0px_2px_8px_0px_rgba(13,27,46,0.06)] outline outline-[1.31px] outline-offset-[-1.31px] outline-slate-900/5 flex flex-col overflow-hidden group active:scale-[0.98] transition-all hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        {product.on_sale && parseFloat(product.regular_price || '0') > parseFloat(product.price || '0') && parseFloat(product.price || '0') > 0 && (
          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">Sale</span>
        )}
        {!(product.on_sale && parseFloat(product.regular_price || '0') > parseFloat(product.price || '0') && parseFloat(product.price || '0') > 0) && (product.acf?.enable_designer || product.acf?.enable_upload) && (
          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-green-700 text-white text-[10px] font-bold rounded-full">Custom</span>
        )}
        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-90
            ${wishlisted ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-sm text-zinc-400 hover:text-red-500 hover:bg-white"}`}
        >
          {wishlistLoading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-white' : ''}`} />
          }
        </button>
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

      <div className="p-3.5 flex flex-col gap-2 border-t border-zinc-100">
        <h3 className="text-slate-900 text-sm font-semibold font-['Outfit'] leading-5 line-clamp-2">{product.name}</h3>

        {rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-3 h-3"
                  fill={s <= Math.round(rating) ? "#ea580c" : "none"}
                  stroke="#ea580c" strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-slate-400 text-[11px] font-['Inter']">
              {product.average_rating} ({product.rating_count.toLocaleString()})
            </span>
          </div>
        )}

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
              <span className="text-gray-400 text-[10px] font-['Inter']">min {product.acf.bulk_pricing[0].min_qty}</span>
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

// ── Main template ─────────────────────────────────────────────────────────────
export default function CategoryPageTemplate({ config }: { config: CategoryPageConfig }) {
  const { title, subtitle, breadcrumb, wpCategorySlug, searchFallback, subCategories, filterGroups } = config;

  const [filterOpen,       setFilterOpen]       = useState(false);
  const [sortOpenMobile,   setSortOpenMobile]   = useState(false);
  const [sortOpenDesktop,  setSortOpenDesktop]  = useState(false);
  const [products,   setProducts]   = useState<WPProduct[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState(false);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PER_PAGE = 24;

  const fetchProducts = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(
        `/api/products-list?category=${wpCategorySlug}&per_page=${PER_PAGE}&page=${pageNum}`
      );
      const data = await res.json();
      const tp = parseInt(res.headers.get('X-WP-TotalPages') ?? '1');
      setTotalPages(isNaN(tp) ? 1 : tp);

      if (res.ok && Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else if (pageNum === 1) {
        // First page empty — try keyword fallback
        const fallbackRes = await fetch(
          `/api/products-list?search=${encodeURIComponent(searchFallback)}&per_page=${PER_PAGE}&page=1`
        );
        const fallbackData = await fallbackRes.json();
        const fbTp = parseInt(fallbackRes.headers.get('X-WP-TotalPages') ?? '1');
        setTotalPages(isNaN(fbTp) ? 1 : fbTp);
        setProducts(fallbackRes.ok && Array.isArray(fallbackData) ? fallbackData : []);
      } else {
        setProducts([]);
      }
    } catch {
      setLoadError(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [wpCategorySlug, searchFallback]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchProducts(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="w-full flex flex-col items-center bg-white">

      {/* ── Hero ── */}
      <section className="w-full bg-emerald-50 px-4 sm:px-6 py-10 sm:py-14 flex flex-col items-center gap-4">
        <nav className="flex items-center gap-1 flex-wrap justify-center">
          <Link href="/" className="text-emerald-500 text-xs sm:text-sm font-medium font-['Inter'] hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0" />
          <Link href="/categories" className="text-emerald-500 text-xs sm:text-sm font-medium font-['Inter'] hover:underline">Categories</Link>
          <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-zinc-500 text-xs sm:text-sm font-medium font-['Inter']">{breadcrumb}</span>
        </nav>
        <h1 className="text-center text-green-600 text-4xl sm:text-5xl lg:text-6xl font-bold font-['Outfit'] leading-tight">{title}</h1>
        <p className="max-w-md text-center text-zinc-500 text-sm sm:text-base font-normal font-['Inter'] leading-relaxed px-2">{subtitle}</p>
      </section>

      {/* ── Sub-category row ── */}
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
                    src={sub.wpImage || sub.fallback || 'https://placehold.co/283x287'}
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
        <button onClick={() => setFilterOpen(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
        </button>
        <button onClick={() => setSortOpenMobile(v => !v)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200 text-zinc-700 rounded-xl text-xs font-bold active:scale-95 transition-all">
          <ArrowUpDown className="w-3.5 h-3.5" /> Sort
        </button>
      </div>

      {/* ── Sort sheet (mobile) ── */}
      {sortOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setSortOpenMobile(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />
            <p className="text-sm font-bold text-zinc-900 mb-4 font-['Inter']">Sort By</p>
            {SORT_OPTIONS.map(opt => (
              <button key={opt} onClick={() => setSortOpenMobile(false)}
                className="w-full text-left py-3.5 text-sm text-zinc-700 border-b border-gray-100 last:border-0 font-['Inter'] hover:text-green-700 transition-colors">
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="w-full max-w-[1280px] px-4 sm:px-6 py-6 sm:py-10 flex gap-8 items-start">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-60 xl:w-64 shrink-0 sticky top-24">
          <div className="w-full p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <FilterPanel groups={filterGroups} />
          </div>
        </aside>

        {/* Product column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 sm:gap-6">

          {/* Results bar (desktop) */}
          <div className="hidden sm:flex justify-between items-center">
            <p className="text-sm font-normal font-['Inter'] text-gray-600">
              {loading
                ? <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin text-green-700" />Loading products…</span>
                : <><strong className="text-zinc-900">{products.length}</strong> {products.length === 1 ? 'product' : 'products'} found</>
              }
            </p>
            <div className="relative">
              <button onClick={() => setSortOpenDesktop(v => !v)}
                className="px-3 py-2 bg-white rounded-lg border border-gray-200 flex items-center gap-2 text-xs font-medium text-gray-600 hover:border-green-500 hover:text-green-700 transition-all">
                <ArrowUpDown className="w-3.5 h-3.5" />Sort: Most Popular<ChevronDown className="w-3 h-3" />
              </button>
              {sortOpenDesktop && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-gray-100 shadow-xl z-20 overflow-hidden">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => setSortOpenDesktop(false)}
                      className="w-full text-left px-4 py-2.5 text-xs text-zinc-700 hover:bg-green-50 hover:text-green-700 font-['Inter'] transition-colors">
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {!loading && loadError && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-red-300" />
              </div>
              <p className="text-zinc-500 font-semibold font-['Inter']">Could not load products right now.</p>
              <button onClick={() => fetchProducts(page)} className="px-5 py-2.5 bg-green-700 text-white text-sm font-bold rounded-xl hover:bg-green-800 transition-colors">Try again</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !loadError && products.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-gray-200" />
              </div>
              <p className="text-zinc-500 font-semibold font-['Inter']">No {title.toLowerCase()} products available yet.</p>
              <Link href="/categories" className="px-5 py-2.5 bg-green-700 text-white text-sm font-bold rounded-xl hover:bg-green-800 transition-colors">Browse all categories</Link>
            </div>
          )}

          {/* Grid */}
          {!loading && !loadError && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] flex flex-col max-h-[88dvh]">
            <div className="flex justify-center pt-4 pb-2 shrink-0">
              <div className="w-10 h-1.5 bg-gray-200 rounded-full" />
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-4 no-scrollbar">
              <FilterPanel groups={filterGroups} onClose={() => setFilterOpen(false)} />
            </div>
            <div className="px-6 pb-6 pt-3 shrink-0 border-t border-gray-100">
              <button onClick={() => setFilterOpen(false)}
                className="w-full py-4 bg-green-700 hover:bg-green-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all">
                {loading ? 'Loading…' : `Show ${products.length} Results`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
