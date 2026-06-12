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

  const filterGroups = [
    {
      title: "Categories",
      options: rootCategories.map(c => c.name)
    },
    {
      title: "Print Method",
      options: ["Screen Printing", "Direct-to-Garment", "Embroidery", "Heat Transfer"]
    }
  ];

  return (
    <main className="w-full flex flex-col items-center bg-white">
      {/* Hero / Header Section */}
      <section className="w-full p-6 bg-emerald-50 flex flex-col justify-start items-center gap-2.5">
        <div className="w-full max-w-[1280px] flex flex-col justify-center items-center gap-7 py-10">
          <nav className="px-3 py-2 rounded-md inline-flex justify-start items-center gap-1">
            <Link href="/" className="text-center text-emerald-500 text-sm font-medium font-['Inter'] leading-5 hover:underline">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-center text-zinc-500 text-sm font-medium font-['Inter'] leading-5">Product Categories</span>
          </nav>

          <h1 className="self-stretch text-center text-green-500 text-6xl font-bold font-['Outfit'] leading-tight md:leading-[65.66px]">Product Categories</h1>

          <p className="w-full max-w-[480px] text-center text-zinc-500/90 text-base font-normal font-['Inter'] leading-6">Professionally printed custom products. Premium quality, bulk pricing, fast delivery.</p>
        </div>
      </section>

      <div className="w-full flex flex-col items-center">
        {/* Pass the server-fetched categories to the Client Carousel */}
        <CategoryCarousel categories={rootCategories} />

        {/* Filters and Grid Section */}
        <section className="w-full max-w-[1280px] px-4 md:px-20 py-10 flex flex-col md:flex-row gap-8 items-start">

          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-4">
            <div className="p-5 bg-white rounded-2xl outline outline-[1.31px] outline-offset-[-1.31px] outline-green-900/5 flex flex-col gap-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center pb-2">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-green-900" />
                  <span className="text-neutral-900 text-base font-bold font-['Inter'] leading-6">Filters</span>
                </div>
              </div>

              {filterGroups.map((group, idx) => (
                <div key={idx} className="flex flex-col gap-3 py-4 border-t-[1.31px] border-green-900/5">
                  <div className="flex justify-between items-center cursor-pointer">
                    <span className="text-neutral-900 text-xs font-bold font-['Inter'] leading-5">{group.title}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div className="flex flex-col gap-2">
                    {group.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-green-700 focus:ring-green-500" />
                        <span className="text-neutral-700 text-xs font-normal font-['Inter'] leading-5 group-hover:text-green-700 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Product Grid Content */}
          <div className="flex-1 flex flex-col gap-6">

            <div className="self-stretch flex justify-between items-center">
              <div className="text-sm font-normal font-['Inter'] leading-5">
                <span className="text-gray-600">Showing </span>
                <span className="text-neutral-900 font-bold">{products.length}</span>
                <span className="text-gray-600"> products</span>
              </div>
              <div className="w-40 px-3 py-1.5 bg-white rounded-lg outline outline-[1.31px] outline-offset-[-1.31px] outline-green-900/10 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-gray-600 text-xs font-normal font-['Inter']">Sort: Most Popular</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-700" />
              </div>
            </div>

            {/* Grid of Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm outline outline-[1.31px] outline-offset-[-1.31px] outline-slate-900/5 flex flex-col overflow-hidden group hover:shadow-lg transition-all border border-gray-100">
                  <div className="relative h-56 p-2.5 flex items-center justify-center">
                    {p.on_sale && (
                      <div className="absolute top-[14px] left-[18px] px-2 py-[3px] bg-red-600 rounded-[20px] flex justify-center items-center z-10">
                        <span className="text-white text-[10px] font-bold font-['Inter'] leading-4">SALE</span>
                      </div>
                    )}
                    <img
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      src={p.images[0]?.src || "https://placehold.co/319x220"}
                      alt={p.name}
                    />
                  </div>

                  {/* Details */}
                  <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-slate-900 text-base font-semibold font-['Outfit'] leading-5 line-clamp-1">{p.name}</h3>
                      <div className="text-zinc-500 hover:text-red-500 cursor-pointer transition-colors">
                        <Heart className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(star => (
                           <Star key={star} className={`w-3 h-3 ${star <= Number(p.average_rating) ? 'text-orange-600 fill-current' : 'text-zinc-300'}`} />
                        ))}
                      </div>
                      <span className="text-slate-500 text-xs font-normal font-['Inter'] leading-4">{p.average_rating} ({p.rating_count})</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap items-baseline gap-1">
                        <span
                          className="text-slate-900 text-base font-semibold font-['Outfit'] leading-6 [&_del]:text-gray-400 [&_del]:text-xs [&_del]:font-normal [&_ins]:no-underline"
                          dangerouslySetInnerHTML={{ __html: p.price_html || `$${p.price}` }}
                        />
                      </div>
                      <Link
                        href={`/products/${p.categories[0]?.slug || 'all'}/${p.slug}`}
                        className="px-3 py-2 bg-green-700 rounded-lg flex justify-center items-center hover:bg-green-800 transition-colors"
                      >
                        <span className="text-white text-xs font-semibold font-['Inter'] leading-4">Shop</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
