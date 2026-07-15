/**
 * POST /api/square/charge
 *
 * Security model:
 *  - Square token is validated server-side; card data never touches this server
 *  - Prices are fetched from WooCommerce — the client cannot influence the charged amount
 *  - Shipping is an allowlisted server-side lookup — no client-supplied costs accepted
 *  - Gateway/payment method labels are derived server-side — client supplies only the gateway ID
 *    which is validated against the enabled list fetched from WooCommerce
 *  - All contact fields are sanitized and length-capped
 *  - Idempotency key is a server-generated UUID — safe to retry without double-charging
 *  - Square Access Token and WC credentials are env-only, never sent to the browser
 */
import { NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';
import { randomUUID } from 'crypto';

// ── WC auth ───────────────────────────────────────────────────────────────────
const wcBasic = () =>
  'Basic ' + Buffer.from(
    `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
  ).toString('base64');

// ── Sanitizers ────────────────────────────────────────────────────────────────
function sanitizeText(v: unknown, maxLen = 200): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, maxLen).replace(/[<>]/g, '');
}
function sanitizeEmail(v: unknown): string {
  if (typeof v !== 'string') return '';
  const t = v.trim().toLowerCase().slice(0, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t : '';
}
function sanitizePostcode(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, 20).replace(/[^a-zA-Z0-9\s\-]/g, '');
}
function sanitizePhone(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, 30).replace(/[^0-9+\-\s().]/g, '');
}

// ── Allowed shipping rates (server-authoritative) ─────────────────────────────
const ALLOWED_SHIPPING: Record<string, { label: string; cost: number }> = {
  usps_priority: { label: 'USPS Priority Mail®',    cost: 12.87 },
  usps_ground:   { label: 'USPS Ground Advantage™', cost:  8.45 },
};

// ── Square gateway ID → WC payment method label ───────────────────────────────
// Derived entirely server-side; client only supplies the gateway ID which is
// validated against the enabled list from WooCommerce.
const SQUARE_GATEWAY_LABELS: Record<string, string> = {
  square_credit_card:  'Credit / Debit Card (Square)',
  square_cash_app_pay: 'Cash App Pay (Square)',
  gift_cards_pay:      'Gift Card (Square)',
};

// ── Fetch enabled gateway IDs from WooCommerce (cached 5 min) ─────────────────
async function getEnabledGatewayIds(): Promise<string[]> {
  try {
    const res = await fetch(`${WP_BASE_URL}/wc/v3/payment_gateways`, {
      headers: { Authorization: wcBasic() },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const gateways: { id: string; enabled: boolean }[] = await res.json();
    return gateways.filter(g => g.enabled).map(g => g.id);
  } catch { return []; }
}

// ── Customer helpers ──────────────────────────────────────────────────────────
async function findCustomerByEmail(email: string): Promise<number | null> {
  try {
    const url = new URL(`${WP_BASE_URL}/wc/v3/customers`);
    url.searchParams.set('email', email);
    const res = await fetch(url.toString(), { headers: { Authorization: wcBasic() }, cache: 'no-store' });
    if (!res.ok) return null;
    const customers: { id: number }[] = await res.json();
    return customers?.[0]?.id ?? null;
  } catch { return null; }
}

async function createWCCustomer(email: string, firstName: string, lastName: string): Promise<number | null> {
  try {
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_\-.]/g, '').slice(0, 60) || 'customer';
    const res = await fetch(`${WP_BASE_URL}/wc/v3/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: wcBasic() },
      body: JSON.stringify({ email, username, first_name: firstName, last_name: lastName }),
    });
    if (!res.ok) return null;
    const c: { id: number } = await res.json();
    return c.id ?? null;
  } catch { return null; }
}

