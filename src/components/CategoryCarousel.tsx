"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WPCategory } from '@/lib/wordpress';

export default function CategoryCarousel({ categories }: { categories: WPCategory[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="w-full px-6 md:px-20 py-10 overflow-hidden relative">
      <div className="w-full max-w-[1280px] mx-auto relative group">
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-[-50px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-xl border border-zinc-100 items-center justify-center text-zinc-600 hover:bg-green-700 hover:text-white transition-all duration-300 scale-90 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={carouselRef}
          className="flex justify-start items-start gap-4 md:gap-6 overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory pb-6"
        >
          {categories.map((cat, index) => (
            <Link
              key={cat.id}
              href={`/products/${cat.slug}`}
              className={`w-[260px] md:w-72 min-w-[260px] md:min-w-[288px] px-5 py-8 md:py-9 ${index % 2 === 0 ? 'bg-zinc-100' : 'bg-orange-50'} rounded-2xl flex flex-col justify-center items-center gap-6 md:gap-8 overflow-hidden group snap-start hover:shadow-xl transition-all duration-300 border border-transparent hover:border-green-100`}
            >
              <div className="relative w-full aspect-square max-h-44 md:max-h-52 flex items-center justify-center">
                <img
                  className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  src={cat.image?.src || "https://placehold.co/212x212"}
                  alt={cat.name}
                />
              </div>
              <div className="self-stretch flex flex-col justify-center items-center gap-2">
                <div className="self-stretch text-center text-zinc-900 text-xl md:text-2xl font-bold font-['Outfit'] leading-tight">
                  {cat.name}
                </div>
                <div className="flex items-center gap-2 text-green-700 font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>Explore All</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-[-50px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-xl border border-zinc-100 items-center justify-center text-zinc-600 hover:bg-green-700 hover:text-white transition-all duration-300 scale-90 hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
