"use client";

import React, { useState, useEffect } from 'react';

const DEFAULT_TEXT = 'Free shipping on orders over $75 · Use code PRINT15 for 15% off your first order';

export default function AnnouncementBar() {
  const [text, setText] = useState(DEFAULT_TEXT);

  useEffect(() => {
    fetch('/api/announcement')
      .then(res => res.json())
      .then(data => {
        if (data && data.text) setText(data.text);
      })
      .catch(() => {});
  }, []);

  const isDefault = text === DEFAULT_TEXT;

  return (
    <div className="w-full min-h-[44px] bg-green-700 flex items-center shrink-0 z-[60] relative border-b border-white/5 shadow-sm overflow-hidden">

      {/* ── Desktop View (Centered Static) ── */}
      <div className="hidden sm:flex w-full px-4 py-2 items-center justify-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-center">
          {isDefault ? (
            <p className="text-white text-xs md:text-sm font-bold uppercase tracking-wider leading-tight text-center">
              Free shipping on orders over $75 <span className="mx-2 text-white/30">|</span>
              Use code <span className="bg-white text-green-700 px-1.5 py-0.5 rounded-md font-black mx-1 inline-block">PRINT15</span> for 15% off
            </p>
          ) : (
            <p className="text-white text-xs md:text-sm font-bold uppercase tracking-wider leading-tight text-center">
              {text}
            </p>
          )}
        </div>
      </div>

      {/* ── Mobile View (Marquee) ── */}
      <div className="sm:hidden w-full relative flex items-center py-2.5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          <p className="text-white text-[10px] font-bold uppercase tracking-widest px-8">
            {text}
          </p>
          {/* Duplicate for seamless loop */}
          <p className="text-white text-[10px] font-bold uppercase tracking-widest px-8" aria-hidden="true">
            {text}
          </p>
          <p className="text-white text-[10px] font-bold uppercase tracking-widest px-8" aria-hidden="true">
            {text}
          </p>
          <p className="text-white text-[10px] font-bold uppercase tracking-widest px-8" aria-hidden="true">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
