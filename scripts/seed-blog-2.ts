/**
 * ButtonInks — Blog Seed Script #2
 * Run with:
 *   $env:WP_APP_PASSWORD="dmzz P1jh kly5 hIKF LjIS u9Fg"; npx --yes tsx scripts/seed-blog-2.ts
 *
 * Creates 4 SEO-focused blog posts in WordPress with Unsplash featured images.
 * Skips posts that already exist (checked by slug).
 */

const WP_BASE = 'https://central.buttoninks.com/wp-json';
const WP_USER = 'timilehin';
const WP_PASS = process.env.WP_APP_PASSWORD ?? 'dmzz P1jh kly5 hIKF LjIS u9Fg';

const auth = Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64');
const headers = { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' };

// ── Posts ─────────────────────────────────────────────────────────────────────

const posts = [
  {
    title: '5 Benefits of Custom Embroidery for Business Uniforms',
    slug:  'benefits-of-custom-embroidery',
    category: 'Embroidery',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80',
    imageName: 'embroidery-uniforms.jpg',
    excerpt: 'Custom embroidery adds a premium, professional look to any uniform. Here is why businesses across Texas choose embroidery over print.',
    content: `
<p>When it comes to outfitting your team, the decoration method matters as much as the garment itself. Custom embroidery has long been the go-to choice for businesses that want to project a polished, professional image — and for good reason.</p>

<h2>1. Durability That Outlasts Print</h2>
<p>Embroidery is stitched directly into the fabric using thread, which means it will not crack, peel, or fade the way heat transfers and screen prints can. A well-embroidered logo can outlast the garment itself. For workwear that gets washed dozens of times a year, this is a critical advantage.</p>

<h2>2. A Premium, Professional Look</h2>
<p>There is no denying the premium feel of an embroidered logo. The raised texture and clean lines give your brand identity a three-dimensional quality that flat printing simply cannot replicate. Whether you are outfitting a hospitality team, a corporate office, or a trade crew, embroidery instantly elevates the perceived value of your uniform.</p>

<h2>3. Brand Consistency Across Your Team</h2>
<p>Embroidery files (called DST or EMB digitised files) produce the same result every single time. Once your logo is digitised, every polo shirt, jacket, or cap will carry an identical representation of your brand — no colour drift, no registration errors, no variation between batches.</p>

<h2>4. Works on Almost Any Fabric</h2>
<p>From heavyweight fleece and cotton twill to performance polos and caps, embroidery adheres beautifully to a wide range of materials. Unlike some print methods that require specific fabric compositions, embroidery is versatile enough to work across your entire uniform range without compromise.</p>

<h2>5. Cost-Effective at Scale</h2>
<p>While the setup cost (digitisation fee) is a one-time investment, the per-unit cost of embroidery drops significantly as quantities increase. For businesses ordering 50 or more pieces, embroidery becomes highly competitive — especially when you factor in the longevity of the decoration over the garment's lifetime.</p>

<p>At <strong>ButtonInks</strong>, we offer professional embroidery services for businesses of all sizes across Texas. Our in-house digitising team ensures your logo looks sharp on every stitch. <a href="/categories">Browse our embroidery products</a> or contact us today to request a quote.</p>
    `.trim(),
  },
  {
    title: 'How to Design a Logo for Custom Printing: A Beginner\'s Guide',
    slug:  'how-to-design-a-logo-for-custom-printing',
    category: 'Design Tips',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&q=80',
    imageName: 'logo-design-printing.jpg',
    excerpt: 'Getting your logo print-ready is easier than you think. Here is what you need to know before placing your first custom print order.',
    content: `
<p>One of the most common reasons custom print orders get delayed is artwork issues. Logos that look great on a screen can fall apart at print size if they were not designed with print in mind from the start. Here is what you need to know.</p>

<h2>Start with a Vector File</h2>
<p>Vector files (AI, EPS, SVG) use mathematical paths rather than pixels, which means they can be scaled to any size without losing quality. Whether your logo ends up on a business card or a 10-foot banner, a vector file will remain crisp and clean. If you only have a JPEG or PNG, we can trace it — but starting with vector is always preferable.</p>

<h2>Keep It Simple</h2>
<p>Intricate logos with fine gradients, thin strokes, or tiny text often do not translate well to screen printing or embroidery. Aim for designs with solid, distinct colour areas and clear, legible type. A simpler logo reproduces more reliably and looks stronger at scale.</p>

<h2>Mind Your Colours</h2>
<p>Screen printing uses spot colours (typically Pantone references), while digital printing uses CMYK. What looks vibrant on your monitor (RGB) may appear different in print. When briefing your designer, specify Pantone codes for any colour-critical brand elements. Avoid gradients and drop shadows in screen print designs.</p>

<h2>Test Before You Print</h2>
<p>Before approving a large order, always request a printed proof or sample. A physical proof reveals issues that digital mockups miss — colour accuracy, print placement, readability at size. At ButtonInks, we offer pre-production proofs on all significant orders.</p>

<h2>Work with a Professional Designer</h2>
<p>If you are starting from scratch, working with a professional graphic designer is a worthwhile investment. A well-designed logo built for print will save you money on reprints and corrections down the line.</p>

<p>The <strong>ButtonInks design team</strong> can help you create or adapt your logo for any print application. <a href="/categories">Explore our products</a> and get in touch to discuss your project. We are here to make sure your brand looks its best from the very first print.</p>
    `.trim(),
  },
  {
    title: 'Custom Mugs for Your Business: Everything You Need to Know',
    slug:  'custom-mugs-for-business',
    category: 'Drinkware',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&q=80',
    imageName: 'custom-mugs-business.jpg',
    excerpt: 'From corporate gifts to promotional giveaways, custom mugs are one of the most versatile branded merchandise items you can order.',
    content: `
<p>Custom mugs are one of the most popular branded merchandise items for a reason: they are practical, long-lasting, and used every single day. Whether you are looking for corporate gifts, trade show giveaways, or merchandise to sell, custom mugs deliver excellent brand exposure at a reasonable cost.</p>

<h2>Why Custom Mugs Work</h2>
<p>The average person uses a mug multiple times per day. That means every coffee or tea break is a brand impression — in the office, at home, or on a desk visible to clients and colleagues. Unlike flyers or pens, a quality mug is something people actually keep, which extends your brand's reach over months or years.</p>

<h2>Choosing the Right Mug Style</h2>
<p>Not all mugs are created equal. The most common options are ceramic 11oz and 15oz mugs for general use, enamel mugs for a vintage or outdoor aesthetic, and travel mugs or insulated tumblers for on-the-go branding. Each style suits different audiences and occasions — a ceramic mug works well for office settings, while a stainless travel tumbler is ideal for active or outdoor-facing brands.</p>

<h2>Design Tips for Mug Printing</h2>
<p>Mugs are typically printed using sublimation (full-wrap, full-colour) or screen printing (spot colour, one side). For sublimation, your design should be provided in high-resolution at the correct dimensions for the mug. For screen printing, keep your logo to 2–3 spot colours for the best result. Always account for the handle position when planning your design layout.</p>

<h2>Minimum Order Quantities</h2>
<p>Most custom mug printing starts at 12–24 units, depending on the decoration method. Sublimation mugs can often be done in very small quantities, while screen-printed mugs typically have a higher minimum due to setup costs.</p>

<h2>Bulk Pricing</h2>
<p>Ordering in bulk is where custom mugs truly shine on a cost-per-unit basis. At ButtonInks, pricing tiers kick in at 24, 48, 100, and 250 units, with significant savings at each level. Bulk orders also make it easier to distribute across a large team or event.</p>

<p>Ready to order? <strong>ButtonInks</strong> offers custom mug printing with fast turnaround and competitive bulk pricing. <a href="/categories">Browse our drinkware range</a> or get in touch for a custom quote today.</p>
    `.trim(),
  },
  {
    title: 'Banner Printing 101: Roll-Up, Feather, and Table Banners Explained',
    slug:  'banner-printing-guide',
    category: 'Banners',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    imageName: 'banner-printing.jpg',
    excerpt: 'Not sure which banner type is right for your event or business? This guide breaks down the most popular options and when to use each.',
    content: `
<p>Banners are one of the most effective and affordable tools for promoting your business at events, trade shows, retail spaces, and outdoor locations. But with so many types available, choosing the right format can feel overwhelming. This guide breaks down the most popular banner options and when to use each one.</p>

<h2>Roll-Up Banners</h2>
<p>Also known as retractable banners or pull-up banners, roll-up banners are the workhorse of the events industry. The printed graphic rolls into a base unit for transport and pops up in seconds for display. They are lightweight, portable, and perfect for trade show booths, reception areas, conferences, and point-of-sale displays. Standard sizes are 800mm x 2000mm and 1000mm x 2000mm.</p>

<h2>Feather/Teardrop Banners</h2>
<p>Feather and teardrop banners are flying banners mounted on a flexible fibreglass pole. Their distinctive shape catches the eye and holds up well in outdoor conditions, making them ideal for car dealerships, outdoor events, shop fronts, and sports days. They are available in single-sided and double-sided print options and typically include a ground stake or cross base.</p>

<h2>Table Banners</h2>
<p>Table banners (or table-top roll-ups) are compact versions of the standard roll-up, designed to sit on a counter or exhibition table. They are great for smaller display areas, retail counters, or alongside product displays. Typical heights range from 600mm to 800mm.</p>

<h2>Pop-Up Display Banners</h2>
<p>Pop-up displays create an instant branded backdrop — perfect for photo opportunities, stage backdrops, and large exhibition stands. They consist of a collapsible frame with a fabric or graphic panel that attaches via magnetic bars or hooks. They fold down into a carry case for easy transport.</p>

<h2>Choosing the Right Banner for Your Event</h2>
<p>Match the banner type to your environment. Indoors and tight on space? A table banner or roll-up is ideal. Outdoors or needing maximum visibility? Go for feather banners. Need a large branded backdrop? A pop-up display is your best option. Consider weight, setup time, and reusability when making your choice.</p>

<p><strong>ButtonInks</strong> prints and supplies all types of banners with fast turnaround and free design checks on every order. <a href="/categories">Browse our banner range</a> or contact our team to get started on your next event.</p>
    `.trim(),
  },
];

// ── Utilities ─────────────────────────────────────────────────────────────────

async function uploadImage(imageUrl: string, filename: string): Promise<number | null> {
  console.log(`  📥 Downloading image: ${filename}`);
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    console.error(`  ❌ Failed to download image from ${imageUrl}`);
    return null;
  }
  const blob = await imgRes.arrayBuffer();

  console.log(`  ⬆️  Uploading to WordPress media library…`);
  const uploadRes = await fetch(`${WP_BASE}/wp/v2/media`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    body: blob,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error(`  ❌ Media upload failed: ${err}`);
    return null;
  }

  const media = await uploadRes.json() as { id: number };
  console.log(`  ✅ Media uploaded — ID: ${media.id}`);
  return media.id;
}

