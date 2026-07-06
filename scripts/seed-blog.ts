/**
 * ButtonInks — Blog Seed Script
 * Run with: npx tsx scripts/seed-blog.ts
 *
 * Creates 3 blog posts in WordPress with Unsplash featured images.
 * Uses Basic Auth (username + application password).
 */

const WP_BASE = 'https://central.buttoninks.com/wp-json';
const WP_USER = process.env.WP_USER         ?? 'timilehin';
const WP_PASS = process.env.WP_APP_PASSWORD ?? '';

const auth = Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64');
const headers = { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' };

// Unsplash images (direct CDN URLs — free to use)
const posts = [
  {
    title: 'How to Choose the Right Fabric for Your Custom Apparel',
    slug:  'how-to-choose-the-right-fabric',
    category: 'Tips & Guides',
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80',
    imageName: 'custom-apparel-fabric.jpg',
    content: `
<p>Choosing the right fabric for your custom apparel order is one of the most important decisions you will make. The wrong choice can affect how your logo looks, how comfortable the garment is to wear, and how long it lasts.</p>

<h2>100% Cotton</h2>
<p>Cotton is the most popular choice for custom t-shirts and casual apparel. It is soft, breathable, and takes screen printing and DTG printing exceptionally well. The downside is that it can shrink in the wash and may not hold up as well in heavy-use environments.</p>

<h2>Polyester Blends</h2>
<p>Polyester blends (e.g. 50/50 cotton-poly) offer the best of both worlds. They are more durable, resistant to shrinking and wrinkles, and hold colour well over repeated washing. These are ideal for workwear and uniform applications.</p>

<h2>Performance Fabrics</h2>
<p>For sports teams, gyms, and active brands, moisture-wicking performance polyester is the right call. These fabrics are designed for movement and sweat management. Sublimation printing works best on 100% polyester.</p>

<h2>Our Recommendation</h2>
<p>For most corporate and event orders, we recommend a 60/40 cotton-poly blend for t-shirts and a 100% polyester option for any activewear or technical apparel. Contact our team and we will help you choose the right material for your order.</p>
    `.trim(),
    excerpt: 'From 100% cotton to performance blends — a practical guide to picking the best fabric for your team uniforms or event merchandise.',
  },
  {
    title: 'The Complete Guide to Corporate Branded Merchandise',
    slug:  'corporate-branding-guide',
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    imageName: 'corporate-branding.jpg',
    content: `
<p>Corporate branded merchandise is one of the most cost-effective ways to increase brand visibility, improve staff morale, and leave a lasting impression at events. Here is how to do it well.</p>

<h2>Start with Your Brand Standards</h2>
<p>Before ordering anything, make sure you have your brand assets ready — your logo in vector format (AI or EPS), your brand colours in CMYK or Pantone codes, and any usage guidelines. Consistent branding across all items is what makes corporate merchandise look professional.</p>

<h2>Choose Products That Reflect Your Brand Values</h2>
<p>Sustainable brands should look at organic cotton apparel and eco-friendly bags. Tech companies often go for premium notebooks, USB drives, and desk accessories. Hospitality and events brands benefit from mugs, water bottles, and wearable items.</p>

<h2>Plan Your Quantities Early</h2>
<p>Bulk pricing tiers kick in at different levels. At ButtonInks, you start seeing significant savings at 50 units, with deeper discounts at 100, 250, and 500+. Order early to get the best price and allow production time.</p>

<h2>Think About Distribution</h2>
<p>Will you be handing items out at an event, shipping to remote team members, or sending them as client gifts? Your distribution method affects packaging requirements. We offer bulk packing, individual fulfilment, and even drop-shipping to your clients.</p>

<h2>Get in Touch</h2>
<p>Our corporate team handles orders of all sizes. Email sales@buttoninks.com with your requirements and we will send a quote within 24 hours.</p>
    `.trim(),
    excerpt: 'How to build a cohesive brand across clothing, bags, mugs, and print materials without blowing your budget.',
  },
  {
    title: 'DTG vs Screen Printing: Which Is Right for Your Order?',
    slug:  'dtg-vs-screen-printing',
    category: 'Print Tech',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    imageName: 'print-methods.jpg',
    content: `
<p>When it comes to custom apparel decoration, two methods dominate the industry: Direct-to-Garment (DTG) printing and traditional screen printing. Each has strengths and ideal use cases. Here is what you need to know.</p>

<h2>What is Screen Printing?</h2>
<p>Screen printing uses a mesh screen to transfer ink directly onto the fabric, one colour at a time. It produces vibrant, durable prints that hold up exceptionally well over hundreds of washes. It is the industry standard for large-volume, simple-design orders.</p>

<p><strong>Best for:</strong> High-quantity orders (50+), designs with 1–4 solid colours, workwear, events, uniforms.</p>
<p><strong>Not ideal for:</strong> Small runs, photographic designs, or orders requiring many colour variations.</p>

<h2>What is DTG Printing?</h2>
<p>Direct-to-Garment printing works like a large inkjet printer that prints directly onto the fabric. It can reproduce full-colour photographic images with fine detail, and requires no screen setup — making it ideal for small runs and complex artwork.</p>

<p><strong>Best for:</strong> Small quantities (1–49), full-colour or photographic designs, personalised items.</p>
<p><strong>Not ideal for:</strong> Dark fabrics with light-coloured designs (pre-treatment required) or very high volume orders.</p>

<h2>Cost Comparison</h2>
<p>Screen printing has a higher setup cost (screen creation) but a lower per-unit cost at volume. DTG has no setup cost but a higher per-unit price, making it ideal for small or one-off orders.</p>

<h2>Our Recommendation</h2>
<p>For orders under 30 pieces with a complex design, go DTG. For 50+ pieces with a bold 1–4 colour logo, screen printing delivers the best value. Not sure? Our team will review your artwork and recommend the best method for your specific project.</p>
    `.trim(),
    excerpt: 'A side-by-side comparison of two popular decoration methods — costs, quality, minimums, and ideal use cases.',
  },
];

async function uploadImage(imageUrl: string, filename: string): Promise<number | null> {
  console.log(`  Downloading image: ${filename}`);
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) { console.error(`  Failed to download image`); return null; }
  const blob = await imgRes.arrayBuffer();

  console.log(`  Uploading to WordPress media library…`);
  const uploadRes = await fetch(`${WP_BASE}/wp/v2/media`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type':        'image/jpeg',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    body: blob,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error(`  Media upload failed: ${err}`);
    return null;
  }

  const media = await uploadRes.json() as { id: number };
  console.log(`  Media uploaded — ID: ${media.id}`);
  return media.id;
}

