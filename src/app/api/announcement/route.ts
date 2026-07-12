/**
 * GET /api/announcement
 *
 * Proxy to the WordPress buttoninks/v1/announcement endpoint.
 * Caches the response for 5 minutes (revalidate: 300) so every page load
 * doesn't hammer the WP REST API.
 *
 * Falls back to the default announcement text if WordPress is unreachable.
 */
import { NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

const DEFAULT_TEXT =
  'Free shipping on orders over $75 · Use code PRINT15 for 15% off your first order';

export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const res = await fetch(`${WP_BASE_URL}/buttoninks/v1/announcement`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`WordPress returned ${res.status}`);

    const data = await res.json();
    return NextResponse.json({ text: data.text ?? DEFAULT_TEXT });
  } catch {
    // Graceful degradation — frontend already has this as its default
    return NextResponse.json({ text: DEFAULT_TEXT });
  }
}
