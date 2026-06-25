"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, X, ChevronDown,
  Package, ShoppingCart, Bookmark, Share2, Sparkles,
} from 'lucide-react';
import { DesignTemplate } from '@/app/api/design-templates/route';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FilterState {
  category: string;
  style:    string;
  search:   string;
}

type RichTemplate = DesignTemplate & {
  industry:  string;
  styles:    string[];
  previewBg: string;
};

// ── Display metadata ──────────────────────────────────────────────────────────
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

function enrich(t: DesignTemplate): RichTemplate {
  return {
    ...t,
    industry:  INDUSTRIES[t.category]     ?? t.category,
    styles:    STYLES[t.id]               ?? [],
    previewBg: PREVIEW_COLORS[t.category] ?? '#F9FAFB',
  };
}

// ── Design preview ────────────────────────────────────────────────────────────
function DesignPreview({ template, scale = 0.42 }: { template: RichTemplate; scale?: number }) {
  const texts = template.elements.filter(el => el.type === 'text').slice(0, 3);
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: template.previewBg }}>
      {texts.map((el, i) => (
        <span key={i} className="text-center px-3 leading-snug select-none"
          style={{
            color:        el.color      ?? '#111827',
            fontFamily:   el.fontFamily ?? 'Inter, sans-serif',
            fontSize:     Math.round((el.fontSize ?? 24) * scale),
            fontWeight:   el.fontWeight ?? '700',
            maxWidth:     '90%',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
          {el.content}
        </span>
      ))}
    </div>
  );
}

