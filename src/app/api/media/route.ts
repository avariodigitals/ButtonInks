import { NextResponse } from 'next/server';
import { getRecentMedia } from '@/lib/wordpress';

export async function GET() {
  try {
    const media = await getRecentMedia();
    return NextResponse.json(media);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
