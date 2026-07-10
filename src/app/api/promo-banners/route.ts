import { NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

const DEFAULT_BANNERS = [
  {
    id:   1,
    url:  'https://central.buttoninks.com/wp-content/uploads/2026/07/Apparel.png',
    link: '/categories?category=apparel',
    alt:  'Apparel Collection',
  },
  {
    id:   2,
    url:  'https://central.buttoninks.com/wp-content/uploads/2026/07/Vehicle.png',
    link: '/categories?category=vehicle-branding',
    alt:  'Vehicle Branding',
  },
];

export async function GET() {
  try {
    const res = await fetch(`${WP_BASE_URL}/buttoninks/v1/promo-banners`, {
      next: { revalidate: 300 }, // cache for 5 minutes
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch { /* fall through to default */ }

  return NextResponse.json(DEFAULT_BANNERS);
}
