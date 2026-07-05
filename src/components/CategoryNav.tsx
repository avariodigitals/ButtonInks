"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface SubCategory {
  label: string;
  href: string;
}

interface Category {
  label: string;
  href: string;
  subcategories?: SubCategory[];
}

/**
 * WP parent → child mapping (from /wc/v3/products/categories):
 *   Embroidery (73)         → Cap (103), Hoodie (104), Long Sleeve Polo (105), Polo (102)
 *   Apparel (57)            → Bags (61), Custom Hoodies (93), Tshirts (58)
 *   Drinkware (55)          → Custom Coffee Mugs (56), Personalized Mugs (92)
 *   Gifts & Decor (75)      → Birthday Gifts (87), Corporate Gifts (88), Wedding Gifts (86)
 *   Banners (80)            → Promotional Banners (84), Rollup Banners (82), Table Banners (83), Other Banners (85)
 *   Retail (78)             → Hoodies (98)
 *   DTF Prints (74)         → no children
 *   Events Merchandize (77) → no children
 *   Office Supplies (76)    → no children
 *   Personalization Center  → no children
 */
const categories: Category[] = [
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

// ─── Portal Dropdown ──────────────────────────────────────────────────────────
// Renders directly into document.body so it escapes every stacking context
// and overflow:hidden/auto ancestor.

interface PortalDropdownProps {
  cat: Category;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function PortalDropdown({ cat, anchorRef, open, onMouseEnter, onMouseLeave }: PortalDropdownProps) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Recompute position every time it opens
  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top:  rect.bottom + window.scrollY,  // flush against the bottom edge — bridge div covers the gap
        left: rect.left   + window.scrollX,
      });
    }
  }, [open, anchorRef]);

  if (!mounted || !cat.subcategories?.length) return null;

  return createPortal(
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ top: pos.top, left: pos.left, position: "absolute" }}
      className={`min-w-[220px] bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-[99999] transition-all duration-150 origin-top ${
        open
          ? "opacity-100 scale-y-100 pointer-events-auto"
          : "opacity-0 scale-y-95 pointer-events-none"
      }`}
    >
      {/* Invisible bridge fills the gap between nav bar and panel so the
          cursor doesn't trigger mouseleave while moving down to the panel */}
      <div className="absolute -top-2 left-0 right-0 h-2" />

      <div className="py-1">
        {cat.subcategories.map((sub) => (
          <Link
            key={sub.label}
            href={sub.href}
            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-colors whitespace-nowrap"
          >
            {sub.label}
          </Link>
        ))}
      </div>
    </div>,
    document.body
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({ cat }: { cat: Category }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRef  = useRef<HTMLDivElement>(null);
  const hasDropdown = !!cat.subcategories?.length;

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    // 300ms gives enough time to move cursor from trigger into the dropdown panel
    timeoutRef.current = setTimeout(() => setOpen(false), 300);
  }, []);

  return (
    <div
      ref={anchorRef}
      className="relative shrink-0"
      onMouseEnter={hasDropdown ? show : undefined}
      onMouseLeave={hasDropdown ? hide : undefined}
    >
      <Link
        href={cat.href}
        className="px-3 py-2 rounded-md flex items-center gap-1 hover:bg-gray-50 group transition-colors"
      >
        <span className="text-gray-700 text-sm font-medium leading-5 whitespace-nowrap group-hover:text-green-700 transition-colors font-inter">
          {cat.label}
        </span>
        {hasDropdown && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-500 group-hover:text-green-700 transition-transform duration-200 shrink-0 ${
              open ? "rotate-180" : "rotate-0"
            }`}
            strokeWidth={1.5}
          />
        )}
      </Link>

      {hasDropdown && (
        <PortalDropdown
          cat={cat}
          anchorRef={anchorRef}
          open={open}
          onMouseEnter={show}
          onMouseLeave={hide}
        />
      )}
    </div>
  );
}

// ─── CategoryNav ──────────────────────────────────────────────────────────────

export default function CategoryNav() {
  const pathname = usePathname();

  if (pathname?.startsWith("/design")) return null;

  return (
    <div className="hidden lg:flex w-full h-16 px-4 xl:px-20 border-b border-slate-400/20 items-center bg-white shrink-0">
      <div className="flex-1 flex justify-between items-center gap-1 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <NavItem key={cat.label} cat={cat} />
        ))}

        <Link
          href="/designs"
          className="px-3 py-2 rounded-md flex items-center gap-1 hover:bg-gray-50 group transition-colors shrink-0"
        >
          <span className="text-gray-700 text-sm font-medium leading-5 whitespace-nowrap group-hover:text-green-700 transition-colors font-inter">
            Ready-Made Designs
          </span>
        </Link>
      </div>
    </div>
  );
}
