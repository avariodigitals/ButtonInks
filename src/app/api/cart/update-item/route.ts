import { NextRequest, NextResponse } from 'next/server';
import { WC_STORE_URL } from '@/lib/wordpress';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const cookie = req.headers.get('cookie');
    if (cookie) headers['Cookie'] = cookie;
    const auth = req.headers.get('authorization');
    if (auth) headers['Authorization'] = auth;

    const res = await fetch(`${WC_STORE_URL}/cart/update-item`, {
      method: 'POST',
      headers,
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
      { error: err instanceof Error ? err.message : 'Failed to update item' },
      { status: 500 }
    );
  }
}
