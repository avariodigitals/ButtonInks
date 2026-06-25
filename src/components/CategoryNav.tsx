"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Sparkles } from "lucide-react";

/**
 * Mapping the requested frontend labels to the new logical WordPress slugs
 */
const categories = [
  { label: "All",                      hasDropdown: true,  href: "/categories" },
  { label: "Embroidery",               hasDropdown: true,  href: "/categories?category=embroidery-uniforms" },
  { label: "DTF Prints",               hasDropdown: true,  href: "/categories?category=custom-t-shirts" },
  { label: "Apparel",                  hasDropdown: true,  href: "/categories?category=apparel-outerwear" },
  { label: "Drinkware",                hasDropdown: true,  href: "/categories?category=drinkware-mugs" },
  { label: "Gifts & Decor",            hasDropdown: true,  href: "/categories?category=photo-prints-art" },
  { label: "Office Supplies",          hasDropdown: true,  href: "/categories?category=marketing-prints" },
  { label: "Event Merchandize",        hasDropdown: true,  href: "/categories?category=event-tradeshow" },
  { label: "Personalization Center",   hasDropdown: false, href: "/categories" },
  { label: "Retail",                   hasDropdown: true,  href: "/categories?category=stickers-labels" },
];

export default function CategoryNav() {
  const pathname = usePathname();

  if (pathname?.startsWith('/design')) return null;

  return (
    <div className="hidden lg:flex w-full h-16 px-4 xl:px-20 border-b border-slate-400/20 items-center bg-white shrink-0 overflow-x-auto no-scrollbar">
      <div className="flex-1 flex justify-between items-center gap-1 min-w-max">
        {categories.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="px-3 py-2 rounded-md flex items-center gap-1 hover:bg-gray-50 group transition-colors"
          >
            <span
              className="text-gray-700 text-sm font-medium leading-5 whitespace-nowrap group-hover:text-green-700 transition-colors font-inter"
            >
              {cat.label}
            </span>
            {cat.hasDropdown && (
              <ChevronDown className="w-3.5 h-3.5 text-gray-700 group-hover:text-green-700 transition-colors shrink-0" strokeWidth={1.5} />
            )}
          </Link>
        ))}

        {/* ── Ready-Made Designs CTA ── */}
        <Link
          href="/designs"
          className="ml-2 px-3 py-1.5 bg-green-700 hover:bg-green-800 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span className="text-white text-sm font-semibold leading-5 whitespace-nowrap font-inter">
            Ready-Made Designs
          </span>
        </Link>
      </div>
    </div>
  );
}
