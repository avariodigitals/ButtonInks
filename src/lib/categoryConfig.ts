/**
 * Shared category configuration — defines the display order, display names,
 * background colours, and fallback images for all product categories.
 *
 * Priority for images:
 *   1. Image set in WP Admin (cat.image.src) — always wins
 *   2. fallback below — shown until a WP image is added
 */

export interface CategoryConfig {
  slugs: string[];       // all possible WP slugs for this category
  displayName: string;   // label shown on cards (overrides WP name)
  bg: string;            // tailwind bg class
  fallback: string;      // image shown when WP has no category image
}

export const CATEGORY_CONFIG: CategoryConfig[] = [
  // Row 1
  {
    slugs: ['t-shirts', 'tshirts'],
    displayName: 'T-shirts',
    bg: 'bg-teal-50',
    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/d635e3885db72a201fb38cd1899466b1a126138a-scaled.png',
  },
  {
    slugs: ['bags'],
    displayName: 'Bags',
    bg: 'bg-orange-50',
    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/0e770e70e91b1ae429ca2f5e7d0f54c765794b85.png',
  },
  {
    slugs: ['custom-mugs', 'personalized-cups'],
    displayName: 'Custom Mugs',
    bg: 'bg-emerald-50',
    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/30763b2cf68c84422213d4791db08c534e04d973-1.png',
  },
  {
    slugs: ['corporate-gifts'],
    displayName: 'Corporate Gifts',
    bg: 'bg-slate-100',
    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/5832c7755acb2ef3d54261b0e7c8d447868937cc-1.png',
  },
  // Row 2
  {
    slugs: ['banners'],
    displayName: 'Banners',
    bg: 'bg-rose-50',
    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/c308dbfcbddeb088e0a263b9bf4d997abc9c36dc-1-scaled.png',
  },
  {
    slugs: ['apparel', 'embroidery-uniforms'],
    displayName: 'Apparel',
    bg: 'bg-cyan-50',
    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/eef09eee3c42e2fede3e44aae578853a9f831650.png',
  },
  {
    slugs: ['event-tradeshow-supplies', 'event-supplies'],
    displayName: 'Event supplies',
    bg: 'bg-sky-100',
    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/b94750be637a17fced8bb75acc416711fa889a3a.png',
  },
  {
    slugs: ['marketing-prints', 'marketing-print'],
    displayName: 'Marketing Print',
    bg: 'bg-pink-100',
    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/f98beadb61ec3ec2d51e5a0615bc26bf9e067141.png',
  },
  // Row 3
  {
    slugs: ['vehicle-branding', 'vehicles-branding'],
    displayName: 'Vehicles Branding',
    bg: 'bg-lime-50',
    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/8f07aa27c661a1ec07576c83a356356a9eca7b44-scaled.png',
  },
  {
    slugs: ['photo-prints', 'photoprint'],
    displayName: 'Photoprint',
    bg: 'bg-yellow-50',
    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/935886bb5b62c3c9c1d6ce8e5e35ed4f6a74f25d-2.png',
  },
  {
    slugs: ['stickers'],
    displayName: 'Stickers',
    bg: 'bg-violet-100',
    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/2b24ecf2ef7763ef450908ae7f5280269bae6902-scaled.png',
  },
  {
    slugs: ['embroidery', 'embroidery-uniforms'],
    displayName: 'Embroidery',
    bg: 'bg-zinc-100',
    fallback: 'https://central.buttoninks.com/wp-content/uploads/2026/06/7deef321d225c1ffe174ad69a1abab84d93eb99a.png',
  },
];

/** Returns WP image if set, otherwise our fallback. WP image always wins. */
export function getCategoryImage(catImage: { src: string } | null, fallback: string): string {
  return catImage?.src || fallback;
}

/** Find the config entry for a given WP slug */
export function getConfigForSlug(slug: string): CategoryConfig | undefined {
  return CATEGORY_CONFIG.find(cfg => cfg.slugs.includes(slug));
}

