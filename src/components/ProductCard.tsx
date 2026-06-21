"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Heart, Loader2 } from "lucide-react";

export interface ProductCardProps {
  category: string;
  name: string;
  rating: number;
  reviewCount: number;
  filledStars: number;
  price: string;        // may be price_html with <del>/<ins>
  minQty: string;
  image: string;
  href: string;
  productId?: number;   // WP product ID — used for wishlist
}

function getToken(): string | null {
  try { return localStorage.getItem("bi_token"); } catch { return null; }
}

export default function ProductCard({
  category,
  name,
  rating,
  reviewCount,
  filledStars,
  price,
  minQty,
  image,
  href,
  productId,
}: ProductCardProps) {
  const router = useRouter();
  const [wishlisted,     setWishlisted]     = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handleWishlist = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();   // don't navigate
    e.stopPropagation();

    const token = getToken();
    if (!token) {
      // Not logged in — send to login with redirect back
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
      return;
    }

    if (!productId) return;
    setWishlistLoading(true);
    try {
      const action = wishlisted ? "remove" : "add";
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, action }),
      });
      setWishlisted(v => !v);
    } finally {
      setWishlistLoading(false);
    }
  }, [wishlisted, productId, href, router]);

  return (
    <Link
      href={href}
      className="flex flex-col bg-white rounded-2xl shadow-[0px_2px_8px_0px_rgba(13,27,46,0.04)] outline outline-[1.31px] outline-offset-[-1.31px] outline-slate-900/5 overflow-hidden group hover:shadow-[0px_8px_24px_0px_rgba(13,27,46,0.10)] transition-all duration-300 active:scale-[0.98]"
    >
      {/* ── Image ── */}
      <div className="relative w-full h-56 overflow-hidden bg-gray-50">
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-90
            ${wishlisted
              ? "bg-red-500 text-white"
              : "bg-white/90 backdrop-blur-sm text-zinc-400 hover:text-red-500 hover:bg-white"
            }`}
        >
          {wishlistLoading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-white" : ""}`} />
          }
        </button>
      </div>

      {/* ── Body ── */}
      <div className="p-4 bg-white border-t border-zinc-500/30 flex flex-col gap-3">
        <span className="text-gray-400 text-xs font-semibold uppercase leading-4 tracking-wide font-['Inter']">
          {category}
        </span>

        <p className="text-slate-900 text-base font-medium leading-5 line-clamp-2 font-['Outfit']">
          {name}
        </p>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-3 h-3"
                fill={i < filledStars ? "#ea580c" : "none"}
                stroke="#ea580c"
                strokeWidth={1}
              />
            ))}
          </div>
          <span className="text-slate-500 text-xs font-normal leading-4 font-['Inter']">
            {rating} ({reviewCount.toLocaleString()})
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex flex-wrap items-baseline gap-1">
            <span
              className="text-slate-900 text-base font-semibold leading-6 [&_del]:text-gray-400 [&_del]:text-xs [&_del]:font-normal [&_del]:mr-1 [&_ins]:no-underline font-['Outfit']"
              dangerouslySetInnerHTML={{ __html: price }}
            />
            {minQty && (
              <span className="text-gray-400 text-xs font-normal leading-4 font-['Inter']">
                · {minQty}
              </span>
            )}
          </div>
          <span className="px-3 py-2 bg-green-700 group-hover:bg-green-800 rounded-lg text-white text-xs font-semibold leading-4 font-['Inter'] transition-colors shrink-0">
            Shop
          </span>
        </div>
      </div>
    </Link>
  );
}
