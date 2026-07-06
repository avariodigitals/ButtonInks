import { NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${WP_BASE_URL}/buttoninks/v1/contact`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    const data: unknown = await res.json();

    if (!res.ok) {
      const err = data as { message?: string };
      return NextResponse.json(
        { error: err.message ?? 'Failed to send enquiry.' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
