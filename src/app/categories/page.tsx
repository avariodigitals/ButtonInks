import React from 'react';
import Link from 'next/link';
import { ChevronRight, Filter, ChevronDown, Heart, Star, SlidersHorizontal } from 'lucide-react';
import { getProductCategories, getProducts, getProductAttributes, getAttributeTerms, decodeHTMLEntities } from '@/lib/wordpress';
import FilterSidebar from '@/components/FilterSidebar';
import { CATEGORY_CONFIG, getCategoryImage, getConfigForSlug } from '@/lib/categoryConfig';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categorySlug = typeof params.category === 'string' ? params.category : undefined;

  // Fetch data on the server
  const categoriesData = await getProductCategories();
  const rootCategories = categoriesData.filter(c => c.parent === 0 && c.slug !== 'uncategorized');

  // Find current category ID if filtering
  let currentCategoryId: number | undefined = undefined;
  if (categorySlug) {
    const currentCat = categoriesData.find(c => c.slug === categorySlug);
    if (currentCat) currentCategoryId = currentCat.id;
  }

  // Fetch products based on category
  const products = await getProducts(1, 24, currentCategoryId ? { category: String(currentCategoryId) } : {});

  // Fetch some attributes for the sidebar to make it dynamic
  // Note: We might want to limit this or cache it
  const attributes = await getProductAttributes().catch(() => []);

  // Build ordered featured row using CATEGORY_CONFIG order (same as homepage)
  const orderedCategories = CATEGORY_CONFIG.reduce<typeof rootCategories>((acc, cfg) => {
    const match = rootCategories.find(c => cfg.slugs.includes(c.slug));
    if (match) acc.push(match);
    return acc;
  }, []);
  const featuredRow = orderedCategories.slice(0, 5);
  const rowColors = ['bg-zinc-100', 'bg-orange-50', 'bg-emerald-50', 'bg-slate-50', 'bg-rose-50'];

  return (
    <main className="w-full flex flex-col items-center bg-white overflow-hidden">

      {/* ── Breadcrumbs ── */}
      <section className="self-stretch px-4 md:px-20 py-4 bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2">
          <Link href="/" className="text-emerald-500 text-sm font-medium font-['Inter'] leading-5 hover:underline">Home</Link>
          <ChevronRight className="w-4 h-4 text-emerald-500" />
          <span className="text-zinc-500 text-sm font-medium font-['Inter'] leading-5">Product Categories</span>
          {categorySlug && (
            <>
              <ChevronRight className="w-4 h-4 text-emerald-500" />
              <span className="text-zinc-900 text-sm font-bold font-['Inter'] leading-5 capitalize">{decodeHTMLEntities(categorySlug.replace(/-/g, ' '))}</span>
            </>
          )}
        </div>
      </section>

      {/* ── Hero / Header Section ── */}
      <section className="self-stretch px-4 md:px-20 py-12 md:py-16 bg-emerald-50 border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex flex-col justify-center items-center gap-6 text-center">
          <h1 className="text-green-500 text-4xl md:text-6xl font-bold font-['Outfit'] leading-tight">
            {categorySlug ? decodeHTMLEntities(categorySlug.replace(/-/g, ' ')) : 'Product Categories'}
          </h1>
          <p className="max-w-[480px] text-zinc-500/90 text-base font-normal font-['Inter'] leading-6">
            Professionally printed custom products. Premium quality, bulk pricing, and fast delivery guaranteed.
          </p>
        </div>
      </section>

      {/* ── Featured Categories Row (Scrollable on Mobile) ── */}
      {!categorySlug && (
        <section className="self-stretch px-4 md:px-20 py-10 overflow-x-auto no-scrollbar">
          <div className="max-w-[1280px] mx-auto flex items-start gap-6 min-w-max md:min-w-0">
            {featuredRow.map((cat, i) => {
              const cfg = getConfigForSlug(cat.slug);
              const bg = cfg?.bg ?? 'bg-gray-50';
              const displayName = cfg?.displayName ?? decodeHTMLEntities(cat.name);
              const imgSrc = getCategoryImage(cat.image, cfg?.fallback ?? `https://placehold.co/212x212?text=${encodeURIComponent(displayName)}`);
              return (
              <Link
                key={cat.id}
                href={`/categories?category=${cat.slug}`}
                className={`w-72 px-5 py-9 ${bg} rounded-xl flex flex-col justify-center items-center gap-8 overflow-hidden hover:shadow-lg transition-all group`}
              >
                <div className="w-52 h-52 relative flex items-center justify-center">
                  <img
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    src={imgSrc}
                    alt={displayName}
                  />
                </div>
                <div className="self-stretch flex flex-col justify-center items-center gap-2">
                  <div className="self-stretch text-center text-zinc-900 text-2xl font-medium font-['Outfit'] leading-7">
                    {displayName}
                  </div>
                  <div className="py-1 border-b border-black inline-flex justify-center items-center gap-2.5">
                    <div className="text-center text-zinc-900 text-base font-normal font-['Outfit'] leading-6">View all</div>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Main Content Area ── */}
      <section className="self-stretch px-4 md:px-20 py-10">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-10 items-start">

          <FilterSidebar
            categories={rootCategories}
            activeCategory={categorySlug}
            attributes={attributes}
          />

          {/* Product Grid Content */}
          <div className="flex-1 flex flex-col gap-8 w-full">

            <div className="flex justify-between items-center">
              <div className="text-sm font-normal font-['Inter'] leading-5">
                <span className="text-gray-600">Showing </span>
                <span className="text-neutral-900 font-bold">{products.length}</span>
                <span className="text-gray-600"> results</span>
              </div>

              <div className="w-44 px-3 py-2 bg-white rounded-lg outline outline-[1.31px] outline-offset-[-1.31px] outline-green-900/10 flex justify-between items-center cursor-pointer hover:border-green-700 transition-colors">
                <span className="text-gray-600 text-xs font-medium font-['Inter']">Sort: Most Popular</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Grid of Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
              {products.map((p, i) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-[0px_2px_8px_0px_rgba(13,27,46,0.04)] outline outline-[1.31px] outline-offset-[-1.31px] outline-slate-900/5 flex flex-col overflow-hidden group hover:shadow-2xl transition-all duration-500">
                  <div className="relative aspect-[4/3] p-4 flex items-center justify-center bg-white overflow-hidden">
                    {/* Badge Overlay */}
                    {p.on_sale && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full z-10 shadow-lg">
                        SALE
                      </div>
                    )}
                    {i === 0 && (
                       <div className="absolute top-4 left-4 px-3 py-1 bg-green-700 text-white text-[10px] font-black rounded-full z-10 shadow-lg">
                        BEST SELLER
                      </div>
                    )}

                    <img
                      className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                      src={p.images[0]?.src || "https://placehold.co/400x300?text=ButtonInks"}
                      alt={p.name}
                    />

                    <Link
                      href={`/products/${p.categories[0]?.slug || 'all'}/${p.slug}`}
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"
                    />
                  </div>

                  {/* Details */}
                  <div className="p-6 bg-white border-t border-zinc-100 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{decodeHTMLEntities(p.categories[0]?.name || 'Printing')}</span>
                       <Link href={`/products/${p.categories[0]?.slug || 'all'}/${p.slug}`}>
                          <h3 className="text-slate-900 text-lg font-bold font-['Outfit'] leading-tight group-hover:text-green-700 transition-colors line-clamp-1">
                            {decodeHTMLEntities(p.name)}
                          </h3>
                       </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(star => (
                           <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(Number(p.average_rating || 4.5)) ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-zinc-500 text-xs font-bold font-['Inter']">{p.average_rating || "4.5"}</span>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div className="flex flex-col gap-1">
                        <div
                          className="text-slate-900 text-xl font-black font-['Outfit'] [&_del]:text-gray-400 [&_del]:text-sm [&_del]:font-normal [&_del]:mr-2 [&_ins]:no-underline"
                          dangerouslySetInnerHTML={{ __html: p.price_html || `from $${p.price}` }}
                        />
                        <span className="text-gray-400 text-[10px] font-medium font-['Inter']">Free Shipping over $75</span>
                      </div>
                      <Link
                        href={`/products/${p.categories[0]?.slug || 'all'}/${p.slug}`}
                        className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white text-xs font-bold font-['Inter'] rounded-xl shadow-xl shadow-green-700/20 transition-all active:scale-95 flex items-center justify-center uppercase tracking-widest"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="w-full py-32 text-center flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center animate-pulse">
                   <Filter className="w-10 h-10 text-emerald-200" />
                </div>
                <div className="flex flex-col gap-2">
                   <p className="text-gray-900 font-bold font-['Outfit'] text-2xl">No products found</p>
                   <p className="text-gray-500 font-medium font-['Inter'] max-w-sm">We couldn't find any products matching your selection. Try clearing your filters.</p>
                </div>
                <Link href="/categories" className="px-8 py-4 bg-green-700 text-white rounded-2xl font-bold hover:bg-green-800 transition-all shadow-xl shadow-green-900/10">Clear All Filters</Link>
              </div>
            )}

            {/* ── Pagination (Simple placeholder) ── */}
            {products.length > 0 && (
              <div className="w-full flex justify-center items-center gap-2 pt-10">
                 <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-sm font-bold text-green-700 bg-green-50">1</button>
                 <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 hover:border-green-700 hover:text-green-700 transition-all">2</button>
                 <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 hover:border-green-700 hover:text-green-700 transition-all">3</button>
                 <div className="px-2 text-gray-400">...</div>
                 <button className="px-4 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 hover:border-green-700 hover:text-green-700 transition-all gap-2">
                    Next <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
