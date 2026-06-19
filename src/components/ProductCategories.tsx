import Image from "next/image";
import Link from "next/link";
import { WPCategory, decodeHTMLEntities } from "@/lib/wordpress";

// ── Design-specified category order, display names, bg colors & fallback images
// Order matches the UI/UX design exactly (3 rows × 4 columns)
const CATEGORY_CONFIG: {
  slugs: string[];          // possible WP slugs for this category
  displayName: string;      // label shown on card (overrides WP name)
  bg: string;               // tailwind bg class
  fallback: string;         // placeholder if no WP image
}[] = [
  // Row 1
  { slugs: ['t-shirts', 'tshirts'],                              displayName: 'T-shirts',          bg: 'bg-teal-50',    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/d635e3885db72a201fb38cd1899466b1a126138a-scaled.png'  },
  { slugs: ['bags'],                                             displayName: 'Bags',              bg: 'bg-orange-50',  fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/0e770e70e91b1ae429ca2f5e7d0f54c765794b85.png'        },
  { slugs: ['custom-mugs', 'personalized-cups'],                 displayName: 'Custom Mugs',       bg: 'bg-emerald-50', fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/30763b2cf68c84422213d4791db08c534e04d973-1.png'      },
  { slugs: ['corporate-gifts'],                                  displayName: 'Corporate Gifts',   bg: 'bg-slate-100',  fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/5832c7755acb2ef3d54261b0e7c8d447868937cc-1.png'      },
  // Row 2
  { slugs: ['banners'],                                          displayName: 'Banners',           bg: 'bg-rose-50',    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/c308dbfcbddeb088e0a263b9bf4d997abc9c36dc-1-scaled.png' },
  { slugs: ['apparel', 'embroidery-uniforms'],                   displayName: 'Apparel',           bg: 'bg-cyan-50',    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/eef09eee3c42e2fede3e44aae578853a9f831650.png'        },
  { slugs: ['event-tradeshow-supplies', 'event-supplies'],       displayName: 'Event supplies',    bg: 'bg-sky-100',    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/b94750be637a17fced8bb75acc416711fa889a3a.png'        },
  { slugs: ['marketing-prints', 'marketing-print'],              displayName: 'Marketing Print',   bg: 'bg-pink-100',   fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/f98beadb61ec3ec2d51e5a0615bc26bf9e067141.png'        },
  // Row 3
  { slugs: ['vehicle-branding', 'vehicles-branding'],            displayName: 'Vehicles Branding', bg: 'bg-lime-50',    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/8f07aa27c661a1ec07576c83a356356a9eca7b44-scaled.png'  },
  { slugs: ['photo-prints', 'photoprint'],                       displayName: 'Photoprint',        bg: 'bg-yellow-50',  fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/935886bb5b62c3c9c1d6ce8e5e35ed4f6a74f25d-2.png'      },
  { slugs: ['stickers'],                                         displayName: 'Stickers',          bg: 'bg-violet-100', fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/2b24ecf2ef7763ef450908ae7f5280269bae6902-scaled.png'  },
  { slugs: ['embroidery', 'embroidery-uniforms'],                displayName: 'Embroidery',        bg: 'bg-zinc-100',   fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/7deef321d225c1ffe174ad69a1abab84d93eb99a.png'        },
];

// Match a WPCategory to a config entry by slug
function matchConfig(cat: WPCategory) {
  return CATEGORY_CONFIG.find(cfg => cfg.slugs.includes(cat.slug));
}

function getCategoryImage(cat: WPCategory, fallback: string): string {
  if (cat.image?.src) return cat.image.src;
  return fallback;
}

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
          src={getCategoryImage(category, fallback)}
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
export default function ProductCategories({ categories = [] }: { categories?: WPCategory[] }) {
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

  return (
    <section className="w-full px-4 md:px-20 py-10 flex flex-col justify-start items-start gap-10 overflow-hidden">

      <div className="w-full flex flex-col justify-center items-start gap-4">
        <div className="px-4 py-2 bg-green-100/40 rounded-[20px] flex justify-center items-center gap-2.5">
          <span className="text-center text-green-700 text-xs font-bold uppercase leading-5 tracking-wide font-['Inter']">
            PRODUCT CATEGORIES
          </span>
        </div>
        <h2 className="text-slate-900 text-4xl font-semibold leading-10 font-['Outfit']">
          Shop Prints by Categories
        </h2>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {orderedCards.map(({ category, displayName, bg, fallback }) => (
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
