"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Filter, ChevronDown, Grid, X, ZoomIn } from 'lucide-react';

const templates = [
  { id: 1, title: "Bold Typography", industry: "Tech", tags: ["Modern", "Minimalist"], image: "https://placehold.co/300x300" },
  { id: 2, title: "Vintage Badge", industry: "Food & Beverage", tags: ["Retro", "Classic"], image: "https://placehold.co/300x300" },
  { id: 3, title: "Geometric Shapes", industry: "Creative", tags: ["Modern", "Abstract"], image: "https://placehold.co/300x300" },
  { id: 4, title: "Floral Elegance", industry: "Beauty & Spa", tags: ["Elegant", "Decorative"], image: "https://placehold.co/300x300" },
  // Duplicate for grid filling
  { id: 5, title: "Minimalist Lines", industry: "Architecture", tags: ["Clean", "Professional"], image: "https://placehold.co/300x300" },
  { id: 6, title: "Retro Script", industry: "Apparel", tags: ["Vintage", "Trendy"], image: "https://placehold.co/300x300" },
];

// Extend templates to 30 for display purposes
const allTemplates = Array.from({ length: 30 }, (_, i) => ({
  ...templates[i % templates.length],
  id: i + 1,
}));

export default function BuyAsItIsPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="w-full bg-white flex flex-col items-center">
      {/* Breadcrumbs */}
      <section className="w-full px-4 md:px-20 py-4 border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="text-emerald-500 hover:underline">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/products/apparel" className="text-emerald-500 hover:underline">Apparel</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/products/embroidery/classic-tshirt" className="text-gray-600 hover:underline">Classic Tshirt</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">Buy as it is</span>
        </div>
      </section>

      {/* Hero Header */}
      <section className="w-full px-4 md:px-20 py-12 bg-emerald-50 border-b border-gray-200 flex flex-col items-center">
        <div className="max-w-[1280px] w-full flex flex-col gap-3">
          <h1 className="text-green-700 text-4xl font-bold font-['Outfit']">Choose Ready Made design</h1>
          <p className="text-slate-500 text-lg font-normal font-['Inter'] leading-7 max-w-[800px]">
            These are finished designs — pick one you love and order directly. No editing needed.
          </p>
        </div>
      </section>

      {/* Toolbar and Filters */}
      <section className="w-full max-w-[1280px] px-4 md:px-20 py-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search */}
          <div className="flex-1 w-full relative">
            <input
              type="text"
              placeholder="Search for any Template..."
              className="w-full h-14 pl-12 pr-4 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-700 font-['Inter']"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-4 bg-white rounded-[10px] border border-gray-300 flex items-center gap-2 hover:bg-gray-50 transition-colors font-['Inter'] font-medium"
          >
            <Filter className="w-5 h-5 text-neutral-900" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="w-full p-6 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-wrap gap-8">
            <div className="flex-1 min-w-[200px] flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-bold font-['Inter']">Category</label>
              <div className="relative">
                <select className="w-full p-3 bg-white rounded-[10px] border border-gray-300 appearance-none focus:outline-none font-['Inter']">
                  <option>All</option>
                  <option>Apparel</option>
                  <option>Marketing</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 min-w-[200px] flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-bold font-['Inter']">Industry</label>
              <div className="relative">
                <select className="w-full p-3 bg-white rounded-[10px] border border-gray-300 appearance-none focus:outline-none font-['Inter']">
                  <option>All</option>
                  <option>Tech</option>
                  <option>Finance</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 min-w-[200px] flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-bold font-['Inter']">Color</label>
              <div className="relative">
                <select className="w-full p-3 bg-white rounded-[10px] border border-gray-300 appearance-none focus:outline-none font-['Inter']">
                  <option>Select Color</option>
                  <option>Red</option>
                  <option>Blue</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 min-w-[200px] flex flex-col gap-2">
              <label className="text-gray-700 text-sm font-bold font-['Inter']">Style</label>
              <div className="relative">
                <select className="w-full p-3 bg-white rounded-[10px] border border-gray-300 appearance-none focus:outline-none font-['Inter']">
                  <option>All</option>
                  <option>Modern</option>
                  <option>Retro</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="w-full flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-gray-600 text-sm">Showing <strong>{allTemplates.length}</strong> of {allTemplates.length} templates</span>
              <button className="text-green-700 font-medium hover:underline text-sm">Clear all filters</button>
            </div>
          </div>
        )}
      </section>

      {/* Grid */}
      <section className="w-full max-w-[1280px] px-4 md:px-20 pb-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allTemplates.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <h3 className="text-gray-900 text-lg font-bold font-['Inter']">{item.title}</h3>
              <p className="text-gray-500 text-sm font-['Inter']">{item.industry}</p>
              <div className="flex gap-2">
                {item.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs font-['Inter']">{tag}</span>
                ))}
              </div>
            </div>
            <div className="p-4 pt-0 mt-auto">
              <Link
                href={`/products/embroidery/classic-tshirt/buy-as-it-is/${item.id}`}
                className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors flex justify-center items-center"
              >
                Select Design
              </Link>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
