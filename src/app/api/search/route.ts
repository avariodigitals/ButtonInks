import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getPosts, WP_BASE_URL } from '@/lib/wordpress';

// ── Static site pages that are always searchable ──────────────────────────────
const SITE_PAGES = [
  { title: 'Design Studio',      href: '/design',     type: 'page', excerpt: 'Create your own custom design with our free online design tool.' },
  { title: 'Upload Your Design', href: '/upload',     type: 'page', excerpt: 'Already have a design? Upload your artwork and we will print it.' },
  { title: 'All Categories',     href: '/categories', type: 'page', excerpt: 'Browse all our product categories.' },
  { title: 'My Cart',            href: '/cart',       type: 'page', excerpt: 'View items in your shopping cart.' },
  { title: 'My Account',         href: '/account',    type: 'page', excerpt: 'Manage your ButtonInks account.' },
  { title: 'Wishlist',           href: '/wishlist',   type: 'page', excerpt: 'Your saved items wishlist.' },
  // Category pages
  { title: 'Embroidery & Uniforms', href: '/categories?category=embroidery-uniforms', type: 'category', excerpt: 'Custom embroidery on polos, caps, jackets and more.' },
  { title: 'Custom T-Shirts',    href: '/categories?category=custom-t-shirts', type: 'category', excerpt: 'Premium full-color custom printed t-shirts.' },
  { title: 'Drinkware & Mugs',   href: '/categories?category=drinkware-mugs',  type: 'category', excerpt: 'Custom printed mugs and drinkware.' },
  { title: 'Bags & Carrying',    href: '/categories?category=bags-carrying',   type: 'category', excerpt: 'Custom tote bags, backpacks and more.' },
  { title: 'Photo Prints & Art', href: '/categories?category=photo-prints-art',type: 'category', excerpt: 'Canvas prints, photo posters and wall art.' },
  { title: 'Marketing Prints',   href: '/categories?category=marketing-prints',type: 'category', excerpt: 'Business cards, flyers, banners and brochures.' },
  { title: 'Corporate Gifts',    href: '/categories?category=corporate-gifts', type: 'category', excerpt: 'Branded corporate gift sets for teams and clients.' },
  { title: 'Stickers & Labels',  href: '/categories?category=stickers-labels', type: 'category', excerpt: 'Die-cut stickers, roll labels and more.' },
];

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], posts: [], pages: [] });
  }

  const lq = q.toLowerCase();

  try {
    // Run all searches in parallel
    const [products, posts] = await Promise.allSettled([
      getProducts(1, 8, { search: q, status: 'publish' }),
      getPosts(1, 5).catch(() => []),
    ]);

    // Products
    const productResults = (products.status === 'fulfilled' ? products.value : [])
      .map(p => ({
        id:      p.id,
        title:   p.name,
        href:    `/products/${p.categories?.[0]?.slug ?? 'all'}/${p.slug}`,
        image:   p.images?.[0]?.src ?? null,
        price:   p.price ? `$${parseFloat(p.price).toFixed(2)}` : null,
        type:    'product' as const,
      }));

    // Blog posts filtered client-side (WP search is broad enough)
    const allPosts = posts.status === 'fulfilled' ? posts.value : [];
    const postResults = allPosts
      .filter(p =>
        p.title.rendered.toLowerCase().includes(lq) ||
        p.excerpt.rendered.toLowerCase().includes(lq)
      )
      .slice(0, 4)
      .map(p => ({
        id:      p.id,
        title:   p.title.rendered.replace(/<[^>]+>/g, ''),
        href:    `/blog/${p.slug}`,
        excerpt: p.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 100),
        image:   p._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null,
        type:    'post' as const,
      }));

    // Static pages / categories — match against title + excerpt
    const pageResults = SITE_PAGES
      .filter(pg =>
        pg.title.toLowerCase().includes(lq) ||
        pg.excerpt.toLowerCase().includes(lq)
      )
      .slice(0, 4)
      .map(pg => ({ ...pg, type: pg.type as 'page' | 'category' }));

    return NextResponse.json({ products: productResults, posts: postResults, pages: pageResults });
  } catch (err: any) {
    console.error('Search API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
