/**
 * ButtonInks – WordPress & WooCommerce REST API client
 */

export const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://central.buttoninks.com";
export const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_API_URL || `${WP_URL}/wp-json`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  modified?: string;
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
  acf?: {
    enable_designer?:    boolean;      // Design Your Own — opens designer tool
    enable_upload?:      boolean;      // Upload Design — customer uploads artwork
    buy_as_is?:          boolean;      // Retail / no customisation
    available_colors?:   string[];     // Deprecated — use WC Color attribute
    print_style?:        string;       // Decoration method e.g. 'embroidery' | 'dtg' | 'screen_printing'
    product_type?:       string;       // 'clothing' | 'paper' | 'stationery' | ''
    clothing_specs?: {
      fabric?: string;
      fit?: string;
      gender?: string;
    };
    paper_specs?: {
      stock?: string;
      corners?: string;
      orientation?: string;
      thickness?: string;
      perforated?: string;
    };
    stationery_specs?: {
      subtype?: string;
      pen_material?: string;
      banner_material?: string;
    };
    print_notes?:        string;       // Artwork / print guidelines
    bulk_pricing?: {
      min_qty:        number;
      pct?:           number;          // discount % (new)
      discount_price: string;
    }[];
    production_options?: {
      type:          'regular' | 'urgent';
      extra_cost:    string;
      delivery_days: string;
    }[];
    download_templates?: {
      url:   string;                   // Direct download URL
      label: string;                   // Format: 'PDF' | 'AI' | 'PSD' | 'EPS' | 'PNG' | 'SVG'
    }[];
    design_fee?: number;               // Flat personalisation fee per unit (£/$ added on top of base price)
  };
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

/**
 * Decodes basic HTML entities like &amp; to &
 */
export function decodeHTMLEntities(text: string): string {
  if (!text) return '';
  // Keep decoding until there are no more entities (handles double-encoding like &amp;amp;)
  let decoded = text;
  let previous = '';
  while (decoded !== previous) {
    previous = decoded;
    decoded = decoded
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }
  return decoded;
}

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
  } catch (error: unknown) {
    console.error("Failed to fetch JWT auth token:", (error as Error).message);
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
  } catch (authError: unknown) {
    throw new Error(`Authentication Failed: ${(authError as Error).message}`);
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
    } catch { }
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
  params?: Record<string, string>
): Promise<WPProduct[]> {
  const queryParams: Record<string, string> = {
    page: String(page),
    per_page: String(perPage),
    ...params,
  };

  return wpFetch<WPProduct[]>("/wc/v3/products", queryParams, true);
}

export async function getProductBySlug(slug: string): Promise<WPProduct | null> {
  const products = await wpFetch<WPProduct[]>("/wc/v3/products", { slug }, true);
  return products[0] ?? null;
}

export async function getProductById(id: number): Promise<WPProduct | null> {
  return wpFetch<WPProduct>(`/wc/v3/products/${id}`, undefined, true);
}

export interface WCAttribute {
  id:   number;
  name: string;
  slug: string;
  type: string;
  order_by: string;
  has_archives: boolean;
}

export interface WCAttributeTerm {
  id:          number;
  name:        string;
  slug:        string;
  description: string;
  menu_order:  number;
  count:       number;
}

export interface WPOrderResponse {
  id:     number;
  status: string;
  number: string;
  total:  string;
}

export async function getProductCategories(): Promise<WPCategory[]> {
  return wpFetch<WPCategory[]>("/wc/v3/products/categories", { per_page: "100" }, true);
}

export async function getProductAttributes(): Promise<WCAttribute[]> {
  return wpFetch<WCAttribute[]>("/wc/v3/products/attributes", undefined, true);
}

export async function getAttributeTerms(attributeId: number): Promise<WCAttributeTerm[]> {
  return wpFetch<WCAttributeTerm[]>(`/wc/v3/products/attributes/${attributeId}/terms`, { per_page: "100" }, true);
}

// ── Orders (WooCommerce REST API v3) ──────────────────────────────────────────

export interface WPCustomer {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface WPOrder {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  billing: WPCustomer;
  shipping: WPCustomer;
  line_items: {
    product_id: number;
    quantity: number;
  }[];
}

export async function createOrder(orderData: WPOrder): Promise<WPOrderResponse> {
  const url = `${WP_BASE_URL}/wc/v3/orders`;
  const auth = Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to create order: ${errorBody}`);
  }

  return res.json();
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
  } catch (error: unknown) {
    console.error("Media upload error:", (error as Error).message);
    throw error;
  }
}

export interface WPMediaItem {
  source_url: string;
  id:         number;
  title?:     { rendered: string };
  mime_type?: string;
}

export async function getRecentMedia(perPage = 12): Promise<WPMediaItem[]> {
  const token = await getAuthToken();
  if (!token) return [];

  return wpFetch<WPMediaItem[]>("/wp/v2/media", { per_page: String(perPage) }, false);
}

// ── ButtonInks Plugin API (buttoninks/v1) ─────────────────────────────────────

/**
 * Get the current user's wishlist product IDs.
 * Requires a user JWT token passed from the client.
 */
export async function getWishlist(userToken: string): Promise<number[]> {
  const res = await fetch(`${WP_BASE_URL}/buttoninks/v1/wishlist`, {
    headers: {
      Authorization: `Bearer ${userToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  // Plugin returns array of product IDs or { wishlist: [...] }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.wishlist)) return data.wishlist;
  return [];
}

export async function addToWishlist(userToken: string, productId: number): Promise<boolean> {
  const res = await fetch(`${WP_BASE_URL}/buttoninks/v1/wishlist/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ product_id: productId }),
  });
  return res.ok;
}

export async function removeFromWishlist(userToken: string, productId: number): Promise<boolean> {
  const res = await fetch(`${WP_BASE_URL}/buttoninks/v1/wishlist/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ product_id: productId }),
  });
  return res.ok;
}

// ── WooCommerce Store API cart (wc/store/v1) ─────────────────────────────────
// These are called client-side with a Nonce or from API routes.
// The Store API uses cookie-based sessions for guests and logged-in users alike.

export const WC_STORE_URL = `${WP_BASE_URL}/wc/store/v1`;

// ── Product Reviews (WooCommerce REST API v3) ─────────────────────────────────

export interface WPProductReview {
  id: number;
  date_created: string;
  review: string;
  rating: number;
  name: string;
  email: string;
  verified: boolean;
}

export async function getProductReviews(productId: number, perPage = 10): Promise<WPProductReview[]> {
  try {
    return await wpFetch<WPProductReview[]>(
      `/wc/v3/products/${productId}/reviews`,
      { per_page: String(perPage), status: 'approved' },
      true
    );
  } catch {
    return [];
  }
}
