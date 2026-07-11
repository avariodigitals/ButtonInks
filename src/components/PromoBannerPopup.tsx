"use client";

import React, { useState, useEffect, useRef } from "react";
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

  const goTo = (indexOrUpdater: number | ((p: number) => number)) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(prev =>
        typeof indexOrUpdater === "function" ? indexOrUpdater(prev) : indexOrUpdater
      );
      setAnimating(false);
    }, 220);
  };

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
      setAnimating(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % banners.length);
        setAnimating(false);
      }, 220);
    }, AUTO_ROTATE_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [visible, banners.length]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % banners.length);
        setAnimating(false);
      }, 220);
    }, AUTO_ROTATE_MS);
  };

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
        className="fixed inset-0 z-[501] flex items-center justify-center p-2 sm:p-6 pointer-events-none"
      >
        {/*
          Card — max-w-4xl on desktop, full-width minus padding on mobile.
          overflow-hidden + rounded on all sides everywhere.
        */}
        <div
          className={[
            "relative pointer-events-auto",
            // Mobile stays as-is; desktop gets a larger presence.
            "w-[min(100vw-1rem,780px)] sm:w-[min(72vw,920px)]",
            "rounded-3xl sm:rounded-[22px]",
            "overflow-hidden",
            "shadow-[0_36px_90px_rgba(0,0,0,0.52)]",
            "animate-in fade-in zoom-in-95 duration-300",
          ].join(" ")}
        >
          {/* ── Close button ── */}
          <button
            onClick={dismiss}
            aria-label="Close promotion"
            className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:scale-110 hover:bg-black/70 active:scale-95 sm:top-4 sm:right-4"
          >
            <X className="h-5 w-5" />
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
                className="block w-full"
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  maxHeight: "84dvh",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />

              {/* Gradient for control legibility */}
              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />

              {/* Dot indicators */}
              {banners.length > 1 && (
                <div className="absolute bottom-12 inset-x-0 z-10 flex items-center justify-center gap-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.preventDefault(); resetTimer(); goTo(i); }}
                      aria-label={`Go to banner ${i + 1}`}
                      className={[
                        "rounded-full transition-all duration-200",
                        i === current
                          ? "h-2.5 w-7 bg-white"
                          : "h-2.5 w-2.5 bg-white/40 hover:bg-white/75",
                      ].join(" ")}
                    />
                  ))}
                </div>
              )}

              {/* "Don't show again" pill on the image */}
              <div className="absolute bottom-3 inset-x-0 z-10 flex justify-center">
                <button
                  onClick={(e) => { e.preventDefault(); dismiss(); }}
                  className="rounded-full border border-white/45 bg-black/35 px-5 py-2 text-xs font-medium text-white/90 backdrop-blur-sm transition-all active:scale-95 hover:bg-black/55 hover:text-white sm:px-6 sm:py-2.5"
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
