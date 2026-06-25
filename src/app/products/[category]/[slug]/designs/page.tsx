"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Search, SlidersHorizontal, X, ChevronDown,
  Package, ShoppingCart, Bookmark, Share2,
} from 'lucide-react';
import { DesignTemplate } from '@/app/api/design-templates/route';
import { decodeHTMLEntities } from '@/lib/wordpress';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FilterState {
  category: string;
  industry: string;
  color:    string;
  style:    string;
  search:   string;
}

type RichTemplate = DesignTemplate & {
  industry:  string;
  styles:    string[];
  previewBg: string;
};

// ── Display metadata maps ─────────────────────────────────────────────────────
const INDUSTRIES: Record<string, string> = {
  apparel:    'Fashion & Apparel',
  mug:        'Food & Beverage',
  corporate:  'Business & Corporate',
  sticker:    'Creative',
  banner:     'Marketing & Events',
};

const STYLES: Record<string, string[]> = {
  'tshirt-bold':          ['Modern', 'Minimalist'],
  'tshirt-slogan':        ['Retro', 'Classic'],
  'tshirt-minimal':       ['Modern', 'Abstract'],
  'mug-birthday':         ['Playful', 'Colourful'],
  'mug-motivational':     ['Elegant', 'Minimal'],
  'corp-badge':           ['Professional', 'Corporate'],
  'corp-event':           ['Elegant', 'Corporate'],
  'sticker-fun':          ['Bold', 'Playful'],
  'sticker-custom':       ['Retro', 'Handmade'],
  'banner-sale':          ['Bold', 'Promotional'],
  'banner-grand-opening': ['Modern', 'Celebratory'],
};

const PREVIEW_COLORS: Record<string, string> = {
  apparel:   '#EEF2FF',
  mug:       '#FEF3C7',
  corporate: '#ECFDF5',
  sticker:   '#FFF7ED',
  banner:    '#F0FDF4',
};

function enrichTemplate(t: DesignTemplate): RichTemplate {
  return {
    ...t,
    industry:  INDUSTRIES[t.category]     ?? t.category,
    styles:    STYLES[t.id]               ?? [],
    previewBg: PREVIEW_COLORS[t.category] ?? '#F9FAFB',
  };
}

// ── Mini design preview renderer ──────────────────────────────────────────────
function DesignPreview({
  template,
  scale = 0.45,
  className = '',
}: {
  template: RichTemplate;
  scale?: number;
  className?: string;
}) {
  const texts = template.elements.filter(el => el.type === 'text').slice(0, 3);
  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{ background: template.previewBg }}
    >
      {texts.map((el, i) => (
        <span
          key={i}
          className="text-center px-4 leading-snug select-none"
          style={{
            color:      el.color      ?? '#111827',
            fontFamily: el.fontFamily ?? 'Inter, sans-serif',
            fontSize:   Math.round((el.fontSize ?? 24) * scale),
            fontWeight: el.fontWeight ?? '700',
            maxWidth:   '90%',
            overflow:   'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {el.content}
        </span>
      ))}
    </div>
  );
}

