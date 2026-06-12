import React from 'react';
import Link from 'next/link';
import { ChevronRight, Filter, Heart, Star } from 'lucide-react';
import { getProductCategories, getProducts } from '@/lib/wordpress';

export default async function EmbroideryPage() {
  // Fetch data on server
  const categories = await getProductCategories();
  const currentCat = categories.find(c => c.slug === 'embroidery');

  const products = currentCat
    ? await getProducts(1, 20, currentCat.id)
    : await getProducts(1, 20);

  const categoryName = currentCat?.name || "Embroidery";

  const subCategories = [
    { name: "T-shirts", image: "https://placehold.co/283x287", href: "/products/t-shirts" },
    { name: "Bags", image: "https://placehold.co/283x287" },
    { name: "Caps", image: "https://placehold.co/283x287" },
    { name: "Hoodie", image: "https://placehold.co/283x287" },
    { name: "Uniform Sets", image: "https://placehold.co/283x287" },
  ];

  return (
    <main className="w-full flex flex-col items-center bg-white">
      {/* Hero / Header Section */}
      <section className="w-full p-6 bg-emerald-50 flex flex-col justify-start items-center gap-2.5">
        <div className="w-full max-w-[1280px] flex flex-col justify-center items-center gap-7 py-10">
          <nav className="px-3 py-2 rounded-md inline-flex justify-start items-center gap-1">
            <Link href="/" className="text-center text-emerald-500 text-sm font-medium font-['Inter'] leading-5 hover:underline">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
            <Link href="/categories" className="text-center text-emerald-500 text-sm font-medium font-['Inter'] leading-5 hover:underline">Categories</Link>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-center text-zinc-500 text-sm font-medium font-['Inter'] leading-5">{categoryName}</span>
          </nav>

          <h1 className="self-stretch text-center text-green-500 text-6xl font-bold font-['Outfit'] leading-tight md:leading-[65.66px]">{categoryName}</h1>

          <p className="w-full max-w-[480px] text-center text-zinc-500/90 text-base font-normal font-['Inter'] leading-6">
            Professional {categoryName} services. Premium quality, bulk pricing, fast delivery.
          </p>
        </div>
      </section>

      <div className="w-full max-w-[1280px] px-6 py-10 flex flex-col gap-10">
        <section className="w-full overflow-x-auto pb-4 no-scrollbar">
          <div className="flex justify-start items-start gap-6 min-w-max">
            {subCategories.map((sub, index) => (
              <Link key={index} href={sub.href || "#"} className="flex-1 min-w-[220px] flex flex-col justify-start items-center gap-4 group cursor-pointer">
                <img
                  className="self-stretch aspect-[283/287] object-cover rounded-2xl group-hover:shadow-md transition-shadow"
                  src={sub.image}
                  alt={sub.name}
                />
                <div className="self-stretch text-center text-neutral-950 text-base font-medium font-['Outfit'] group-hover:text-green-700 transition-colors">
                  {sub.name}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-4">
            <div className="p-5 bg-white rounded-2xl border border-green-900/5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-green-900" />
                <span className="text-neutral-900 text-base font-bold font-['Inter'] leading-6">Filters</span>
              </div>
            </div>
          </aside>

          <div className="flex-1 flex flex-col gap-6">
            <div className="self-stretch flex justify-between items-center">
              <div className="text-sm font-normal font-['Inter'] leading-5">
                <span className="text-gray-600">Showing </span>
                <span className="text-neutral-900 font-bold">{products.length}</span>
                <span className="text-gray-600"> products</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-900/5 flex flex-col overflow-hidden group hover:shadow-lg transition-all">
                  <div className="relative h-56 p-2.5 flex items-center justify-center">
                    {p.on_sale && (
                      <div className="absolute top-[14px] left-[18px] px-2 py-[3px] bg-red-600 rounded-[20px] flex justify-center items-center z-10">
                        <span className="text-white text-[10px] font-bold font-['Inter'] leading-4">SALE</span>
                      </div>
                    )}
                    <img className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" src={p.images[0]?.src || "https://placehold.co/319x220"} alt={p.name} />
                  </div>

                  <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-slate-900 text-base font-semibold font-['Outfit'] leading-5 line-clamp-1">{p.name}</h3>
                      <div className="text-zinc-500 hover:text-red-500 cursor-pointer transition-colors">
                        <Heart className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(star => (
                           <Star key={star} className={`w-3 h-3 ${star <= Number(p.average_rating) ? 'text-orange-600 fill-current' : 'text-zinc-300'}`} />
                        ))}
                      </div>
                      <span className="text-slate-500 text-xs">{p.average_rating} ({p.rating_count})</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-slate-900 text-base font-semibold font-['Outfit'] leading-6" dangerouslySetInnerHTML={{ __html: p.price_html || `$${p.price}` }} />
                      </div>
                      <Link
                        href={`/products/embroidery/${p.slug}`}
                        className="px-3 py-2 bg-green-700 rounded-lg flex justify-center items-center hover:bg-green-800 transition-colors"
                      >
                        <span className="text-white text-xs font-semibold font-['Inter'] leading-4">Shop</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {products.length === 0 && <p className="text-center py-10 text-gray-500">No products found in this category.</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
