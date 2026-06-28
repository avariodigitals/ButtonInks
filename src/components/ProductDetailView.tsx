"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight, Star, Minus, Plus, Upload, Maximize2,
  FileDown, ShoppingCart, SlidersHorizontal, X, ChevronDown, Package, LayoutGrid, Send,
} from 'lucide-react';
import { WPProduct, WPProductReview, decodeHTMLEntities } from '@/lib/wordpress';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';

// ── Utility ───────────────────────────────────────────────────────────────────
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`${cls} ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex gap-0.5 shrink-0">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`w-3 h-3 rounded-[1px] ${s <= stars ? 'bg-yellow-500' : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 text-right text-zinc-500 text-xs font-inter">{count.toLocaleString()}</span>
    </div>
  );
}

// ── Write-a-Review modal ─────────────────────────────────────────────────────
function ReviewFormModal({
  productId,
  productName,
  onClose,
  onSuccess,
}: {
  productId:   number;
  productName: string;
  onClose:     () => void;
  onSuccess:   (review: WPProductReview) => void;
}) {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [body,    setBody]    = useState('');
  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', esc);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!rating) { setError('Please select a star rating.'); return; }
    if (!name.trim())  { setError('Your name is required.'); return; }
    if (!email.trim()) { setError('Your email is required.'); return; }
    if (!body.trim())  { setError('Please write your review.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          reviewer:       name.trim(),
          reviewer_email: email.trim(),
          review:         body.trim(),
          rating,
        }),
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? 'Something went wrong. Please try again.');
        return;
      }
      onSuccess(data as WPProductReview);
      onClose();
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto no-scrollbar rounded-t-3xl sm:rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="p-5 sm:p-8 flex flex-col gap-5">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-slate-900 text-xl font-bold font-outfit">Write a Review</h2>
              <p className="text-gray-500 text-sm font-inter mt-0.5 line-clamp-1">{decodeHTMLEntities(productName)}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Star picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold font-inter text-gray-700">Your Rating <span className="text-red-500">*</span></label>
              <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`${s} star${s > 1 ? 's' : ''}`}
                    aria-pressed={rating === s}
                    className="p-0.5 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        s <= (hovered || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200 fill-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rv-name" className="text-sm font-bold font-inter text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="rv-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm font-inter text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-green-600 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rv-email" className="text-sm font-bold font-inter text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="rv-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm font-inter text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-green-600 transition-colors"
              />
              <p className="text-xs text-gray-400 font-inter">Not displayed publicly.</p>
            </div>

            {/* Review body */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rv-body" className="text-sm font-bold font-inter text-gray-700">
                Review <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rv-body"
                rows={4}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Share your experience with this product…"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm font-inter text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-green-600 transition-colors resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-600 text-sm font-inter bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold font-inter rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting…
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Color map ─────────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  'black': '#111827', 'white': '#F9FAFB', 'grey': '#9CA3AF', 'gray': '#9CA3AF',
  'charcoal': '#374151', 'dark heather': '#4B5563', 'heather grey': '#D1D5DB',
  'sport grey': '#E5E7EB', 'ash': '#9CA3AF', 'silver': '#C0C0C0', 'natural': '#FAF5EB',
  'navy': '#1E3A5F', 'royal blue': '#1D4ED8', 'sapphire': '#0F52BA',
  'light blue': '#BFDBFE', 'sky blue': '#38BDF8', 'columbia blue': '#9EC8E8',
  'carolina blue': '#56A0D3', 'powder blue': '#B0E0E6', 'tour blue': '#0369A1',
  'forest green': '#166534', 'irish green': '#15803D', 'kelly green': '#22C55E',
  'military green': '#4B5320', 'olive': '#6B7280', 'lime': '#84CC16',
  'red': '#DC2626', 'cardinal': '#9F1239', 'maroon': '#7F1D1D', 'burgundy': '#800020',
  'cranberry': '#9B1B30', 'cherry red': '#DC143C', 'hot pink': '#EC4899',
  'light pink': '#FBD5E4', 'pink': '#F9A8D4', 'coral': '#F87171',
  'orange': '#EA580C', 'gold': '#D97706', 'yellow': '#FBBF24', 'sand': '#D6C9A0',
  'daisy': '#FDE047', 'purple': '#7C3AED', 'violet': '#8B5CF6', 'plum': '#9D174D',
  'lavender': '#C4B5FD', 'brown': '#92400E', 'chocolate': '#3B1F0A', 'tan': '#D2B48C',
  'mint': '#6EE7B7', 'teal': '#0D9488', 'cyan': '#06B6D4',
};

