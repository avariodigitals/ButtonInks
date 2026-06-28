/**
 * /api/checkout
 *
 * Security-hardened order creation.
 *
 * All fields are validated and sanitised server-side before being forwarded
 * to WooCommerce. The client CANNOT:
 *   - set_paid: true  (always forced to false — WC marks paid after real payment)
 *   - inject arbitrary payment_method values (validated against enabled gateways)
 *   - override prices (WC calculates prices from product IDs server-side)
 *   - inject extra WC fields (only an explicit allowlist is forwarded)
 */
import { NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

// ── Helpers ───────────────────────────────────────────────────────────────────

function sanitizeText(v: unknown, maxLen = 200): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, maxLen).replace(/[<>]/g, ''); // strip basic HTML injection
}

function sanitizeEmail(v: unknown): string {
  if (typeof v !== 'string') return '';
  const trimmed = v.trim().toLowerCase().slice(0, 254);
  // RFC 5322-ish basic check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : '';
}

function sanitizePostcode(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, 20).replace(/[^a-zA-Z0-9\s\-]/g, '');
}

function sanitizePhone(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, 30).replace(/[^0-9+\-\s().]/g, '');
}

// ── Fetch enabled gateway IDs from WC (server-to-server) ─────────────────────
async function getEnabledGatewayIds(): Promise<string[]> {
  try {
    const auth = Buffer.from(
      `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString('base64');
    const res = await fetch(`${WP_BASE_URL}/wc/v3/payment_gateways`, {
      headers: { Authorization: `Basic ${auth}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const gateways: { id: string; enabled: boolean }[] = await res.json();
    return gateways.filter(g => g.enabled).map(g => g.id);
  } catch {
    return [];
  }
}

// ── POST /api/checkout ────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // ── 1. Validate & sanitize contact fields ──────────────────────────────
    const email     = sanitizeEmail(body.billing?.email);
    const firstName = sanitizeText(body.billing?.first_name, 100);
    const lastName  = sanitizeText(body.billing?.last_name,  100);
    const phone     = sanitizePhone(body.billing?.phone);
    const address1  = sanitizeText(body.billing?.address_1,  200);
    const city      = sanitizeText(body.billing?.city,       100);
    const state     = sanitizeText(body.billing?.state,      100);
    const postcode  = sanitizePostcode(body.billing?.postcode);
    const country   = 'US'; // fixed — not accepted from client

    if (!email)     return NextResponse.json({ error: 'Valid email is required' },       { status: 400 });
    if (!firstName) return NextResponse.json({ error: 'First name is required' },        { status: 400 });
    if (!lastName)  return NextResponse.json({ error: 'Last name is required' },         { status: 400 });
    if (!address1)  return NextResponse.json({ error: 'Street address is required' },    { status: 400 });
    if (!city)      return NextResponse.json({ error: 'City is required' },              { status: 400 });
    if (!state)     return NextResponse.json({ error: 'State is required' },             { status: 400 });

    const addressBlock = { first_name: firstName, last_name: lastName,
      address_1: address1, city, state, postcode, country, email, phone };

    // ── 2. Validate line items — only id + quantity, nothing else ──────────
    const rawItems = Array.isArray(body.line_items) ? body.line_items : [];
    if (rawItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    const lineItems: { product_id: number; quantity: number }[] = [];
    for (const item of rawItems) {
      const productId = parseInt(item?.product_id, 10);
      const quantity  = parseInt(item?.quantity,   10);
      if (!Number.isFinite(productId) || productId <= 0) continue;
      if (!Number.isFinite(quantity)  || quantity  <= 0 || quantity > 9999) continue;
      lineItems.push({ product_id: productId, quantity });
    }
    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 });
    }

    // ── 3. Validate shipping method against known rates ────────────────────
    const ALLOWED_SHIPPING: Record<string, { label: string; cost: number }> = {
      usps_priority: { label: 'USPS Priority Mail®',    cost: 12.87 },
      usps_ground:   { label: 'USPS Ground Advantage™', cost:  8.45 },
    };
    const shippingMethodId = typeof body.shipping_lines?.[0]?.method_id === 'string'
      ? body.shipping_lines[0].method_id : 'usps_ground';
    const shippingRate = ALLOWED_SHIPPING[shippingMethodId] ?? ALLOWED_SHIPPING.usps_ground;

    // ── 4. Validate payment method against WC enabled gateways ────────────
    const enabledGatewayIds = await getEnabledGatewayIds();
    let paymentMethodId    = 'pending';
    let paymentMethodTitle = 'Pending — to be arranged';

    if (enabledGatewayIds.length > 0) {
      const requested = typeof body.payment_method === 'string' ? body.payment_method : '';
      if (enabledGatewayIds.includes(requested)) {
        paymentMethodId    = requested;
        paymentMethodTitle = sanitizeText(body.payment_method_title, 100) || requested;
      } else {
        // Gateway sent by client is not enabled — reject with a clear message
        return NextResponse.json(
          { error: 'Selected payment method is not available. Please refresh and try again.' },
          { status: 400 }
        );
      }
    }
    // If no gateways enabled at all, we allow the order through as 'pending'

    // ── 5. Customer note (optional, sanitised) ─────────────────────────────
    const customerNote = sanitizeText(body.customer_note ?? '', 500);

    // ── 6. Build the WC order payload — explicitly constructed, nothing extra
    const orderPayload = {
      payment_method:       paymentMethodId,
      payment_method_title: paymentMethodTitle,
      set_paid:             false,              // NEVER true — WC handles this
      billing:              addressBlock,
      shipping:             addressBlock,
      line_items:           lineItems,
      customer_note:        customerNote,
      shipping_lines: [{
        method_id:    shippingMethodId in ALLOWED_SHIPPING ? shippingMethodId : 'usps_ground',
        method_title: shippingRate.label,
        total:        shippingRate.cost.toFixed(2),
      }],
    };

    // ── 7. Create order in WooCommerce ─────────────────────────────────────
    const auth = Buffer.from(
      `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString('base64');

    const wcRes = await fetch(`${WP_BASE_URL}/wc/v3/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify(orderPayload),
    });

    if (!wcRes.ok) {
      const errText = await wcRes.text();
      console.error('WC order creation failed:', errText);
      // Don't leak WC internals to the client
      return NextResponse.json({ error: 'Order could not be created. Please try again.' }, { status: 502 });
    }

    const order = await wcRes.json();

    // Return only what the frontend needs — not the full WC order object
    return NextResponse.json({ id: order.id, status: order.status });

  } catch (err) {
    console.error('Checkout API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
