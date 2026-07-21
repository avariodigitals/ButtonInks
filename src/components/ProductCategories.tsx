import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WPCategory } from "@/lib/wordpress";
import { CATEGORY_CONFIG, getCategoryImage } from "@/lib/categoryConfig";

// ── Category card ─────────────────────────────────────────────────────────────
function CategoryCard({
  category,
  displayName,
  bg,
  fallback,
}: {
  category: WPCategory;
  displayName: string;
  bg: string;
  fallback: string;
}) {
  return (
    <Link
      href={`/products/${category.slug}`}
      className={`px-5 py-9 ${bg} rounded-xl flex flex-col justify-center items-center gap-8 overflow-hidden group hover:shadow-md transition-shadow duration-300`}
    >
      <div className="relative w-40 h-48">
        <Image
          src={getCategoryImage(category.image, fallback)}
          alt={displayName}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
          sizes="160px"
        />
      </div>

      <div className="self-stretch flex flex-col justify-center items-center gap-2">
        <p className="self-stretch text-center text-zinc-900 text-xl font-semibold leading-7 font-['Outfit']">
          {displayName}
        </p>
        <span className="py-1 border-b border-black text-zinc-900 text-sm font-normal leading-6 group-hover:border-green-700 group-hover:text-green-700 transition-colors duration-200 font-['Outfit']">
          View all
        </span>
      </div>
    </Link>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function ProductCategories({
  categories = [],
  limit,
}: {
  categories?: WPCategory[];
  limit?: number;
}) {
  // Build ordered list: for each design slot, find the matching WP category
  const orderedCards = CATEGORY_CONFIG.reduce<{
    category: WPCategory;
    displayName: string;
    bg: string;
    fallback: string;
  }[]>((acc, cfg) => {
    const match = (categories || []).find(cat => cfg.slugs.includes(cat.slug));
    if (match) {
      acc.push({ category: match, displayName: cfg.displayName, bg: cfg.bg, fallback: cfg.fallback });
    }
    return acc;
  }, []);

  // Apply limit if specified (used on homepage to show only featured 4)
  const visibleCards = limit ? orderedCards.slice(0, limit) : orderedCards;

  return (
    <section className="w-full px-4 md:px-20 py-10 flex flex-col justify-start items-start gap-10 overflow-hidden">

      <div className="w-full flex flex-row justify-between items-end gap-6">
        <div className="flex flex-col justify-center items-start gap-4">
          <div className="px-4 py-2 bg-green-100/40 rounded-[20px] flex justify-center items-center gap-2.5">
            <span className="text-center text-green-700 text-xs font-bold uppercase leading-5 tracking-wide font-['Inter']">
              PRODUCT CATEGORIES
            </span>
          </div>
          <h2 className="text-xl md:text-4xl font-semibold leading-tight md:leading-10 font-['Outfit'] text-slate-900">
            Shop Prints by Categories
          </h2>
        </div>
        <Link href="/categories" className="flex items-center gap-1.5 hover:gap-2.5 transition-all group shrink-0 pb-1 md:pb-2">
          <span className="text-emerald-500 text-[10px] sm:text-sm font-semibold leading-5 group-hover:text-emerald-600 font-['Inter']">
            View all <span className="hidden sm:inline">categories</span>
          </span>
          <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" strokeWidth={2.5} />
        </Link>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleCards.map(({ category, displayName, bg, fallback }) => (
          <CategoryCard
            key={category.id}
            category={category}
            displayName={displayName}
            bg={bg}
            fallback={fallback}
          />
        ))}
      </div>
    </section>
  );
}
