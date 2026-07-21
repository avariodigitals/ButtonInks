/**
 * WordPress Color Swatch Cache
 *
 * Fetches the admin-managed color map from WordPress (ButtonInks → Color Swatches)
 * and caches it for the duration of the server process.
 *
 * Resolution priority:
 *  1. WordPress admin map (exact, authoritative)
 *  2. BRAND_COLOR_OVERRIDES (built-in garment library)
 *  3. color-name-list 35k names
 *  4. Slash-split auto-pairing
 *  5. Word-scan fallback
 */

import { WP_BASE_URL } from '@/lib/wordpress';

export type ColorMap = Record<string, string>; // name (lowercase) → hex

let cachedMap: ColorMap | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch the WordPress color swatch map.
 * Returns an empty object if WordPress is unreachable.
 */
export async function getWordPressColorMap(): Promise<ColorMap> {
  if (cachedMap && Date.now() < cacheExpiry) return cachedMap;

  try {
    const res = await fetch(`${WP_BASE_URL}/buttoninks/v1/color-swatches`, {
      next: { revalidate: 300, tags: ['color-swatches'] },
    });
    if (!res.ok) throw new Error(`WP returned ${res.status}`);
    const data = await res.json() as Record<string, string>;

    // Normalize keys to lowercase for case-insensitive matching
    const normalized: ColorMap = {};
    for (const [name, hex] of Object.entries(data)) {
      if (name && /^#[0-9a-fA-F]{3,6}$/.test(hex)) {
        normalized[name.toLowerCase().trim()] = hex;
      }
    }

    cachedMap   = normalized;
    cacheExpiry = Date.now() + CACHE_TTL;
    return normalized;
  } catch {
    return cachedMap ?? {};
  }
}
