"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

const categories = [
  { label: "All",                      hasDropdown: true,  href: "/categories" },
  { label: "Embroidery",               hasDropdown: true,  href: "/products/embroidery" },
  { label: "DTF (Direct-to-Film) Prints", hasDropdown: true, href: "/products/dtf-prints" },
  { label: "Apparel",                  hasDropdown: true,  href: "/products/apparel" },
  { label: "Drinkware",                hasDropdown: true,  href: "/products/drinkware" },
  { label: "Gifts & Decor",            hasDropdown: true,  href: "/products/gifts-decor" },
  { label: "Office Supplies",          hasDropdown: true,  href: "/products/office-supplies" },
  { label: "Event Merchandize",        hasDropdown: true,  href: "/products/event-merchandize" },
  { label: "Personalization Center",   hasDropdown: false, href: "/personalization" },
  { label: "Retail",                   hasDropdown: true,  href: "/products/retail" },
];

export default function CategoryNav() {
  return (
    <div className="hidden lg:flex w-full h-16 px-20 border-b border-slate-400/20 items-center bg-white shrink-0 overflow-x-auto">
      <div className="flex-1 flex justify-between items-center min-w-max">
        {categories.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="px-3 py-2 rounded-md flex items-center gap-1 hover:bg-gray-50 group transition-colors"
          >
            <span
              className="text-gray-700 text-sm font-medium leading-5 whitespace-nowrap group-hover:text-green-700 transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {cat.label}
            </span>
            {cat.hasDropdown && (
              <ChevronDown
                className="w-3.5 h-3.5 text-gray-700 group-hover:text-green-700 transition-colors shrink-0"
                strokeWidth={1.5}
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
