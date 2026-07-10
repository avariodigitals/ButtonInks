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
  'black':              '#1C1C1C',  // garment black — not pure #000
  'white':              '#F5F5F5',  // garment white — off-white cotton
  'grey':               '#9CA3AF',
  'gray':               '#9CA3AF',
  'light grey':         '#D1D5DB',
  'light gray':         '#D1D5DB',
  'dark grey':          '#4B5563',
  'dark gray':          '#4B5563',
  'charcoal':           '#374151',
  'dark charcoal':      '#2D3748',
  'ash':                '#B5BEC6',  // Gildan Ash — warm light grey
  'ash grey':           '#B5BEC6',
  'ash gray':           '#B5BEC6',
  'natural':            '#EDE8DC',  // unbleached cotton — warm off-white
  'cream':              '#F5EDD6',
  'ivory':              '#F8F4E8',
  'off white':          '#F0EDE6',
  'antique white':      '#FAEBD7',

  // ── Heather / Marl variants ───────────────────────────────────────────────────
  // Heather colors are a lighter, mixed-yarn look — slightly muted/washed vs solid
  'heather grey':          '#8D9DA8',  // Gildan/Port & Co standard heather grey
  'heather gray':          '#8D9DA8',
  'sport grey':            '#9AA0A6',  // Gildan Sport Grey — slightly warmer tone
  'sport gray':            '#9AA0A6',
  'light heather grey':    '#BEC4CA',  // lighter marl
  'dark heather':          '#4B5563',  // Gildan Dark Heather — charcoal mix
  'dark heather grey':     '#4B5563',
  'heather charcoal':      '#4B5563',
  'graphite heather':      '#4B5563',
  'graphite':              '#525B64',
  'carbon heather':        '#3A3F47',  // Carhartt — near-black charcoal heather
  'heather navy':          '#2E4470',  // navy with heather softness
  'heather red':           '#B83232',  // red marl — slightly muted vs solid red
  'heather scarlet':       '#B83232',
  'heather royal':         '#3362B0',  // royal blue heather
  'heather blue':          '#5B8AC6',  // medium blue heather
  'heather sapphire':      '#3A6FA0',
  'heather green':         '#5A8A5E',  // Gildan/Port & Co — muted sage-green heather
  'heather forest':        '#3D6B45',  // darker forest-green heather
  'heather kelly':         '#4E9A56',
  'heather military green':'#5B6B45',  // olive-military heather
  'heather purple':        '#7B5EA7',  // medium purple heather
  'heather maroon':        '#7A2B35',
  'heather cardinal':      '#8C2332',
  'heather orange':        '#D26A2A',  // burnt-orange heather
  'heather gold':          '#C8932A',
  'heather indigo':        '#4B5B9A',
  'heather black':         '#2D2D2D',  // very dark near-black heather

  // ── Blues ────────────────────────────────────────────────────────────────────
  'navy':               '#1B2F4E',  // Gildan/Port & Co navy — deep ink blue
  'navy blue':          '#1B2F4E',
  'dark navy':          '#0D1B2A',  // near-black navy
  'new navy':           '#1A2B5E',  // Carhartt
  'mid-night navy':     '#1C2951',
  'midnight navy':      '#1C2951',
  'midnight':           '#1A1A2E',
  'royal':              '#1F4FA0',  // Gildan Royal — vivid true royal blue
  'royal blue':         '#1F4FA0',
  'royalnavy':          '#1F4FA0',
  'tour blue':          '#5B8DB8',
  'carolina blue':      '#7BAFD4',  // light sky blue
  'sky blue':           '#87CEEB',
  'light blue':         '#AED6F1',
  'baby blue':          '#C9E4F5',
  'powder blue':        '#B0D4E8',
  'indigo':             '#3F51B5',
  'sapphire':           '#1A4F8A',
  'cobalt':             '#0047AB',
  'denim':              '#1560BD',
  'columbia blue':      '#78B9D5',  // slightly darker than most libraries show
  'athletic navy':      '#1A2E5A',
  'oxford':             '#4E5D6C',
  'steel blue':         '#4A7FA5',
  'slate blue':         '#6A7BA2',
  'pacific blue':       '#2E7FAD',

  // ── Reds & Pinks ─────────────────────────────────────────────────────────────
  'red':                '#CC1F1F',  // Gildan Red — slightly darker than CSS red
  'true red':           '#CC0000',
  'bright red':         '#E8231E',
  'cardinal':           '#8C1A2E',  // darker, more burgundy-red cardinal
  'crimson':            '#A50024',
  'maroon':             '#6B0F1A',  // deep maroon — darker than web standard
  'burgundy':           '#6E1020',
  'wine':               '#5C1A22',
  'cherry red':         '#C0002A',
  'fire red':           '#CE1620',
  'red daisy':          '#E8373B',
  'antique cherry red': '#9E2020',
  'sport scarlet red':  '#CC1B1B',  // Gildan Sport Scarlet
  'safety red':         '#EE2024',
  'pink':               '#F472B6',
  'ribbon pink':        '#F4A7B9',
  'light pink':         '#FFB6C1',
  'hot pink':           '#FF1493',
  'neon pink':          '#FF006E',
  'coral':              '#FF6B6B',
  'coral silk':         '#FF7F7F',
  'azalea':             '#E87BB1',
  'heliconia':          '#D62E8A',  // Gildan Heliconia — deep fuchsia pink
  'safety pink':        '#FF69B4',

  // ── Greens ───────────────────────────────────────────────────────────────────
  'green':              '#1E8A3C',  // Gildan Green — rich mid-green
  'dark green':         '#1A4D2E',  // Gildan Dark Green — very deep
  'forest green':       '#2D6A35',  // Forest — medium-dark natural green
  'forest':             '#2D6A35',
  'kelly green':        '#2FAD4A',  // bright vivid Kelly
  'kelly':              '#2FAD4A',
  'military green':     '#4B5320',  // OD green
  'moss':               '#8A9A5B',
  'putting green':      '#4C7A34',
  'olive':              '#6B6B2A',  // true olive — more brownish than web standard
  'olive green':        '#6B7B3A',
  'bottle green':       '#1A5C3A',
  'sage':               '#8DAA7E',  // Gildan Sage — muted green-grey
  'mint':               '#98E8B0',
  'mint green':         '#98E8B0',
  'lime':               '#84CC16',
  'lime green':         '#3CB843',  // brighter than CSS lime
  'brite lime':         '#C5E800',
  'safety green':       '#7FC42F',
  'neon green':         '#39FF14',
  'jade dome':          '#00A86B',
  'irish green':        '#008940',
  'teal':               '#007070',  // deeper teal for garments
  'dark teal':          '#004040',

  // ── Oranges & Yellows ────────────────────────────────────────────────────────
  'orange':             '#E85D0A',  // Gildan Orange — vivid burnt orange
  'brite orange':       '#FF5F00',  // Carhartt high-vis
  'burnt orange':       '#BF4F0F',
  'texas orange':       '#BF4F0F',
  'gold':               '#C8901A',  // Gildan Gold — deeper than CSS gold
  'old gold':           '#B8820A',
  'yellow':             '#F5C518',  // garment yellow — slightly amber
  'yellow haze':        '#F5E47A',
  'daisy':              '#F5C630',  // Gildan Daisy — warm yellow
  'neon yellow':        '#E8FF00',
  'safety orange':      '#FF5C00',
  'sport orange':       '#F04A10',
  'tangerine':          '#E87A00',

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
  'brown':              '#7A3214',  // Gildan Brown — warm dark brown
  'chocolate':          '#5C2900',
  'dark chocolate':     '#3D1F0D',
  'mocha':              '#6B4226',
  'tan':                '#C8A87A',  // garment tan — slightly muted vs CSS tan
  'sand':               '#C4AA7A',
  'khaki':              '#B5A26A',  // garment khaki — more green-brown than CSS
  'stone':              '#9E9580',
  'titan':              '#6B7280',
  'taupe':              '#8B7B6A',  // warm taupe
  'linen':              '#F0E8D8',
  'antique sapphire':   '#3A5F8A',
  'antique jade':       '#3A6B4A',
  'antique gold':       '#B8960C',
  'antique cherry':     '#9E2020',
  'camo':               '#78866B',
  'military camo':      '#6B6B47',
  'royalsteel grey':    '#4A6080',

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
