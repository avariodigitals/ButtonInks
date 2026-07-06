import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { WP_BASE_URL } from "@/lib/wordpress";
import type { WPPost } from "@/lib/wordpress";
import type { Metadata } from "next";

// ── SEO Metadata ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Blog | ButtonInks — Custom Printing Tips & Guides",
  description:
    "Expert guides, printing tips, and industry news from the ButtonInks team. Learn about custom embroidery, screen printing, branded merchandise, and more.",
  alternates: {
    canonical: "https://buttoninks.com/blog",
  },
  openGraph: {
    title: "Blog | ButtonInks — Custom Printing Tips & Guides",
    description:
      "Expert guides, printing tips, and industry news from the ButtonInks team.",
    url: "https://buttoninks.com/blog",
    siteName: "ButtonInks",
    type: "website",
    images: [
      {
        url: "https://buttoninks.com/logo.png",
        width: 1200,
        height: 630,
        alt: "ButtonInks Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | ButtonInks — Custom Printing Tips & Guides",
    description:
      "Expert guides, printing tips, and industry news from the ButtonInks team.",
  },
};

// Always fresh — new WP posts show instantly
export const revalidate = 0;

// ── Helpers ───────────────────────────────────────────────────────────────────

function decodeEntities(str: string) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#038;/g, "&")
    .replace(/&apos;/g, "'");
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z#0-9]+;/gi, " ").trim();
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function readTime(html: string): string {
  const wordCount = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / 200) + " min read";
}

// ── Data ──────────────────────────────────────────────────────────────────────

async function getPosts(): Promise<WPPost[]> {
  try {
    const url = new URL(`${WP_BASE_URL}/wp/v2/posts`);
    url.searchParams.set("per_page", "12");
    url.searchParams.set("status", "publish");
    url.searchParams.set("_embed", "1");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function buildJsonLd(posts: WPPost[]) {
  const items = posts.map((post) => {
    const img = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    return {
      "@type": "BlogPosting",
      headline: decodeEntities(stripHtml(post.title.rendered)),
      url: `https://buttoninks.com/blog/${post.slug}`,
      datePublished: post.date,
      image: img ?? "https://buttoninks.com/logo.png",
      author: { "@type": "Organization", name: "ButtonInks" },
      publisher: {
        "@type": "Organization",
        name: "ButtonInks",
        logo: {
          "@type": "ImageObject",
          url: "https://buttoninks.com/logo.png",
        },
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "ButtonInks Blog",
    url: "https://buttoninks.com/blog",
    description:
      "Expert guides, printing tips, and industry news from the ButtonInks team.",
    blogPost: items,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="w-full bg-white min-h-screen">
      {/* JSON-LD */}
      {posts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(posts)) }}
        />
      )}

      {/* Hero */}
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-16 px-6 md:px-20">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-4">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest w-fit">
            Blog
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-['Outfit'] text-slate-900">
            Printing Tips &amp; Insights
          </h1>
          <p className="text-slate-500 text-base font-['Inter'] leading-7 max-w-xl">
            Guides, how-tos, and news from the ButtonInks team to help you get
            the most from your custom print orders.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="w-full px-6 md:px-20 py-16">
        <div className="max-w-[1280px] mx-auto">
          {posts.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <BookOpen className="w-12 h-12 text-gray-200" />
              <h2 className="text-xl font-bold font-['Outfit'] text-slate-700">
                No articles yet
              </h2>
              <p className="text-slate-400 font-['Inter'] max-w-sm">
                We are working on great content. Check back soon for tips,
                guides, and printing insights.
              </p>
            </div>
          ) : (
            <>
              {/* Featured first post */}
              {posts[0] && (() => {
                const post = posts[0];
                const img = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                const cat = post._embedded?.["wp:term"]?.[0]?.[0]?.name;
                const title = decodeEntities(stripHtml(post.title.rendered));
                const excerpt = decodeEntities(stripHtml(post.excerpt.rendered));
                const rt = readTime(post.content.rendered);
                return (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group mb-12 grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    aria-label={`Read article: ${title}`}
                  >
                    {/* Image */}
                    <div className="relative aspect-video lg:aspect-auto lg:min-h-[360px] bg-gray-100">
                      {img ? (
                        <Image
                          src={img}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width:1024px) 100vw, 50vw"
                          unoptimized
                          priority
                        />
                      ) : (
                        <div className="w-full h-full bg-green-50 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-green-200" />
                        </div>
                      )}
                      {cat && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-green-700 text-white text-xs font-bold rounded-full font-['Inter']">
                          {decodeEntities(cat)}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-8 lg:p-10 flex flex-col justify-center gap-4 bg-white">
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-['Inter']">
                        <span>{formatDate(post.date)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {rt}
                        </span>
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-bold font-['Outfit'] text-slate-900 leading-snug group-hover:text-green-700 transition-colors">
                        {title}
                      </h2>
                      <p className="text-slate-500 text-sm font-['Inter'] leading-7 line-clamp-3">
                        {excerpt}
                      </p>
                      <span className="flex items-center gap-1 text-green-700 font-bold text-sm font-['Inter'] mt-auto">
                        Read article <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                );
              })()}

              {/* Remaining posts grid */}
              {posts.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.slice(1).map((post) => {
                    const img = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                    const cat = post._embedded?.["wp:term"]?.[0]?.[0]?.name;
                    const title = decodeEntities(stripHtml(post.title.rendered));
                    const excerpt = decodeEntities(stripHtml(post.excerpt.rendered));
                    const rt = readTime(post.content.rendered);
                    return (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                        aria-label={`Read article: ${title}`}
                      >
                        {/* Image */}
                        <div className="relative aspect-video bg-gray-100 overflow-hidden">
                          {img ? (
                            <Image
                              src={img}
                              alt={title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-green-50 flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-green-200" />
                            </div>
                          )}
                          {cat && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 bg-green-700 text-white text-xs font-bold rounded-full font-['Inter']">
                              {decodeEntities(cat)}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col gap-3 flex-1">
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-['Inter']">
                            <span>{formatDate(post.date)}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {rt}
                            </span>
                          </div>
                          <h2 className="text-lg font-bold font-['Outfit'] text-slate-900 leading-snug group-hover:text-green-700 transition-colors line-clamp-2">
                            {title}
                          </h2>
                          <p className="text-slate-500 text-sm font-['Inter'] leading-6 line-clamp-2 flex-1">
                            {excerpt}
                          </p>
                          <span className="flex items-center gap-1 text-green-700 font-bold text-sm font-['Inter'] mt-auto">
                            Read article <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