// ---------------------------------------------------------------------------
// Category-scoped sidebar filters
// ---------------------------------------------------------------------------

export interface CategoryFilterGroup {
  /** Label shown in the sidebar section header */
  label: string;
  /** WooCommerce attribute name(s) to match (case-insensitive) */
  attributeNames: string[];
}

/**
 * Maps a category slug to the filter groups that make sense for it.
 * Keys are any of the WP slugs listed in CATEGORY_CONFIG.
 * If a category is not listed here, the sidebar shows only Price Range.
 */
export const CATEGORY_FILTERS: Record<string, CategoryFilterGroup[]> = {
  // ── Apparel / T-shirts ──────────────────────────────────────────────────
  't-shirts': [
    { label: 'Size',   attributeNames: ['size', 'pa_size', 'tshirt standard sizes'] },
    { label: 'Color',  attributeNames: ['color', 'pa_color', 'colour'] },
    { label: 'Style',  attributeNames: ['style', 'pa_style', 'fit'] },
  ],
  'tshirts': [
    { label: 'Size',   attributeNames: ['size', 'pa_size', 'tshirt standard sizes'] },
    { label: 'Color',  attributeNames: ['color', 'pa_color', 'colour'] },
    { label: 'Style',  attributeNames: ['style', 'pa_style', 'fit'] },
  ],
  'apparel': [
    { label: 'Size',   attributeNames: ['size', 'pa_size', 'tshirt standard sizes'] },
    { label: 'Color',  attributeNames: ['color', 'pa_color', 'colour'] },
    { label: 'Gender', attributeNames: ['gender', 'pa_gender'] },
  ],
  'embroidery-uniforms': [
    { label: 'Size',   attributeNames: ['size', 'pa_size'] },
    { label: 'Color',  attributeNames: ['color', 'pa_color', 'colour'] },
  ],
  'embroidery': [
    { label: 'Size',   attributeNames: ['size', 'pa_size'] },
    { label: 'Color',  attributeNames: ['color', 'pa_color', 'colour'] },
  ],

  // ── Bags ────────────────────────────────────────────────────────────────
  'bags': [
    { label: 'Color', attributeNames: ['color', 'pa_color', 'colour'] },
    { label: 'Size',  attributeNames: ['size', 'pa_size'] },
    { label: 'Style', attributeNames: ['style', 'pa_style', 'bag type'] },
  ],

  // ── Mugs ────────────────────────────────────────────────────────────────
  'custom-mugs': [
    { label: 'Color',    attributeNames: ['color', 'pa_color', 'mug color', 'colour'] },
    { label: 'Mug Size', attributeNames: ['size', 'pa_size', 'mug size', 'choose your mug size'] },
  ],
  'personalized-cups': [
    { label: 'Color',    attributeNames: ['color', 'pa_color', 'mug color', 'colour'] },
    { label: 'Mug Size', attributeNames: ['size', 'pa_size', 'mug size', 'choose your mug size'] },
  ],

  // ── Caps / Hats ─────────────────────────────────────────────────────────
  'face-caps': [
    { label: 'Color',   attributeNames: ['color', 'pa_color', 'colour'] },
    { label: 'Style',   attributeNames: ['style', 'pa_style', 'cap style'] },
    { label: 'Fitting', attributeNames: ['size', 'pa_size', 'fitting', 'cap size'] },
  ],
  'caps': [
    { label: 'Color',   attributeNames: ['color', 'pa_color', 'colour'] },
    { label: 'Style',   attributeNames: ['style', 'pa_style', 'cap style'] },
    { label: 'Fitting', attributeNames: ['size', 'pa_size', 'fitting'] },
  ],

  // ── Corporate gifts ─────────────────────────────────────────────────────
  'corporate-gifts': [
    { label: 'Color', attributeNames: ['color', 'pa_color', 'colour'] },
    { label: 'Type',  attributeNames: ['type', 'pa_type', 'product type', 'gift type'] },
  ],

  // ── Banners ─────────────────────────────────────────────────────────────
  'banners': [
    { label: 'Material', attributeNames: ['material', 'pa_material', 'banner material'] },
    { label: 'Size',     attributeNames: ['size', 'pa_size', 'banner size'] },
  ],

  // ── Stickers ────────────────────────────────────────────────────────────
  'stickers': [
    { label: 'Shape',    attributeNames: ['shape', 'pa_shape'] },
    { label: 'Material', attributeNames: ['material', 'pa_material'] },
    { label: 'Size',     attributeNames: ['size', 'pa_size'] },
  ],

  // ── Marketing prints ────────────────────────────────────────────────────
  'marketing-prints': [
    { label: 'Paper Stock', attributeNames: ['paper stock', 'pa_paper-stock', 'paper', 'material'] },
    { label: 'Size',        attributeNames: ['size', 'pa_size'] },
    { label: 'Finish',      attributeNames: ['finish', 'pa_finish', 'coating'] },
  ],
  'marketing-print': [
    { label: 'Paper Stock', attributeNames: ['paper stock', 'pa_paper-stock', 'paper', 'material'] },
    { label: 'Size',        attributeNames: ['size', 'pa_size'] },
    { label: 'Finish',      attributeNames: ['finish', 'pa_finish', 'coating'] },
  ],

  // ── Event supplies ──────────────────────────────────────────────────────
  'event-tradeshow-supplies': [
    { label: 'Type',  attributeNames: ['type', 'pa_type', 'product type'] },
    { label: 'Color', attributeNames: ['color', 'pa_color', 'colour'] },
    { label: 'Size',  attributeNames: ['size', 'pa_size'] },
  ],
  'event-supplies': [
    { label: 'Type',  attributeNames: ['type', 'pa_type', 'product type'] },
    { label: 'Color', attributeNames: ['color', 'pa_color', 'colour'] },
    { label: 'Size',  attributeNames: ['size', 'pa_size'] },
  ],

  // ── Vehicle branding ────────────────────────────────────────────────────
  'vehicle-branding': [
    { label: 'Material', attributeNames: ['material', 'pa_material', 'vinyl type'] },
    { label: 'Finish',   attributeNames: ['finish', 'pa_finish'] },
  ],
  'vehicles-branding': [
    { label: 'Material', attributeNames: ['material', 'pa_material', 'vinyl type'] },
    { label: 'Finish',   attributeNames: ['finish', 'pa_finish'] },
  ],

  // ── Photo prints ────────────────────────────────────────────────────────
  'photo-prints': [
    { label: 'Size',    attributeNames: ['size', 'pa_size', 'print size'] },
    { label: 'Finish',  attributeNames: ['finish', 'pa_finish', 'paper finish'] },
    { label: 'Paper',   attributeNames: ['paper', 'pa_paper', 'paper stock'] },
  ],
  'photoprint': [
    { label: 'Size',    attributeNames: ['size', 'pa_size', 'print size'] },
    { label: 'Finish',  attributeNames: ['finish', 'pa_finish', 'paper finish'] },
  ],
};

/**
 * Returns the filter groups for a given category slug.
 * Falls back to an empty array (sidebar shows only Price Range).
 */
export function getFiltersForCategory(slug: string | undefined): CategoryFilterGroup[] {
  if (!slug) return [];
  return CATEGORY_FILTERS[slug] ?? [];
}

/**
 * Given a WC attribute and a list of CategoryFilterGroups, finds the matching
 * group label. Returns null if the attribute shouldn't be shown.
 */
export function matchAttributeToGroup(
  attributeName: string,
  groups: CategoryFilterGroup[]
): string | null {
  const lower = attributeName.toLowerCase();
  for (const group of groups) {
    if (group.attributeNames.some(n => lower.includes(n.toLowerCase()) || n.toLowerCase().includes(lower))) {
      return group.label;
    }
  }
  return null;
}
