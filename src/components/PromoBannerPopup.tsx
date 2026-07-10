"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const STORAGE_KEY   = "bi_promo_dismissed_v1";
const SHOW_DELAY_MS = 2500;   // wait 2.5 s before showing
const AUTO_ROTATE_MS = 4000;  // rotate every 4 s

interface Banner {
  id:   number;
  url:  string;
  link: string;
  alt:  string;
}

export default function PromoBannerPopup() {
  const [banners,    setBanners]    = useState<Banner[]>([]);
  const [visible,    setVisible]    = useState(false);
  const [current,    setCurrent]    = useState(0);
  const [animating,  setAnimating]  = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check localStorage — never show again after dismissed
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch { /* SSR / private mode */ }

    fetch("/api/promo-banners")
      .then(r => r.json())
      .then((data: Banner[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
          // Delay before showing
          const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
          return () => clearTimeout(t);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!visible || banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      goTo((prev) => (prev + 1) % banners.length);
    }, AUTO_ROTATE_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [visible, banners.length]);

  const goTo = useCallback((indexOrUpdater: number | ((p: number) => number)) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(typeof indexOrUpdater === "function"
        ? indexOrUpdater(current)
        : indexOrUpdater);
      setAnimating(false);
    }, 200);
  }, [current]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goTo((prev) => (prev + 1) % banners.length);
    }, AUTO_ROTATE_MS);
  }, [banners.length, goTo]);

  const prev = () => {
    resetTimer();
    goTo((p) => (p - 1 + banners.length) % banners.length);
  };

  const next = () => {
    resetTimer();
    goTo((p) => (p + 1) % banners.length);
  };

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* private mode */ }
  };

  if (!visible || banners.length === 0) return null;

  const banner = banners[current];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Promotional offer"
        className="fixed inset-0 z-[501] flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="relative pointer-events-auto w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-white animate-in fade-in zoom-in-95 duration-300">

          {/* Close button */}
          <button
            onClick={dismiss}
            aria-label="Close promotion"
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Banner image — links to its destination */}
          <Link
            href={banner.link}
            onClick={dismiss}
            className="block"
          >
            <div
              className={`relative w-full transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.url}
                alt={banner.alt}
                className="w-full object-cover rounded-t-2xl"
                style={{ maxHeight: '420px', display: 'block' }}
              />
            </div>
          </Link>

          {/* Nav + dots — only shown when multiple banners */}
          {banners.length > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100">
              {/* Prev */}
              <button
                onClick={prev}
                aria-label="Previous banner"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-green-600 hover:text-green-700 transition-colors text-gray-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { resetTimer(); goTo(i); }}
                    aria-label={`Go to banner ${i + 1}`}
                    className={`rounded-full transition-all ${
                      i === current
                        ? "w-5 h-2 bg-green-600"
                        : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              {/* Next */}
              <button
                onClick={next}
                aria-label="Next banner"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-green-600 hover:text-green-700 transition-colors text-gray-500"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Dismiss text link */}
          <div className="text-center pb-3">
            <button
              onClick={dismiss}
              className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
            >
              Don&apos;t show this again
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
