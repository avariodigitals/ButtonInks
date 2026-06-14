/**
 * ButtonInks Product Reorganization Tool
 *
 * This script checks existing products and moves them to the newly created
 * 2-tier category hierarchy based on keywords in their names.
 *
 * Usage: node scripts/reorganize-products.js [--execute]
 */

const fs = require('fs');
const path = require('path');

const IS_DRY_RUN = !process.argv.includes('--execute');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const CONSUMER_KEY = env.WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = env.WOOCOMMERCE_CONSUMER_SECRET;
const API_URL_BASE = (env.NEXT_PUBLIC_WP_API_URL || 'https://buttoninks.com/wp-json').replace(/\/$/, '') + '/wc/v3';
const AUTH_HEADER = 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

const KEYWORD_MAP = [
  { keywords: ['polo'], parent: 'Embroidery & Uniforms', child: 'Polo Shirts' },
  { keywords: ['cap', 'hat'], parent: 'Embroidery & Uniforms', child: 'Caps & Headwear' },
  { keywords: ['hoodie', 'sweatshirt'], parent: 'Apparel & Outerwear', child: 'Hoodies' },
  { keywords: ['tshirt', 'tee', 't-shirt', 'vshirt'], parent: 'Custom T-Shirts', child: 'Cotton Tees' },
  { keywords: ['mug', 'cup'], parent: 'Drinkware & Mugs', child: 'Photo & Ceramic Mugs' },
  { keywords: ['totte', 'tote', 'bag'], parent: 'Bags & Carrying', child: 'Tote Bags' },
];

async function run() {
  console.log('--- ButtonInks Product Reorganization ---');
  if (IS_DRY_RUN) console.log('MODE: [DRY RUN]\n');
  else console.log('MODE: [LIVE UPDATE]\n');

  try {
    // 1. Get all categories with their IDs
    const catRes = await fetch(`${API_URL_BASE}/products/categories?per_page=100`, { headers: { Authorization: AUTH_HEADER } });
    const allCats = await catRes.json();

    const normalize = (str) => str.toLowerCase().replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

    const getCatId = (name) => {
      const found = allCats.find(c => normalize(c.name) === normalize(name));
      return found ? found.id : null;
    };

    // 2. Get all products
    const prodRes = await fetch(`${API_URL_BASE}/products?per_page=100`, { headers: { Authorization: AUTH_HEADER } });
    const products = await prodRes.json();

    console.log(`Checking ${products.length} products...\n`);

    for (const prod of products) {
      const name = prod.name.toLowerCase();
      let targetParent = null;
      let targetChild = null;

      // Find the best match
      for (const rule of KEYWORD_MAP) {
        if (rule.keywords.some(k => name.includes(k))) {
          targetParent = rule.parent;
          targetChild = rule.child;
          break;
        }
      }

      if (targetParent && targetChild) {
        const parentId = getCatId(targetParent);
        const childId = getCatId(targetChild);

        if (!parentId || !childId) {
          console.log(`  [Issue] Could not find ID for ${targetParent} or ${targetChild}`);
          continue;
        }

        const currentIds = prod.categories.map(c => c.id);
        const isCorrect = currentIds.includes(parentId) && currentIds.includes(childId) && currentIds.length === 2;

        if (isCorrect) {
          console.log(`  [OK] "${prod.name}" is already in the correct categories.`);
        } else {
          console.log(`  [Move] "${prod.name}" -> ${targetParent} > ${targetChild}`);
          if (!IS_DRY_RUN) {
            await fetch(`${API_URL_BASE}/products/${prod.id}`, {
              method: 'PUT',
              headers: { Authorization: AUTH_HEADER, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                categories: [{ id: parentId }, { id: childId }]
              })
            });
            console.log(`    Updated successfully.`);
          }
        }
      } else {
        console.log(`  [Skip] No clear match for "${prod.name}" (Current: ${prod.categories.map(c => c.name).join(', ')})`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n--- Reorganization Check Complete ---');
  if (IS_DRY_RUN) console.log('Run with --execute to apply changes.');
}

run();
