import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { WPProduct, getProductThumbnail } from "@/lib/wordpress";

interface NewArrivalsProps {
  products: WPProduct[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  return (
    <section className="w-full px-4 md:px-20 py-10 bg-white flex flex-col justify-start items-center">
      <div className="w-full max-w-[1280px] flex flex-col gap-10">

        {/* ── Section header ── */}
        <div className="w-full flex flex-row justify-between items-end gap-6">
          <div className="flex flex-col gap-3 md:gap-4 max-w-xl">
            <div className="px-4 py-1.5 bg-green-100/40 rounded-[20px] inline-flex self-start justify-center items-center">
              <span className="text-green-700 text-[10px] md:text-xs font-bold uppercase tracking-wider font-['Inter']">
                New Arrivals
              </span>
            </div>
            <h2 className="text-xl md:text-4xl font-semibold leading-tight md:leading-10 font-['Outfit'] text-slate-900">
              Discover Our Latest Printing Products
            </h2>
          </div>

          <Link href="/categories" className="flex items-center gap-1.5 hover:gap-2.5 transition-all group shrink-0 pb-1 md:pb-2">
            <span className="text-emerald-500 text-[10px] sm:text-sm font-semibold leading-5 group-hover:text-emerald-600 font-['Inter']">
              View all <span className="hidden sm:inline">products</span>
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" strokeWidth={2.5} />
          </Link>
        </div>

        {/* ── Product cards grid ── */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products
            .filter(p => p.slug && p.categories?.[0]?.slug)
            .map((p) => (
            <ProductCard
              key={p.id}
              category={p.categories[0]?.name || "Uncategorized"}
              name={p.name}
              rating={Number(p.average_rating)}
              reviewCount={p.rating_count}
              filledStars={Math.round(Number(p.average_rating))}
              price={p.price_html || `$${p.price}`}
              minQty="min 1"
              image={getProductThumbnail(p.images)}
              href={`/products/${p.categories[0]?.slug || 'all'}/${p.slug}`}
              productId={p.id}
              rawPrice={parseFloat(p.price || '0')}
              slug={p.slug}
              colors={p.attributes.find(a => a.name.toLowerCase() === 'color')?.options}
            />
          ))}
        </div>
        {products.length === 0 && <p className="text-center text-gray-500 py-10">No new arrivals found.</p>}
      </div>
    </section>
  );
}
