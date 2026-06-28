/**
 * /api/payment-gateways
 *
 * Server-side proxy to WooCommerce /wc/v3/payment_gateways.
 * Returns only enabled gateways so the frontend never needs WC credentials.
 */
import { NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

export interface WCPaymentGateway {
  id:          string;
  title:       string;
  description: string;
  enabled:     boolean;
  settings:    Record<string, { value: string; label: string }>;
}

export async function GET() {
  try {
    const auth = Buffer.from(
      `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString('base64');

    const res = await fetch(`${WP_BASE_URL}/wc/v3/payment_gateways`, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      // revalidate every 5 minutes — gateways rarely change
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ gateways: [] }, { status: 200 });
    }

    const all: WCPaymentGateway[] = await res.json();
    const enabled = all.filter(g => g.enabled);
    return NextResponse.json({ gateways: enabled });
  } catch {
    // Never crash the checkout page — just return empty so we show "not set up" notice
    return NextResponse.json({ gateways: [] }, { status: 200 });
  }
}
