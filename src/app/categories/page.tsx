import React from 'react';
import Link from 'next/link';
import { ChevronRight, Filter, ChevronDown, Heart, Star } from 'lucide-react';
import { getProductCategories, getProducts } from '@/lib/wordpress';
import CategoryCarousel from '@/components/CategoryCarousel';

export default async function CategoriesPage() {
  // Fetch data on the server - this uses your .env.local keys safely
  const categoriesData = await getProductCategories();
  const products = await getProducts(1, 12);

  const rootCategories = categoriesData.filter(c => c.parent === 0 && c.count > 0);

  return (
    <main className="w-full flex flex-col items-center bg-white">
      {/* Hero / Header Section */}
      <section className="w-full px-6 py-12 md:py-20 bg-emerald-50 flex flex-col justify-start items-center">
        <div className="w-full max-w-[1280px] flex flex-col justify-center items-center gap-6 text-center">
          <nav className="flex items-center gap-1 text-sm font-medium font-['Inter']">
            <Link href="/" className="text-emerald-600 hover:underline">Home</Link>
            <ChevronRight className="w-4 h-4 text-emerald-300" />
            <span className="text-zinc-500">Product Categories</span>
          </nav>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-['Outfit'] text-green-700 leading-tight">
            Our Categories
          </h1>

          <p className="max-w-xl text-zinc-500 text-base md:text-lg font-normal font-['Inter'] leading-relaxed">
            Professionally printed custom products. From apparel to business essentials, we deliver premium quality with unbeatable pricing.
          </p>
        </div>
      </section>

      <div className="w-full flex flex-col items-center">
        {/* Pass the server-fetched categories to the Client Carousel */}
        <CategoryCarousel categories={rootCategories} />

        {/* Filters and Grid Section */}
        <section className="w-full max-w-[1280px] px-6 md:px-20 py-10 flex flex-col lg:flex-row gap-10 items-start">

          {/* Sidebar Filters (Hidden on small mobile, or shown as a simplified version) */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6 sticky top-24">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                <Filter className="w-5 h-5 text-green-700" />
                <span className="text-neutral-900 text-lg font-bold font-['Inter']">Filters</span>
              </div>

              {/* Category Filter */}
              <div className="flex flex-col gap-4">
                <span className="text-neutral-900 text-xs font-bold uppercase tracking-widest font-['Inter']">Categories</span>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  {rootCategories.slice(0, 8).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products/${cat.slug}`}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-green-50 rounded-lg text-sm text-gray-600 hover:text-green-700 transition-colors border border-transparent hover:border-green-100"
                    >
                      {cat.name} ({cat.count})
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50">
                 <span className="text-neutral-900 text-xs font-bold uppercase tracking-widest font-['Inter']">Price Range</span>
                 <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-500" />
                      <span className="group-hover:text-green-700">Under $10</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-500" />
                      <span className="group-hover:text-green-700">$10 – $50</span>
                    </label>
                 </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Content */}
          <div className="flex-1 flex flex-col gap-8 w-full">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-base font-normal font-['Inter']">
                <span className="text-gray-500">Showing </span>
                <span className="text-neutral-900 font-bold">{products.length}</span>
                <span className="text-gray-500"> unique products</span>
              </div>

              <div className="relative group min-w-[180px]">
                <div className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-green-700 transition-colors">
                  <span className="text-gray-600 text-sm font-medium font-['Inter']">Sort: Most Popular</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Grid of Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 group">
                  <div className="relative h-64 md:h-56 p-4 flex items-center justify-center bg-gray-50/50">
                    {p.on_sale && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-full z-10 shadow-sm">
                        SALE
                      </div>
                    )}
                    <img
                      className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      src={p.images[0]?.src || "https://placehold.co/319x220"}
                      alt={p.name}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                  </div>

                  {/* Details */}
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-slate-900 text-lg font-bold font-['Outfit'] leading-tight line-clamp-2 group-hover:text-green-700 transition-colors">
                        {p.name}
                      </h3>
                      <button className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all shrink-0">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(star => (
                           <Star key={star} className={`w-3.5 h-3.5 ${star <= Number(p.average_rating) ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-zinc-500 text-xs font-semibold font-['Inter']">{p.average_rating} ({p.rating_count} reviews)</span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div
                        className="text-slate-900 text-xl font-bold font-['Outfit'] [&_del]:text-gray-400 [&_del]:text-sm [&_del]:font-normal [&_ins]:no-underline"
                        dangerouslySetInnerHTML={{ __html: p.price_html || `$${p.price}` }}
                      />
                      <Link
                        href={`/products/${p.categories[0]?.slug || 'all'}/${p.slug}`}
                        className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-bold font-['Inter'] rounded-xl shadow-md shadow-green-700/20 transition-all active:scale-95 flex items-center justify-center"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {products.length === 0 && (
              <div className="w-full py-20 text-center flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                   <Filter className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium font-['Inter'] text-lg">No products found in this category.</p>
                <Link href="/categories" className="text-green-700 font-bold hover:underline">Clear all filters</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
            {products.length === 0 && (
              <div className="w-full py-20 text-center text-gray-500">
                No products found. Please check your WooCommerce store.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
