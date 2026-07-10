"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { X, Tag } from "lucide-react";

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

  const prev = () => { resetTimer(); goTo((p) => (p - 1 + banners.length) % banners.length); };
  const next = () => { resetTimer(); goTo((p) => (p + 1) % banners.length); };

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

      {/* ── Modal shell ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Promotional offer"
        className="fixed inset-0 z-[501] flex items-end sm:items-center justify-center sm:p-6 pointer-events-none"
      >
        {/*
          Mobile  → slides up from bottom, nearly full-width, rounded top corners
          Desktop → centered card, very wide (up to 960px), rounded all sides
        */}
        <div
          className={[
            "relative pointer-events-auto",
            "w-full sm:w-auto sm:max-w-4xl",
            // Mobile: bottom sheet feel
            "rounded-t-[28px] sm:rounded-[20px]",
            // Size
            "overflow-hidden",
            // Shadow + bg
            "shadow-[0_32px_80px_rgba(0,0,0,0.45)] bg-white",
            // Entrance animation
            "animate-in fade-in slide-in-from-bottom-8 sm:zoom-in-95 duration-350",
          ].join(" ")}
        >

          {/* ── Drag pill (mobile only) ── */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* ── Close button ── */}
          <button
            onClick={dismiss}
            aria-label="Close promotion"
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-all hover:scale-110 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ── Promo badge ── */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-600 text-white text-xs font-bold font-['Inter'] shadow-md">
            <Tag className="w-3 h-3" />
            Special Offer
          </div>

          {/* ── Banner image area ── */}
          <Link href={banner.link} onClick={dismiss} className="block">
            <div
              className={[
                "relative w-full overflow-hidden",
                "transition-opacity duration-220",
                animating ? "opacity-0" : "opacity-100",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.url}
                alt={banner.alt}
                className={[
                  "w-full object-cover block",
                  // Mobile: tall portrait; Desktop: cinematic landscape
                  "max-h-[58dvh] sm:max-h-[540px]",
                  "min-h-[220px]",
                ].join(" ")}
                style={{ objectPosition: "center top" }}
              />

              {/* Subtle bottom gradient so nav dots have contrast */}
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

              {/* Dot navigation — overlaid on the image bottom */}
              {banners.length > 1 && (
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-10">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.preventDefault(); resetTimer(); goTo(i); }}
                      aria-label={`Go to banner ${i + 1}`}
                      className={[
                        "rounded-full transition-all duration-200",
                        i === current
                          ? "w-6 h-2 bg-white"
                          : "w-2 h-2 bg-white/50 hover:bg-white/80",
                      ].join(" ")}
                    />
                  ))}
                </div>
              )}
            </div>
          </Link>

          {/* ── Footer bar ── */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white">

            {/* Counter */}
            {banners.length > 1 ? (
              <span className="text-xs text-gray-400 font-['Inter'] tabular-nums">
                {current + 1} / {banners.length}
              </span>
            ) : (
              <div /> /* spacer */
            )}

            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2 font-['Inter']"
            >
              Don&apos;t show again
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
