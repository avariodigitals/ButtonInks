/**
 * Color name → hex lookup using the `color-name-list` package (35,000+ names).
 *
 * Usage:
 *   import { colorNameToHex, BRAND_COLOR_OVERRIDES } from '@/lib/colorLookup';
 *   const hex = colorNameToHex('Atomic Blue'); // '#3a59a8' (or null if unknown)
 *
 * BRAND_COLOR_OVERRIDES is the canonical map used across every component that
 * renders color swatches. Add new garment/brand colors here — nowhere else.
 */

// color-name-list exports a named export `colornames` — array of { name: string; hex: string }
import { colornames } from 'color-name-list';

// ── Single source of truth for garment / brand / industry color names ─────────
// These take priority over the 35k-name library because the library's values for
// generic names like "black" or "white" are often not the printware convention.
//
// Naming convention: always lowercase keys matching exactly how WooCommerce
// returns the attribute option string (trimmed, lowercased at lookup time).
//
// Value types:
//   - string:          single solid color hex (e.g. '#111827')
//   - [string,string]: two-tone pair [leftHex, rightHex] for split circles
export const BRAND_COLOR_OVERRIDES: Record<string, string | [string, string]> = {

  // ── Core basics ──────────────────────────────────────────────────────────────
  'black':              '#111827',
  'white':              '#F9FAFB',
  'grey':               '#9CA3AF',
  'gray':               '#9CA3AF',
  'charcoal':           '#374151',
  'dark charcoal':      '#2D3748',
  'ash':                '#B0BEC5',
  'ash grey':           '#B2B8BE',
  'ash gray':           '#B2B8BE',
  'natural':            '#F5F0E8',
  'cream':              '#FFFDD0',
  'ivory':              '#FFFFF0',
  'off white':          '#FAF9F6',

  // ── Heather / Marl variants ───────────────────────────────────────────────────
  'heather grey':       '#8E9BA8',
  'heather gray':       '#8E9BA8',
  'sport grey':         '#8E9BA8',
  'sport gray':         '#8E9BA8',
  'dark heather':       '#4A5568',
  'graphite heather':   '#4B5563',
  'graphite':           '#4B5563',
  'carbon heather':     '#3A3F47',  // Carhartt — very dark charcoal heather
  'heather charcoal':   '#3D4A52',
  'heather navy':       '#2C3E6B',
  'heather red':        '#C0392B',
  'heather royal':      '#2E5FA3',
  'heather blue':       '#5B8AC6',
  'heather green':      '#4A7C59',
  'heather purple':     '#7B5EA7',
  'heather orange':     '#D2622A',
  'heather cardinal':   '#8C2332',
  'heather military':   '#5A6644',
  'heather dark grey':  '#4A525A',
  'heather indigo':     '#4B5B9A',

  // ── Blues ────────────────────────────────────────────────────────────────────
  'navy':               '#1E3A5F',
  'navy blue':          '#1E3A5F',
  'dark navy':          '#0D1B2A',  // Carhartt — near-black navy
  'new navy':           '#1A2B5E',  // Carhartt — bright deep navy
  'mid-night navy':     '#1C2951',  // hyphenated variant of Midnight Navy
  'midnight navy':      '#1C2951',
  'midnight':           '#1A1A2E',
  'royal':              '#2850A0',
  'royal blue':         '#2850A0',
  'royalnavy':          '#2850A0',  // no-space WC typo → treat as Royal
  'tour blue':          '#5B8DB8',  // Carhartt medium blue
  'carolina blue':      '#7BAFD4',
  'sky blue':           '#7EC8E3',
  'light blue':         '#ADD8E6',
  'indigo':             '#3F51B5',
  'sapphire':           '#1B4F8A',
  'cobalt':             '#0047AB',
  'denim':              '#1560BD',
  'columbia blue':      '#9BDDFF',
  'athletic navy':      '#1A2E5A',
  'oxford':             '#4E5D6C',  // grey-blue Oxford (Carhartt/Hanes)

  // ── Reds & Pinks ─────────────────────────────────────────────────────────────
  'red':                '#DC2626',
  'true red':           '#CC0000',  // pure print red
  'cardinal':           '#8C2332',
  'crimson':            '#BE0032',
  'maroon':             '#800000',
  'burgundy':           '#800020',
  'wine':               '#722F37',
  'cherry red':         '#C0002A',
  'fire red':           '#CE1620',
  'red daisy':          '#E8373B',
  'antique cherry red': '#9E2020',
  'pink':               '#F472B6',
  'ribbon pink':        '#F4A7B9',  // Carhartt — soft dusty pink
  'light pink':         '#FFB6C1',
  'hot pink':           '#FF69B4',
  'coral':              '#FF6B6B',
  'coral silk':         '#FF7F7F',
  'azalea':             '#E87BB1',
  'heliconia':          '#E84A8E',
  'safety pink':        '#FF6EB4',
  'neon pink':          '#FF00AF',

  // ── Greens ───────────────────────────────────────────────────────────────────
  'green':              '#16A34A',
  'dark green':         '#14532D',
  'forest green':       '#228B22',
  'forest':             '#228B22',
  'kelly green':        '#4CBB17',
  'kelly':              '#4CBB17',
  'military green':     '#4B5320',
  'moss':               '#8A9A5B',  // Carhartt Moss — muted yellow-green
  'putting green':      '#4C7A34',  // Golf green
  'olive':              '#808000',
  'olive green':        '#6B7B3A',
  'bottle green':       '#006A4E',
  'sage':               '#BCB88A',
  'mint':               '#98FF98',
  'mint green':         '#98FF98',
  'lime':               '#84CC16',
  'lime green':         '#32CD32',
  'brite lime':         '#C5E800',  // Carhartt high-vis yellow-green
  'safety green':       '#7FC42F',
  'neon green':         '#39FF14',
  'jade dome':          '#00A86B',
  'irish green':        '#008940',
  'teal':               '#008080',
  'dark teal':          '#003C3C',

  // ── Oranges & Yellows ────────────────────────────────────────────────────────
  'orange':             '#EA580C',
  'brite orange':       '#FF6B00',  // Carhartt high-vis orange
  'burnt orange':       '#CC5500',
  'texas orange':       '#CC5500',
  'gold':               '#D97706',
  'old gold':           '#CFB53B',
  'yellow':             '#FBBF24',
  'yellow haze':        '#F5E47A',
  'daisy':              '#FCD34D',
  'neon yellow':        '#FFFF00',
  'safety orange':      '#FF6600',
  'sport orange':       '#FF5F1F',
  'tangerine':          '#F28500',

  // ── Purples ──────────────────────────────────────────────────────────────────
  'purple':             '#7C3AED',
  'college purple':     '#4B2D8A',  // collegiate/sports purple
  'violet':             '#8B5CF6',
  'lavender':           '#E6E6FA',
  'lilac':              '#C8A2C8',
  'plum':               '#8E4585',
  'berry':              '#994F88',
  'orchid':             '#DA70D6',
  'grape':              '#6F2DA8',
  'dark purple':        '#4B0082',

  // ── Browns & Neutrals ────────────────────────────────────────────────────────
  'brown':              '#92400E',
  'chocolate':          '#7B3F00',
  'dark chocolate':     '#3D1F0D',  // Carhartt — deep espresso brown
  'mocha':              '#6F4E37',
  'tan':                '#D2B48C',
  'sand':               '#C2B280',
  'khaki':              '#F0E68C',
  'stone':              '#928E85',
  'titan':              '#6B7280',  // Carhartt Titan — medium grey
  'taupe':              '#483C32',
  'linen':              '#FAF0E6',
  'antique white':      '#FAEBD7',
  'antique sapphire':   '#3A5F8A',
  'antique jade':       '#3A6B4A',
  'antique gold':       '#B8960C',
  'antique cherry':     '#9E2020',
  'camo':               '#78866B',
  'military camo':      '#6B6B47',
  'royalsteel grey':    '#4A6080',  // no-space WC typo — Royal + Steel Grey blend

  // ── Metallics / Special ───────────────────────────────────────────────────────
  'silver':             '#C0C0C0',
  'metallic silver':    '#A8A9AD',
  'gold metallic':      '#D4AF37',
  'rose gold':          '#B76E79',
  'chrome':             '#DBE2EB',

  // ── Two-tone / Combo garment colors (Richardson 112, similar trucker caps) ────
  // Format: primary/mesh or primary/accent — we show BOTH in a split circle
  // Richardson 112 official colorways:
  'army olive green/tan':     ['#4B5320', '#D2B48C'],  // Olive front / Tan mesh
  'beetle/quarry':            ['#3E3E3C', '#8B8682'],  // Dark charcoal / Quarry grey
  'black/white':              ['#000000', '#FFFFFF'],
  'cardinal/tan':             ['#8C2332', '#D2B48C'],  // Deep red / Tan mesh
  'heather grey/amber gold':  ['#9CA3AF', '#D4AF37'],  // Grey heather / Gold
  'cobalt blue/grey':         ['#0047AB', '#9CA3AF'],
  'charcoal/black':           ['#36454F', '#000000'],
  'ombre blue/navy':          ['#4169E1', '#000080'],  // Royal blue to navy gradient
  'pale khaki/loden green':   ['#BDB76B', '#6B8E23'],  // Light khaki / Olive green
  'charcoal/white':           ['#36454F', '#FFFFFF'],
  'heather grey/black':       ['#9CA3AF', '#000000'],
  'navy/white':               ['#000080', '#FFFFFF'],

  // Generic two-tone fallbacks (for other products)
  'grey/black':               ['#9CA3AF', '#000000'],
  'gray/black':               ['#9CA3AF', '#000000'],
  'white/black':              ['#FFFFFF', '#000000'],
  'white/navy':               ['#FFFFFF', '#000080'],
  'white/red':                ['#FFFFFF', '#DC2626'],
  'royal/white':              ['#2850A0', '#FFFFFF'],
  'red/black':                ['#DC2626', '#000000'],
  'red/white':                ['#DC2626', '#FFFFFF'],
  'black/gold':               ['#000000', '#D4AF37'],
  'black/red':                ['#000000', '#DC2626'],
  'navy/gold':                ['#000080', '#D4AF37'],
  'navy/red':                 ['#000080', '#DC2626'],
  'loden green/khaki':        ['#6B8E23', '#BDB76B'],
  'black/khaki':              ['#000000', '#C3B091'],
  'camo/black':               ['#78866B', '#000000'],
  'multicam':                 ['#7B7B3E', '#5A5A3A'],  // Multicam OCP pattern
  'realtree':                 ['#4A5728', '#7A8B5C'],  // Realtree camo
  'mossy oak':                ['#4D5240', '#6B7562'],  // Mossy Oak camo
};



