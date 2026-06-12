import Link from "next/link";
import Image from "next/image";
import { Search, Phone, ShoppingCart, Heart, User } from "lucide-react";

export default function Navbar() {
  return (
    <div className="w-full h-16 px-20 border-b border-slate-400/20 flex justify-between items-center bg-white shrink-0">

      {/* ── Logo ── */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-16 h-16 relative overflow-hidden flex items-center justify-center">
          <Image
            src="https://buttoninks.com/wp-content/uploads/2022/08/cropped-Screenshot_3.png"
            alt="ButtonInks logo"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
      </Link>

      {/* ── Search ── */}
      <div className="flex-1 max-w-[608px] mx-8">
        <div className="w-full h-9 px-3 py-2 bg-white rounded-md outline outline-1 outline-offset-[-1px] outline-gray-300 flex justify-between items-center gap-3 cursor-text hover:outline-gray-400 transition-all">
          <span className="text-gray-400 text-sm font-normal leading-5 select-none" style={{ fontFamily: "var(--font-inter)" }}>
            Search for any product...
          </span>
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
        </div>
      </div>

      {/* ── Right icons ── */}
      <div className="flex items-center gap-4 shrink-0">

        {/* Hotline */}
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-neutral-700" />
          <span
            className="text-neutral-700 text-sm font-medium leading-5 whitespace-nowrap"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Hotline: +1 (409) 800-3195
          </span>
        </div>

        {/* Cart with badge */}
        <div className="relative p-2 rounded-md cursor-pointer hover:bg-gray-50">
          <ShoppingCart className="w-4 h-4 text-gray-700" />
          <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-700 rounded-full flex items-center justify-center">
            <span
              className="text-white text-[10px] font-bold leading-4"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              9+
            </span>
          </div>
        </div>

        {/* Wishlist */}
        <button className="w-6 h-6 flex items-center justify-center hover:text-green-700 text-neutral-700 transition-colors">
          <Heart className="w-5 h-5" />
        </button>

        {/* Account */}
        <button className="w-6 h-6 flex items-center justify-center hover:text-green-700 text-neutral-700 transition-colors">
          <User className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
