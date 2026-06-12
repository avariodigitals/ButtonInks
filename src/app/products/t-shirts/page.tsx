"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Filter, ChevronDown, Heart, Star } from 'lucide-react';

// Preparation for WordPress integration: these will later be fetched from WP API
const subCategories = [
  { name: "Men’s Tshirt", image: "https://placehold.co/283x287" },
  { name: "Women’s T-shirt", image: "https://placehold.co/283x287" },
  { name: "Kids", image: "https://placehold.co/283x287" },
  { name: "Crew neck", image: "https://placehold.co/283x287" },
  { name: "V- Neck Sets", image: "https://placehold.co/283x287" },
];

const filterGroups = [
  {
    title: "Featured",
    options: ["Best Sellers", "New", "New option", "Better by design"]
  },
  {
    title: "Gender",
    options: ["Men", "Women", "Unisex"]
  },
  {
    title: "Collar",
    options: ["Crew neck", "V-Neck", "U- Neck", "Wide neck"]
  },
  {
    title: "Material",
    options: ["100% Cotton", "Cotton/Poly Blend", "Performance Poly", "Tri-Blend"]
  },
  {
    title: "Price Range",
    options: ["Under $10", "$10–$20", "$20–$35", "$35+"]
  }
];

// Placeholder for products that will come from WordPress/WooCommerce
const products = Array(12).fill({
  name: "Classic Unisex Tee",
  price: "from $8.99",
  minQty: "min 12",
  rating: 4.9,
  reviews: 2847,
  image: "https://placehold.co/319x220",
  badge: "Best Seller"
});

const TshirtsPage = () => {
  return (
    <main className="w-full flex flex-col items-center bg-white">
      {/* Hero / Header Section */}
      <section className="w-full p-6 bg-emerald-50 flex flex-col justify-start items-center gap-2.5">
        <div className="w-full max-w-[1280px] flex flex-col justify-center items-center gap-7 py-10">
          {/* Breadcrumbs */}
          <nav className="px-3 py-2 rounded-md inline-flex justify-start items-center gap-1">
            <Link href="/" className="text-center text-emerald-500 text-sm font-medium font-['Inter'] leading-5 hover:underline">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
            <Link href="/products/embroidery" className="text-center text-emerald-500 text-sm font-medium font-['Inter'] leading-5 hover:underline">Embroidery</Link>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-center text-zinc-500 text-sm font-medium font-['Inter'] leading-5">T-shirt</span>
          </nav>

          {/* Title */}
          <h1 className="self-stretch text-center text-green-500 text-6xl font-bold font-['Outfit'] leading-tight md:leading-[65.66px]">T-shirts</h1>

          {/* Subtitle */}
          <p className="w-full max-w-[480px] text-center text-zinc-500/90 text-base font-normal font-['Inter'] leading-6">Professional Embroidery custom t-shirts, hoodies, polos, and more. Premium quality, bulk pricing, fast delivery.</p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="w-full max-w-[1280px] px-6 py-10 flex flex-col gap-10">

        {/* Sub-Category Selection Row */}
        <section className="w-full overflow-x-auto pb-4 no-scrollbar">
          <div className="flex justify-start items-start gap-6 min-w-max">
            {subCategories.map((sub, index) => (
              <div key={index} className="flex-1 min-w-[220px] flex flex-col justify-start items-center gap-4 group cursor-pointer">
                <img
                  className="self-stretch aspect-[283/287] object-cover rounded-2xl group-hover:shadow-md transition-shadow"
                  src={sub.image}
                  alt={sub.name}
                />
                <div className="self-stretch text-center text-neutral-950 text-base font-medium font-['Outfit'] group-hover:text-green-700 transition-colors">
                  {sub.name}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filters and Grid Section */}
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-4">
            <div className="p-5 bg-white rounded-2xl outline outline-[1.31px] outline-offset-[-1.31px] outline-green-900/5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 text-green-900"><Filter className="w-full h-full" /></div>
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

            {/* Results Info & Sort */}
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
              {products.map((p, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-[0px_2px_8px_0px_rgba(13,27,46,0.04)] outline outline-[1.31px] outline-offset-[-1.31px] outline-slate-900/5 flex flex-col overflow-hidden group hover:shadow-lg transition-all">
                  <div className="relative h-56 p-2.5 flex items-center justify-center">
                    {/* Badge */}
                    <div className="absolute top-[14px] left-[18px] px-2 py-[3px] bg-green-700 rounded-[20px] flex justify-center items-center z-10">
                      <span className="text-white text-[10px] font-bold font-['Inter'] leading-4">{p.badge}</span>
                    </div>
                    {/* Image */}
                    <img className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" src={p.image} alt={p.name} />
                  </div>

                  {/* Details */}
                  <div className="p-4 bg-white border-t-[0.30px] border-zinc-500 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-slate-900 text-base font-semibold font-['Outfit'] leading-5">{p.name}</h3>
                      <div className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-red-500 cursor-pointer transition-colors">
                        <Heart className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4].map(star => (
                          <div key={star} className="w-3 h-3 text-orange-600"><Star className="w-full h-full fill-current" /></div>
                        ))}
                        <div className="w-3 h-3 text-orange-600"><Star className="w-full h-full" /></div>
                      </div>
                      <span className="text-slate-500 text-xs font-normal font-['Inter'] leading-4">{p.rating} ({p.reviews})</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-slate-900 text-base font-semibold font-['Outfit'] leading-6">{p.price}</span>
                        <span className="text-gray-400 text-[10px] font-normal font-['Inter'] leading-4">· {p.minQty}</span>
                      </div>
                      <button className="px-3 py-2 bg-green-700 rounded-lg flex justify-center items-center hover:bg-green-800 transition-colors">
                        <span className="text-white text-xs font-semibold font-['Inter'] leading-4">Shop</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TshirtsPage;
