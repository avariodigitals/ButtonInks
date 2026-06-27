/**
 * /api/designs  —  Proxy to buttoninks/v1/designs plugin endpoints
 *
 * GET  /api/designs          — list saved designs (auth required)
 * POST /api/designs          — create a saved design (auth required)
 */
import { NextRequest, NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

const PLUGIN = `${WP_BASE_URL}/buttoninks/v1`;

function authHeader(req: NextRequest): Record<string, string> {
  const token = req.headers.get('authorization');
  return token ? { Authorization: token } : {};
}

export async function GET(req: NextRequest) {
  const headers = { Accept: 'application/json', ...authHeader(req) };
  try {
    const res  = await fetch(`${PLUGIN}/designs`, { headers, cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res  = await fetch(`${PLUGIN}/designs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeader(req) },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
