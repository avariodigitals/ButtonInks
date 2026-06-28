/**
 * /api/checkout
 *
 * Security-hardened order creation with automatic guest account handling.
 *
 * Flow:
 *
 * LOGGED-IN USER:
 *   JWT in Authorization header → verified with WP → customer_id attached to order
 *   → order appears in /account/orders immediately
 *
 * GUEST USER:
 *   1. Order created with customer_id: 0
 *   2. We check if a WC customer already exists for their email
 *   3. If yes  → update the order to link customer_id
 *   4. If no   → create a new WC customer (triggers WC "New Account" email with
 *                password setup link so they can log in and track the order)
 *   5. Either way the order is linked to a real WP account server-side
 *
 * The client CANNOT:
 *   - set_paid: true
 *   - inject arbitrary payment methods
 *   - override prices or shipping costs
 *   - inject extra WC fields
 */
import { NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

// ── Auth helper ───────────────────────────────────────────────────────────────
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

// ── Fetch enabled gateway IDs (cached 5 min) ──────────────────────────────────
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

// ── Find existing WC customer by email ───────────────────────────────────────
async function findCustomerByEmail(email: string): Promise<number | null> {
  try {
    const url = new URL(`${WP_BASE_URL}/wc/v3/customers`);
    url.searchParams.set('email', email);
    const res = await fetch(url.toString(), {
      headers: { Authorization: wcBasic() },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const customers: { id: number }[] = await res.json();
    return customers?.[0]?.id ?? null;
  } catch { return null; }
}

// ── Create a new WC customer (triggers WC "New Account" welcome email) ────────
async function createWCCustomer(
  email: string, firstName: string, lastName: string
): Promise<number | null> {
  try {
    // Generate a username from email (WC will de-duplicate if needed)
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_\-.]/g, '').slice(0, 60)
      || 'customer';

    const res = await fetch(`${WP_BASE_URL}/wc/v3/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: wcBasic() },
      body: JSON.stringify({
        email,
        username,
        first_name: firstName,
        last_name:  lastName,
        // No password — WC sends a "Set your password" email automatically
        // because woocommerce_registration_generate_password = yes
      }),
    });
    if (!res.ok) {
      console.error('WC customer create failed:', await res.text());
      return null;
    }
    const customer: { id: number } = await res.json();
    return customer.id ?? null;
  } catch (e) {
    console.error('createWCCustomer error:', e);
    return null;
  }
}

// ── Update order's customer_id after creation ─────────────────────────────────
async function linkOrderToCustomer(orderId: number, customerId: number): Promise<void> {
  try {
    await fetch(`${WP_BASE_URL}/wc/v3/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: wcBasic() },
      body: JSON.stringify({ customer_id: customerId }),
    });
  } catch (e) {
    console.error('linkOrderToCustomer error:', e);
  }
}

// ── POST /api/checkout ────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // ── 0. Resolve logged-in WP customer ID from JWT ───────────────────────
    let wpCustomerId = 0;
    let isGuest = true;
    const authHeader = request.headers.get('authorization') ?? '';
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (jwt) {
      try {
        const meRes = await fetch(`${WP_BASE_URL}/wp/v2/users/me?context=edit`, {
          headers: { Authorization: `Bearer ${jwt}` },
          cache: 'no-store',
        });
        if (meRes.ok) {
          const me = await meRes.json();
          if (me?.id) { wpCustomerId = Number(me.id); isGuest = false; }
        }
      } catch { /* treat as guest */ }
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

    // ── 2. Validate line items ─────────────────────────────────────────────
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

    // ── 3. Validate shipping ───────────────────────────────────────────────
    const ALLOWED_SHIPPING: Record<string, { label: string; cost: number }> = {
      usps_priority: { label: 'USPS Priority Mail®',    cost: 12.87 },
      usps_ground:   { label: 'USPS Ground Advantage™', cost:  8.45 },
    };
    const shippingMethodId = typeof body.shipping_lines?.[0]?.method_id === 'string'
      ? body.shipping_lines[0].method_id : 'usps_ground';
    const shippingRate = ALLOWED_SHIPPING[shippingMethodId] ?? ALLOWED_SHIPPING.usps_ground;

    // ── 4. Validate payment method ─────────────────────────────────────────
    const enabledGatewayIds = await getEnabledGatewayIds();
    let paymentMethodId    = 'other';
    let paymentMethodTitle = 'To be arranged';
    let orderStatus        = 'on-hold'; // triggers admin "New Order" email

    if (enabledGatewayIds.length > 0) {
      const requested = typeof body.payment_method === 'string' ? body.payment_method : '';
      if (enabledGatewayIds.includes(requested)) {
        paymentMethodId    = requested;
        paymentMethodTitle = sanitizeText(body.payment_method_title, 100) || requested;
        orderStatus        = 'pending';
      } else {
        return NextResponse.json(
          { error: 'Selected payment method is not available. Please refresh and try again.' },
          { status: 400 }
        );
      }
    }

    // ── 5. Sanitize customer note ──────────────────────────────────────────
    const customerNote  = sanitizeText(body.customer_note ?? '', 500);
    const createAccount = isGuest && body.create_account === true;

    // ── 6. Build order payload ─────────────────────────────────────────────
    const orderPayload = {
      status:               orderStatus,
      payment_method:       paymentMethodId,
      payment_method_title: paymentMethodTitle,
      set_paid:             false,
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
    };

    // ── 7. Create order in WooCommerce ─────────────────────────────────────
    const wcRes = await fetch(`${WP_BASE_URL}/wc/v3/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: wcBasic() },
      body: JSON.stringify(orderPayload),
    });

    if (!wcRes.ok) {
      console.error('WC order creation failed:', await wcRes.text());
      return NextResponse.json({ error: 'Order could not be created. Please try again.' }, { status: 502 });
    }

    const order = await wcRes.json();

    // ── 8. Guest: find or create WC account if they opted in ──────────────
    // Only runs for guests who ticked "Save my details for faster checkout".
    let accountCreated = false;
    if (createAccount) {
      let customerId = await findCustomerByEmail(email);
      if (!customerId) {
        customerId = await createWCCustomer(email, firstName, lastName);
        if (customerId) accountCreated = true;
      }
      if (customerId) await linkOrderToCustomer(order.id, customerId);
    }
    // Logged-in user: already linked via customer_id.
    // Guest who didn't opt in: pure guest order, customer_id stays 0.

    // Return only what the frontend needs
    return NextResponse.json({
      id:              order.id,
      status:          order.status,
      guest:           isGuest,
      account_created: accountCreated,
    });

  } catch (err) {
    console.error('Checkout API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
