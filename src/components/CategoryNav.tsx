"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubLink {
  label: string;
  href: string;
}

interface SubGroup {
  heading: string;
  links: SubLink[];
}

interface Category {
  label: string;
  href: string;
  /** Static preview image shown on the right side of the mega menu */
  previewImage?: string;
  /** Simple flat list — renders as a single-column dropdown */
  subcategories?: SubLink[];
  /** Grouped columns — renders as a mega-menu panel */
  megaMenu?: SubGroup[];
}

// ── Category data ─────────────────────────────────────────────────────────────

const categories: Category[] = [
  { label: "All", href: "/categories" },

  {
    label: "Embroidery",
    href: "/categories?category=embroidery",
    previewImage: "https://central.buttoninks.com/wp-content/uploads/2026/07/toa-heftiba-ScuVVivQPTc-unsplash-scaled.jpg",
    megaMenu: [
      {
        heading: "Tops",
        links: [
          { label: "Polo Shirts",      href: "/categories?category=polo" },
          { label: "Hoodies",          href: "/categories?category=hoodie" },
          { label: "Long Sleeve Polo", href: "/categories?category=long-sleeve-polo" },
        ],
      },
      {
        heading: "Accessories",
        links: [
          { label: "Caps", href: "/categories?category=cap" },
        ],
      },
    ],
  },

  { label: "DTF Prints", href: "/categories?category=dtf-direct-to-filmprints" },

  {
    label: "Clothing & Bags",
    href: "/categories?category=apparel",
    previewImage: "https://central.buttoninks.com/wp-content/uploads/2026/07/thom-bradley-WeG2bHKSUo0-unsplash-scaled.jpg",
    megaMenu: [
      {
        heading: "Tops",
        links: [
          { label: "T-Shirts",       href: "/categories?category=tshirts" },
          { label: "Custom Hoodies", href: "/categories?category=custom-hoodies" },
        ],
      },
      {
        heading: "Bags",
        links: [
          { label: "All Bags", href: "/categories?category=bags" },
        ],
      },
    ],
  },

  {
    label: "Drinkware",
    href: "/categories?category=best-custom-drinkware",
    previewImage: "https://central.buttoninks.com/wp-content/uploads/2025/02/images-3.jpg",
    megaMenu: [
      {
        heading: "Mugs",
        links: [
          { label: "Custom Coffee Mugs", href: "/categories?category=custom-coffee-mugs" },
          { label: "Personalized Mugs",  href: "/categories?category=personalized-mugs" },
        ],
      },
    ],
  },

  {
    label: "Gifts & Decor",
    href: "/categories?category=gifts-decor",
    previewImage: "https://central.buttoninks.com/wp-content/uploads/2025/04/corporate-gifts.png",
    megaMenu: [
      {
        heading: "By Occasion",
        links: [
          { label: "Birthday Gifts",  href: "/categories?category=birthday-gifts" },
          { label: "Wedding Gifts",   href: "/categories?category=wedding-gifts" },
        ],
      },
      {
        heading: "Business",
        links: [
          { label: "Corporate Gifts", href: "/categories?category=corporate-gifts" },
        ],
      },
    ],
  },

  {
    label: "Banners",
    href: "/categories?category=banners",
    previewImage: "https://central.buttoninks.com/wp-content/uploads/2025/04/banners.png",
    megaMenu: [
      {
        heading: "Banner Types",
        links: [
          { label: "Promotional Banners", href: "/categories?category=promotional-banners" },
          { label: "Rollup Banners",      href: "/categories?category=rollupbanners" },
          { label: "Table Banners",       href: "/categories?category=table-banners" },
          { label: "Other Banners",       href: "/categories?category=other-banners" },
        ],
      },
    ],
  },

  { label: "Office Supplies",    href: "/categories?category=office-supplies" },
  { label: "Event Merchandize",  href: "/categories?category=event-merchandize" },

  {
    label: "Retail",
    href: "/categories?category=retail",
    subcategories: [
      { label: "Hoodies", href: "/categories?category=ready_made_hoodies" },
    ],
  },

  { label: "Personalization Center", href: "/design" },
];

