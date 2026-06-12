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
    <section className="w-full px-4 md:px-20 py-10 overflow-hidden relative">
      <div className="w-full max-w-[1280px] mx-auto relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-[-20px] md:left-[-50px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-green-700 hover:text-white transition-all duration-300 scale-90 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={carouselRef}
          className="flex justify-start items-start gap-6 overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory pb-4"
        >
          {categories.map((cat, index) => (
            <Link
              key={cat.id}
              href={`/products/${cat.slug}`}
              className={`w-72 min-w-[288px] px-5 py-9 ${index % 2 === 0 ? 'bg-zinc-100' : 'bg-orange-50'} rounded-xl flex flex-col justify-center items-center gap-8 overflow-hidden group snap-start hover:shadow-md transition-shadow shrink-0`}
            >
              <div className="relative w-full aspect-square max-h-52 flex items-center justify-center">
                <img
                  className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  src={cat.image?.src || "https://placehold.co/212x212"}
                  alt={cat.name}
                />
              </div>
              <div className="self-stretch flex flex-col justify-center items-center gap-2">
                <div className="self-stretch text-center text-zinc-900 text-2xl font-medium font-['Outfit'] leading-7">
                  {cat.name}
                </div>
                <div className="py-1 border-b border-black inline-flex justify-center items-center gap-2.5 group-hover:border-green-700 transition-colors">
                  <div className="text-center text-zinc-900 text-base font-normal font-['Outfit'] leading-6 group-hover:text-green-700">
                    View all
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-[-20px] md:right-[-50px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-green-700 hover:text-white transition-all duration-300 scale-90 hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