// ── Related product card (live WP data) ───────────────────────────────────────
function RelatedCard({ product }: { product: WPProduct }) {
  const categorySlug = product.categories?.[0]?.slug ?? 'all';
  const href  = `/products/${categorySlug}/${product.slug}`;
  const image = product.images?.[0]?.src;
  const rating = parseFloat(product.average_rating || '0');
  const badge = product.on_sale ? { label: 'Sale', color: 'bg-red-500' }
    : product.acf?.enable_designer ? { label: 'Custom', color: 'bg-green-700' }
    : null;

  // Parse sale price from price_html
  function stripTags(html: string) { return html.replace(/<[^>]*>/g, ''); }
  function extractAmt(html: string): number | null {
    const m = stripTags(html).match(/\$([\d,]+\.?\d*)/);
    if (!m) return null;
    const v = parseFloat(m[1].replace(/,/g, ''));
    return v > 0 ? v : null;
  }
  const del = product.price_html?.match(/<del[^>]*>([\s\S]*?)<\/del>/i);
  const ins = product.price_html?.match(/<ins[^>]*>([\s\S]*?)<\/ins>/i);
  const regularPrice = del ? extractAmt(del[1]) : null;
  const currentPrice2 = ins ? extractAmt(ins[1]) : extractAmt(product.price_html || '');
  const displayPrice = currentPrice2 ?? (parseFloat(product.price || '0') > 0 ? parseFloat(product.price) : null);
  const fmtR = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <Link
      href={href}
      className="bg-white rounded-2xl shadow-[0px_2px_8px_0px_rgba(13,27,46,0.04)] outline outline-[1.31px] outline-offset-[-1.31px] outline-slate-900/5 flex flex-col overflow-hidden group hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-50/30">
        {badge && (
          <span className={`absolute top-3 left-3 z-10 px-2 py-0.5 ${badge.color} rounded-full text-white text-[10px] font-bold font-inter leading-4`}>
            {badge.label}
          </span>
        )}
        {image ? (
          <Image src={image} alt={decodeHTMLEntities(product.name)} fill
            className="object-contain p-2.5 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-200" />
          </div>
        )}
      </div>
      <div className="p-4 bg-white border-t border-zinc-500/30 flex flex-col gap-2.5">
        <span className="text-gray-400 text-xs font-semibold font-inter uppercase leading-4 tracking-wide">
          {product.categories?.[0]?.name ?? ''}
        </span>
        <h3 className="text-slate-900 text-sm sm:text-base font-medium font-outfit leading-5 line-clamp-2">
          {decodeHTMLEntities(product.name)}
        </h3>
        {rating > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRow rating={rating} size="sm" />
            <span className="text-slate-500 text-xs font-inter leading-4">
              {product.average_rating} ({product.rating_count.toLocaleString()})
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex flex-wrap items-baseline gap-1">
              {regularPrice && (
                <span className="text-gray-400 text-xs font-normal line-through font-inter">{fmtR(regularPrice)}</span>
              )}
              <span className={`text-sm sm:text-base font-semibold font-outfit leading-6 ${regularPrice ? 'text-green-700' : 'text-slate-900'}`}>
                {displayPrice ? fmtR(displayPrice) : 'Get a quote'}
              </span>
            </div>
            {product.acf?.bulk_pricing?.[0] && (
              <span className="text-gray-400 text-xs font-inter leading-4"> · min {product.acf.bulk_pricing[0].min_qty}</span>
            )}
          </div>
          <span className="px-3 py-1.5 bg-green-700 rounded-lg text-white text-xs font-bold font-inter leading-4 group-hover:bg-green-800 transition-colors">
            Shop
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProductDetailView({
  product,
  categorySlug,
}: {
  product: WPProduct;
  categorySlug: string;
}) {
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  const uniqueImages = product.images.filter(
    (img, idx, arr) => arr.findIndex(x => x.id === img.id) === idx
  );

  const [mainImage,          setMainImage]          = useState(uniqueImages[0]?.src || '');
  const [lightboxOpen,       setLightboxOpen]       = useState(false);
  const [quantity,           setQuantity]           = useState(1);
  const [activeTab,          setActiveTab]          = useState('Description');
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [selectedProduction, setSelectedProduction] = useState<string>(
    product.acf?.production_options?.[0]?.type ?? 'regular'
  );
  const [selectedPrintArea, setSelectedPrintArea] = useState<string>('Front');
  const [selectedMaterial,  setSelectedMaterial]  = useState<string>('');

  // ── Restore selections from "Edit selection" URL params ───────────────────
  const searchParams = useSearchParams();
  useEffect(() => {
    const sel = searchParams.get('sel');
    const qty = searchParams.get('qty');

    if (qty) {
      const n = parseInt(qty, 10);
      if (n > 0) setQuantity(n);
    }

    if (!sel) return;

    // Parse "Color: Red, Blue · Size: L · Print Area: Front · Urgent Production"
    const parts = sel.split('·').map(s => s.trim());
    const restoredAttrs: Record<string, string[]> = {};
    let restoredPrintArea = '';
    let restoredProduction = '';
    let restoredMaterial = '';

    for (const part of parts) {
      if (part.toLowerCase().startsWith('print area:')) {
        restoredPrintArea = part.split(':')[1]?.trim() ?? '';
      } else if (part.toLowerCase() === 'urgent production') {
        restoredProduction = 'urgent';
      } else if (part.toLowerCase() === 'standard production') {
        restoredProduction = 'regular';
      } else if (part.toLowerCase().startsWith('material:')) {
        restoredMaterial = part.split(':')[1]?.trim() ?? '';
      } else if (part.includes(':')) {
        // Attribute — e.g. "Color: Red, Blue" or "Size: L"
        const colonIdx = part.indexOf(':');
        const attrName = part.slice(0, colonIdx).trim();
        const vals = part.slice(colonIdx + 1).split(',').map(v => v.trim()).filter(Boolean);
        if (attrName && vals.length) restoredAttrs[attrName] = vals;
      }
    }

    if (Object.keys(restoredAttrs).length) setSelectedAttributes(restoredAttrs);
    if (restoredPrintArea) setSelectedPrintArea(restoredPrintArea);
    if (restoredProduction) setSelectedProduction(restoredProduction);
    if (restoredMaterial) setSelectedMaterial(restoredMaterial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  // ── Live data from WP ────────────────────────────────────────────────────
  const [reviews,        setReviews]        = useState<WPProductReview[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<WPProduct[]>([]);
  const [reviewsLoading,  setReviewsLoading]  = useState(true);
  const [relatedLoading,  setRelatedLoading]  = useState(true);
  const [reviewFormOpen,  setReviewFormOpen]  = useState(false);

  useEffect(() => {
    // Fetch reviews
    fetch(`/api/products/${product.id}/reviews`)
      .then(r => r.ok ? r.json() : [])
      .then((data: WPProductReview[]) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [product.id]);

  useEffect(() => {
    if (!product.related_ids?.length) { setRelatedLoading(false); return; }
    // Fetch up to 8 related products via the products-list API
    const ids = product.related_ids.slice(0, 8).join(',');
    fetch(`/api/products-list?include=${ids}&per_page=8`)
      .then(r => r.ok ? r.json() : [])
      .then((data: WPProduct[]) => setRelatedProducts(Array.isArray(data) ? data : []))
      .catch(() => setRelatedProducts([]))
      .finally(() => setRelatedLoading(false));
  }, [product.related_ids]);

  // ── Materials ─────────────────────────────────────────────────────────────
  const materialAttr = product.attributes.find(a =>
    a.name.toLowerCase().includes('material') || a.name.toLowerCase().includes('fabric')
  );
  const materials = materialAttr?.options ?? [];
  useEffect(() => {
    if (!selectedMaterial && materials.length > 0) setSelectedMaterial(materials[0]);
  }, [materials, selectedMaterial]);

  const printAreas = ['Front', 'Back', 'Front and Back'];

  // ── Price ─────────────────────────────────────────────────────────────────
  const getBasePrice = () => {
    let price = parseFloat(product.price || '0');
    if (product.acf?.bulk_pricing) {
      const sorted = [...product.acf.bulk_pricing].sort((a, b) => b.min_qty - a.min_qty);
      const tier = sorted.find(t => quantity >= t.min_qty);
      if (tier) price = parseFloat(tier.discount_price);
    }
    return price;
  };

  const unitPrice = (() => {
    let p = getBasePrice();
    const opt = product.acf?.production_options?.find(o => o.type === selectedProduction);
    if (opt) p += parseFloat(opt.extra_cost || '0');
    return p;
  })();

  const regularUnitPrice = parseFloat(product.regular_price || '0');
  const currentPrice     = parseFloat(product.price || '0');
  const isOnSale = product.on_sale === true && regularUnitPrice > 0 && currentPrice > 0 && regularUnitPrice > currentPrice;

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  // ── Flags ─────────────────────────────────────────────────────────────────
  const enableDesigner = product.acf?.enable_designer === true;
  const enableUpload   = product.acf?.enable_upload   === true;
  const buyAsIs        = product.acf?.buy_as_is       === true;
  const showUploadBtn  = enableUpload || (!enableDesigner && !buyAsIs);
  const showDesignBtn  = enableDesigner;

  // ── Attribute toggles ─────────────────────────────────────────────────────
  const toggleAttr = (name: string, val: string, multi: boolean) => {
    setValidationErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    setSelectedAttributes(prev => {
      const cur = prev[name] ?? [];
      if (multi) {
        return { ...prev, [name]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] };
      }
      return { ...prev, [name]: [val] };
    });
  };

  // ── Validation state ──────────────────────────────────────────────────────
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Required attributes: everything that isn't material/fabric
  const requiredAttrs = product.attributes.filter(
    a => !a.name.toLowerCase().includes('material') && !a.name.toLowerCase().includes('fabric')
  );

  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    // Validate required attributes
    const errors: Record<string, string> = {};
    for (const attr of requiredAttrs) {
      const vals = selectedAttributes[attr.name] ?? [];
      if (vals.length === 0) {
        errors[attr.name] = `Please select a ${attr.name.toLowerCase()}`;
      }
    }
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Scroll to the first error
      const firstAttr = requiredAttrs[0];
      if (firstAttr) {
        document.getElementById(`attr-${firstAttr.name}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showNotification({
        title:   'Please complete your selection',
        message: Object.values(errors)[0],
        type:    'error',
      });
      return;
    }

    const attrParts = requiredAttrs.flatMap(a => {
      const vals = selectedAttributes[a.name] ?? [];
      return vals.length ? [`${a.name}: ${vals.join(', ')}`] : [];
    });

    const extras = [
      ...attrParts,
      `Print Area: ${selectedPrintArea}`,
      selectedMaterial ? `Material: ${selectedMaterial}` : null,
      selectedProduction === 'urgent' ? 'Urgent Production' : 'Standard Production',
    ].filter(Boolean).join(' · ');

    addToCart({
      id:       product.id,
      name:     `${decodeHTMLEntities(product.name)}${extras ? ` (${extras})` : ''}`,
      price:    unitPrice,
      quantity,
      image:    uniqueImages[0]?.src || '',
      slug:     product.slug,
      category: categorySlug,
    });
    showNotification({
      title:   'Added to Cart',
      message: `${decodeHTMLEntities(product.name)} added to your bag.`,
      type:    'cart',
    });
  };

  const handleReviewSuccess = useCallback((newReview: WPProductReview) => {
    setReviews(prev => [newReview, ...prev]);
    showNotification({ title: 'Review Submitted', message: 'Thanks for your review!', type: 'cart' });
  }, [showNotification]);

  // ── Rating breakdown from actual review data ──────────────────────────────
  const avgRating   = parseFloat(product.average_rating || '0');
  const ratingCount = product.rating_count || 0;
  const breakdown = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length ||
      // fallback proportional estimate when reviews haven't loaded yet
      (ratingCount > 0 ? Math.round(ratingCount * [0.787, 0.149, 0.040, 0.015, 0.010][5 - stars]) : 0),
  }));

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const TABS = ['Description', 'Print Guidelines', 'Ordering information', 'File Setup', 'Template'];

  const tabContent = () => {
    switch (activeTab) {
      case 'Description':
        return (
          <div
            className="prose prose-sm sm:prose max-w-none text-slate-600 font-inter leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description || product.short_description }}
          />
        );
      case 'Print Guidelines':
        return (
          <div className="flex flex-col gap-4 text-slate-600 text-sm sm:text-base font-inter leading-7">
            {product.acf?.print_notes ? (
              <p>{product.acf.print_notes}</p>
            ) : (
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li>Use high-resolution images (300 DPI minimum).</li>
                <li>Keep important text within the safe zone.</li>
                <li>Convert all text to outlines if using custom fonts.</li>
                <li>Ensure colors are in CMYK mode for accurate reproduction.</li>
              </ul>
            )}
          </div>
        );
      case 'Ordering information':
        return (
          <div className="flex flex-col gap-4 text-slate-600 text-sm sm:text-base font-inter leading-7">
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>Standard Production: 3–5 business days.</li>
              <li>Express Production: 1–2 business days (additional fee).</li>
              <li>Shipping: USPS Priority Mail (1–3 days) or Ground (2–5 days).</li>
            </ul>
          </div>
        );
      case 'File Setup':
        return (
          <div className="flex flex-col gap-4 text-slate-600 text-sm sm:text-base font-inter leading-7">
            <p>Accepted file formats:</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {['PDF', 'AI', 'PSD', 'PNG', 'JPG', 'EPS'].map(ext => (
                <div key={ext} className="p-3 bg-gray-50 rounded-lg text-center font-bold border border-gray-100 text-sm font-inter">
                  {ext}
                </div>
              ))}
            </div>
          </div>
        );
      case 'Template':
        return (
          <div className="flex flex-col gap-6 text-slate-600 text-sm sm:text-base font-inter">
            <p>Download our design templates to set up your artwork correctly:</p>
            {product.acf?.download_templates && product.acf.download_templates.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {product.acf.download_templates.map((tpl, i) => {
                  const meta: Record<string, { color: string; emoji: string }> = {
                    PDF: { color: 'text-red-600 border-red-200 bg-red-50',          emoji: '📄' },
                    AI:  { color: 'text-orange-500 border-orange-200 bg-orange-50', emoji: '✏️' },
                    PSD: { color: 'text-blue-600 border-blue-200 bg-blue-50',       emoji: '🖼️' },
                    EPS: { color: 'text-purple-600 border-purple-200 bg-purple-50', emoji: '🎨' },
                    PNG: { color: 'text-green-600 border-green-200 bg-green-50',    emoji: '🖼️' },
                    SVG: { color: 'text-teal-600 border-teal-200 bg-teal-50',       emoji: '🔷' },
                  };
                  const m = meta[tpl.label?.toUpperCase()] ?? { color: 'text-gray-600 border-gray-200 bg-gray-50', emoji: '📁' };
                  return (
                    <a key={i} href={tpl.url} target="_blank" rel="noopener noreferrer" download
                      className={`px-4 py-3 border rounded-xl hover:opacity-80 flex items-center gap-2 font-bold text-sm transition-all font-inter ${m.color}`}>
                      <FileDown className="w-4 h-4" />
                      {m.emoji} Download {tpl.label} Template
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic font-inter">No templates available for this product yet.</p>
            )}
          </div>
        );
      default: return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col items-center bg-white">

      {/* Review form modal */}
      {reviewFormOpen && (
        <ReviewFormModal
          productId={product.id}
          productName={product.name}
          onClose={() => setReviewFormOpen(false)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Lightbox */}
      {lightboxOpen && mainImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-full max-w-3xl aspect-square" onClick={e => e.stopPropagation()}>
            <Image src={mainImage} alt={decodeHTMLEntities(product.name)} fill className="object-contain" sizes="90vw" />
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <section className="w-full px-4 md:px-20 py-3 bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex items-center gap-1.5 text-sm flex-wrap">
          <Link href="/" className="text-emerald-500 hover:underline font-inter">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          <Link href={`/products/${categorySlug}`} className="text-emerald-500 hover:underline capitalize font-inter">
            {decodeHTMLEntities(categorySlug.replace(/-/g, ' '))}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-gray-600 font-inter line-clamp-1">{decodeHTMLEntities(product.name)}</span>
        </div>
      </section>

      {/* ── Main product section ── */}
      <section className="w-full px-4 md:px-20 py-8 md:py-12">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-8 xl:gap-14 items-start">

          {/* LEFT — Images */}
          <div className="w-full lg:w-[540px] shrink-0 flex flex-col gap-3">
            <div className="relative w-full aspect-[589/480] bg-white rounded-[20px] shadow-[0px_4px_20px_0px_rgba(15,81,50,0.06)] border border-green-900/5 overflow-hidden">
              {mainImage ? (
                <Image src={mainImage} alt={decodeHTMLEntities(product.name)} fill
                  className="object-contain p-4" sizes="(max-width:1024px) 100vw,540px" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-200" />
                </div>
              )}
              <button onClick={() => setLightboxOpen(true)}
                className="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-2xl flex items-center justify-center shadow-sm"
                aria-label="View full size">
                <Maximize2 className="w-4 h-4 text-neutral-700" />
              </button>
            </div>
            {uniqueImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {uniqueImages.map((img, idx) => (
                  <button key={`${img.id}-${idx}`} onClick={() => setMainImage(img.src)}
                    className={`relative w-16 h-16 shrink-0 rounded-[10px] overflow-hidden border-2 transition-all ${
                      mainImage === img.src ? 'border-green-700' : 'border-gray-100 hover:border-gray-300'
                    }`}>
                    <Image src={img.src} alt={img.alt || product.name} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Info & Config */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Title + rating */}
            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 text-2xl sm:text-3xl xl:text-4xl font-semibold font-outfit leading-tight">
                {decodeHTMLEntities(product.name)}
              </h1>
              {avgRating > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <StarRow rating={avgRating} size="md" />
                  <span className="text-neutral-900 text-sm font-semibold font-inter">{avgRating.toFixed(1)}</span>
                  <span className="text-gray-500 text-xs font-inter">
                    ({ratingCount.toLocaleString()} reviews)
                  </span>
                </div>
              )}
              <div className="text-gray-600 text-sm font-inter leading-6"
                dangerouslySetInnerHTML={{ __html: product.short_description }} />
            </div>

            {/* Attributes */}
            {product.attributes
              .filter(a => !a.name.toLowerCase().includes('material') && !a.name.toLowerCase().includes('fabric'))
              .map((attr, idx) => {
                const isColor  = attr.name.toLowerCase() === 'color';
                const selected = selectedAttributes[attr.name] ?? [];
                const error    = validationErrors[attr.name];
                return (
                  <div key={`${attr.name}-${idx}`} id={`attr-${attr.name}`} className={`flex flex-col gap-2.5 ${error ? 'p-3 rounded-xl border border-red-200 bg-red-50/40' : ''}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-900 text-base sm:text-lg font-semibold font-inter leading-7">
                        {isColor
                          ? <>Choose Color <span className="text-slate-500 text-sm sm:text-base font-normal">(Select Multiple)</span></>
                          : <>Choose {attr.name} <span className="text-red-500 text-sm">*</span></>}
                      </span>
                      {error && (
                        <span className="text-red-500 text-xs font-medium font-inter">{error}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map(opt => {
                        const isSel = selected.includes(opt);
                        if (isColor) {
                          const hex   = COLOR_MAP[opt.toLowerCase().trim()] ?? null;
                          const light = hex ? isLightColor(hex) : false;
                          return hex ? (
                            <button key={opt} title={opt} onClick={() => toggleAttr(attr.name, opt, true)}
                              aria-label={opt} aria-pressed={isSel}
                              className={`relative w-6 h-6 rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                                isSel ? 'border-transparent ring-[3.5px] ring-green-500 scale-110' : 'border-gray-200 hover:scale-110'
                              }`}
                              style={{ backgroundColor: hex }}>
                              {isSel && <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-black ${light ? 'text-gray-800' : 'text-white'}`}>✓</span>}
                              {light && <span className="absolute inset-0 rounded-full ring-1 ring-gray-200" />}
                            </button>
                          ) : (
                            <button key={opt} onClick={() => toggleAttr(attr.name, opt, true)}
                              className={`px-3 py-1.5 rounded-lg border text-sm font-inter font-medium transition-all ${isSel ? 'border-green-700 bg-green-50 text-green-700' : 'border-gray-200 text-gray-700 hover:border-green-700'}`}>
                              {opt}
                            </button>
                          );
                        }
                        return (
                          <button key={opt} onClick={() => toggleAttr(attr.name, opt, false)}
                            className={`flex-1 min-w-[44px] h-11 px-2 sm:px-3 rounded-[10px] font-bold font-inter text-sm sm:text-base border-[1.31px] transition-all ${
                              isSel ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-700 border-gray-300 hover:border-green-700'
                            }`}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            {/* Quantity */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-neutral-900 text-sm font-bold font-inter">Quantity:</span>
                <span className="text-gray-500 text-xs font-inter">Min. 1</span>
              </div>
              <div className="w-36 sm:w-40 h-11 sm:h-12 bg-white rounded-lg border border-green-900/10 flex items-center overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-full flex items-center justify-center hover:bg-gray-50 border-r border-gray-100" aria-label="Decrease">
                  <Minus className="w-4 h-4 text-neutral-700" />
                </button>
                <div className="flex-1 text-center text-neutral-900 text-base font-bold font-inter">{quantity}</div>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-full flex items-center justify-center hover:bg-gray-50 border-l border-gray-100" aria-label="Increase">
                  <Plus className="w-4 h-4 text-neutral-700" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-2">
              <div className="px-4 sm:px-5 py-4 bg-green-50/50 rounded-xl flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="text-green-700 text-2xl sm:text-3xl font-extrabold font-outfit">{fmt(unitPrice)}</span>
                <span className="text-zinc-500 text-xs sm:text-sm font-inter leading-5">
                  per unit (With your Logo) · Total:{' '}
                  <span className="text-green-700 font-bold">{fmt(unitPrice * quantity)}</span>
                </span>
                {isOnSale && <span className="text-gray-400 text-sm line-through font-inter">{fmt(regularUnitPrice)}</span>}
              </div>
              <p className="text-green-700 text-xs sm:text-sm font-inter leading-5">
                Shipping and final pricing is calculated at checkout
              </p>
            </div>

            {/* Bulk pricing */}
            {product.acf?.bulk_pricing && product.acf.bulk_pricing.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100">
                <h4 className="text-gray-900 font-bold mb-3 flex items-center gap-2 text-sm font-inter">
                  <SlidersHorizontal className="w-4 h-4 text-green-700" /> Bulk Pricing
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {product.acf.bulk_pricing.map((tier, i) => (
                    <div key={i} className={`p-3 rounded-xl border transition-all ${quantity >= tier.min_qty ? 'bg-white border-green-700 shadow-sm' : 'bg-transparent border-gray-200 opacity-60'}`}>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block font-inter">{tier.min_qty}+ units</span>
                      <span className="text-base sm:text-lg font-black text-green-700 font-outfit">{fmt(parseFloat(tier.discount_price))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Print Area */}
            <div className="flex flex-col gap-2.5">
              <span className="text-slate-900 text-base sm:text-lg font-semibold font-inter leading-7">Print Area</span>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {printAreas.map(area => (
                  <button key={area} onClick={() => setSelectedPrintArea(area)}
                    className={`px-2 sm:px-4 py-3 rounded-[10px] border-[1.31px] text-xs sm:text-base font-bold font-inter leading-tight text-center transition-all ${
                      selectedPrintArea === area ? 'border-green-700 text-green-700 bg-white' : 'border-gray-300 text-gray-700 bg-white hover:border-green-700'
                    }`}>
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Production Time */}
            <div className="flex flex-col gap-2.5">
              <span className="text-slate-900 text-base sm:text-lg font-semibold font-inter leading-7">Production Time</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {(product.acf?.production_options?.length
                  ? product.acf.production_options.map(opt => ({
                      key:      opt.type,
                      label:    opt.type === 'urgent' ? 'Urgent Production' : 'Regular Production',
                      subtitle: `${opt.delivery_days} Days${opt.type === 'regular' ? ' - Standard turnaround' : ' - Priority Manufacturing'}`,
                    }))
                  : [
                      { key: 'regular', label: 'Regular Production', subtitle: '2-5 Days - Standard turnaround' },
                      { key: 'urgent',  label: 'Urgent Production',  subtitle: '2 days - Priority Manufacturing' },
                    ]
                ).map(opt => (
                  <button key={opt.key} onClick={() => setSelectedProduction(opt.key)}
                    className={`px-4 py-3 rounded-[10px] border-[1.31px] flex flex-col items-center gap-0.5 transition-all ${
                      selectedProduction === opt.key ? 'border-green-700 text-green-700 bg-white' : 'border-gray-300 text-gray-700 bg-white hover:border-green-700'
                    }`}>
                    <span className="text-sm sm:text-base font-bold font-inter">{opt.label}</span>
                    <span className={`text-xs font-inter leading-4 ${selectedProduction === opt.key ? 'text-green-700' : 'text-gray-500'}`}>{opt.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Material — only show when there are options */}
            {materials.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-neutral-900 text-sm font-bold font-inter">Material:</span>
                <div className="p-2.5 bg-white rounded-lg border border-green-900/10">
                  <div className="relative">
                    <select value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)}
                      className="w-full px-3 py-2 pr-8 appearance-none bg-transparent text-gray-700 text-sm font-inter leading-5 focus:outline-none cursor-pointer"
                      aria-label="Select material">
                      {materials.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-700 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-1">
              {buyAsIs && (
                <Link href={`/products/${categorySlug}/${product.slug}/designs`}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-inter font-medium py-3.5 sm:py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <LayoutGrid className="w-5 h-5" /> Choose a Ready-Made Design
                </Link>
              )}
              {showUploadBtn && (
                <Link href={`/upload?product=${product.id}`}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-inter font-medium py-3.5 sm:py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <Upload className="w-5 h-5" /> Upload your Design
                </Link>
              )}
              {showDesignBtn && (
                <Link href={`/design?product=${product.id}`}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-inter font-medium py-3.5 sm:py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <Upload className="w-5 h-5" /> Design Your Own
                </Link>
              )}
              <button onClick={handleAddToCart}
                className="w-full bg-white border-2 border-green-700 text-green-700 hover:bg-green-50 font-bold font-inter py-3.5 sm:py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs ── */}
      <section className="w-full px-4 md:px-20 py-8 md:py-10">
        <div className="max-w-[1280px] mx-auto bg-white rounded-2xl border border-gray-200 p-4 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar -mx-1">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-3 sm:px-4 pt-3 pb-3 text-base sm:text-xl font-medium font-outfit transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab ? 'text-green-700 border-green-700' : 'text-zinc-500 border-transparent hover:text-green-700'
                }`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="w-full">{tabContent()}</div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="w-full px-4 md:px-20 py-8 md:py-10">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
          <h2 className="text-slate-900 text-2xl sm:text-4xl font-semibold font-outfit leading-tight">Reviews</h2>

          <div className="bg-white flex flex-col gap-6">

            {/* Rating summary — only shown when product has ratings */}
            {ratingCount > 0 && (
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
                {/* Score card */}
                <div className="w-full sm:w-56 p-6 bg-green-50 rounded-2xl flex flex-col justify-center items-center gap-2 shrink-0">
                  <span className="text-green-700 text-5xl sm:text-6xl font-bold font-inter tracking-tight leading-none">
                    {avgRating.toFixed(1)}
                  </span>
                  <div className="py-1"><StarRow rating={avgRating} size="lg" /></div>
                  <span className="text-zinc-500 text-xs sm:text-sm font-inter text-center">
                    Based on {ratingCount.toLocaleString()} reviews
                  </span>
                </div>
                {/* Breakdown bars */}
                <div className="flex-1 w-full flex flex-col gap-2">
                  {breakdown.map(row => (
                    <RatingBar key={row.stars} stars={row.stars} count={row.count} total={ratingCount} />
                  ))}
                </div>
              </div>
            )}

            {/* Customer reviews header */}
            <div className="flex justify-between items-center border-t border-gray-100 pt-5">
              <h3 className="text-slate-800 text-base sm:text-lg font-semibold font-inter">Customer Reviews</h3>
              <button
                onClick={() => setReviewFormOpen(true)}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 rounded-[10px] text-white text-sm font-semibold font-inter transition-all active:scale-95"
              >
                Write a Review
              </button>
            </div>

            {/* Review list — live from WC */}
            {reviewsLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map(i => (
                  <div key={i} className="p-5 rounded-2xl border border-gray-100 animate-pulse flex flex-col gap-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-2 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-2 bg-gray-100 rounded w-full" />
                    <div className="h-2 bg-gray-100 rounded w-4/5" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-gray-400 text-sm font-inter italic py-4">
                No reviews yet — be the first to review this product!
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map(review => {
                  // Build initials from reviewer name
                  const parts    = review.name.trim().split(' ');
                  const initials = parts.length >= 2
                    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
                    : review.name.slice(0, 2).toUpperCase();
                  const date = new Date(review.date_created).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  });
                  // Strip HTML tags from review body (WC sometimes wraps in <p>)
                  const body = review.review.replace(/<[^>]*>/g, '').trim();

                  return (
                    <div key={review.id} className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 flex flex-col gap-2.5 shadow-sm">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm font-inter shrink-0">
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-800 text-sm font-semibold font-inter leading-5">{review.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <StarRow rating={review.rating} size="sm" />
                              {review.verified && (
                                <span className="text-green-700 text-[10px] font-semibold font-inter bg-green-50 border border-green-100 px-2 py-0.5 rounded-full tracking-tight">
                                  ✓ Verified Purchase
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-zinc-500 text-xs font-inter shrink-0">{date}</span>
                      </div>
                      {body && <p className="text-zinc-500 text-sm font-inter leading-6">{body}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Related Products ── */}
      {(relatedLoading || relatedProducts.length > 0) && (
        <section className="w-full px-4 md:px-20 py-8 md:py-10">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-6 sm:gap-8">
            <h2 className="text-slate-900 text-2xl sm:text-4xl font-semibold font-outfit leading-tight">Related Products</h2>
            {relatedLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-48 sm:h-56 bg-gray-100" />
                    <div className="p-4 flex flex-col gap-2.5">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="flex justify-between items-center pt-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-8 w-14 bg-gray-200 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map(p => <RelatedCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}