// ── Portal Mega-Menu ──────────────────────────────────────────────────────────

interface PortalMenuProps {
  cat: Category;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function PortalMenu({ cat, anchorRef, open, onMouseEnter, onMouseLeave }: PortalMenuProps) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [open, anchorRef]);

  if (!mounted) return null;

  const isMega   = !!cat.megaMenu?.length;
  const isSimple = !isMega && !!cat.subcategories?.length;
  if (!isMega && !isSimple) return null;

  const previewImg = cat.previewImage;

  return createPortal(
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ top: pos.top, left: isMega ? 0 : pos.left, position: "absolute" }}
      className={`z-[99999] transition-all duration-150 origin-top ${
        open ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
      } ${isMega ? "w-full" : "min-w-[200px]"}`}
    >
      {/* Invisible bridge */}
      <div className="h-1" />

      {/* ── Mega menu ── */}
      {isMega && (
        <div className="w-full bg-white border-t border-gray-100 shadow-2xl">
          <div className="max-w-[1280px] mx-auto px-8 py-8 flex gap-12">

            {/* Left: groups */}
            <div className="flex-1">
              {/* Category title row */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                <Link
                  href={cat.href}
                  className="text-xs font-bold uppercase tracking-widest text-green-700 hover:underline font-['Inter']"
                >
                  {cat.label} — View All
                </Link>
              </div>

              <div className="flex gap-12 flex-wrap">
                {cat.megaMenu!.map((group) => (
                  <div key={group.heading} className="min-w-[140px]">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 font-['Inter']">
                      {group.heading}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-sm text-gray-700 hover:text-green-700 transition-colors font-['Inter']"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: product preview image — always reserve space */}
            <div className="shrink-0 w-[240px] flex flex-col gap-3">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                {previewImg ? (
                  <Image
                    src={previewImg}
                    alt={cat.label}
                    fill
                    className="object-cover"
                    sizes="240px"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-100 rounded-xl" />
                )}
              </div>
              <Link
                href={cat.href}
                className="text-xs font-bold text-green-700 hover:underline font-['Inter'] text-center"
              >
                Browse {cat.label}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Simple dropdown ── */}
      {isSimple && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden">
          <div className="py-1">
            {cat.subcategories!.map((sub) => (
              <Link
                key={sub.label}
                href={sub.href}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-colors whitespace-nowrap font-['Inter']"
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

// ── NavItem ───────────────────────────────────────────────────────────────────

function NavItem({ cat }: { cat: Category }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRef  = useRef<HTMLDivElement>(null);
  const hasMenu = !!(cat.megaMenu?.length || cat.subcategories?.length);

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 300);
  }, []);

  return (
    <div
      ref={anchorRef}
      className="relative shrink-0"
      onMouseEnter={hasMenu ? show : undefined}
      onMouseLeave={hasMenu ? hide : undefined}
    >
      <Link
        href={cat.href}
        className="px-3 py-2 rounded-md flex items-center gap-1 hover:bg-gray-50 group transition-colors"
      >
        <span className="text-gray-700 text-sm font-medium leading-5 whitespace-nowrap group-hover:text-green-700 transition-colors font-['Inter']">
          {cat.label}
        </span>
        {hasMenu && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-500 group-hover:text-green-700 transition-transform duration-200 shrink-0 ${
              open ? "rotate-180" : "rotate-0"
            }`}
            strokeWidth={1.5}
          />
        )}
      </Link>

      {hasMenu && (
        <PortalMenu
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

// ── CategoryNav ───────────────────────────────────────────────────────────────

export default function CategoryNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/design")) return null;

  return (
    <div className="hidden lg:flex w-full h-16 px-4 xl:px-20 border-b border-slate-400/20 items-center bg-white shrink-0">
      <div className="flex-1 flex justify-between items-center gap-1 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <NavItem key={cat.label} cat={cat} />
        ))}
      </div>
    </div>
  );
}
