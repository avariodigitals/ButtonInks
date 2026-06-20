/**
 * /api/icons?q=star&set=fluent-emoji
 *
 * Proxies search + SVG fetching from the Iconify API.
 * - No auth required on Iconify's end
 * - We proxy to avoid CORS issues and to add caching
 *
 * Query params:
 *   q    – search term (e.g. "star", "heart", "badge")
 *   set  – icon set prefix to limit results (optional, e.g. "fluent-emoji", "tabler")
 *   limit – max results (default 30)
 */

import { NextRequest, NextResponse } from 'next/server';

const ICONIFY_SEARCH = 'https://api.iconify.design/search';
const ICONIFY_SVG   = 'https://api.iconify.design';

// Curated professional icon sets — clean, line-based, print-ready. No emojis.
const DEFAULT_SETS = 'tabler,phosphor,material-symbols,lucide';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q     = searchParams.get('q')     || 'star';
  const set   = searchParams.get('set')   || DEFAULT_SETS;
  const limit = searchParams.get('limit') || '40';
  const mode  = searchParams.get('mode')  || 'search'; // 'search' | 'svg'
  const icon  = searchParams.get('icon')  || '';       // for mode=svg: e.g. "fluent-emoji:star"

  // ── Mode: return raw SVG for a single icon ────────────────────────────────
  if (mode === 'svg' && icon) {
    const [prefix, name] = icon.split(':');
    if (!prefix || !name) {
      return NextResponse.json({ error: 'Invalid icon format. Use prefix:name' }, { status: 400 });
    }
    const svgRes = await fetch(`${ICONIFY_SVG}/${prefix}/${name}.svg`, {
      next: { revalidate: 86400 }, // cache 24h
    });
    if (!svgRes.ok) {
      return NextResponse.json({ error: 'Icon not found' }, { status: 404 });
    }
    const svg = await svgRes.text();
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  // ── Mode: search icons ────────────────────────────────────────────────────
  const url = new URL(ICONIFY_SEARCH);
  url.searchParams.set('query', q);
  url.searchParams.set('limit', limit);
  url.searchParams.set('prefixes', set);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Iconify search failed: ${res.status}`);
    const data = await res.json();

    // data.icons is an array of "prefix:name" strings
    const icons: string[] = data.icons || [];

    // Build response with SVG URL for each icon
    const results = icons.map((iconId: string) => {
      const [prefix, name] = iconId.split(':');
      return {
        id:     iconId,
        label:  name?.replace(/-/g, ' '),
        svgUrl: `/api/icons?mode=svg&icon=${encodeURIComponent(iconId)}`,
      };
    });

    return NextResponse.json({ icons: results, total: data.total || results.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, icons: [] }, { status: 500 });
  }
}
