"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Fragment,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  Loader2,
  Package,
  FileText,
  Layers,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProductResult {
  id: number;
  title: string;
  href: string;
  image: string | null;
  price: string | null;
  type: "product";
}

interface PostResult {
  id: number;
  title: string;
  href: string;
  excerpt: string;
  image: string | null;
  type: "post";
}

interface PageResult {
  title: string;
  href: string;
  excerpt: string;
  type: "page" | "category";
}

interface SearchResults {
  products: ProductResult[];
  posts: PostResult[];
  pages: PageResult[];
}

// ── Popular / trending quick-searches ────────────────────────────────────────
const TRENDING = [
  "Custom T-Shirts",
  "Embroidery",
  "Business Cards",
  "Mugs",
  "Tote Bags",
  "Stickers",
  "Banners",
  "Corporate Gifts",
];

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
      <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-1.5">
      <Icon className="w-3.5 h-3.5 text-green-700" />
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-['Inter']">
        {label}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const inputRef              = useRef<HTMLInputElement>(null);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset when closed
      setTimeout(() => { setQuery(""); setResults(null); setError(null); }, 250);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  // Keyboard close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok) setResults(data);
      else setError("Something went wrong. Please try again.");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.length < 2) { setResults(null); setLoading(false); return; }
    setLoading(true);          // show spinner immediately
    timerRef.current = setTimeout(() => doSearch(val), 380);
  };

  const handleTrending = (term: string) => {
    setQuery(term);
    setLoading(true);
    doSearch(term);
  };

  const hasResults =
    results &&
    (results.products.length + results.posts.length + results.pages.length) > 0;

  const isEmpty = results && !hasResults && !loading;

  const handleLinkClick = () => onClose();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* ── Panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site search"
        className={`fixed z-[201] transition-all duration-300 ease-out
          /* mobile: slides up from bottom */
          bottom-0 left-0 right-0 rounded-t-3xl
          /* desktop: centered card */
          md:bottom-auto md:top-[10vh] md:left-1/2 md:-translate-x-1/2
          md:w-full md:max-w-2xl md:rounded-2xl
          bg-white shadow-2xl flex flex-col overflow-hidden
          max-h-[90dvh] md:max-h-[80vh]
          ${open ? "translate-y-0 opacity-100" : "translate-y-full md:translate-y-8 opacity-0 pointer-events-none"}
        `}
      >
        {/* ── Drag handle (mobile) ── */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-gray-200" />
        </div>

        {/* ── Search Input Row ── */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 shrink-0">
          {loading ? (
            <Loader2 className="w-5 h-5 text-green-700 shrink-0 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          )}

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="Search products, blog posts, pages…"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-base text-zinc-900 placeholder-zinc-400 outline-none font-['Inter'] min-w-0"
          />

          {query && (
            <button
              onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}
              className="p-1.5 rounded-full hover:bg-gray-100 text-zinc-400 hover:text-zinc-700 transition-colors shrink-0"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="hidden md:flex p-1.5 rounded-full hover:bg-gray-100 text-zinc-400 hover:text-zinc-700 transition-colors shrink-0"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Results / idle body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar">

          {/* ── IDLE — trending searches ── */}
          {!query && (
            <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-700" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 font-['Inter']">
                  Trending searches
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTrending(t)}
                    className="px-4 py-2 bg-gray-50 hover:bg-green-50 hover:text-green-700 text-zinc-600 text-sm font-semibold rounded-full border border-gray-100 hover:border-green-200 transition-all active:scale-95 font-['Inter']"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── LOADING skeleton ── */}
          {loading && query && (
            <div className="py-2">
              <SectionHead icon={Loader2} label="Searching…" />
              <div className="divide-y divide-gray-50">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          )}

          {/* ── EMPTY state ── */}
          {isEmpty && (
            <div className="flex flex-col items-center gap-3 py-14 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Search className="w-6 h-6 text-zinc-300" />
              </div>
              <p className="text-zinc-500 font-semibold font-['Inter']">
                No results for &ldquo;<span className="text-zinc-900">{query}</span>&rdquo;
              </p>
              <p className="text-zinc-400 text-sm">
                Try different keywords or browse our categories.
              </p>
              <Link
                href="/categories"
                onClick={handleLinkClick}
                className="mt-2 px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-xl transition-colors font-['Inter']"
              >
                Browse all categories
              </Link>
            </div>
          )}

          {/* ── ERROR state ── */}
          {error && (
            <div className="px-6 py-10 text-center text-sm text-red-500 font-['Inter']">
              {error}
            </div>
          )}

          {/* ── RESULTS ── */}
          {!loading && hasResults && (
            <div className="pb-4">

              {/* Products */}
              {results!.products.length > 0 && (
                <Fragment>
                  <SectionHead icon={Package} label="Products" />
                  <ul>
                    {results!.products.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={p.href}
                          onClick={handleLinkClick}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-xl border border-gray-100 bg-white overflow-hidden flex items-center justify-center shrink-0">
                            {p.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-zinc-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-800 group-hover:text-green-700 truncate transition-colors font-['Inter']">
                              {p.title}
                            </p>
                            {p.price && (
                              <p className="text-xs text-green-700 font-bold mt-0.5">
                                from {p.price}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-green-500 shrink-0 transition-colors" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Fragment>
              )}

              {/* Pages / Categories */}
              {results!.pages.length > 0 && (
                <Fragment>
                  <SectionHead icon={Layers} label="Pages & Categories" />
                  <ul>
                    {results!.pages.map((pg) => (
                      <li key={pg.href}>
                        <Link
                          href={pg.href}
                          onClick={handleLinkClick}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            <Layers className="w-4 h-4 text-zinc-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-800 group-hover:text-green-700 truncate transition-colors font-['Inter']">
                              {pg.title}
                            </p>
                            <p className="text-xs text-zinc-400 truncate">{pg.excerpt}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-green-500 shrink-0 transition-colors" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Fragment>
              )}

              {/* Blog posts */}
              {results!.posts.length > 0 && (
                <Fragment>
                  <SectionHead icon={FileText} label="Blog & News" />
                  <ul>
                    {results!.posts.map((post) => (
                      <li key={post.id}>
                        <Link
                          href={post.href}
                          onClick={handleLinkClick}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                            {post.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileText className="w-5 h-5 text-zinc-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-800 group-hover:text-green-700 truncate transition-colors font-['Inter']">
                              {post.title}
                            </p>
                            {post.excerpt && (
                              <p className="text-xs text-zinc-400 line-clamp-1">{post.excerpt}</p>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-green-500 shrink-0 transition-colors" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Fragment>
              )}

              {/* View all results CTA */}
              <div className="px-4 pt-3 mt-1 border-t border-gray-50">
                <Link
                  href={`/categories?search=${encodeURIComponent(query)}`}
                  onClick={handleLinkClick}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-xl transition-colors font-['Inter'] active:scale-[0.98]"
                >
                  <Search className="w-4 h-4" />
                  View all results for &ldquo;{query}&rdquo;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer hint ── */}
        <div className="hidden md:flex items-center gap-4 px-5 py-3 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <span className="text-[10px] text-zinc-400 font-['Inter']">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono shadow-sm">ESC</kbd>
            {" "}to close
          </span>
          <span className="text-[10px] text-zinc-400 font-['Inter']">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono shadow-sm">↵</kbd>
            {" "}to browse all results
          </span>
        </div>
      </div>
    </>
  );
}