// Build a lowercase-keyed Map for O(1) lookup from the 35k-name library
const colorMap = new Map<string, string>(
  (colornames as Array<{ name: string; hex: string }>).map(({ name, hex }) => [
    name.toLowerCase().trim(),
    hex.startsWith('#') ? hex : `#${hex}`,
  ])
);

/**
 * Resolve a color name to either a single hex string or a [leftHex, rightHex] pair.
 *
 * Returns:
 *   - string          — single solid color (render as filled circle)
 *   - [string,string] — two-tone pair (render as diagonal split circle)
 *   - null            — unknown (render as text pill)
 *
 * Resolution order:
 *  1. BRAND_COLOR_OVERRIDES  — garment/printware industry names (highest priority)
 *  2. color-name-list        — 35,000-name database
 *  3. Slash-split fallback   — auto-builds a pair from left/right parts
 *  4. null                   — unknown
 */
export function colorNameToHex(name: string): string | [string, string] | null {
  if (!name) return null;

  // 0. If the value is already a hex code, return it directly
  if (/^#[0-9a-fA-F]{3,6}$/.test(name.trim())) return name.trim();

  const key = name.toLowerCase().trim();

  // 1. Brand overrides first — may return a string or [string, string]
  if (BRAND_COLOR_OVERRIDES[key] !== undefined) return BRAND_COLOR_OVERRIDES[key];

  // 2. Strip trailing "color" / "colour"
  const stripped = key.replace(/\s+(color|colour)$/, '').trim();
  if (stripped !== key && BRAND_COLOR_OVERRIDES[stripped] !== undefined) return BRAND_COLOR_OVERRIDES[stripped];

  // 3. Exact match in 35k library (always single hex)
  if (colorMap.has(key)) return colorMap.get(key)!;

  // 4. Library with stripped suffix
  if (stripped !== key && colorMap.has(stripped)) return colorMap.get(stripped)!;

  // 5. Collapse multiple spaces and retry
  const collapsed = key.replace(/\s+/g, ' ');
  if (BRAND_COLOR_OVERRIDES[collapsed] !== undefined) return BRAND_COLOR_OVERRIDES[collapsed];
  if (colorMap.has(collapsed)) return colorMap.get(collapsed)!;

  // 6. Slash-split fallback — auto-build a two-tone pair for unlisted combos
  if (key.includes('/')) {
    const parts   = key.split('/');
    const leftKey = parts[0].trim();
    const rightKey = parts[1]?.trim() ?? '';

    function resolveHalf(k: string): string {
      if (BRAND_COLOR_OVERRIDES[k] !== undefined) {
        const v = BRAND_COLOR_OVERRIDES[k];
        return Array.isArray(v) ? v[0] : v;
      }
      if (colorMap.has(k)) return colorMap.get(k)!;
      // De-prefix "heather"
      const dep = k.replace(/^heather\s+/, '').trim();
      if (dep !== k) {
        if (BRAND_COLOR_OVERRIDES[dep] !== undefined) {
          const v2 = BRAND_COLOR_OVERRIDES[dep];
          return Array.isArray(v2) ? v2[0] : v2;
        }
        if (colorMap.has(dep)) return colorMap.get(dep)!;
      }
      return '#9CA3AF'; // fallback grey
    }

    const leftHex  = resolveHalf(leftKey);
    const rightHex = rightKey ? resolveHalf(rightKey) : '#E5E7EB';
    return [leftHex, rightHex];
  }

  return null;
}

/**
 * Convenience function for components that only need a single hex (non-split use cases).
 * For two-tone values, returns the left/primary hex.
 */
export function colorNameToPrimaryHex(name: string): string | null {
  const result = colorNameToHex(name);
  if (!result) return null;
  return Array.isArray(result) ? result[0] : result;
}
