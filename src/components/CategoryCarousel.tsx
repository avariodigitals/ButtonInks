"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselCategory {
  id: number;
  name: string;
  slug: string;
  imgSrc: string;
  bg: string;
}

interface CategoryCarouselProps {
  categories: CarouselCategory[];
}

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex,    setActiveIndex]    = useState(0);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 24
      : 240;
    setActiveIndex(Math.round(el.scrollLeft / cardWidth));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  const scrollByCard = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 24
      : 240;
    el.scrollBy({ left: direction === 'left' ? -(cardWidth * 4) : cardWidth * 4, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 24
      : 240;
    el.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full">

      {/* Left arrow — desktop */}
      <button
        onClick={() => scrollByCard('left')}
        aria-label="Scroll left"
        className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10
          w-11 h-11 items-center justify-center bg-white border border-gray-200 rounded-full shadow-md
          hover:bg-green-50 hover:border-green-400 hover:text-green-700 active:scale-95 transition-all
          ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right arrow — desktop */}
      <button
        onClick={() => scrollByCard('right')}
        aria-label="Scroll right"
        className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10
          w-11 h-11 items-center justify-center bg-white border border-gray-200 rounded-full shadow-md
          hover:bg-green-50 hover:border-green-400 hover:text-green-700 active:scale-95 transition-all
          ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory md:snap-none pb-4
          [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
        style={{ WebkitOverflowScrolling: 'touch' }}
        onMouseDown={(e) => {
          const el = scrollRef.current;
          if (!el || window.innerWidth < 768) return;
          const startX     = e.pageX - el.offsetLeft;
          const startScroll = el.scrollLeft;
          el.style.cursor  = 'grabbing';
          const onMove = (ev: MouseEvent) => {
            el.scrollLeft = startScroll - (ev.pageX - el.offsetLeft - startX);
          };
          const onUp = () => {
            el.style.cursor = 'grab';
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup',   onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup',   onUp);
        }}
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories?category=${cat.slug}`}
            draggable={false}
            className={`snap-start shrink-0 select-none
              w-[75vw] sm:w-56 md:w-56 lg:w-60 xl:w-64
              px-4 sm:px-5 py-7 sm:py-8
              ${cat.bg} rounded-2xl
              flex flex-col justify-center items-center gap-5 sm:gap-6 overflow-hidden
              hover:shadow-lg transition-all duration-300 group`}
          >
            <div className="w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.imgSrc}
                alt={cat.name}
                draggable={false}
                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="flex flex-col items-center gap-1.5 w-full">
              <p className="text-center text-zinc-900 text-base sm:text-lg font-semibold font-['Outfit'] leading-tight">
                {cat.name}
              </p>
              <span className="py-0.5 border-b border-zinc-900 text-zinc-900 text-xs sm:text-sm font-normal font-['Outfit']">
                View all
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Dot indicators — mobile */}
      {categories.length > 2 && (
        <div className="flex md:hidden justify-center gap-1.5 pt-3">
          {categories.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to category ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-6 bg-green-700' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Swipe hint — mobile */}
      <p className="flex md:hidden items-center justify-center gap-1.5 mt-3 text-gray-400 text-xs font-medium">
        <span className="inline-block w-4 h-0.5 bg-gray-300 rounded" />
        Swipe to browse
        <span className="inline-block w-4 h-0.5 bg-gray-300 rounded" />
      </p>
    </div>
  );
}
