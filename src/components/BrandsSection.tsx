import React from "react";

const brands = [
  { name: "Brand 1", src: "https://buttoninks.com/wp-content/uploads/2026/06/5f1e8e8845530085a04ead9c9217d656fa6425bb.png" },
  { name: "Brand 2", src: "https://buttoninks.com/wp-content/uploads/2026/06/7ea7e774f99d34e4dae09698630927ccf0c9ce26.png" },
  { name: "Brand 3", src: "https://buttoninks.com/wp-content/uploads/2026/06/de0182dc0b2bb25221beba3247ea13e8b2125db7.png" },
  { name: "Brand 4", src: "https://buttoninks.com/wp-content/uploads/2026/06/a71735a170f2dc9f3ae66f67814ad25f69d03bcd.png" },
  { name: "Brand 5", src: "https://buttoninks.com/wp-content/uploads/2026/06/991e1445872b1bf03ccff96f41b2ab3bfbba22b3.png" },
];

export default function BrandsSection() {
  return (
    <section className="w-full px-4 md:px-20 py-10 flex flex-col justify-center items-center gap-6 md:gap-10 overflow-hidden bg-white">
      {/* ── Label ── */}
      <p
        className="text-center text-gray-400 text-[10px] md:text-base font-normal leading-4 tracking-[0.2em] uppercase font-outfit"
      >
        WE HAVE SERVED REPUTABLE BRANDS
      </p>

      {/* ── Desktop View (Grid) ── */}
      <div className="hidden md:flex w-full justify-center items-center flex-wrap gap-12">
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="w-48 h-24 shrink-0 flex items-center justify-center transition-all duration-300"
          >
            <img
              src={brand.src}
              alt={brand.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* ── Mobile View (Marquee) ── */}
      <div className="md:hidden w-full relative overflow-hidden h-20">
        <div className="flex w-fit animate-marquee">
          {/* First set */}
          {brands.map((brand, idx) => (
            <div
              key={`m1-${idx}`}
              className="w-40 h-20 shrink-0 px-6 flex items-center justify-center"
            >
              <img
                src={brand.src}
                alt={brand.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {brands.map((brand, idx) => (
            <div
              key={`m2-${idx}`}
              className="w-40 h-20 shrink-0 px-6 flex items-center justify-center"
            >
              <img
                src={brand.src}
                alt={brand.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
        {/* Fades for smooth look */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent z-10" />
      </div>
    </section>
  );
}
