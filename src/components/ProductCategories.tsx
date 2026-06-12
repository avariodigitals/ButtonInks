import Image from "next/image";
import Link from "next/link";
import { WPCategory } from "@/lib/wordpress";

// ── Category card ─────────────────────────────────────────────────────────────
function CategoryCard({
  category,
  index
}: {
  category: WPCategory;
  index: number;
}) {
  const backgrounds = [
    "bg-teal-50", "bg-orange-50", "bg-emerald-50", "bg-slate-50",
    "bg-rose-50", "bg-cyan-50", "bg-pink-100", "bg-lime-50",
    "bg-orange-100", "bg-violet-100", "bg-zinc-100"
  ];
  const bg = backgrounds[index % backgrounds.length];

  return (
    <Link
      href={`/products/${category.slug}`}
      className={`flex-1 min-w-[280px] px-5 py-9 ${bg} rounded-xl flex flex-col justify-center items-center gap-8 overflow-hidden group hover:shadow-md transition-shadow duration-300`}
    >
      {/* Product image */}
      <div className="w-40 h-52 flex items-center justify-center">
        <img
          src={category.image?.src || "https://placehold.co/168x212"}
          alt={category.name}
          className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Label + View all */}
      <div className="self-stretch flex flex-col justify-center items-center gap-2 h-16">
        <p
          className="self-stretch text-center text-zinc-900 text-2xl font-medium leading-7"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {category.name}
        </p>
        <span
          className="py-1 border-b border-black text-zinc-900 text-base font-normal leading-6 group-hover:border-green-700 group-hover:text-green-700 transition-colors duration-200"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          View all
        </span>
      </div>
    </Link>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function ProductCategories({ categories = [] }: { categories?: WPCategory[] }) {
  // Show only top 12 categories on home if many exist
  const displayCategories = (categories || []).slice(0, 12);

  return (
    <section className="w-full px-4 md:px-20 py-10 flex flex-col justify-start items-start gap-10 overflow-hidden">

      {/* ── Heading block ── */}
      <div className="w-full flex flex-col justify-center items-start gap-4">
        {/* Badge */}
        <div className="px-4 py-2 bg-green-100/40 rounded-[20px] flex justify-center items-center gap-2.5">
          <span
            className="text-center text-green-700 text-xs font-bold uppercase leading-5 tracking-wide"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            PRODUCT CATEGORIES
          </span>
        </div>

        {/* Title */}
        <h2
          className="text-slate-900 text-4xl font-semibold leading-10"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Shop Prints by Categories
        </h2>
      </div>

      {/* ── Category Grid ── */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayCategories.map((cat, idx) => (
          <CategoryCard key={cat.id} category={cat} index={idx} />
        ))}
      </div>
    </section>
  );
}