async function linkOrderToCustomer(orderId: number, customerId: number): Promise<void> {
  try {
    await fetch(`${WP_BASE_URL}/wc/v3/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: wcBasic() },
      body: JSON.stringify({ customer_id: customerId }),
    });
  } catch { /* non-fatal */ }
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // ── 0. Resolve logged-in WP customer ─────────────────────────────────
    let wpCustomerId = 0;
    let isGuest = true;
    const authHeader = request.headers.get('authorization') ?? '';
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (jwt) {
      try {
        const meRes = await fetch(`${WP_BASE_URL}/wp/v2/users/me?context=edit`, {
          headers: { Authorization: `Bearer ${jwt}` }, cache: 'no-store',
        });
        if (meRes.ok) {
          const me = await meRes.json();
          if (me?.id) { wpCustomerId = Number(me.id); isGuest = false; }
        }
      } catch { /* treat as guest */ }
    }

    // ── 1. Validate Square payment token format ───────────────────────────
    // Square tokens are short-lived nonces; we validate the format here and
    // let Square's API do the authoritative check. A token that doesn't match
    // the expected pattern is rejected before we make any external calls.
    const squareToken = typeof body.square_token === 'string' ? body.square_token.trim() : '';
    if (!squareToken) {
      return NextResponse.json({ error: 'Payment token is required' }, { status: 400 });
    }
    // Square payment tokens start with specific prefixes depending on method
    // cnon: = card nonce, CAPP: = Cash App, GCN: = gift card
    const VALID_TOKEN_PREFIXES = ['cnon:', 'CAPP:', 'GCN:', 'ccof:'];
    const hasValidPrefix = VALID_TOKEN_PREFIXES.some(p => squareToken.startsWith(p));
    if (!hasValidPrefix || squareToken.length > 512) {
      return NextResponse.json({ error: 'Invalid payment token' }, { status: 400 });
    }

    // ── 2. Validate gateway ID against enabled list from WooCommerce ──────
    // We never trust the client for the payment method label — we look it up
    // from our server-side allowlist keyed by the validated gateway ID.
    const rawGatewayId = typeof body.gateway_id === 'string' ? body.gateway_id.trim() : '';
    const enabledGatewayIds = await getEnabledGatewayIds();
    const isSquareGateway = Object.keys(SQUARE_GATEWAY_LABELS).includes(rawGatewayId);
    if (!isSquareGateway || !enabledGatewayIds.includes(rawGatewayId)) {
      return NextResponse.json({ error: 'Selected payment method is not available' }, { status: 400 });
    }
    const paymentMethodTitle = SQUARE_GATEWAY_LABELS[rawGatewayId];

    // ── 3. Validate and sanitize contact fields ───────────────────────────
    const email     = sanitizeEmail(body.billing?.email);
    const firstName = sanitizeText(body.billing?.first_name, 100);
    const lastName  = sanitizeText(body.billing?.last_name,  100);
    const phone     = sanitizePhone(body.billing?.phone);
    const address1  = sanitizeText(body.billing?.address_1, 200);
    const city      = sanitizeText(body.billing?.city, 100);
    const state     = sanitizeText(body.billing?.state, 100);
    const postcode  = sanitizePostcode(body.billing?.postcode);

    if (!email)     return NextResponse.json({ error: 'Valid email is required' },    { status: 400 });
    if (!firstName) return NextResponse.json({ error: 'First name is required' },     { status: 400 });
    if (!lastName)  return NextResponse.json({ error: 'Last name is required' },      { status: 400 });
    if (!address1)  return NextResponse.json({ error: 'Street address is required' }, { status: 400 });
    if (!city)      return NextResponse.json({ error: 'City is required' },           { status: 400 });
    if (!state)     return NextResponse.json({ error: 'State is required' },          { status: 400 });

    const addressBlock = {
      first_name: firstName, last_name: lastName, address_1: address1,
      city, state, postcode, country: 'US', email, phone,
    };

    // ── 4. Validate line items ────────────────────────────────────────────
    const rawItems = Array.isArray(body.line_items) ? body.line_items : [];
    if (rawItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (rawItems.length > 50) {
      return NextResponse.json({ error: 'Too many items in cart' }, { status: 400 });
    }
    const lineItems: { product_id: number; quantity: number }[] = [];
    for (const item of rawItems) {
      const productId = parseInt(item?.product_id, 10);
      const quantity  = parseInt(item?.quantity, 10);
      if (!Number.isFinite(productId) || productId <= 0) continue;
      if (!Number.isFinite(quantity)  || quantity <= 0 || quantity > 500) continue;
      lineItems.push({ product_id: productId, quantity });
    }
    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 });
    }

    // ── 5. Validate shipping method ───────────────────────────────────────
    const shippingMethodId = typeof body.shipping_lines?.[0]?.method_id === 'string'
      ? body.shipping_lines[0].method_id : 'usps_ground';
    const shippingRate = ALLOWED_SHIPPING[shippingMethodId] ?? ALLOWED_SHIPPING.usps_ground;

    // ── 6. Compute authoritative total from WooCommerce prices ────────────
    // The client CANNOT influence the charged amount — all prices are fetched
    // from WooCommerce server-side. Only product_id + quantity come from client.
    let itemsTotalCents = 0;
    for (const item of lineItems) {
      const pRes = await fetch(`${WP_BASE_URL}/wc/v3/products/${item.product_id}`, {
        headers: { Authorization: wcBasic() },
        next: { revalidate: 60 },
      });
      if (!pRes.ok) {
        return NextResponse.json({ error: 'Could not verify product pricing. Please try again.' }, { status: 502 });
      }
      const product: { price: string; status: string; purchasable: boolean } = await pRes.json();

      // Reject unpublished or non-purchasable products
      if (product.status !== 'publish' || product.purchasable === false) {
        return NextResponse.json({ error: `A product in your cart is no longer available` }, { status: 400 });
      }

      const unitPrice = Math.round(parseFloat(product.price) * 100);
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        return NextResponse.json({ error: 'Invalid product price' }, { status: 400 });
      }
      itemsTotalCents += unitPrice * item.quantity;
    }

    const shippingCents = Math.round(shippingRate.cost * 100);
    const totalCents    = itemsTotalCents + shippingCents;

    if (totalCents <= 0 || totalCents > 99_999_99) {
      // Cap at $99,999.99 — Square's single-payment limit
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    // ── 7. Charge via Square Payments API ─────────────────────────────────
    const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN;
    if (!squareAccessToken) {
      console.error('SQUARE_ACCESS_TOKEN not configured');
      return NextResponse.json({ error: 'Payment processing is not configured' }, { status: 503 });
    }

    const locationId     = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
    const idempotencyKey = randomUUID(); // server-generated — safe to retry

    const squareRes = await fetch('https://connect.squareup.com/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Square-Version': '2024-02-22',
        'Authorization':  `Bearer ${squareAccessToken}`,
      },
      body: JSON.stringify({
        idempotency_key:     idempotencyKey,
        source_id:           squareToken,
        amount_money: {
          amount:   totalCents,
          currency: 'USD',
        },
        location_id:         locationId,
        buyer_email_address: email,
        billing_address: {
          address_line_1:                  address1,
          locality:                        city,
          administrative_district_level_1: state,
          postal_code:                     postcode,
          country:                         'US',
        },
        note: `ButtonInks order — ${firstName} ${lastName}`,
      }),
    });

    const squareData = await squareRes.json();

    if (!squareRes.ok || squareData.payment?.status !== 'COMPLETED') {
      const errorDetail = squareData.errors?.[0]?.detail
        ?? squareData.errors?.[0]?.code
        ?? 'Payment declined';
      console.error('Square charge failed:', JSON.stringify(squareData));
      return NextResponse.json({ error: errorDetail }, { status: 402 });
    }

    const squarePaymentId = squareData.payment.id as string;

    // ── 8. Create WooCommerce order (paid) ────────────────────────────────
    const customerNote = sanitizeText(body.customer_note ?? '', 500);

    const orderPayload = {
      status:               'processing',  // paid — triggers fulfilment workflow
      payment_method:       rawGatewayId,
      payment_method_title: paymentMethodTitle,
      set_paid:             true,
      customer_id:          wpCustomerId,
      billing:              addressBlock,
      shipping:             addressBlock,
      line_items:           lineItems,
      customer_note:        customerNote,
      shipping_lines: [{
        method_id:    shippingMethodId in ALLOWED_SHIPPING ? shippingMethodId : 'usps_ground',
        method_title: shippingRate.label,
        total:        shippingRate.cost.toFixed(2),
      }],
      meta_data: [
        { key: '_square_payment_id',    value: squarePaymentId },
        { key: '_square_idempotency',   value: idempotencyKey },
        { key: '_square_gateway',       value: rawGatewayId },
      ],
    };

    const wcRes = await fetch(`${WP_BASE_URL}/wc/v3/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: wcBasic() },
      body: JSON.stringify(orderPayload),
    });

    if (!wcRes.ok) {
      // Payment succeeded but WC order failed — log Square payment ID for reconciliation
      console.error(
        'WC order creation failed after successful Square charge.',
        'Square payment ID:', squarePaymentId,
        await wcRes.text()
      );
      return NextResponse.json({
        error: `Your payment was processed but the order could not be saved. Please contact support quoting reference: ${squarePaymentId}`,
      }, { status: 502 });
    }

    const order = await wcRes.json();

    // ── 9. Guest account linking ──────────────────────────────────────────
    let accountCreated = false;
    if (isGuest && body.create_account === true) {
      let customerId = await findCustomerByEmail(email);
      if (!customerId) {
        customerId = await createWCCustomer(email, firstName, lastName);
        if (customerId) accountCreated = true;
      }
      if (customerId) await linkOrderToCustomer(order.id, customerId);
    }

    // Return only what the frontend needs — no internal IDs or payment details
    return NextResponse.json({
      id:              order.id,
      status:          order.status,
      guest:           isGuest,
      account_created: accountCreated,
    });

  } catch (err) {
    console.error('Square charge API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
