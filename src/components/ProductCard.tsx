"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Heart, Loader2, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { colorNameToHex } from "@/lib/colorLookup";

// ── Brand-accurate overrides (same as ProductDetailView) ─────────────────────
const COLOR_MAP_OVERRIDES: Record<string, string> = {
  white: '#FFFFFF', black: '#000000', red: '#EF4444', blue: '#3B82F6',
  green: '#22C55E', yellow: '#EAB308', orange: '#F97316', purple: '#A855F7',
  pink: '#F9A8D4', coral: '#F87171', lime: '#84CC16', teal: '#0D9488',
  cyan: '#06B6D4', brown: '#92400E', tan: '#D2B48C', mint: '#6EE7B7',
};

function resolveColor(name: string): string | null {
  const key = name.toLowerCase().trim();
  if (COLOR_MAP_OVERRIDES[key]) return COLOR_MAP_OVERRIDES[key];
  return colorNameToHex(name);
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}

// ── Price helpers ─────────────────────────────────────────────────────────────
/**
 * Strip all HTML tags from a string, returning plain text.
 * Used to pull numbers out of WooCommerce price_html.
 */
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Extract a dollar amount from a WC price_html string.
 * Returns null when the string is empty or the amount is 0.
 */
function extractAmount(html: string): number | null {
  // Find the first $ followed by digits in the plain text
  const match = stripTags(html).match(/\$([\d,]+\.?\d*)/);
  if (!match) return null;
  const val = parseFloat(match[1].replace(/,/g, ''));
  return val > 0 ? val : null;
}

interface ParsedPrice {
  regular: number | null;  // struck-through price (only present when on sale)
  current: number | null;  // the price to show in green
}

/**
 * Parse WooCommerce price_html into structured regular/current prices.
 *
 * WC sale format:  <del>...$45.00...</del><ins>...$26.95...</ins>
 * WC plain format: <span ...>$12.00</span>  (no del/ins)
 */
function parsePriceHtml(priceHtml: string): ParsedPrice {
  if (!priceHtml) return { regular: null, current: null };

  // Try to extract <del> and <ins> sections
  const delMatch = priceHtml.match(/<del[^>]*>([\s\S]*?)<\/del>/i);
  const insMatch = priceHtml.match(/<ins[^>]*>([\s\S]*?)<\/ins>/i);

  if (delMatch && insMatch) {
    return {
      regular: extractAmount(delMatch[1]),
      current: extractAmount(insMatch[1]),
    };
  }

  // No sale markup — just a plain price
  return { regular: null, current: extractAmount(priceHtml) };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

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
  colors?: string[];    // optional color options from WC attributes
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
  colors = [],
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
  }, [productId, addingToCart, cartSyncing, addToCart, name, rawPrice, image, isLoggedIn, category, slug]);

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
          {(() => {
            const { regular, current } = parsePriceHtml(price);
            // Fallback: if parsing yields nothing, try rawPrice
            const displayCurrent = current ?? (rawPrice > 0 ? rawPrice : null);
            return (
              <>
                {regular && (
                  <span className="text-gray-400 text-xs font-normal line-through font-['Inter']">
                    {fmt(regular)}
                  </span>
                )}
                <span className={`text-base font-semibold leading-6 font-['Outfit'] ${regular ? 'text-green-700' : 'text-slate-900'}`}>
                  {displayCurrent ? fmt(displayCurrent) : 'Get a quote'}
                </span>
              </>
            );
          })()}
          {minQty && (
            <span className="text-gray-400 text-xs font-normal leading-4 font-['Inter']">
              · {minQty}
            </span>
          )}
        </div>

        {/* Color swatches */}
        {colors.length > 0 && (() => {
          const MAX_VISIBLE = 6;
          const visible = colors.slice(0, MAX_VISIBLE);
          const overflow = colors.length - MAX_VISIBLE;
          return (
            <div className="flex items-center gap-1 flex-wrap">
              {visible.map((colorName) => {
                const hex = resolveColor(colorName);
                if (!hex) {
                  // No hex found — render a text pill instead
                  return (
                    <span
                      key={colorName}
                      title={colorName}
                      className="px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 text-[10px] font-inter leading-none"
                    >
                      {colorName}
                    </span>
                  );
                }
                const light = isLightColor(hex);
                return (
                  <span
                    key={colorName}
                    title={colorName}
                    aria-label={colorName}
                    className={`w-4 h-4 rounded-full border shrink-0 ${light ? 'border-gray-300' : 'border-transparent'}`}
                    style={{ backgroundColor: hex }}
                  />
                );
              })}
              {overflow > 0 && (
                <span className="text-gray-400 text-[10px] font-inter leading-none">
                  +{overflow}
                </span>
              )}
            </div>
          );
        })()}

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
