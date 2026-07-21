import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "central.buttoninks.com" },
      { protocol: "https", hostname: "api.iconify.design" },
      { protocol: "https", hostname: "buttoninks.com" },
      { protocol: "https", hostname: "www.buttoninks.com" },
    ],
    minimumCacheTTL: 86400, // 24 hours — WordPress images rarely change
    formats: ['image/webp'], // Enable WebP for smaller file sizes
  },

  // ── Slug aliases: WP category slugs → our page routes ──────────────────
  async redirects() {
    return [
      // Embroidery
      { source: "/products/embroidery-uniforms",   destination: "/products/embroidery",        permanent: false },
      { source: "/products/embroidery-uniforms/:slug*", destination: "/products/embroidery/:slug*", permanent: false },

      // T-Shirts
      { source: "/products/custom-t-shirts",       destination: "/products/t-shirts",          permanent: false },
      { source: "/products/custom-t-shirts/:slug*",destination: "/products/t-shirts/:slug*",   permanent: false },

      // Apparel
      { source: "/products/apparel-outerwear",     destination: "/products/apparel",           permanent: false },
      { source: "/products/apparel-outerwear/:slug*", destination: "/products/apparel/:slug*", permanent: false },

      // Mugs / Drinkware
      { source: "/products/drinkware-mugs",        destination: "/products/custom-mugs",       permanent: false },
      { source: "/products/drinkware-mugs/:slug*", destination: "/products/custom-mugs/:slug*",permanent: false },

      // Marketing Print
      { source: "/products/marketing-prints",      destination: "/products/marketing-print",   permanent: false },
      { source: "/products/marketing-prints/:slug*",destination: "/products/marketing-print/:slug*", permanent: false },

      // Photo Print
      { source: "/products/photo-prints-art",      destination: "/products/photoprint",        permanent: false },
      { source: "/products/photo-prints-art/:slug*",destination: "/products/photoprint/:slug*",permanent: false },
      { source: "/products/photo-prints",          destination: "/products/photoprint",        permanent: false },

      // Stickers
      { source: "/products/stickers-labels",       destination: "/products/stickers",          permanent: false },
      { source: "/products/stickers-labels/:slug*",destination: "/products/stickers/:slug*",   permanent: false },

      // Vehicles
      { source: "/products/vehicle-branding",      destination: "/products/vehicles-branding", permanent: false },
      { source: "/products/vehicle-branding/:slug*",destination: "/products/vehicles-branding/:slug*", permanent: false },

      // Corporate gifts
      { source: "/products/corporate-gifts-sets",  destination: "/products/corporate-gifts",   permanent: false },

      // Bags
      { source: "/products/bags-carrying",         destination: "/products/bags",              permanent: false },
      { source: "/products/bags-carrying/:slug*",  destination: "/products/bags/:slug*",       permanent: false },

      // Event supplies
      { source: "/products/event-tradeshow",       destination: "/products/event-supplies",    permanent: false },
      { source: "/products/event-tradeshow/:slug*",destination: "/products/event-supplies/:slug*", permanent: false },
      { source: "/products/event-tradeshow-supplies", destination: "/products/event-supplies", permanent: false },
    ];
  },

  // ── Cache headers for API routes at CDN level ──────────────────────────
  async headers() {
    return [
      {
        source: '/api/products-list',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' },
        ],
      },
      {
        source: '/api/blog',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/blog/:slug',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
      {
        source: '/api/announcement',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
      {
        source: '/api/promo-banners',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
      {
        source: '/api/design-templates',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
      {
        source: '/api/payment-gateways',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
      {
        source: '/api/products/:id',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
      {
        source: '/api/products/:id/reviews',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
      {
        source: '/api/search',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' },
        ],
      },
    ];
  },
};

export default nextConfig;