// ── Template card ─────────────────────────────────────────────────────────────
function TemplateCard({
  template,
  onPreview,
}: {
  template: RichTemplate;
  onPreview: (t: RichTemplate) => void;
}) {
  return (
    <div
      className="bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] overflow-hidden group hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
      onClick={() => onPreview(template)}
    >
      {/* Preview */}
      <div className="relative w-full aspect-[4/3]">
        <DesignPreview template={template} scale={0.42} />
        {/* Hover overlay with CTA */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
          <button
            onClick={e => { e.stopPropagation(); onPreview(template); }}
            className="opacity-0 group-hover:opacity-100 transition-all px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold font-inter rounded-xl shadow-lg active:scale-95"
          >
            Preview Design
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5">
        <h3 className="text-gray-900 text-base sm:text-lg font-bold font-inter leading-6 line-clamp-1">
          {template.name}
        </h3>
        {template.industry && (
          <p className="text-gray-600 text-sm font-inter leading-5">{template.industry}</p>
        )}
        {template.styles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {template.styles.map(s => (
              <span key={s} className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs font-inter leading-4">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Preview modal ─────────────────────────────────────────────────────────────
function PreviewModal({
  template,
  related,
  onClose,
  onSelectRelated,
  onAddToCart,
}: {
  template:        RichTemplate;
  related:         RichTemplate[];
  onClose:         () => void;
  onSelectRelated: (t: RichTemplate) => void;
  onAddToCart:     (t: RichTemplate) => void;
}) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[978px] max-h-[90dvh] overflow-y-auto no-scrollbar flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-10 flex flex-col gap-10">

          {/* Top: preview + info */}
          <div className="flex flex-col lg:flex-row gap-6 relative">

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
              aria-label="Close preview"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Large preview */}
            <div className="flex-1 min-h-[240px] sm:min-h-[340px] lg:min-h-[475px] rounded-xl overflow-hidden">
              <DesignPreview template={template} scale={0.7} className="rounded-xl" />
            </div>

            {/* Sidebar info */}
            <div className="w-full lg:w-80 flex flex-col gap-6 justify-start">
              <div className="flex flex-col gap-3">
                <h2 className="text-gray-900 text-lg font-semibold font-inter leading-6">
                  {template.name}
                </h2>
                <p className="text-gray-600 text-sm font-inter leading-5">{template.industry}</p>

                {/* Tags + icons row */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {template.styles.map(s => (
                      <span key={s} className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs font-inter leading-4">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                      className="w-8 h-8 p-1 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                      aria-label="Share design"
                      onClick={() => navigator.share?.({ title: template.name, url: window.location.href })}
                    >
                      <Share2 className="w-5 h-5 text-zinc-500" />
                    </button>
                    <button
                      className="w-8 h-8 p-1 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                      aria-label="Save design"
                    >
                      <Bookmark className="w-4 h-4 text-zinc-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => onAddToCart(template)}
                className="w-full px-6 py-3 bg-green-700 hover:bg-green-800 rounded-[10px] flex items-center justify-center gap-2 text-white text-base font-medium font-inter leading-4 transition-all active:scale-[0.98]"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>

          {/* More like this */}
          {related.length > 0 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-slate-900 text-2xl sm:text-4xl font-bold font-outfit leading-tight">
                More like this
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {related.map(t => (
                  <div
                    key={t.id}
                    className="bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group"
                    onClick={() => onSelectRelated(t)}
                  >
                    <div className="relative w-full aspect-[4/3]">
                      <DesignPreview template={t} scale={0.38} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                        <button className="opacity-0 group-hover:opacity-100 transition-all px-3 py-1.5 bg-green-700 text-white text-xs font-semibold font-inter rounded-lg shadow-md active:scale-95">
                          Preview
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <p className="text-gray-900 text-base font-bold font-inter leading-6 line-clamp-1">{t.name}</p>
                      <p className="text-gray-600 text-sm font-inter leading-5">{t.industry}</p>
                      {t.styles.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {t.styles.map(s => (
                            <span key={s} className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs font-inter leading-4">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Filter select ─────────────────────────────────────────────────────────────
function FilterSelect({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-gray-700 text-sm font-bold font-inter leading-5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full p-2.5 pr-8 rounded-[10px] border border-gray-300 bg-white text-black text-base font-inter leading-5 appearance-none focus:outline-none focus:border-green-600 cursor-pointer"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 pointer-events-none" />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DesignsGalleryPage() {
  const params   = useParams<{ category: string; slug: string }>();
  const category = params.category ?? '';
  const slug     = params.slug     ?? '';

  const { addToCart }        = useCart();
  const { showNotification } = useNotification();

  const [templates,   setTemplates]   = useState<RichTemplate[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [preview,     setPreview]     = useState<RichTemplate | null>(null);
  const [filters,     setFilters]     = useState<FilterState>({
    category: 'All', industry: 'All', color: 'Select Color', style: 'All', search: '',
  });

  useEffect(() => {
    setLoading(true);
    fetch('/api/design-templates?category=all')
      .then(r => r.ok ? r.json() : { templates: [] })
      .then((data: { templates: DesignTemplate[] }) => {
        setTemplates((data.templates ?? []).map(enrichTemplate));
      })
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(templates.map(t => t.category)));
    return ['All', ...cats.map(c => INDUSTRIES[c] ?? c)];
  }, [templates]);

  const styleOptions = useMemo(() => {
    const styles = Array.from(new Set(templates.flatMap(t => t.styles)));
    return ['All', ...styles];
  }, [templates]);

  const colorOptions = ['Select Color', 'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink'];

  const visible = useMemo(() => {
    const q = filters.search.toLowerCase();
    return templates.filter(t => {
      if (q && !t.name.toLowerCase().includes(q) && !t.industry.toLowerCase().includes(q)) return false;
      if (filters.category !== 'All' && t.industry !== filters.category) return false;
      if (filters.style    !== 'All' && !t.styles.includes(filters.style)) return false;
      return true;
    });
  }, [templates, filters]);

  // Related = same category as previewed template, excluding itself, max 6
  const related = useMemo(() => {
    if (!preview) return [];
    return templates
      .filter(t => t.category === preview.category && t.id !== preview.id)
      .slice(0, 6);
  }, [templates, preview]);

  const updateFilter = (key: keyof FilterState, val: string) =>
    setFilters(prev => ({ ...prev, [key]: val }));

  const clearFilters = () =>
    setFilters({ category: 'All', industry: 'All', color: 'Select Color', style: 'All', search: '' });

  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.style     !== 'All' ||
    filters.color     !== 'Select Color' ||
    filters.search    !== '';

  const handleAddToCart = useCallback((template: RichTemplate) => {
    addToCart({
      id:       0,  // design templates don't have a WC product ID — quantity is tied to the parent product
      name:     `Ready-Made Design: ${template.name}`,
      price:    0,
      quantity: 1,
      image:    '',
    });
    showNotification({
      title:   'Design Selected',
      message: `${template.name} added to your order.`,
      type:    'cart',
    });
    setPreview(null);
  }, [addToCart, showNotification]);

  const breadcrumbLabel = slug.replace(/-/g, ' ');

  return (
    <main className="w-full flex flex-col items-center bg-white">

      {/* Preview modal */}
      {preview && (
        <PreviewModal
          template={preview}
          related={related}
          onClose={() => setPreview(null)}
          onSelectRelated={setPreview}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Hero */}
      <section className="w-full px-4 md:px-20 py-8 bg-emerald-50 border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-2">
          <nav className="flex items-center gap-1.5 text-sm flex-wrap mb-2">
            <Link href="/" className="text-emerald-500 hover:underline font-inter">Home</Link>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            <Link href={`/products/${category}`} className="text-emerald-500 hover:underline capitalize font-inter">
              {decodeHTMLEntities(category.replace(/-/g, ' '))}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            <Link href={`/products/${category}/${slug}`} className="text-emerald-500 hover:underline capitalize font-inter">
              {decodeHTMLEntities(breadcrumbLabel)}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-600 font-inter">Buy as it is</span>
          </nav>
          <h1 className="text-green-700 text-3xl sm:text-4xl font-bold font-outfit leading-tight">
            Choose Ready Made design
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-inter leading-7 max-w-2xl">
            These are finished designs — pick one you love and order directly. No editing needed.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="w-full px-4 md:px-20 py-8 bg-gray-50">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-6">

          {/* Search + toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for any Template..."
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                className="w-full h-14 pl-9 pr-4 bg-white rounded-md border border-gray-300 text-sm font-inter text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-green-600"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(v => !v)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-[10px] border border-gray-300 text-neutral-950 text-base font-medium font-inter whitespace-nowrap hover:border-green-600 transition-all"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {filtersOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters */}
          {filtersOpen && (
            <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-sm flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FilterSelect label="Category" value={filters.category}
                  options={categoryOptions} onChange={v => updateFilter('category', v)} />
                <FilterSelect label="Industry" value={filters.industry}
                  options={categoryOptions} onChange={v => updateFilter('industry', v)} />
                <FilterSelect label="Color" value={filters.color}
                  options={colorOptions} onChange={v => updateFilter('color', v)} />
                <FilterSelect label="Style" value={filters.style}
                  options={styleOptions} onChange={v => updateFilter('style', v)} />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-600 text-sm font-inter">
                  Showing <strong className="text-gray-900">{loading ? '…' : visible.length}</strong> of{' '}
                  <strong className="text-gray-900">{templates.length}</strong> templates
                </span>
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className="flex items-center gap-1 text-green-700 text-sm font-medium font-inter hover:text-green-800 transition-colors">
                    <X className="w-3.5 h-3.5" /> Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-100" />
                  <div className="p-4 flex flex-col gap-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="flex gap-1.5 mt-1">
                      <div className="h-5 w-14 bg-gray-100 rounded" />
                      <div className="h-5 w-14 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold font-inter text-center">
                No templates match your filters.
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters}
                  className="px-5 py-2.5 bg-green-700 text-white text-sm font-bold font-inter rounded-xl hover:bg-green-800 transition-colors">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {visible.map(t => (
                <TemplateCard key={t.id} template={t} onPreview={setPreview} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
