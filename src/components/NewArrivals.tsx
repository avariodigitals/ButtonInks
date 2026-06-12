import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { WPProduct } from "@/lib/wordpress";

interface NewArrivalsProps {
  products: WPProduct[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  return (
    <section className="w-full px-4 md:px-20 py-10 bg-white flex flex-col justify-start items-center">
      <div className="w-full max-w-[1280px] flex flex-col gap-10">

        {/* ── Section header ── */}
        <div className="w-full flex justify-between items-center">
          <div className="flex flex-col gap-4">
            <div className="px-4 py-2 bg-green-100/40 rounded-[20px] inline-flex justify-center items-center gap-2.5">
              <span className="text-green-700 text-xs font-bold uppercase leading-5 tracking-wide font-['Inter']">
                New Arrivals
              </span>
            </div>
            <h2 className="text-slate-900 text-4xl font-semibold leading-10 font-['Outfit']">
              Discover Our Latest Printing Products
            </h2>
          </div>

          <Link href="/categories" className="flex items-center gap-1.5 hover:gap-2.5 transition-all group">
            <span className="text-emerald-500 text-sm font-semibold leading-5 group-hover:text-emerald-600 font-['Inter']">
              View all products
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:text-emerald-600 transition-colors" strokeWidth={2} />
          </Link>
        </div>

        {/* ── Product cards grid ── */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              category={p.categories[0]?.name || "Uncategorized"}
              name={p.name}
              rating={Number(p.average_rating)}
              reviewCount={p.rating_count}
              filledStars={Math.round(Number(p.average_rating))}
              price={p.price_html || `$${p.price}`}
              minQty="min 1" // Default for display
              image={p.images[0]?.src || "https://placehold.co/310x220"}
              href={`/products/${p.categories[0]?.slug || 'all'}/${p.slug}`}
            />
          ))}
        </div>
        {products.length === 0 && <p className="text-center text-gray-500 py-10">No new arrivals found.</p>}
      </div>
    </section>
  );
}
