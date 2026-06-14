/**
 * ButtonInks Category Sync Tool
 *
 * This script organizes your product catalog into a logical 2-tier hierarchy
 * and uploads them to WooCommerce using the REST API.
 *
 * Usage: node scripts/sync-categories.js [--execute]
 */

const fs = require('fs');
const path = require('path');

// ── CONFIGURATION ────────────────────────────────────────────────────────────

const IS_DRY_RUN = !process.argv.includes('--execute');

// Parse .env.local manually to avoid dependencies
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const CONSUMER_KEY = env.WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = env.WOOCOMMERCE_CONSUMER_SECRET;
const API_URL = (env.NEXT_PUBLIC_WP_API_URL || 'https://buttoninks.com/wp-json').replace(/\/$/, '') + '/wc/v3/products/categories';

if (!CONSUMER_KEY || !CONSUMER_SECRET) {
  console.error('Error: WooCommerce keys not found in .env.local');
  process.exit(1);
}

const AUTH_HEADER = 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

// ── CATEGORY HIERARCHY ───────────────────────────────────────────────────────

const CATEGORY_MAP = [
  {
    name: "Embroidery & Uniforms",
    children: ["Polo Shirts", "Caps & Headwear", "Uniform Sets", "Hoodies & Layering", "Embroidered Bags"]
  },
  {
    name: "Custom T-Shirts",
    children: ["Cotton Tees", "Crew Neck & Sweatshirts", "Performance & Activewear", "V-Neck Shirts", "Pocket Tees"]
  },
  {
    name: "Drinkware & Mugs",
    children: ["Photo & Ceramic Mugs", "Travel Mugs & Tumblers", "Funny & Novelty Mugs", "Corporate Drinkware", "Color Changing Mugs"]
  },
  {
    name: "Bags & Carrying",
    children: ["Tote Bags", "Backpacks", "Drawstring & Gym Bags", "Messenger & Laptop Bags", "Eco-Friendly Bags"]
  },
  {
    name: "Photo Prints & Art",
    children: ["Framed Prints", "Canvas Gallery Wraps", "Personalized Calendars"]
  },
  {
    name: "Apparel & Outerwear",
    children: ["Sweatshirts", "Zipper Hoodies", "Athletic Jerseys", "Aprons", "Sweaters & Vests"]
  },
  {
    name: "Event & Tradeshow",
    children: ["Banners & Displays", "Table Covers", "Lanyards & Badges", "Pop-Up Stands"]
  },
  {
    name: "Marketing Prints",
    children: ["Business Cards", "Brochures & Flyers", "Postcards", "Presentation Folders"]
  },
  {
    name: "Corporate Gifts",
    children: ["Notebooks & Journals", "Pen Sets", "Desk Organizers", "USB & Tech Accessories", "Power Banks"]
  },
  {
    name: "Signs & Vehicle Branding",
    children: ["Door Magnets", "Window Decals", "Full Car Wraps", "Bumper Stickers"]
  },
  {
    name: "Stickers & Labels",
    children: ["Die-Cut Stickers", "Holographic Stickers", "Sticker Packs"]
  },
  {
    name: "Back to School",
    children: ["School Backpacks", "Pencil Cases", "Stationary & Notebooks", "Lunch Boxes"]
  }
];

// ── SYNC LOGIC ───────────────────────────────────────────────────────────────

async function sync() {
  console.log('--- ButtonInks Category Sync ---');
  if (IS_DRY_RUN) {
    console.log('MODE: [DRY RUN] (No changes will be made. Use --execute to upload)');
  } else {
    console.log('MODE: [LIVE UPLOAD]');
  }
  console.log('--------------------------------\n');

  for (const parent of CATEGORY_MAP) {
    let parentId = 0;

    // 1. Create or Find Parent
    console.log(`Parent Category: ${parent.name}`);
    if (!IS_DRY_RUN) {
      parentId = await upsertCategory(parent.name, 0);
    } else {
      console.log(`  [Dry Run] Would create/verify parent: ${parent.name}`);
    }

    // 2. Create Children
    for (const childName of parent.children) {
      if (!IS_DRY_RUN) {
        await upsertCategory(childName, parentId);
        console.log(`  Created child: ${childName}`);
      } else {
        console.log(`  [Dry Run] Would create child: ${childName} under ${parent.name}`);
      }
    }
    console.log('');
  }

  console.log('\n--- Sync Complete ---');
  if (IS_DRY_RUN) {
    console.log('Run "node scripts/sync-categories.js --execute" to perform the actual upload.');
  }
}

/**
 * Creates a category if it doesn't exist, or returns the ID of the existing one.
 * If it exists, it ensures the parent is correctly linked (updates if necessary).
 */
async function upsertCategory(name, parent = 0) {
  try {
    // 1. Fetch ALL categories to ensure we find the exact match regardless of pagination
    // (For smaller catalogs, a search query is efficient)
    const searchRes = await fetch(`${API_URL}?search=${encodeURIComponent(name)}`, {
      headers: { 'Authorization': AUTH_HEADER }
    });

    if (!searchRes.ok) {
      throw new Error(`API returned ${searchRes.status}`);
    }

    const results = await searchRes.json();

    // 2. Find exact name match (case-insensitive)
    const existing = results.find(c => c.name.toLowerCase() === name.toLowerCase());

    if (existing) {
      // 3. If it exists but has the wrong parent, update it
      if (existing.parent !== parent) {
        console.log(`  [Update] Category "${name}" exists but parent is wrong. Fixing...`);
        const updateRes = await fetch(`${API_URL}/${existing.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': AUTH_HEADER,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ parent })
        });
        const updated = await updateRes.json();
        return updated.id;
      }

      console.log(`  [Existing] Found category: ${name}`);
      return existing.id;
    }

    // 4. Create new if not found
    console.log(`  [New] Creating category: ${name}`);
    const createRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_HEADER,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, parent })
    });

    if (!createRes.ok) {
      const errData = await createRes.json();
      throw new Error(errData.message || 'Creation failed');
    }

    const created = await createRes.json();
    return created.id;
  } catch (error) {
    console.error(`  [Error] Failed to sync "${name}":`, error.message);
    return 0;
  }
}

sync();
