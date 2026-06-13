import { NextRequest, NextResponse } from 'next/server';
import { uploadMedia } from '@/lib/wordpress';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const result = await uploadMedia(file);
    if (!result) {
      return NextResponse.json({ error: "Upload to WordPress failed" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
