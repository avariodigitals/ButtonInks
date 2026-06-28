/**
 * GET /api/orders
 *
 * Returns orders for the currently authenticated WordPress user.
 *
 * Flow:
 *  1. Client sends its JWT in the Authorization header
 *  2. We verify it with WP to get the WP user ID (server-side — key never exposed)
 *  3. We query wc/v3/orders?customer={wpUserId} with consumer key (server-side only)
 *  4. We return a trimmed order list to the client
 */
import { NextRequest, NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

const wcAuth = () =>
  Buffer.from(
    `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
  ).toString('base64');

export async function GET(req: NextRequest) {
  // ── 1. Extract JWT from Authorization header ───────────────────────────────
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  try {
    // ── 2. Verify JWT & get WP user ID ───────────────────────────────────────
    const meRes = await fetch(`${WP_BASE_URL}/wp/v2/users/me?context=edit`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (meRes.status === 401) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Could not verify user' }, { status: 502 });
    }

    const me = await meRes.json();
    const wpUserId: number = me?.id;
    if (!wpUserId) {
      return NextResponse.json({ error: 'Could not resolve user ID' }, { status: 500 });
    }

    // ── 3. Fetch orders from WooCommerce for this customer ───────────────────
    const url = new URL(`${WP_BASE_URL}/wc/v3/orders`);
    url.searchParams.set('customer',  String(wpUserId));
    url.searchParams.set('per_page',  '50');
    url.searchParams.set('orderby',   'date');
    url.searchParams.set('order',     'desc');

    const ordersRes = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${wcAuth()}` },
      cache: 'no-store',
    });

    if (!ordersRes.ok) {
      const errText = await ordersRes.text();
      console.error('WC orders fetch failed:', errText);
      return NextResponse.json({ error: 'Could not fetch orders' }, { status: 502 });
    }

    const rawOrders = await ordersRes.json();

    // ── 4. Return a trimmed, safe subset — no sensitive WC internals ─────────
    const orders = (Array.isArray(rawOrders) ? rawOrders : []).map((o: any) => ({
      id:            o.id,
      number:        o.number,
      status:        o.status,
      date_created:  o.date_created,
      total:         o.total,
      currency:      o.currency,
      item_count:    (o.line_items ?? []).reduce((s: number, i: any) => s + (i.quantity ?? 1), 0),
      items:         (o.line_items ?? []).map((i: any) => ({
        name:     i.name,
        quantity: i.quantity,
        total:    i.total,
        image:    i.image?.src ?? '',
      })),
      shipping_total:        o.shipping_total,
      payment_method_title:  o.payment_method_title,
    }));

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('Orders API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
