import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

export interface ProductCardProps {
  category: string;
  name: string;
  rating: number;       // e.g. 4.9
  reviewCount: number;  // e.g. 2847
  filledStars: number;  // e.g. 4 (out of 5)
  price: string;        // e.g. "from $8.99"
  minQty: string;       // e.g. "min 12"
  image: string;        // url
  href: string;
}

export default function ProductCard({
  category,
  name,
  rating,
  reviewCount,
  filledStars,
  price,
  minQty,
  image,
  href,
}: ProductCardProps) {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-[0px_2px_8px_0px_rgba(13,27,46,0.04)] outline outline-[1.31px] outline-offset-[-1.31px] outline-slate-900/5 overflow-hidden group hover:shadow-[0px_8px_24px_0px_rgba(13,27,46,0.10)] transition-shadow duration-300">

      {/* ── Product image ── */}
      <div className="relative w-full h-56 p-2.5 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain p-2.5 group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* ── Card body ── */}
      <div className="p-4 bg-white border-t border-zinc-500/30 flex flex-col gap-3">

        {/* Category */}
        <span
          className="text-gray-400 text-xs font-semibold uppercase leading-4 tracking-wide"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {category}
        </span>

        {/* Product name */}
        <p
          className="text-slate-900 text-base font-medium leading-5"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {name}
        </p>

        {/* Star rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-3 h-3"
                fill={i < filledStars ? "#ea580c" : "none"}
                stroke={i < filledStars ? "#ea580c" : "#ea580c"}
                strokeWidth={1}
              />
            ))}
          </div>
          <span
            className="text-slate-500 text-xs font-normal leading-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {rating} ({reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap items-baseline gap-1">
            <span
              className="text-slate-900 text-base font-semibold leading-6 [&_del]:text-gray-400 [&_del]:text-xs [&_del]:font-normal [&_del]:mr-2 [&_ins]:no-underline"
              style={{ fontFamily: "var(--font-outfit)" }}
              dangerouslySetInnerHTML={{ __html: price }}
            />
            {minQty && (
              <span
                className="text-gray-400 text-xs font-normal leading-4"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                · {minQty}
              </span>
            )}
          </div>

          <Link
            href={href}
            className="px-3 py-2 bg-green-700 rounded-lg flex items-center justify-center gap-2.5 hover:bg-green-600 active:scale-95 transition-all"
          >
            <span
              className="text-white text-xs font-semibold leading-4"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Shop
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
