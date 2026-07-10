"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY    = "bi_promo_dismissed_v1";
const SHOW_DELAY_MS  = 2500;
const AUTO_ROTATE_MS = 5000;

interface Banner {
  id:   number;
  url:  string;
  link: string;
  alt:  string;
}

export default function PromoBannerPopup() {
  const [banners,   setBanners]   = useState<Banner[]>([]);
  const [visible,   setVisible]   = useState(false);
  const [current,   setCurrent]   = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch { /* SSR / private mode */ }

    fetch("/api/promo-banners")
      .then(r => r.json())
      .then((data: Banner[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
          const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
          return () => clearTimeout(t);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!visible || banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      goTo((prev) => (prev + 1) % banners.length);
    }, AUTO_ROTATE_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, banners.length]);

  const goTo = useCallback((indexOrUpdater: number | ((p: number) => number)) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(prev =>
        typeof indexOrUpdater === "function" ? indexOrUpdater(prev) : indexOrUpdater
      );
      setAnimating(false);
    }, 220);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goTo((prev) => (prev + 1) % banners.length);
    }, AUTO_ROTATE_MS);
  }, [banners.length, goTo]);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* private mode */ }
  };

  if (!visible || banners.length === 0) return null;

  const banner = banners[current];

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-[3px]"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* ── Centering wrapper — centered on ALL screen sizes ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Promotional offer"
        className="fixed inset-0 z-[501] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
      >
        {/*
          Card — max-w-4xl on desktop, full-width minus padding on mobile.
          overflow-hidden + rounded on all sides everywhere.
        */}
        <div
          className={[
            "relative pointer-events-auto",
            // Mobile: full width minus padding. Desktop: ~600px sweet spot
            "w-full sm:w-[min(60vw,620px)]",
            "rounded-2xl sm:rounded-[20px]",
            "overflow-hidden",
            "shadow-[0_32px_80px_rgba(0,0,0,0.50)]",
            "animate-in fade-in zoom-in-95 duration-300",
          ].join(" ")}
        >
          {/* ── Close button ── */}
          <button
            onClick={dismiss}
            aria-label="Close promotion"
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/45 hover:bg-black/65 text-white transition-all hover:scale-110 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ── Banner image ── */}
          <Link href={banner.link} onClick={dismiss} className="block">
            <div
              className={[
                "relative w-full",
                "transition-opacity duration-200",
                animating ? "opacity-0" : "opacity-100",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.url}
                alt={banner.alt}
                className="w-full block"
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  maxHeight: "70dvh",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />

              {/* Gradient for control legibility */}
              <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

              {/* Dot indicators */}
              {banners.length > 1 && (
                <div className="absolute bottom-11 inset-x-0 flex items-center justify-center gap-2 z-10">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.preventDefault(); resetTimer(); goTo(i); }}
                      aria-label={`Go to banner ${i + 1}`}
                      className={[
                        "rounded-full transition-all duration-200",
                        i === current
                          ? "w-6 h-2 bg-white"
                          : "w-2 h-2 bg-white/45 hover:bg-white/75",
                      ].join(" ")}
                    />
                  ))}
                </div>
              )}

              {/* "Don't show again" pill on the image */}
              <div className="absolute bottom-3.5 inset-x-0 flex justify-center z-10">
                <button
                  onClick={(e) => { e.preventDefault(); dismiss(); }}
                  className="px-5 py-1.5 rounded-full border border-white/50 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white/80 hover:text-white text-xs font-medium font-['Inter'] transition-all active:scale-95"
                >
                  Don&apos;t show again
                </button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
