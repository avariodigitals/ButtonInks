"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Hide on design page if it interferes too much, or adjust position
  const isDesignPage = pathname?.startsWith('/design');

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top scroll position
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div
      className={`fixed z-[100] transition-all duration-300 ease-in-out
        ${isDesignPage ? 'bottom-20 md:bottom-8' : 'bottom-6 md:bottom-8'}
        right-4 md:right-8
      `}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className={`
          w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-green-700 text-white shadow-2xl transition-all duration-300 hover:bg-green-800 active:scale-95 border border-white/20
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
      </button>
    </div>
  );
};

export default ScrollToTop;