async function getOrCreateCategory(name: string): Promise<number | null> {
  // Check if category exists
  const searchRes = await fetch(`${WP_BASE}/wp/v2/categories?search=${encodeURIComponent(name)}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (searchRes.ok) {
    const cats = await searchRes.json() as Array<{ id: number; name: string }>;
    const existing = cats.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;
  }

  // Create it
  const createRes = await fetch(`${WP_BASE}/wp/v2/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name }),
  });
  if (!createRes.ok) { console.error(`  Failed to create category: ${name}`); return null; }
  const cat = await createRes.json() as { id: number };
  return cat.id;
}

async function postExists(slug: string): Promise<boolean> {
  const res = await fetch(`${WP_BASE}/wp/v2/posts?slug=${slug}&status=any`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) return false;
  const posts = await res.json() as unknown[];
  return posts.length > 0;
}

async function seed() {
  console.log('🌱 ButtonInks Blog Seed Script\n');

  for (const post of posts) {
    console.log(`\n📝 Creating: "${post.title}"`);

    // Skip if already exists
    if (await postExists(post.slug)) {
      console.log(`  ⏭  Post already exists — skipping`);
      continue;
    }

    // Upload featured image
    const mediaId = await uploadImage(post.imageUrl, post.imageName);

    // Get or create category
    const catId = await getOrCreateCategory(post.category);

    // Create post
    const body: Record<string, unknown> = {
      title:   post.title,
      slug:    post.slug,
      content: post.content,
      excerpt: post.excerpt,
      status:  'publish',
    };
    if (mediaId) body.featured_media = mediaId;
    if (catId)   body.categories     = [catId];

    const createRes = await fetch(`${WP_BASE}/wp/v2/posts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error(`  ❌ Failed to create post: ${err}`);
      continue;
    }

    const created = await createRes.json() as { id: number; link: string };
    console.log(`  ✅ Created — ID: ${created.id} | URL: ${created.link}`);
  }

  console.log('\n✨ Seed complete! Visit https://central.buttoninks.com/blog to verify.');
}

seed().catch(console.error);
