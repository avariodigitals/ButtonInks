/**
 * Color name → hex lookup using the `color-name-list` package (35,000+ names).
 *
 * Usage:
 *   import { colorNameToHex } from '@/lib/colorLookup';
 *   const hex = colorNameToHex('Atomic Blue'); // '#3a59a8' (or null if unknown)
 */

// color-name-list exports a named export `colornames` — array of { name: string; hex: string }
import { colornames } from 'color-name-list';

// Build a lowercase-keyed Map for O(1) lookup
const colorMap = new Map<string, string>(
  (colornames as Array<{ name: string; hex: string }>).map(({ name, hex }) => [
    name.toLowerCase().trim(),
    hex.startsWith('#') ? hex : `#${hex}`,
  ])
);

/**
 * Convert a color name string to a hex code.
 * Returns null if the name is not in the database.
 *
 * Tries exact match first, then a few normalizations:
 *  - strips common trailing words ("color", "colour")
 *  - collapses multiple spaces
 */
export function colorNameToHex(name: string): string | null {
  if (!name) return null;
  const key = name.toLowerCase().trim();

  // 1. Exact match
  if (colorMap.has(key)) return colorMap.get(key)!;

  // 2. Strip trailing "color" / "colour"
  const stripped = key.replace(/\s+(color|colour)$/, '').trim();
  if (stripped !== key && colorMap.has(stripped)) return colorMap.get(stripped)!;

  // 3. Collapse multiple spaces
  const collapsed = key.replace(/\s+/g, ' ');
  if (colorMap.has(collapsed)) return colorMap.get(collapsed)!;

  return null;
}