async function getOrCreateCategory(name: string): Promise<number | null> {
  // Check if category already exists
  const searchRes = await fetch(
    `${WP_BASE}/wp/v2/categories?search=${encodeURIComponent(name)}`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  if (searchRes.ok) {
    const cats = await searchRes.json() as Array<{ id: number; name: string }>;
    const existing = cats.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      console.log(`  📂 Category "${name}" found — ID: ${existing.id}`);
      return existing.id;
    }
  }

  // Create it
  console.log(`  📂 Creating category "${name}"…`);
  const createRes = await fetch(`${WP_BASE}/wp/v2/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name }),
  });
  if (!createRes.ok) {
    console.error(`  ❌ Failed to create category: ${name}`);
    return null;
  }
  const cat = await createRes.json() as { id: number };
  console.log(`  ✅ Category created — ID: ${cat.id}`);
  return cat.id;
}

async function postExists(slug: string): Promise<boolean> {
  const res = await fetch(`${WP_BASE}/wp/v2/posts?slug=${slug}&status=any`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) return false;
  const existing = await res.json() as unknown[];
  return existing.length > 0;
}

// ── Seed ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 ButtonInks Blog Seed Script #2\n');
  console.log(`🔗 Target: ${WP_BASE}`);
  console.log(`👤 User: ${WP_USER}\n`);

  let created = 0;
  let skipped = 0;

  for (const post of posts) {
    console.log(`\n📝 Processing: "${post.title}"`);

    // Skip if already exists
    if (await postExists(post.slug)) {
      console.log(`  ⏭️  Post already exists (slug: ${post.slug}) — skipping`);
      skipped++;
      continue;
    }

    // Upload featured image
    const mediaId = await uploadImage(post.imageUrl, post.imageName);

    // Get or create category
    const catId = await getOrCreateCategory(post.category);

    // Build post body
    const body: Record<string, unknown> = {
      title:   post.title,
      slug:    post.slug,
      content: post.content,
      excerpt: post.excerpt,
      status:  'publish',
    };
    if (mediaId) body.featured_media = mediaId;
    if (catId)   body.categories     = [catId];

    // Create the post
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

    const createdPost = await createRes.json() as { id: number; link: string };
    console.log(`  ✅ Post created — ID: ${createdPost.id} | URL: ${createdPost.link}`);
    created++;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✨ Seed complete! Created: ${created} | Skipped: ${skipped}`);
  console.log(`🌐 Visit https://central.buttoninks.com/wp-admin to verify.\n`);
}

seed().catch(console.error);
