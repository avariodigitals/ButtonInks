"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Phone, ShoppingCart, Heart, User, Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { WP_URL } from "@/lib/wordpress";
import SearchModal from "@/components/SearchModal";

// ── Shared category data (mirrors CategoryNav.tsx) ───────────────────────────
interface SubCategory { label: string; href: string; }
interface MobileCategory { label: string; href: string; subcategories?: SubCategory[]; }

const mobileCategories: MobileCategory[] = [
  { label: "All", href: "/categories" },
  {
    label: "Embroidery",
    href: "/categories?category=embroidery",
    subcategories: [
      { label: "Polo Shirts",      href: "/categories?category=polo" },
      { label: "Caps",             href: "/categories?category=cap" },
      { label: "Hoodies",          href: "/categories?category=hoodie" },
      { label: "Long Sleeve Polo", href: "/categories?category=long-sleeve-polo" },
    ],
  },
  { label: "DTF Prints", href: "/categories?category=dtf-direct-to-filmprints" },
  {
    label: "Apparel",
    href: "/categories?category=apparel",
    subcategories: [
      { label: "T-Shirts",        href: "/categories?category=tshirts" },
      { label: "Custom Hoodies",  href: "/categories?category=custom-hoodies" },
      { label: "Bags",            href: "/categories?category=bags" },
    ],
  },
  {
    label: "Drinkware",
    href: "/categories?category=best-custom-drinkware",
    subcategories: [
      { label: "Custom Coffee Mugs", href: "/categories?category=custom-coffee-mugs" },
      { label: "Personalized Mugs",  href: "/categories?category=personalized-mugs" },
    ],
  },
  {
    label: "Gifts & Decor",
    href: "/categories?category=gifts-decor",
    subcategories: [
      { label: "Birthday Gifts",  href: "/categories?category=birthday-gifts" },
      { label: "Corporate Gifts", href: "/categories?category=corporate-gifts" },
      { label: "Wedding Gifts",   href: "/categories?category=wedding-gifts" },
    ],
  },
  {
    label: "Banners",
    href: "/categories?category=banners",
    subcategories: [
      { label: "Promotional Banners", href: "/categories?category=promotional-banners" },
      { label: "Rollup Banners",      href: "/categories?category=rollupbanners" },
      { label: "Table Banners",       href: "/categories?category=table-banners" },
      { label: "Other Banners",       href: "/categories?category=other-banners" },
    ],
  },
  { label: "Office Supplies",        href: "/categories?category=office-supplies" },
  { label: "Event Merchandize",      href: "/categories?category=event-merchandize" },
  {
    label: "Retail",
    href: "/categories?category=retail",
    subcategories: [
      { label: "Hoodies", href: "/categories?category=ready_made_hoodies" },
    ],
  },
  { label: "Personalization Center", href: "/categories?category=personalization-center" },
];

