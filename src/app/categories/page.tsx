import React from 'react';
import Link from 'next/link';
import { ChevronRight, Filter, ChevronDown, Star } from 'lucide-react';
import {
  getProductCategories,
  getProducts,
  getProductAttributes,
  decodeHTMLEntities,
  WP_BASE_URL,
} from '@/lib/wordpress';
import FilterSidebar from '@/components/FilterSidebar';
import CategoryCarousel, { CarouselCategory } from '@/components/CategoryCarousel';
import { CATEGORY_CONFIG, getCategoryImage, getConfigForSlug } from '@/lib/categoryConfig';
import CategoriesPagination from '@/components/CategoriesPagination';
import CategoriesProductCard from '@/components/CategoriesProductCard';

const PER_PAGE = 24;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const params       = await searchParams;
  const categorySlug = typeof params.category === 'string' ? params.category : undefined;
  const page         = Math.max(1, parseInt(typeof params.page === 'string' ? params.page : '1') || 1);

  const categoriesData  = await getProductCategories();
  const rootCategories  = categoriesData.filter(
    (c) => c.parent === 0 && c.slug !== 'uncategorized'
  );

  let currentCategoryId: number | undefined = undefined;
  if (categorySlug) {
    const currentCat = categoriesData.find((c) => c.slug === categorySlug);
    if (currentCat) currentCategoryId = currentCat.id;
  }

  // Fetch products with real pagination from WP headers
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let totalPages = 1;
  try {
    const url = new URL(`${WP_BASE_URL}/wc/v3/products`);
    url.searchParams.set('page',     String(page));
    url.searchParams.set('per_page', String(PER_PAGE));
    url.searchParams.set('status',   'publish');
    if (currentCategoryId) url.searchParams.set('category', String(currentCategoryId));

    const auth = Buffer.from(
      `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString('base64');
    const wpRes = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (wpRes.ok) {
      products   = await wpRes.json();
      totalPages = parseInt(wpRes.headers.get('X-WP-TotalPages') ?? '1') || 1;
    } else {
      products = await getProducts(page, PER_PAGE, currentCategoryId ? { category: String(currentCategoryId) } : {});
    }
  } catch {
    products = await getProducts(page, PER_PAGE, currentCategoryId ? { category: String(currentCategoryId) } : {});
  }
  const attributes = await getProductAttributes().catch(() => []);

  // ALL categories ordered by config, then any extras
  const orderedCategories = CATEGORY_CONFIG.reduce<typeof rootCategories>((acc, cfg) => {
    const match = rootCategories.find((c) => cfg.slugs.includes(c.slug));
    if (match && !acc.find((a) => a.id === match.id)) acc.push(match);
    return acc;
  }, []);
  const remainingCats         = rootCategories.filter((c) => !orderedCategories.find((o) => o.id === c.id));
  const allOrderedCategories  = [...orderedCategories, ...remainingCats];

  const carouselCategories: CarouselCategory[] = allOrderedCategories.map((cat) => {
    const cfg         = getConfigForSlug(cat.slug);
    const displayName = cfg?.displayName ?? decodeHTMLEntities(cat.name);
    const imgSrc      = getCategoryImage(
      cat.image,
      cfg?.fallback ?? `https://placehold.co/200x200?text=${encodeURIComponent(displayName)}`
    );
    return { id: cat.id, name: displayName, slug: cat.slug, imgSrc, bg: cfg?.bg ?? 'bg-gray-50' };
  });

  return (
    <main className="w-full flex flex-col items-center bg-white overflow-hidden">

      {/* ── Breadcrumbs ── */}
      <section className="self-stretch px-4 md:px-20 py-3 md:py-4 bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 flex-wrap">
          <Link href="/" className="text-emerald-500 text-sm font-medium font-['Inter'] hover:underline">Home</Link>
          <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-zinc-500 text-sm font-medium font-['Inter']">Product Categories</span>
          {categorySlug && (
            <>
              <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-zinc-900 text-sm font-bold font-['Inter'] capitalize">
                {decodeHTMLEntities(categorySlug.replace(/-/g, ' '))}
              </span>
            </>
          )}
        </div>
      </section>

      {/* ── Hero ── */}
      <section className="self-stretch px-4 md:px-20 py-10 md:py-16 bg-emerald-50 border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex flex-col justify-center items-center gap-4 text-center">
          <h1 className="text-green-500 text-3xl sm:text-5xl font-bold font-['Outfit'] leading-tight">
            {categorySlug ? decodeHTMLEntities(categorySlug.replace(/-/g, ' ')) : 'Product Categories'}
          </h1>
          <p className="max-w-[480px] text-zinc-500/90 text-sm sm:text-base font-normal font-['Inter'] leading-6">
            Professionally printed custom products. Premium quality, bulk pricing, and fast delivery guaranteed.
          </p>
        </div>
      </section>

      {/* ── Category Carousel ── */}
      {!categorySlug && (
        <section className="self-stretch px-4 sm:px-10 md:px-20 py-8 md:py-12">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="text-zinc-900 text-lg sm:text-2xl font-bold font-['Outfit']">Shop by Category</h2>
              <span className="text-xs text-gray-400 font-medium hidden sm:block">{carouselCategories.length} categories</span>
            </div>
            <div className="md:px-6">
              <CategoryCarousel categories={carouselCategories} />
            </div>
          </div>
        </section>
      )}

      {!categorySlug && <div className="self-stretch border-t border-gray-100" />}

      {/* ── Main Content: Sidebar + Product Grid ── */}
      <section className="self-stretch px-4 md:px-20 py-6 md:py-10">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

          <FilterSidebar categories={rootCategories} activeCategory={categorySlug} attributes={attributes} />

          <div className="flex-1 flex flex-col gap-6 w-full min-w-0">

            {/* Results bar */}
            <div className="flex justify-between items-center">
              <p className="text-sm font-normal font-['Inter']">
                <span className="text-gray-600">Showing </span>
                <span className="text-neutral-900 font-bold">{products.length}</span>
                <span className="text-gray-600"> results</span>
              </p>
              <div className="px-3 py-2 bg-white rounded-lg border border-gray-200 flex items-center gap-2 cursor-pointer hover:border-green-700 transition-colors">
                <span className="text-gray-600 text-xs font-medium font-['Inter'] whitespace-nowrap">Sort: Most Popular</span>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-8">
              {products.map((p, i) => (
                <CategoriesProductCard key={p.id} product={p} index={i} />
              ))}
            </div>

            {/* Empty */}
            {products.length === 0 && (
              <div className="w-full py-24 text-center flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Filter className="w-9 h-9 text-emerald-200" />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-gray-900 font-bold font-['Outfit'] text-xl">No products found</p>
                  <p className="text-gray-500 text-sm font-['Inter'] max-w-xs">We couldn&apos;t find any products matching your selection.</p>
                </div>
                <Link href="/categories" className="px-8 py-4 bg-green-700 text-white rounded-2xl font-bold hover:bg-green-800 transition-all">
                  Clear All Filters
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <CategoriesPagination
                currentPage={page}
                totalPages={totalPages}
                categorySlug={categorySlug}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
