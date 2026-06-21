import { NextRequest, NextResponse } from 'next/server';
import { WP_BASE_URL } from '@/lib/wordpress';

/**
 * GET /api/media
 *
 * Fetches recent media uploads from WordPress.
 * - If the request carries a user JWT (Authorization header), it is forwarded
 *   directly — WordPress then returns only that user's own uploads.
 * - If no JWT is present (guest / admin context), a server-side admin token is
 *   used so the design tool still has a media library to show.
 */
export async function GET(req: NextRequest) {
  try {
    const perPage = req.nextUrl.searchParams.get('per_page') ?? '20';

    // Prefer the user's own token so WP scopes the results to their uploads
    const userAuth = req.headers.get('authorization');

    let authHeader: string;

    if (userAuth) {
      // Logged-in user — use their token directly
      authHeader = userAuth;
    } else {
      // No user token — fall back to admin credentials
      const username = process.env.WORDPRESS_AUTH_USERNAME;
      const password = process.env.WORDPRESS_AUTH_PASSWORD;

      if (!username || !password) {
        return NextResponse.json([], { status: 200 });
      }

      // Obtain admin JWT
      const tokenRes = await fetch(`${WP_BASE_URL}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        cache: 'no-store',
      });

      if (!tokenRes.ok) {
        return NextResponse.json([], { status: 200 });
      }

      const tokenData = await tokenRes.json();
      if (!tokenData.token) {
        return NextResponse.json([], { status: 200 });
      }

      authHeader = `Bearer ${tokenData.token}`;
    }

    const url = new URL(`${WP_BASE_URL}/wp/v2/media`);
    url.searchParams.set('per_page', perPage);
    url.searchParams.set('orderby', 'date');
    url.searchParams.set('order', 'desc');
    url.searchParams.set('media_type', 'image');

    const mediaRes = await fetch(url.toString(), {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!mediaRes.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data = await mediaRes.json();

    // Return only the fields the design tool needs
    const items = (Array.isArray(data) ? data : []).map((m: { id: number; source_url: string }) => ({
      id: m.id,
      source_url: m.source_url,
    }));

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
