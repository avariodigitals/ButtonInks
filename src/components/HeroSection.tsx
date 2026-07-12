import Link from "next/link";
import Image from "next/image";
import { WP_URL } from "@/lib/wordpress";

export default function HeroSection() {
  return (
    <section className="p-0 md:p-6 h-[100dvh] md:h-auto md:min-h-[520px]">
      <div className="relative w-full h-full md:rounded-2xl overflow-hidden flex flex-col justify-center md:justify-start items-start">

        {/* ── Background image ── */}
        <Image
          src={`${WP_URL}/wp-content/uploads/2026/06/aa4015b2d0f56fc883cc1ae9615d887744808bd1.png`}
          alt="Custom printing products spread"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/60" />

        {/* ── Content ── */}
        <div className="relative z-10 px-6 md:px-10 py-16 md:py-20 flex flex-col gap-6 md:gap-7 max-w-2xl">

          {/* Headline */}
          <h1
            className="text-4xl md:text-6xl font-bold leading-tight md:leading-[65.66px]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            <span className="text-white">Custom Printing</span>
            <br className="hidden md:block" />
            <span className="text-green-500"> That Works</span>
            <span className="text-white"> as Hard </span>
            <br className="hidden md:block" />
            <span className="text-white">as Your Brand</span>
          </h1>

          {/* Sub-headline */}
          <p
            className="w-full md:w-[480px] text-white/80 text-base md:text-lg font-normal leading-relaxed md:leading-8"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            T-shirts, business cards, stickers, banners, and 500+ more products.
            Professional quality, fast turnaround, unbeatable bulk pricing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/design"
              className="px-8 py-3.5 bg-green-700 rounded-[10px] flex items-center justify-center gap-2 hover:bg-green-600 active:scale-95 transition-all text-white text-base font-semibold"
            >
              Start Designing Free
            </Link>

            <Link
              href="/categories"
              className="px-7 py-3.5 bg-white/10 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/20 flex items-center justify-center gap-2 hover:bg-white/20 active:scale-95 transition-all backdrop-blur-sm text-white text-base font-medium"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
