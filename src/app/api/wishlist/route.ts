/**
 * /api/wishlist  —  Proxy to buttoninks/v1/wishlist plugin endpoints
 */
import { NextRequest, NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

const PLUGIN = `${WP_BASE_URL}/buttoninks/v1`;

function authHeader(req: NextRequest): Record<string, string> {
  const token = req.headers.get('authorization');
  return token ? { Authorization: token } : {};
}

// GET /api/wishlist  — fetch wishlist product IDs
export async function GET(req: NextRequest) {
  const headers = { Accept: 'application/json', ...authHeader(req) };
  try {
    const res  = await fetch(`${PLUGIN}/wishlist`, { headers, cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}

// POST /api/wishlist  — add or remove
// Body: { product_id: number, action: 'add' | 'remove' }
export async function POST(req: NextRequest) {
  try {
    const { product_id, action } = await req.json();
    const endpoint = action === 'remove'
      ? `${PLUGIN}/wishlist/remove`
      : `${PLUGIN}/wishlist/add`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeader(req),
      },
      body: JSON.stringify({ product_id }),
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
