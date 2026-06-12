/**
 * ButtonInks – WordPress & WooCommerce REST API client
 */

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_API_URL || "https://buttoninks.com/wp-json";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: [{ source_url: string; alt_text: string }];
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

export interface WPProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WPProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WPProduct {
  id: number;
  slug: string;
  name: string;
  type: string;
  status: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  price_html: string;
  on_sale: boolean;
  images: WPProductImage[];
  categories: { id: number; name: string; slug: string }[];
  attributes: WPProductAttribute[];
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  stock_status: string;
  menu_order: number;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: { src: string } | null;
  menu_order: number;
  count: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let cachedToken: string | null = null;

async function getAuthToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;

  const username = process.env.WORDPRESS_AUTH_USERNAME;
  const password = process.env.WORDPRESS_AUTH_PASSWORD;

  if (!username || !password) return null;

  try {
    const res = await fetch(`${WP_BASE_URL}/jwt-auth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      cachedToken = data.token;
      return cachedToken;
    }
  } catch (error) {
    console.error("Failed to fetch JWT auth token:", error);
  }
  return null;
}

async function wpFetch<T>(path: string, params?: Record<string, string>, useWooCommerceAuth = false): Promise<T> {
  const url = new URL(`${WP_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  // Use WooCommerce Consumer Key/Secret if path is for WC and keys are present
  if (useWooCommerceAuth && process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET) {
    const auth = Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
    headers.Authorization = `Basic ${auth}`;
  } else {
    // Fallback to JWT for general WP endpoints or if WC keys are missing
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // Cache for 1 hour
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`WP API Error: ${res.status} ${url}`, errorBody);
    throw new Error(`WordPress API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Posts (Blog) ──────────────────────────────────────────────────────────────

export async function getPosts(page = 1, perPage = 10): Promise<WPPost[]> {
  return wpFetch<WPPost[]>("/wp/v2/posts", {
    page: String(page),
    per_page: String(perPage),
    _embed: "1",
  });
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>("/wp/v2/posts", { slug, _embed: "1" });
  return posts[0] ?? null;
}

// ── Products (WooCommerce REST API v3) ───────────────────────────────────────

export async function getProducts(
  page = 1,
  perPage = 20,
  category?: number
): Promise<WPProduct[]> {
  const params: Record<string, string> = {
    page: String(page),
    per_page: String(perPage),
  };
  if (category) params.category = String(category);

  return wpFetch<WPProduct[]>("/wc/v3/products", params, true);
}

export async function getProductBySlug(slug: string): Promise<WPProduct | null> {
  const products = await wpFetch<WPProduct[]>("/wc/v3/products", { slug }, true);
  return products[0] ?? null;
}

export async function getProductById(id: number): Promise<WPProduct | null> {
  return wpFetch<WPProduct>(`/wc/v3/products/${id}`, undefined, true);
}

export async function getProductCategories(): Promise<WPCategory[]> {
  return wpFetch<WPCategory[]>("/wc/v3/products/categories", { per_page: "100" }, true);
}
