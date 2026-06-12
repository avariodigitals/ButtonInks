import Image from "next/image";

const brands = [
  { name: "Brand 1", src: "https://buttoninks.com/wp-content/uploads/2026/06/5f1e8e8845530085a04ead9c9217d656fa6425bb.png" },
  { name: "Brand 2", src: "https://buttoninks.com/wp-content/uploads/2026/06/7ea7e774f99d34e4dae09698630927ccf0c9ce26.png" },
  { name: "Brand 3", src: "https://buttoninks.com/wp-content/uploads/2026/06/de0182dc0b2bb25221beba3247ea13e8b2125db7.png" },
  { name: "Brand 4", src: "https://buttoninks.com/wp-content/uploads/2026/06/a71735a170f2dc9f3ae66f67814ad25f69d03bcd.png" },
  { name: "Brand 5", src: "https://buttoninks.com/wp-content/uploads/2026/06/991e1445872b1bf03ccff96f41b2ab3bfbba22b3.png" },
];

export default function BrandsSection() {
  return (
    <section className="w-full px-4 md:px-20 py-10 flex flex-col justify-center items-center gap-10 overflow-hidden">

      {/* ── Label ── */}
      <p
        className="text-center text-gray-400 text-base font-normal leading-4 tracking-wide"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        WE HAVE SERVED REPUTABLE BRANDS
      </p>

      {/* ── Logos strip ── */}
      <div className="relative w-full flex justify-center items-center flex-wrap gap-12">
        {/* Brand images */}
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="w-48 h-24 shrink-0 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
          >
            <img
              src={brand.src}
              alt={brand.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
