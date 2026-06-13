"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Filter, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { WPCategory } from '@/lib/wordpress';

interface FilterSidebarProps {
  categories: WPCategory[];
  activeCategory?: string;
  attributes: any[];
}

export default function FilterSidebar({ categories, activeCategory, attributes }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const FilterContent = () => (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-green-900" />
          <span className="text-neutral-900 text-base font-bold font-['Inter'] leading-6">Filters</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full">
           <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Categories Filter */}
      <div className="py-2 border-t border-green-900/5 flex flex-col gap-4">
        <div className="flex justify-between items-center cursor-pointer">
          <span className="text-neutral-900 text-xs font-bold font-['Inter'] uppercase tracking-wider">Categories</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/categories"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 group"
          >
            <div className={`w-4 h-4 rounded border ${!activeCategory ? 'bg-green-700 border-green-700' : 'border-zinc-500/70 bg-white'} transition-colors`} />
            <span className={`text-xs font-medium leading-5 ${!activeCategory ? 'text-green-700' : 'text-neutral-700 group-hover:text-green-700'}`}>All Products</span>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories?category=${cat.slug}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 group"
            >
              <div className={`w-4 h-4 rounded border ${activeCategory === cat.slug ? 'bg-green-700 border-green-700' : 'border-zinc-500/70 bg-white'} transition-colors`} />
              <span className={`text-xs font-medium leading-5 truncate ${activeCategory === cat.slug ? 'text-green-700' : 'text-neutral-700 group-hover:text-green-700'}`}>
                {cat.name} ({cat.count})
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Dynamic Attributes */}
      {attributes.slice(0, 3).map((attr) => (
        <div key={attr.id} className="py-2 border-t border-green-900/5 flex flex-col gap-4">
          <div className="flex justify-between items-center cursor-pointer">
            <span className="text-neutral-900 text-xs font-bold font-['Inter'] uppercase tracking-wider">{attr.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-gray-400 italic">Options coming soon...</span>
          </div>
        </div>
      ))}

      {/* Price Range */}
      <div className="py-2 border-t border-green-900/5 flex flex-col gap-4">
        <div className="flex justify-between items-center cursor-pointer">
          <span className="text-neutral-900 text-xs font-bold font-['Inter'] uppercase tracking-wider">Price Range (USD)</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <div className="flex flex-col gap-2">
          {['Under $10', '$10–$50', '$50–$100', '$100+'].map(price => (
            <div key={price} className="flex items-center gap-2 cursor-pointer group">
              <div className="w-4 h-4 rounded border border-zinc-500/70 bg-white group-hover:border-green-700 transition-colors" />
              <span className="text-neutral-700 text-xs font-normal font-['Inter'] group-hover:text-green-700 transition-colors">{price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden w-full px-4 py-4 sticky top-16 bg-white border-b border-gray-100 z-30 flex justify-between items-center">
         <span className="text-sm font-bold text-gray-900">
           {activeCategory ? activeCategory.replace(/-/g, ' ') : 'All Products'}
         </span>
         <button
           onClick={() => setIsOpen(true)}
           className="px-4 py-2 bg-green-700 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-green-900/20 active:scale-95 transition-all"
         >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
         </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-6 sticky top-24">
        <div className="w-full p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
           <FilterContent />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
           <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-500">
              <FilterContent />
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-8 py-4 bg-green-700 text-white rounded-2xl font-bold shadow-xl"
              >
                Apply Filters
              </button>
           </div>
        </div>
      )}
    </>
  );
}
