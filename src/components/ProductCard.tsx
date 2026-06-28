"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Heart, Loader2, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

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
  productId?: number;   // WP product ID — used for cart & wishlist
  rawPrice?: number;    // numeric price for cart
  slug?: string;        // WP product slug — used for "Edit selection" link in cart
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
  rawPrice = 0,
  slug,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart, cart, cartSyncing } = useCart();

  const [wishlisted,      setWishlisted]      = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addingToCart,    setAddingToCart]    = useState(false);
  // guestAdded: true while showing "Added to Cart" for non-logged-in users (resets after 3s)
  const [guestAdded,      setGuestAdded]      = useState(false);

  // For logged-in users, derive "added" state from the live cart
  const isLoggedIn     = Boolean(getToken());
  const isInCart       = isLoggedIn && productId
    ? cart.some(item => item.id === productId)
    : false;
  const showAdded      = isInCart || guestAdded;

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

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId || addingToCart || cartSyncing) return;

    setAddingToCart(true);
    try {
      await addToCart({ id: productId, name, price: rawPrice, quantity: 1, image, slug, category });
      if (!isLoggedIn) {
        // Guest: show "Added" temporarily
        setGuestAdded(true);
        setTimeout(() => setGuestAdded(false), 3000);
      }
      // Logged-in: isInCart from cart context will flip to true automatically
    } finally {
      setAddingToCart(false);
    }
  }, [productId, addingToCart, cartSyncing, addToCart, name, rawPrice, image, isLoggedIn]);

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

        {/* Price row */}
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

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={addingToCart}
          aria-label={showAdded ? "Added to cart" : "Add to cart"}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold font-['Inter'] transition-all duration-200 active:scale-95
            ${showAdded
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-green-700 hover:bg-green-800 text-white"
            }
            ${addingToCart ? "opacity-70 cursor-not-allowed" : ""}
          `}
        >
          {addingToCart ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : showAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </Link>
  );
}
