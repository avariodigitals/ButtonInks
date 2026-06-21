/**
 * /api/cart  —  Proxy to WooCommerce Store API (wc/store/v1/cart)
 *
 * The WC Store API is cookie/session based. We forward the client's
 * cookies so WooCommerce can identify the session. For authenticated
 * users we also forward their JWT so WooCommerce links the cart to
 * the WP user account.
 */

import { NextRequest, NextResponse } from 'next/server';
import { WC_STORE_URL } from '@/lib/wordpress';

// ── Shared headers builder ────────────────────────────────────────────────────
function buildHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward session cookies so WC can identify the cart
  const cookie = req.headers.get('cookie');
  if (cookie) headers['Cookie'] = cookie;

  // Forward JWT if the user is logged in
  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  return headers;
}

// ── GET /api/cart  — fetch current cart ──────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${WC_STORE_URL}/cart`, {
      headers: buildHeaders(req),
      cache: 'no-store',
    });

    const data = await res.json();

    // Forward Set-Cookie so the session cookie reaches the browser
    const response = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) response.headers.set('set-cookie', setCookie);
    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// ── POST /api/cart/add-item  — add a product ─────────────────────────────────
// Body: { id: number, quantity: number }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${WC_STORE_URL}/cart/add-item`, {
      method: 'POST',
      headers: buildHeaders(req),
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) response.headers.set('set-cookie', setCookie);
    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to add item' },
      { status: 500 }
    );
  }
}

// ── DELETE /api/cart  — remove item or clear cart ────────────────────────────
// Body: { key: string }  for a single item, or {} to clear all
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const endpoint = body.key
      ? `${WC_STORE_URL}/cart/remove-item`
      : `${WC_STORE_URL}/cart/items/delete`;

    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: buildHeaders(req),
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) response.headers.set('set-cookie', setCookie);
    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to remove item' },
      { status: 500 }
    );
  }
}
