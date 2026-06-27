/**
 * /api/design-templates?category=all
 *
 * Fetches design templates. First tries WordPress (bi_design_template CPT
 * via buttoninks/v1/design-templates), falls back to hardcoded templates if
 * WP returns nothing or is unavailable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

export interface TemplateElement {
  type:        'text' | 'image' | 'graphic';
  content:     string;
  x:           number;
  y:           number;
  width:       number;
  height:      number;
  rotation:    number;
  opacity:     number;
  color?:      string;
  fontFamily?: string;
  fontSize?:   number;
  fontWeight?: string;
  textAlign?:  'left' | 'center' | 'right';
}

export interface DesignTemplate {
  id:          string;
  name:        string;
  category:    string;
  thumbnail:   string;   // URL (from WP featured image) or empty string
  tags?:       string[]; // style tags from WP
  elements:    TemplateElement[];
}

const FALLBACK_TEMPLATES: DesignTemplate[] = [
  { id: 'tshirt-bold',         name: 'Bold Brand',        category: 'apparel',   thumbnail: '', tags: ['Modern','Minimalist'],
    elements: [
      { type: 'text', content: 'BRAND NAME', x: 80,  y: 250, width: 440, height: 90, rotation: 0, opacity: 1, color: '#064E3B', fontFamily: 'Outfit',  fontSize: 56, fontWeight: '900', textAlign: 'center' },
      { type: 'text', content: 'Est. 2024',  x: 180, y: 360, width: 240, height: 40, rotation: 0, opacity: 1, color: '#4B5563', fontFamily: 'Inter',   fontSize: 18, fontWeight: '400', textAlign: 'center' },
    ] },
  { id: 'tshirt-slogan',       name: 'Slogan Tee',        category: 'apparel',   thumbnail: '', tags: ['Retro','Classic'],
    elements: [
      { type: 'text', content: '"Just Do It Better"', x: 70,  y: 290, width: 460, height: 70, rotation: 0, opacity: 1, color: '#B45309', fontFamily: 'Georgia', fontSize: 34, fontWeight: '700', textAlign: 'center' },
      { type: 'text', content: '— ButtonInks —',      x: 170, y: 380, width: 260, height: 36, rotation: 0, opacity: 1, color: '#9CA3AF', fontFamily: 'Inter',   fontSize: 14, fontWeight: '400', textAlign: 'center' },
    ] },
  { id: 'tshirt-minimal',      name: 'Minimal Type',      category: 'apparel',   thumbnail: '', tags: ['Modern','Abstract'],
    elements: [
      { type: 'text', content: 'MINIMAL',     x: 100, y: 310, width: 400, height: 80, rotation: 0, opacity: 1, color: '#171717', fontFamily: 'Outfit', fontSize: 64, fontWeight: '900', textAlign: 'center' },
      { type: 'text', content: '___________', x: 120, y: 400, width: 360, height: 20, rotation: 0, opacity: 1, color: '#6B7280', fontFamily: 'Inter',  fontSize: 14, fontWeight: '400', textAlign: 'center' },
    ] },
  { id: 'mug-birthday',        name: 'Birthday Mug',      category: 'mug',       thumbnail: '', tags: ['Playful','Colourful'],
    elements: [
      { type: 'text', content: 'Happy Birthday!', x: 70,  y: 260, width: 460, height: 80, rotation: 0, opacity: 1, color: '#DC2626', fontFamily: 'Outfit', fontSize: 44, fontWeight: '900', textAlign: 'center' },
      { type: 'text', content: 'Make a Wish',     x: 110, y: 360, width: 380, height: 50, rotation: 0, opacity: 1, color: '#F59E0B', fontFamily: 'Inter',  fontSize: 22, fontWeight: '600', textAlign: 'center' },
    ] },
  { id: 'mug-motivational',    name: 'Motivational',      category: 'mug',       thumbnail: '', tags: ['Elegant','Minimal'],
    elements: [
      { type: 'text', content: 'Rise & Shine',      x: 100, y: 280, width: 400, height: 70, rotation: 0, opacity: 1, color: '#064E3B', fontFamily: 'Outfit', fontSize: 40, fontWeight: '900', textAlign: 'center' },
      { type: 'text', content: 'But first, coffee', x: 80,  y: 370, width: 440, height: 50, rotation: 0, opacity: 1, color: '#6B7280', fontFamily: 'Inter',  fontSize: 20, fontWeight: '400', textAlign: 'center' },
    ] },
  { id: 'corp-badge',          name: 'Company Badge',     category: 'corporate', thumbnail: '', tags: ['Professional','Corporate'],
    elements: [
      { type: 'text', content: 'ACME CORP',                x: 90,  y: 240, width: 420, height: 80, rotation: 0, opacity: 1, color: '#1E3A5F', fontFamily: 'Outfit', fontSize: 52, fontWeight: '900', textAlign: 'center' },
      { type: 'text', content: '___________________',      x: 80,  y: 325, width: 440, height: 20, rotation: 0, opacity: 1, color: '#1E3A5F', fontFamily: 'Inter',  fontSize: 12, fontWeight: '400', textAlign: 'center' },
      { type: 'text', content: 'Excellence in every print',x: 100, y: 350, width: 400, height: 45, rotation: 0, opacity: 1, color: '#4B5563', fontFamily: 'Inter',  fontSize: 18, fontWeight: '400', textAlign: 'center' },
    ] },
  { id: 'corp-event',          name: 'Event Badge',       category: 'corporate', thumbnail: '', tags: ['Elegant','Corporate'],
    elements: [
      { type: 'text', content: 'SUMMIT 2025',               x: 80,  y: 220, width: 440, height: 80, rotation: 0, opacity: 1, color: '#064E3B', fontFamily: 'Outfit', fontSize: 50, fontWeight: '900', textAlign: 'center' },
      { type: 'text', content: 'Annual Business Conference', x: 80,  y: 320, width: 440, height: 45, rotation: 0, opacity: 1, color: '#374151', fontFamily: 'Inter',  fontSize: 20, fontWeight: '600', textAlign: 'center' },
      { type: 'text', content: 'Lagos  |  June 2025',       x: 150, y: 385, width: 300, height: 36, rotation: 0, opacity: 1, color: '#9CA3AF', fontFamily: 'Inter',  fontSize: 14, fontWeight: '400', textAlign: 'center' },
    ] },
  { id: 'sticker-fun',         name: 'Bold Sticker',      category: 'sticker',   thumbnail: '', tags: ['Bold','Playful'],
    elements: [
      { type: 'text', content: 'AWESOME', x: 70, y: 290, width: 460, height: 80, rotation: 0, opacity: 1, color: '#F59E0B', fontFamily: 'Outfit', fontSize: 64, fontWeight: '900', textAlign: 'center' },
    ] },
  { id: 'sticker-custom',      name: 'Handmade Label',    category: 'sticker',   thumbnail: '', tags: ['Retro','Handmade'],
    elements: [
      { type: 'text', content: 'HANDMADE',  x: 100, y: 270, width: 400, height: 80, rotation: -5, opacity: 1, color: '#DC2626', fontFamily: 'Outfit',  fontSize: 52, fontWeight: '900', textAlign: 'center' },
      { type: 'text', content: 'with love', x: 150, y: 370, width: 300, height: 45, rotation: 0,  opacity: 1, color: '#374151', fontFamily: 'Georgia', fontSize: 22, fontWeight: '400', textAlign: 'center' },
    ] },
  { id: 'banner-sale',         name: 'Sale Banner',       category: 'banner',    thumbnail: '', tags: ['Bold','Promotional'],
    elements: [
      { type: 'text', content: 'BIG SALE',          x: 80,  y: 210, width: 440, height: 100, rotation: 0, opacity: 1, color: '#DC2626', fontFamily: 'Outfit', fontSize: 72, fontWeight: '900', textAlign: 'center' },
      { type: 'text', content: 'UP TO 50% OFF',     x: 80,  y: 330, width: 440, height: 60,  rotation: 0, opacity: 1, color: '#171717', fontFamily: 'Outfit', fontSize: 36, fontWeight: '700', textAlign: 'center' },
      { type: 'text', content: 'Limited Time Only', x: 130, y: 410, width: 340, height: 40,  rotation: 0, opacity: 1, color: '#6B7280', fontFamily: 'Inter',  fontSize: 18, fontWeight: '400', textAlign: 'center' },
    ] },
  { id: 'banner-grand-opening',name: 'Grand Opening',     category: 'banner',    thumbnail: '', tags: ['Modern','Celebratory'],
    elements: [
      { type: 'text', content: 'GRAND OPENING',          x: 50, y: 220, width: 500, height: 90, rotation: 0, opacity: 1, color: '#064E3B', fontFamily: 'Outfit', fontSize: 52, fontWeight: '900', textAlign: 'center' },
      { type: 'text', content: 'We are finally here!',   x: 80, y: 330, width: 440, height: 55, rotation: 0, opacity: 1, color: '#374151', fontFamily: 'Inter',  fontSize: 26, fontWeight: '400', textAlign: 'center' },
      { type: 'text', content: 'Come celebrate with us', x: 60, y: 405, width: 480, height: 45, rotation: 0, opacity: 1, color: '#F59E0B', fontFamily: 'Inter',  fontSize: 20, fontWeight: '600', textAlign: 'center' },
    ] },
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get('category') || 'all';

  // Try WordPress first
  try {
    const wpUrl = new URL(`${WP_BASE_URL}/buttoninks/v1/design-templates`);
    wpUrl.searchParams.set('category', category);

    const res = await fetch(wpUrl.toString(), {
      next: { revalidate: 300 }, // cache for 5 min
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json() as { templates: DesignTemplate[]; total: number };
      if (Array.isArray(data.templates) && data.templates.length > 0) {
        return NextResponse.json(
          { templates: data.templates, total: data.total, source: 'wp' },
          { headers: { 'Cache-Control': 'public, max-age=300' } }
        );
      }
    }
  } catch {
    // WP unreachable — fall through to hardcoded
  }

  // Fallback: hardcoded templates
  const filtered = category === 'all'
    ? FALLBACK_TEMPLATES
    : FALLBACK_TEMPLATES.filter(t => t.category === category);

  return NextResponse.json(
    { templates: filtered, total: filtered.length, source: 'fallback' },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  );
}
