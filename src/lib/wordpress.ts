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

  if (!username || !password) {
    console.error("Auth Error: Username or Password missing in .env.local");
    return null;
  }

  try {
    const res = await fetch(`${WP_BASE_URL}/jwt-auth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store'
    });

    const data = await res.json();

    if (res.ok && data.token) {
      cachedToken = data.token;
      return cachedToken;
    } else {
      // Log the specific reason from WordPress (e.g. [jwt_auth] Invalid username)
      console.error("WordPress Login Failed:", data.message || "Unknown error");
      throw new Error(data.message || "Invalid WordPress credentials");
    }
  } catch (error: any) {
    console.error("Failed to fetch JWT auth token:", error.message);
    throw error;
  }
}

async function wpFetch<T>(path: string, params?: Record<string, string>, useWooCommerceAuth = false): Promise<T> {
  const url = new URL(`${WP_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  try {
    if (useWooCommerceAuth && process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET) {
      const auth = Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
      headers.Authorization = `Basic ${auth}`;
    } else {
      const token = await getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (authError: any) {
    throw new Error(`Authentication Failed: ${authError.message}`);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let message = `WordPress API error: ${res.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || message;
    } catch (e) {}
    throw new Error(message);
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

// ── Media Uploads (WP REST API) ──────────────────────────────────────────────

export async function uploadMedia(file: File): Promise<{ source_url: string; id: number } | null> {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Could not retrieve security token.");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${WP_BASE_URL}/wp/v2/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      return res.json();
    }

    const errorData = await res.json();
    throw new Error(errorData.message || "File upload rejected by WordPress");
  } catch (error: any) {
    console.error("Media upload error:", error.message);
    throw error;
  }
}

export async function getRecentMedia(perPage = 12): Promise<{ source_url: string; id: number }[]> {
  const token = await getAuthToken();
  if (!token) return [];

  return wpFetch<any[]>("/wp/v2/media", { per_page: String(perPage) }, false);
}
