import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { WP_BASE_URL } from "@/lib/wordpress";
import type { WPPost } from "@/lib/wordpress";
import type { Metadata } from "next";

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

async function getPost(slug: string): Promise<WPPost | null> {
  try {
    const url = new URL(`${WP_BASE_URL}/wp/v2/posts`);
    url.searchParams.set("slug", slug);
    url.searchParams.set("status", "publish");
    url.searchParams.set("_embed", "1");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const posts: WPPost[] = await res.json();
    return posts[0] ?? null;
  } catch {
    return null;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Post Not Found | ButtonInks" };
  }

  const title = decodeEntities(stripHtml(post.title.rendered));
  const description = decodeEntities(stripHtml(post.excerpt.rendered)).slice(0, 160);
  const img = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const categories = post._embedded?.["wp:term"]?.[0] ?? [];
  const keywords = categories.map((c) => decodeEntities(c.name)).join(", ");

  return {
    title: `${title} | ButtonInks Blog`,
    description,
    keywords,
    alternates: {
      canonical: `https://buttoninks.com/blog/${slug}`,
    },
    openGraph: {
      title: `${title} | ButtonInks Blog`,
      description,
      url: `https://buttoninks.com/blog/${slug}`,
      siteName: "ButtonInks",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified ?? post.date,
      images: img
        ? [{ url: img, width: 1200, height: 630, alt: title }]
        : [{ url: "https://buttoninks.com/logo.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ButtonInks Blog`,
      description,
      images: img ? [img] : undefined,
    },
  };
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function buildJsonLd(post: WPPost, slug: string) {
  const img = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const title = decodeEntities(stripHtml(post.title.rendered));
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    image: img ?? "https://buttoninks.com/logo.png",
    url: `https://buttoninks.com/blog/${slug}`,
    datePublished: post.date,
    dateModified: post.modified ?? post.date,
    author: {
      "@type": "Organization",
      name: "ButtonInks Team",
      url: "https://buttoninks.com",
    },
    publisher: {
      "@type": "Organization",
      name: "ButtonInks",
      url: "https://buttoninks.com",
      logo: {
        "@type": "ImageObject",
        url: "https://buttoninks.com/logo.png",
      },
    },
    description: decodeEntities(stripHtml(post.excerpt.rendered)).slice(0, 160),
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <main className="w-full bg-white min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <BookOpen className="w-12 h-12 text-gray-200" />
        <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">
          Post Not Found
        </h1>
        <p className="text-slate-500 font-['Inter']">
          This article may have been moved or removed.
        </p>
        <Link
          href="/blog"
          className="px-6 py-3 bg-green-700 text-white font-bold rounded-xl font-['Inter'] hover:bg-green-800 transition-all"
        >
          Back to Blog
        </Link>
      </main>
    );
  }

  const img = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const cat = post._embedded?.["wp:term"]?.[0]?.[0]?.name;
  const title = decodeEntities(stripHtml(post.title.rendered));
  const rt = readTime(post.content.rendered);

  return (
    <main className="w-full bg-white min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(post, slug)) }}
      />

      {/* Back nav */}
      <div className="w-full px-6 md:px-20 py-4 border-b border-gray-100">
        <div className="max-w-[800px] mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-green-700 font-bold text-sm hover:underline font-['Inter']"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Hero image */}
      {img && (
        <div className="relative w-full aspect-[21/9] bg-gray-100 max-h-[500px] overflow-hidden">
          <Image
            src={img}
            alt={title}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
            priority
          />
        </div>
      )}

      {/* Article */}
      <article className="w-full px-6 md:px-20 py-12">
        <div className="max-w-[800px] mx-auto flex flex-col gap-6">

          {/* Category + read time + date */}
          <div className="flex flex-wrap items-center gap-3">
            {cat && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter']">
                {decodeEntities(cat)}
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-400 text-sm font-['Inter']">
              <Clock className="w-3.5 h-3.5" />
              {rt}
            </span>
            <span className="text-gray-400 text-sm font-['Inter']">
              {formatDate(post.date)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold font-['Outfit'] text-slate-900 leading-tight">
            {title}
          </h1>

          {/* Byline */}
          <p className="text-sm text-slate-400 font-['Inter']">
            By <span className="font-semibold text-slate-600">ButtonInks Team</span>
          </p>

          {/* Body */}
          <div
            className="prose prose-slate prose-lg max-w-none font-['Inter'] prose-headings:font-['Outfit'] prose-a:text-green-700 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

          {/* Footer CTA */}
          <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-green-700 font-bold text-sm hover:underline font-['Inter']"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
            <Link
              href="/categories"
              className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] text-sm transition-all"
            >
              Browse our custom print products →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
