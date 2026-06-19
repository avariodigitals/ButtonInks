"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WPCategory, decodeHTMLEntities } from '@/lib/wordpress';

const CATEGORY_FALLBACKS: Record<string, string> = {
  'embroidery-uniforms':      'https://placehold.co/212x212?text=Embroidery',
  't-shirts':                 'https://placehold.co/212x212?text=T-Shirts',
  'personalized-cups':        'https://placehold.co/212x212?text=Mugs',
  'bags':                     'https://placehold.co/212x212?text=Bags',
  'photo-prints':             'https://placehold.co/212x212?text=Prints',
  'custom-mugs':              'https://placehold.co/212x212?text=Mugs',
  'apparel':                  'https://placehold.co/212x212?text=Apparel',
  'event-tradeshow-supplies': 'https://placehold.co/212x212?text=Events',
  'marketing-prints':         'https://placehold.co/212x212?text=Marketing',
  'corporate-gifts':          'https://placehold.co/212x212?text=Gifts',
  'vehicle-branding':         'https://placehold.co/212x212?text=Vehicle',
  'banners':                  'https://placehold.co/212x212?text=Banners',
  'stickers':                 'https://placehold.co/212x212?text=Stickers',
  'back-to-school':           'https://placehold.co/212x212?text=School',
};

function getCategoryImage(cat: WPCategory): string {
  // Priority 1 — image uploaded to WP category (always wins)
  if (cat.image?.src) return cat.image.src;
  // Priority 2 — named slug fallback
  if (CATEGORY_FALLBACKS[cat.slug]) return CATEGORY_FALLBACKS[cat.slug];
  // Priority 3 — generic
  return `https://placehold.co/212x212?text=${encodeURIComponent(decodeHTMLEntities(cat.name))}`;
}

export default function CategoryCarousel({ categories }: { categories: WPCategory[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    carouselRef.current?.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
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
              className={`w-[260px] md:w-72 min-w-[260px] md:min-w-[288px] px-5 py-8 md:py-9 ${
                index % 2 === 0 ? 'bg-zinc-100' : 'bg-orange-50'
              } rounded-2xl flex flex-col justify-center items-center gap-6 md:gap-8 overflow-hidden group snap-start hover:shadow-xl transition-all duration-300 border border-transparent hover:border-green-100`}
            >
              <div className="relative w-full aspect-square max-h-44 md:max-h-52">
                <Image
                  src={getCategoryImage(cat)}
                  alt={decodeHTMLEntities(cat.name)}
                  fill
                  className="object-contain group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 260px, 288px"
                />
              </div>
              <div className="self-stretch flex flex-col justify-center items-center gap-2">
                <div className="self-stretch text-center text-zinc-900 text-xl md:text-2xl font-bold font-['Outfit'] leading-tight">
                  {decodeHTMLEntities(cat.name)}
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
