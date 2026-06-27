/**
 * /api/designs/[id]  —  Proxy to buttoninks/v1/designs/{id}
 *
 * GET    /api/designs/[id]  — fetch one design
 * PUT    /api/designs/[id]  — update/overwrite
 * DELETE /api/designs/[id]  — delete
 */
import { NextRequest, NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

const PLUGIN = `${WP_BASE_URL}/buttoninks/v1`;

function authHeader(req: NextRequest): Record<string, string> {
  const token = req.headers.get('authorization');
  return token ? { Authorization: token } : {};
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    const res  = await fetch(`${PLUGIN}/designs/${id}`, {
      headers: { Accept: 'application/json', ...authHeader(req) },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    const body = await req.json();
    const res  = await fetch(`${PLUGIN}/designs/${id}`, {
      method: 'PUT',
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

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    const res  = await fetch(`${PLUGIN}/designs/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', ...authHeader(req) },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