// ── Template card ─────────────────────────────────────────────────────────────
function TemplateCard({ template, onPreview }: { template: RichTemplate; onPreview: (t: RichTemplate) => void }) {
  return (
    <div
      onClick={() => onPreview(template)}
      className="bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] overflow-hidden group hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
    >
      <div className="relative w-full aspect-[4/3]">
        <DesignPreview template={template} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
          <button
            onClick={e => { e.stopPropagation(); onPreview(template); }}
            className="opacity-0 group-hover:opacity-100 transition-all px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold font-inter rounded-xl shadow-lg active:scale-95"
          >
            Preview
          </button>
        </div>
      </div>
      <div className="p-3 sm:p-4 flex flex-col gap-1.5">
        <h3 className="text-gray-900 text-sm sm:text-base font-bold font-inter leading-5 line-clamp-1">{template.name}</h3>
        <p className="text-gray-500 text-xs sm:text-sm font-inter leading-4">{template.industry}</p>
        {template.styles.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {template.styles.slice(0, 2).map(s => (
              <span key={s} className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 text-[10px] sm:text-xs font-inter leading-4">{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Preview modal ─────────────────────────────────────────────────────────────
function PreviewModal({
  template, related, onClose, onSelectRelated, onAddToCart,
}: {
  template: RichTemplate;
  related: RichTemplate[];
  onClose: () => void;
  onSelectRelated: (t: RichTemplate) => void;
  onAddToCart: (t: RichTemplate) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-[978px] max-h-[92dvh] sm:max-h-[90dvh] overflow-y-auto no-scrollbar rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle on mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="p-4 sm:p-8 lg:p-10 flex flex-col gap-6 sm:gap-10">

          {/* Top section */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
            {/* Close */}
            <button onClick={onClose}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
              aria-label="Close">
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Preview */}
            <div className="w-full sm:flex-1 min-h-[200px] sm:min-h-[340px] lg:min-h-[475px] rounded-xl overflow-hidden">
              <DesignPreview template={template} scale={0.65} />
            </div>

            {/* Info panel */}
            <div className="w-full sm:w-72 lg:w-80 flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col gap-2.5">
                <h2 className="text-gray-900 text-lg font-semibold font-inter leading-6">{template.name}</h2>
                <p className="text-gray-600 text-sm font-inter leading-5">{template.industry}</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-1.5">
                    {template.styles.map(s => (
                      <span key={s} className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs font-inter leading-4">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Share"
                      onClick={() => navigator.share?.({ title: template.name, url: window.location.href })}
                    >
                      <Share2 className="w-4 h-4 text-zinc-500" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Save">
                      <Bookmark className="w-4 h-4 text-zinc-500" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onAddToCart(template)}
                className="w-full px-6 py-3.5 bg-green-700 hover:bg-green-800 rounded-[10px] flex items-center justify-center gap-2 text-white text-base font-medium font-inter transition-all active:scale-[0.98]"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>

          {/* More like this */}
          {related.length > 0 && (
            <div className="flex flex-col gap-4 sm:gap-6">
              <h3 className="text-slate-900 text-2xl sm:text-4xl font-bold font-outfit leading-tight">More like this</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {related.map(t => (
                  <div key={t.id}
                    onClick={() => onSelectRelated(t)}
                    className="bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group">
                    <div className="relative w-full aspect-[4/3]">
                      <DesignPreview template={t} scale={0.35} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                        <button className="opacity-0 group-hover:opacity-100 transition-all px-3 py-1.5 bg-green-700 text-white text-xs font-semibold font-inter rounded-lg shadow-md active:scale-95">Preview</button>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-1">
                      <p className="text-gray-900 text-sm font-bold font-inter leading-5 line-clamp-1">{t.name}</p>
                      <p className="text-gray-500 text-xs font-inter leading-4">{t.industry}</p>
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
function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-gray-700 text-sm font-bold font-inter">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full p-2.5 pr-8 rounded-[10px] border border-gray-300 bg-white text-sm font-inter appearance-none focus:outline-none focus:border-green-600 cursor-pointer">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DesignsPage() {
  const { addToCart }        = useCart();
  const { showNotification } = useNotification();

  const [templates,   setTemplates]   = useState<RichTemplate[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [preview,     setPreview]     = useState<RichTemplate | null>(null);
  const [filters,     setFilters]     = useState<FilterState>({ category: 'All', style: 'All', search: '' });

  useEffect(() => {
    setLoading(true);
    fetch('/api/design-templates?category=all')
      .then(r => r.ok ? r.json() : { templates: [] })
      .then((data: { templates: DesignTemplate[] }) => setTemplates((data.templates ?? []).map(enrich)))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(templates.map(t => t.industry)));
    return ['All', ...cats];
  }, [templates]);

  const styleOptions = useMemo(() => {
    const styles = Array.from(new Set(templates.flatMap(t => t.styles)));
    return ['All', ...styles];
  }, [templates]);

  const visible = useMemo(() => {
    const q = filters.search.toLowerCase();
    return templates.filter(t => {
      if (q && !t.name.toLowerCase().includes(q) && !t.industry.toLowerCase().includes(q)) return false;
      if (filters.category !== 'All' && t.industry !== filters.category) return false;
      if (filters.style    !== 'All' && !t.styles.includes(filters.style)) return false;
      return true;
    });
  }, [templates, filters]);

  const related = useMemo(() => {
    if (!preview) return [];
    return templates.filter(t => t.category === preview.category && t.id !== preview.id).slice(0, 6);
  }, [templates, preview]);

  const clearFilters = () => setFilters({ category: 'All', style: 'All', search: '' });
  const hasActive = filters.category !== 'All' || filters.style !== 'All' || filters.search !== '';

  const handleAddToCart = useCallback((template: RichTemplate) => {
    addToCart({ id: 0, name: `Ready-Made Design: ${template.name}`, price: 0, quantity: 1, image: '' });
    showNotification({ title: 'Design Selected', message: `${template.name} added to your order.`, type: 'cart' });
    setPreview(null);
  }, [addToCart, showNotification]);

  return (
    <main className="w-full flex flex-col items-center bg-white">

      {preview && (
        <PreviewModal
          template={preview} related={related}
          onClose={() => setPreview(null)}
          onSelectRelated={setPreview}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Hero */}
      <section className="w-full px-4 md:px-20 py-10 sm:py-16 bg-gradient-to-br from-emerald-50 to-green-50 border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-700/10 rounded-full">
            <Sparkles className="w-4 h-4 text-green-700" />
            <span className="text-green-700 text-xs font-semibold font-inter uppercase tracking-wider">Ready to order</span>
          </div>
          <h1 className="text-green-700 text-3xl sm:text-5xl font-bold font-outfit leading-tight max-w-2xl">
            Choose a Ready-Made Design
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-inter leading-7 max-w-xl">
            Pick a finished design you love and order directly — no editing or uploads needed.
          </p>
          <Link href="/design"
            className="mt-2 px-6 py-3 bg-gray-900 hover:bg-black text-white text-sm font-semibold font-inter rounded-xl transition-all active:scale-95">
            Or design your own from scratch →
          </Link>
        </div>
      </section>

      {/* Content */}
      <section className="w-full px-4 md:px-20 py-6 sm:py-10 bg-gray-50 min-h-screen">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-5 sm:gap-6">

          {/* Search + filter toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Search templates…"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full h-12 pl-9 pr-4 bg-white rounded-xl border border-gray-200 text-sm font-inter text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-green-600 shadow-sm"
              />
            </div>
            <button onClick={() => setFiltersOpen(v => !v)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 text-gray-700 text-sm font-medium font-inter whitespace-nowrap hover:border-green-600 shadow-sm transition-all">
              <SlidersHorizontal className="w-4 h-4" />
              {filtersOpen ? 'Hide Filters' : 'Filters'}
              {hasActive && <span className="w-2 h-2 bg-green-600 rounded-full" />}
            </button>
          </div>

          {/* Filters */}
          {filtersOpen && (
            <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FilterSelect label="Category" value={filters.category} options={categoryOptions}
                  onChange={v => setFilters(prev => ({ ...prev, category: v }))} />
                <FilterSelect label="Style" value={filters.style} options={styleOptions}
                  onChange={v => setFilters(prev => ({ ...prev, style: v }))} />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-500 text-sm font-inter">
                  Showing <strong className="text-gray-900">{loading ? '…' : visible.length}</strong> of{' '}
                  <strong className="text-gray-900">{templates.length}</strong> templates
                </span>
                {hasActive && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-green-700 text-sm font-medium font-inter hover:text-green-800">
                    <X className="w-3.5 h-3.5" /> Clear all
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results count (when filters closed) */}
          {!filtersOpen && !loading && (
            <p className="text-gray-500 text-sm font-inter">
              {visible.length} template{visible.length !== 1 ? 's' : ''} available
              {hasActive && (
                <button onClick={clearFilters} className="ml-2 text-green-700 underline text-sm font-inter">clear filters</button>
              )}
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-100" />
                  <div className="p-3 sm:p-4 flex flex-col gap-2">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold font-inter text-center">No templates match your search.</p>
              {hasActive && (
                <button onClick={clearFilters} className="px-5 py-2.5 bg-green-700 text-white text-sm font-bold font-inter rounded-xl hover:bg-green-800 transition-colors">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {visible.map(t => <TemplateCard key={t.id} template={t} onPreview={setPreview} />)}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
