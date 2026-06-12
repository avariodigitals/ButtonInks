import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="p-6">
      <div className="relative w-full rounded-2xl overflow-hidden min-h-[520px] flex flex-col justify-start items-start">

        {/* ── Background image ── */}
        <Image
          src="https://buttoninks.com/wp-content/uploads/2026/06/aa4015b2d0f56fc883cc1ae9615d887744808bd1.png"
          alt="Custom printing products spread"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/60" />

        {/* ── Content ── */}
        <div className="relative z-10 px-10 py-20 flex flex-col gap-7 max-w-2xl">

          {/* Headline */}
          <h1
            className="text-6xl font-bold leading-[65.66px]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            <span className="text-white">Custom Printing</span>
            <br />
            <span className="text-green-500">That Works</span>
            <span className="text-white"> as Hard</span>
            <br />
            <span className="text-white">as Your Brand</span>
          </h1>

          {/* Sub-headline */}
          <p
            className="w-[480px] text-white/80 text-lg font-normal leading-8"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            T-shirts, business cards, stickers, banners, and 500+ more products.
            Professional quality, fast turnaround, unbeatable bulk pricing.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 h-14">
            <Link
              href="/design"
              className="px-8 py-3.5 bg-green-700 rounded-[10px] flex items-center gap-2 hover:bg-green-600 active:scale-95 transition-all"
            >
              <span
                className="text-white text-base font-semibold leading-6"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Start Designing Free
              </span>
            </Link>

            <Link
              href="/products"
              className="px-7 py-3.5 bg-white/10 rounded-[10px] outline outline-[1.31px] outline-offset-[-1.31px] outline-white/20 flex items-center gap-2 hover:bg-white/20 active:scale-95 transition-all backdrop-blur-sm"
            >
              <span
                className="text-white text-base font-medium leading-6"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Browse Products
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
