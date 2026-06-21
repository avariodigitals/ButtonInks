"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Filter, ChevronDown, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { WPCategory, decodeHTMLEntities } from '@/lib/wordpress';

const SORT_OPTIONS = [
  'Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Best Rated',
];

interface FilterSidebarProps {
  categories: WPCategory[];
  activeCategory?: string;
  attributes: any[];
}

export default function FilterSidebar({ categories, activeCategory, attributes }: FilterSidebarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen,   setSortOpen]   = useState(false);

  const FilterContent = ({ onClose }: { onClose: () => void }) => (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-green-900" />
          <span className="text-neutral-900 text-base font-bold font-['Inter'] leading-6">Filters</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Categories Filter */}
      <div className="py-2 border-t border-green-900/5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-neutral-900 text-xs font-bold font-['Inter'] uppercase tracking-wider">Categories</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/categories" onClick={onClose} className="flex items-center gap-2 group">
            <div className={`w-4 h-4 rounded border ${!activeCategory ? 'bg-green-700 border-green-700' : 'border-zinc-500/70 bg-white'} transition-colors`} />
            <span className={`text-xs font-medium leading-5 ${!activeCategory ? 'text-green-700' : 'text-neutral-700 group-hover:text-green-700'}`}>All Products</span>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories?category=${cat.slug}`} onClick={onClose} className="flex items-center gap-2 group">
              <div className={`w-4 h-4 rounded border ${activeCategory === cat.slug ? 'bg-green-700 border-green-700' : 'border-zinc-500/70 bg-white'} transition-colors`} />
              <span className={`text-xs font-medium leading-5 truncate ${activeCategory === cat.slug ? 'text-green-700' : 'text-neutral-700 group-hover:text-green-700'}`}>
                {decodeHTMLEntities(cat.name)} ({cat.count})
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Dynamic Attributes */}
      {attributes.slice(0, 3).map((attr) => (
        <div key={attr.id} className="py-2 border-t border-green-900/5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
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
        <div className="flex justify-between items-center">
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
      {/* ── Mobile sticky toolbar ── */}
      <div className="lg:hidden w-full sticky top-[64px] z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-2 shadow-sm">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
        </button>
        <button
          onClick={() => setSortOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200 text-zinc-700 rounded-xl text-xs font-bold active:scale-95 transition-all"
        >
          <ArrowUpDown className="w-3.5 h-3.5" /> Sort
        </button>
      </div>

      {/* ── Mobile sort bottom sheet ── */}
      {sortOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]" onClick={() => setSortOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />
            <p className="text-sm font-bold text-zinc-900 mb-4 font-['Inter']">Sort By</p>
            {SORT_OPTIONS.map(opt => (
              <button key={opt} onClick={() => setSortOpen(false)}
                className="w-full text-left py-3.5 text-sm text-zinc-700 border-b border-gray-100 last:border-0 font-['Inter'] hover:text-green-700 transition-colors">
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-6 sticky top-24">
        <div className="w-full p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <FilterContent onClose={() => {}} />
        </div>
      </aside>

      {/* ── Mobile filter bottom sheet ── */}
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
                className="w-full py-4 bg-green-700 hover:bg-green-800 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