// ── Mobile category row (expandable if has subcategories) ────────────────────
function MobileCatRow({ cat, onClose }: { cat: MobileCategory; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const hasSubs = !!cat.subcategories?.length;

  if (!hasSubs) {
    return (
      <Link
        href={cat.href}
        onClick={onClose}
        className="px-6 py-4 flex justify-between items-center hover:bg-green-50 group border-b border-gray-50"
      >
        <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors font-inter">
          {cat.label}
        </span>
      </Link>
    );
  }

  return (
    <div className="border-b border-gray-50">
      {/* Parent row — tap to expand, not navigate */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-green-50 group"
      >
        <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors font-inter">
          {cat.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 group-hover:text-green-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Subcategory list */}
      {open && (
        <div className="bg-gray-50 border-t border-gray-100">
          {cat.subcategories!.map(sub => (
            <Link
              key={sub.label}
              href={sub.href}
              onClick={onClose}
              className="px-8 py-3 flex justify-between items-center text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors border-b border-gray-50 last:border-0"
            >
              {sub.label}
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount } = useCart();

  // Lock body scroll when menu is open
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <div className="w-full h-16 px-4 md:px-20 border-b border-slate-400/20 flex justify-between items-center bg-white shrink-0 relative z-50">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-12 h-12 md:w-16 md:h-16 relative overflow-hidden flex items-center justify-center">
            <Image
              src={`${WP_URL}/wp-content/uploads/2022/08/cropped-Screenshot_3.png`}
              alt="ButtonInks logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        </Link>

        {/* ── Search (Desktop) ── */}
        <div className="hidden lg:flex flex-1 max-w-[608px] mx-8">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full h-9 px-3 py-2 bg-white rounded-md outline outline-1 outline-offset-[-1px] outline-gray-300 flex justify-between items-center gap-3 hover:outline-green-500 hover:shadow-sm transition-all group"
            aria-label="Open search"
          >
            <span className="text-gray-400 text-sm font-normal leading-5 select-none font-['Inter'] group-hover:text-gray-500">
              Search for any product...
            </span>
            <Search className="w-5 h-5 text-slate-400 group-hover:text-green-600 shrink-0 transition-colors" />
          </button>
        </div>

        {/* ── Right icons ── */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">

          {/* Hotline (Desktop) */}
          <div className="hidden xl:flex items-center gap-3">
            <Phone className="w-5 h-5 text-neutral-700" />
            <span
              className="text-neutral-700 text-sm font-medium leading-5 whitespace-nowrap font-['Inter']"
            >
              Hotline: +1 (409) 800-3195
            </span>
          </div>

          {/* Search Icon (Mobile) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="lg:hidden p-2 text-neutral-700 hover:text-green-700 transition-colors"
            aria-label="Open search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart with badge */}
          <Link href="/cart" className="relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-50 group">
            <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-green-700 transition-colors" />
            {/* Label hidden on mobile, shown on desktop */}
            <span className="hidden md:block text-[10px] font-medium text-gray-500 group-hover:text-green-700 transition-colors font-inter leading-none">Cart</span>
            {itemCount > 0 && (
              <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-700 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold leading-4 font-['Inter']">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              </div>
            )}
          </Link>

          {/* Wishlist (Desktop) */}
          <Link href="/wishlist" className="hidden md:flex flex-col items-center gap-0.5 px-2 py-1 rounded-md hover:bg-gray-50 group transition-colors">
            <Heart className="w-5 h-5 text-neutral-700 group-hover:text-green-700 transition-colors" />
            <span className="text-[10px] font-medium text-gray-500 group-hover:text-green-700 transition-colors font-inter leading-none">Wishlist</span>
          </Link>

          {/* Account (Desktop) */}
          <Link href="/account" className="hidden md:flex flex-col items-center gap-0.5 px-2 py-1 rounded-md hover:bg-gray-50 group transition-colors">
            <User className="w-5 h-5 text-neutral-700 group-hover:text-green-700 transition-colors" />
            <span className="text-[10px] font-medium text-gray-500 group-hover:text-green-700 transition-colors font-inter leading-none">Account</span>
          </Link>

          {/* Hamburger Menu (Mobile) */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2 text-neutral-900 hover:bg-gray-50 rounded-md transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ── Mobile Side Menu ── */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Sidebar Drawer (Slide right to left) */}
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-stone-50">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Image
                src={`${WP_URL}/wp-content/uploads/2022/08/cropped-Screenshot_3.png`}
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 bg-white rounded-full shadow-sm text-gray-900 hover:text-red-500 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto py-6 flex flex-col no-scrollbar">

            {/* Quick Links Group */}
            <div className="px-6 pb-6 border-b border-gray-100 flex flex-col gap-4">
               <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl text-green-700">
                  <Phone className="w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-xs opacity-70">Need help? Call us</span>
                    <span className="font-bold text-sm font-['Inter']">+1 (409) 800-3195</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <Link href="/account" onClick={() => setIsMenuOpen(false)} className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                    <User className="w-5 h-5" />
                    <span className="text-xs font-bold font-inter">Account</span>
                 </Link>
                 <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-xs font-bold font-inter">Wishlist</span>
                 </Link>
               </div>
            </div>

            {/* Categories List */}
            <div className="flex flex-col py-4">
              <span className="px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-['Inter']">Shop Categories</span>
              {mobileCategories.map((cat) => (
                <MobileCatRow key={cat.label} cat={cat} onClose={() => setIsMenuOpen(false)} />
              ))}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-6 flex flex-col gap-3 border-t border-gray-100">
            <Link
              href="/designs"
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-3.5 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold text-center flex items-center justify-center active:scale-95 transition-all font-inter"
            >
              Browse Ready-Made Designs
            </Link>
            <Link
              href="/design"
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-center block active:scale-95 transition-transform font-inter"
            >
              Start Designing Free
            </Link>
          </div>
        </div>
      </div>
      {/* ── Search Modal ── */}
      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
