"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Type, UploadCloud, Sticker, LayoutTemplate, Package, X, Trash2,
  ChevronDown, Plus, ChevronLeft, ChevronRight, Layers, Palette,
  Settings2, Copy, Loader2, Move, Minus,
  RefreshCw, Eye, ArrowLeft, AlignLeft, AlignCenter, AlignRight,
  ImageIcon, Circle, Search
} from 'lucide-react';
import { WPProduct, WP_URL } from '@/lib/wordpress';
import { useNotification } from '@/context/NotificationContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'graphic';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  side: 'front' | 'back';
}

interface RawTemplateElement {
  type: 'text' | 'image' | 'graphic';
  content: string;
  x: number; y: number; width: number; height: number;
  rotation?: number; opacity?: number;
  color?: string; fontFamily?: string; fontSize?: number;
  fontWeight?: string; textAlign?: 'left' | 'center' | 'right';
}
interface RawTemplate { id?: string; name?: string; category?: string; elements: RawTemplateElement[]; }

const sidebarTools = [
  { id: 'product',  icon: Package,       label: 'Product'  },
  { id: 'text',     icon: Type,          label: 'Text'     },
  { id: 'uploads',  icon: UploadCloud,   label: 'Uploads'  },
  { id: 'graphics', icon: Sticker,       label: 'Graphics' },
  { id: 'template', icon: LayoutTemplate,label: 'Template' },
];

const colorPalette = [
  "#FFFFFF","#171717","#064E3B","#B45309","#22C55E",
  "#DC2626","#8B5CF6","#0EA5E9","#F59E0B","#4B5563",
  "#374151","#EC4899","#14B8A6","#EF4444","#84CC16"
];

const fontFamilies = ['Inter','Outfit','Montserrat','Georgia','Courier New','Arial','Playfair Display','Roboto'];


// ── Design Content Component ──────────────────────────────────────────────────

function DesignContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialProductId = searchParams.get('product');
  const { showNotification } = useNotification();

  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [zoom, setZoom] = useState(100);
  const [activePropertyTab, setActivePropertyTab] = useState('Type');
  const [elements, setElements] = useState<DesignElement[]>([
    { id: '1', type: 'text', content: 'Your Design Here', x: 150, y: 300, width: 300, height: 60, rotation: 0, opacity: 1, color: '#171717', fontFamily: 'Outfit', fontSize: 32, fontWeight: '700', textAlign: 'center', side: 'front' }
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [wpProducts, setWpProducts] = useState<WPProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<WPProduct | null>(null);
  const [recentUploads, setRecentUploads] = useState<{ source_url: string; id: number }[]>([]);
  const [uploadsPage, setUploadsPage] = useState(0);
  const UPLOADS_PER_PAGE = 30;
  const [isUploading, setIsUploading] = useState(false);

  // ── Save design to review localStorage ───────────────────────────────────
  const goToReview = useCallback(() => {
    const snapshot = {
      productId: selectedProduct?.id ?? null,
      productName: selectedProduct?.name ?? 'Custom Design',
      productImage: selectedProduct?.images[0]?.src ?? null,
      productPrice: selectedProduct?.price ?? '23.95',
      elements,
    };
    localStorage.setItem('bi_review_design', JSON.stringify(snapshot));
    router.push('/design/review');
  }, [elements, selectedProduct, router]);

  // ── iOS Safari viewport height fix ──────────────────────────────────────────
  // iOS Safari's vh includes the address bar, causing overflow. We set --app-height
  // to the actual window.innerHeight and use it instead of 100vh/h-screen.
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', setAppHeight);
    return () => {
      window.removeEventListener('resize', setAppHeight);
      window.removeEventListener('orientationchange', setAppHeight);
    };
  }, []);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const inlineInputRef = useRef<HTMLTextAreaElement>(null);
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);

  // ── Graphics (Iconify) state ─────────────────────────────────────────────
  const [iconSearch, setIconSearch] = useState('print');
  const [iconResults, setIconResults] = useState<{ id: string; label: string; svgUrl: string }[]>([]);
  const [iconsLoading, setIconsLoading] = useState(false);

  // ── Templates state ──────────────────────────────────────────────────────
  const [templateCategory, setTemplateCategory] = useState('all');
  const [apiTemplates, setApiTemplates] = useState<RawTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // ── Product panel pagination ──────────────────────────────────────────────
  const PRODUCTS_PER_PAGE = 4;
  const [productPage, setProductPage] = useState(0);
  const [productSearch, setProductSearch] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const selectedElement = elements.find(el => el.id === selectedId);

  const idCounterRef = useRef(0);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // ── Fetch products & media ──────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/products-list')
      .then(r => r.json())
      .then(d => { if (!d.error) setWpProducts(Array.isArray(d) ? d : []); })
      .catch(() => {});

    if (initialProductId) {
      fetch(`/api/products/${initialProductId}`)
        .then(r => r.json())
        .then(d => { if (!d.error) setSelectedProduct(d); })
        .catch(() => {});
    }
  }, [initialProductId]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bi_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/media', { headers })
      .then(r => r.json())
      .then(d => setRecentUploads(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // ── Fetch icons from Iconify via our proxy ──────────────────────────────
  const searchIcons = useCallback(async (q: string) => {
    setIconsLoading(true);
    try {
      const res = await fetch(`/api/icons?q=${encodeURIComponent(q)}&limit=40`);
      const data = await res.json();
      setIconResults(data.icons || []);
    } catch { setIconResults([]); }
    finally { setIconsLoading(false); }
  }, []);

  const iconsLoadedRef = useRef(false);

  // Load default icons when graphics panel opens (once)
  useEffect(() => {
    if (activeTool !== 'graphics' || iconsLoadedRef.current) return;
    iconsLoadedRef.current = true;
    let cancelled = false;
    (async () => {
      setIconsLoading(true);
      try {
        const res = await fetch(`/api/icons?q=${encodeURIComponent('star crown badge shield')}&limit=40`);
        const data = await res.json();
        if (!cancelled) setIconResults(data.icons || []);
      } catch { if (!cancelled) setIconResults([]); }
      finally { if (!cancelled) setIconsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [activeTool]);

  useEffect(() => {
    if (activeTool !== 'template') return;
    let cancelled = false;
    (async () => {
      setTemplatesLoading(true);
      try {
        const res = await fetch(`/api/design-templates?category=${templateCategory}`);
        const data = await res.json();
        if (!cancelled) setApiTemplates(data.templates || []);
      } catch { if (!cancelled) setApiTemplates([]); }
      finally { if (!cancelled) setTemplatesLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [activeTool, templateCategory]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const updateElement = (id: string, updates: Partial<DesignElement>) =>
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const addTextElement = () => {
    const newId = Date.now().toString();
    setElements(prev => [...prev, {
      id: newId, type: 'text', content: 'New Text',
      x: 150, y: 250, width: 300, height: 60,
      rotation: 0, opacity: 1,
      color: '#171717', fontFamily: 'Outfit', fontSize: 32,
      fontWeight: '700', textAlign: 'center', side
    }]);
    setSelectedId(newId);
    setActiveTool(null);
  };

  const addGraphic = (content: string) => {
    idCounterRef.current += 1;
    const newId = `g-${idCounterRef.current}`;
    setElements(prev => [...prev, {
      id: newId, type: 'graphic', content,
      x: 200, y: 200, width: 150, height: 150,
      rotation: 0, opacity: 1, side
    }]);
    setSelectedId(newId);
    setActiveTool(null);
  };

  const applyTemplate = (tpl: RawTemplate) => {
    idCounterRef.current += 1;
    const base = idCounterRef.current;
    const newEls: DesignElement[] = tpl.elements.map((e: RawTemplateElement, i: number) => ({
      id: `t-${base}-${i}`,
      type: e.type,
      content: e.content,
      x: e.x, y: e.y, width: e.width, height: e.height,
      rotation: e.rotation ?? 0, opacity: e.opacity ?? 1,
      color: e.color, fontFamily: e.fontFamily,
      fontSize: e.fontSize, fontWeight: e.fontWeight,
      textAlign: e.textAlign, side
    }));
    setElements(prev => [...prev, ...newEls]);
    setSelectedId(newEls[0].id);
    setActiveTool(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await res.json();
      if (res.ok) {
        setRecentUploads(prev => [result, ...prev]);
        const newId = Date.now().toString();
        setElements(prev => [...prev, {
          id: newId, type: 'image', content: result.source_url,
          x: 200, y: 200, width: 200, height: 200,
          rotation: 0, opacity: 1, side
        }]);
        setSelectedId(newId);
        setActiveTool(null);

        // Refresh the media list so it reflects the new upload scoped to this user
        const token = typeof window !== 'undefined' ? localStorage.getItem('bi_token') : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        fetch('/api/media', { headers })
          .then(r => r.json())
          .then(d => { setRecentUploads(Array.isArray(d) ? d : []); setUploadsPage(0); })
          .catch(() => {});
      } else throw new Error(result.error);
    } catch (err: unknown) {
      showNotification({ title: 'Upload Failed', message: err instanceof Error ? err.message : 'Upload failed', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // ── Mouse drag ──────────────────────────────────────────────────────────────
  const startDrag = (clientX: number, clientY: number, id: string) => {
    const el = elements.find(item => item.id === id);
    if (!el) return;
    isDraggingRef.current = true;
    dragOffset.current = {
      x: clientX - el.x * (zoom / 100),
      y: clientY - el.y * (zoom / 100),
    };
  };

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current || !selectedId) return;
    updateElement(selectedId, {
      x: (clientX - dragOffset.current.x) / (zoom / 100),
      y: (clientY - dragOffset.current.y) / (zoom / 100),
    });
  }, [selectedId, zoom]);

  const endDrag = useCallback(() => { isDraggingRef.current = false; }, []);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    startDrag(e.clientX, e.clientY, id);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => moveDrag(e.clientX, e.clientY), [moveDrag]);
  const handleMouseUp   = useCallback(() => endDrag(), [endDrag]);

  // ── Touch drag ──────────────────────────────────────────────────────────────
  const nowRef = useRef(Date.now);

  const handleTouchStart = useCallback((e: React.TouchEvent, id: string) => {
    e.stopPropagation();

    const el = elements.find(item => item.id === id);

    // Always select and start drag — editing is done via the floating action bar "Edit" button
    lastTapRef.current = { id, time: nowRef.current() };
    setSelectedId(id);

    // Only start drag if NOT already in inline edit for this element
    if (inlineEditId !== id) {
      const t = e.touches[0];
      startDrag(t.clientX, t.clientY, id);
    }

    void el; // suppress unused warning
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, inlineEditId]);

  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, [moveDrag]);

  const handleTouchEnd = useCallback(() => endDrag(), [endDrag]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main
      className="w-full flex flex-col bg-gray-50 overflow-hidden font-['Inter'] relative"
      style={{ height: 'var(--app-height, 100dvh)' }}
    >

      {/* ── Thin Top Nav Bar ── */}
      <nav className="h-12 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-zinc-700 hover:text-green-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Store</span>
        </Link>
        <span className="text-sm font-black text-zinc-900 font-['Outfit'] tracking-tight">Design Studio</span>
        <button
          onClick={goToReview}
          className="px-4 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" /> Review
        </button>
      </nav>

      {/* ── Editor Body ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Sidebar Tools (Desktop Left) */}
        <aside className="hidden md:flex w-20 bg-white border-r border-gray-200 flex-col items-center py-4 shrink-0 z-30 shadow-sm">
          {sidebarTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(isActive ? null : tool.id)}
                className={`w-full p-2 flex flex-col items-center gap-1 transition-all mb-4 ${isActive ? 'text-green-700' : 'text-zinc-500 hover:text-gray-900'}`}
              >
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-green-700 text-white shadow-lg' : 'hover:bg-gray-100'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold tracking-tight uppercase opacity-80">{tool.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Tool Content Panel (Slide-out) */}
        <aside className={`
          fixed md:relative z-20 bg-white border-r border-gray-200 flex-col shrink-0 transition-transform duration-300
          top-12 md:top-0 bottom-0 left-0 w-full md:w-96
          ${activeTool ? 'translate-x-0 flex' : '-translate-x-full md:-translate-x-full hidden md:flex'}
        `}>
          {/* Dim overlay on mobile */}
          {activeTool && (
            <div className="md:hidden fixed inset-0 bg-black/40 z-[-1]" onClick={() => setActiveTool(null)} />
          )}

          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-stone-50/50">
            <h2 className="text-xl font-bold text-black capitalize font-['Outfit']">{activeTool}</h2>
            <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setActiveTool(null)}>
              <X className="w-5 h-5 text-neutral-950" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar">

            {/* ── Product Panel ── */}
            {activeTool === 'product' && (() => {
              const filtered = wpProducts
                .filter(p => p.acf?.enable_designer !== false)
                .filter(p => productSearch === '' || p.name.toLowerCase().includes(productSearch.toLowerCase()));
              const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
              const paginated = filtered.slice(productPage * PRODUCTS_PER_PAGE, (productPage + 1) * PRODUCTS_PER_PAGE);

              return (
                <div className="flex flex-col gap-4">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => { setProductSearch(e.target.value); setProductPage(0); }}
                      placeholder="Search products..."
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:border-green-700 outline-none"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  </div>

                  {/* Selected product indicator */}
                  {selectedProduct && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                      <Image src={selectedProduct.images[0]?.src || "https://placehold.co/32x32"} width={32} height={32} className="w-8 h-8 object-contain rounded-lg" alt={selectedProduct.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-green-700 font-black uppercase tracking-widest">Selected</p>
                        <p className="text-xs font-bold text-zinc-800 truncate">{selectedProduct.name}</p>
                      </div>
                      <button onClick={() => setSelectedProduct(null)} className="p-1 hover:bg-green-100 rounded-lg transition-colors">
                        <X className="w-3.5 h-3.5 text-green-700" />
                      </button>
                    </div>
                  )}

                  {/* Product grid — 2 cols, 2 rows = 4 per page */}
                  {wpProducts.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-10">
                      <Loader2 className="w-6 h-6 text-green-700 animate-spin" />
                      <p className="text-sm text-zinc-400">Loading products...</p>
                    </div>
                  ) : paginated.length === 0 ? (
                    <p className="text-center text-sm text-zinc-400 py-8">No products match your search.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {paginated.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => { setSelectedProduct(p); setActiveTool(null); }}
                          className={`p-3 rounded-2xl border-2 transition-all cursor-pointer group ${
                            selectedProduct?.id === p.id
                              ? 'border-green-700 bg-green-50'
                              : 'bg-gray-50 border-transparent hover:border-green-300 hover:bg-white'
                          }`}
                        >
                          <div className="aspect-square w-full overflow-hidden rounded-xl bg-white mb-2 flex items-center justify-center p-2">
                            <div className="relative w-full h-full">
                              <Image
                                src={p.images[0]?.src || "https://placehold.co/150x150"}
                                fill
                                className="object-contain group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 40vw, 160px"
                                alt={p.name}
                              />
                            </div>
                          </div>
                          <p className="text-xs font-bold text-center text-zinc-800 line-clamp-2 leading-tight">{p.name}</p>
                          {p.price && (
                            <p className="text-[10px] text-center text-green-700 font-bold mt-1">
                              from ${parseFloat(p.price).toFixed(2)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setProductPage(p => Math.max(0, p - 1))}
                        disabled={productPage === 0}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-zinc-600 hover:border-green-700 hover:text-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>
                      <span className="text-xs text-zinc-400 font-medium">
                        {productPage + 1} / {totalPages}
                      </span>
                      <button
                        onClick={() => setProductPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={productPage >= totalPages - 1}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-zinc-600 hover:border-green-700 hover:text-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <p className="text-[10px] text-zinc-300 text-center">
                    {filtered.length} product{filtered.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              );
            })()}

            {/* ── Text Panel ── */}
            {activeTool === 'text' && (
              <div className="flex flex-col gap-6">
                <p className="text-black/60 text-sm leading-relaxed">Edit your text below, or click a text field directly on your design.</p>
                <button onClick={addTextElement} className="w-full py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Add New Text
                </button>
              </div>
            )}

            {/* ── Uploads Panel ── */}
            {activeTool === 'uploads' && (() => {
              const totalUploadPages = Math.ceil(recentUploads.length / UPLOADS_PER_PAGE);
              const pagedUploads = recentUploads.slice(
                uploadsPage * UPLOADS_PER_PAGE,
                (uploadsPage + 1) * UPLOADS_PER_PAGE
              );
              return (
                <div className="flex flex-col gap-6">
                  <div onClick={() => fileInputRef.current?.click()} className="px-8 py-8 bg-green-50 rounded-2xl border-2 border-dashed border-green-700/30 hover:border-green-700 flex flex-col justify-center items-center gap-4 cursor-pointer transition-all">
                    {isUploading ? <Loader2 className="w-8 h-8 text-green-700 animate-spin" /> : <UploadCloud className="w-8 h-8 text-green-700" />}
                    <div className="text-center">
                      <p className="text-gray-900 font-bold">Upload Design</p>
                      <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest">Browse Files</p>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*" />
                  </div>

                  {recentUploads.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                          Recent uploads
                        </h3>
                        <span className="text-zinc-400 text-[10px]">
                          {recentUploads.length} file{recentUploads.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {pagedUploads.map((img) => (
                          <div
                            key={img.id}
                            onClick={() => {
                              const newId = Date.now().toString();
                              setElements(prev => [...prev, { id: newId, type: 'image', content: img.source_url, x: 200, y: 200, width: 150, height: 150, rotation: 0, opacity: 1, side }]);
                              setSelectedId(newId);
                              setActiveTool(null);
                            }}
                            className="relative aspect-square bg-white rounded-lg border border-black/5 overflow-hidden cursor-pointer hover:border-green-500 transition-all hover:scale-105"
                          >
                            <Image src={img.source_url} fill className="object-cover" sizes="80px" alt="upload" />
                          </div>
                        ))}
                      </div>

                      {/* Pagination — only shown when there are more than 30 uploads */}
                      {totalUploadPages > 1 && (
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => setUploadsPage(p => Math.max(0, p - 1))}
                            disabled={uploadsPage === 0}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-zinc-600 hover:border-green-700 hover:text-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" /> Prev
                          </button>
                          <span className="text-xs text-zinc-400 font-medium">
                            {uploadsPage + 1} / {totalUploadPages}
                          </span>
                          <button
                            onClick={() => setUploadsPage(p => Math.min(totalUploadPages - 1, p + 1))}
                            disabled={uploadsPage >= totalUploadPages - 1}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-zinc-600 hover:border-green-700 hover:text-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            Next <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Graphics Panel ── */}
            {activeTool === 'graphics' && (
              <div className="flex flex-col gap-4">
                {/* Search bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={iconSearch}
                    onChange={e => setIconSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && searchIcons(iconSearch)}
                    placeholder="Search icons... (e.g. star, heart)"
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:border-green-700 outline-none"
                  />
                  <button
                    onClick={() => searchIcons(iconSearch)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-green-700 transition-colors"
                  >
                    {iconsLoading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Search className="w-4 h-4" />
                    }
                  </button>
                </div>

                {/* Quick search tags */}
                <div className="flex flex-wrap gap-2">
                  {['star','heart','fire','crown','badge','rocket','trophy','gift','music','leaf'].map(tag => (
                    <button key={tag} onClick={() => { setIconSearch(tag); searchIcons(tag); }}
                      className="px-3 py-1 bg-gray-100 hover:bg-green-100 hover:text-green-700 rounded-full text-xs font-bold transition-colors capitalize">
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Results grid */}
                {iconsLoading && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
                  </div>
                )}
                {!iconsLoading && iconResults.length === 0 && (
                  <p className="text-center text-sm text-zinc-400 py-6">No icons found. Try a different search.</p>
                )}
                {!iconsLoading && iconResults.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {iconResults.map(icon => (
                      <div key={icon.id} onClick={() => addGraphic(icon.svgUrl)}
                        title={icon.label}
                        className="aspect-square bg-gray-50 rounded-xl border border-gray-100 hover:border-green-500 cursor-pointer flex flex-col items-center justify-center gap-1.5 p-2 transition-all hover:scale-105 hover:bg-green-50">
                        <Image src={icon.svgUrl} width={40} height={40} className="object-contain" alt={icon.label} />
                        <span className="text-[9px] font-bold text-zinc-400 truncate w-full text-center">{icon.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-zinc-300 text-center mt-2">Icons via Iconify · Open source · Free to use</p>
              </div>
            )}

            {/* ── Template Panel ── */}
            {activeTool === 'template' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-zinc-800">Choose a template</p>
                  <p className="text-xs text-zinc-400">Click any template to add it to your canvas. You can edit everything after.</p>
                </div>

                {/* Category filter with icons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all',       label: 'All',      Icon: Layers        },
                    { id: 'apparel',   label: 'Apparel',  Icon: Package       },
                    { id: 'mug',       label: 'Mug',      Icon: Circle        },
                    { id: 'corporate', label: 'Business', Icon: Settings2     },
                    { id: 'sticker',   label: 'Sticker',  Icon: Sticker       },
                    { id: 'banner',    label: 'Banner',   Icon: LayoutTemplate},
                  ].map(({ id: cat, label, Icon }) => (
                    <button key={cat} onClick={() => setTemplateCategory(cat)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                        ${templateCategory === cat ? 'bg-green-700 text-white shadow-sm' : 'bg-gray-100 text-zinc-500 hover:bg-green-50 hover:text-green-700'}`}>
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>

                {templatesLoading && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-green-700 animate-spin" />
                  </div>
                )}

                {!templatesLoading && apiTemplates.length === 0 && (
                  <p className="text-center text-sm text-zinc-400 py-6">No templates found.</p>
                )}

                {/* 2-column grid with mini canvas previews */}
                {!templatesLoading && apiTemplates.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {apiTemplates.map(tpl => {
                      // Category → icon mapping
                      const catIcons: Record<string, React.ReactNode> = {
                        apparel:   <Package        className="w-3.5 h-3.5" />,
                        mug:       <Circle         className="w-3.5 h-3.5" />,
                        corporate: <Settings2      className="w-3.5 h-3.5" />,
                        sticker:   <Sticker        className="w-3.5 h-3.5" />,
                        banner:    <LayoutTemplate className="w-3.5 h-3.5" />,
                      };
                      const catIcon = (tpl.category ? catIcons[tpl.category] : undefined) ?? <Layers className="w-3.5 h-3.5" />;

                      return (
                        <div
                          key={tpl.id}
                          onClick={() => applyTemplate(tpl)}
                          className="group flex flex-col rounded-xl border border-gray-100 hover:border-green-500 overflow-hidden cursor-pointer transition-all hover:shadow-md bg-white"
                        >
                          {/* Mini canvas preview */}
                          <div className="relative w-full bg-gray-50 overflow-hidden" style={{ paddingBottom: '80%' }}>
                            <div
                              className="absolute inset-0"
                              style={{
                                /* scale the 600×750 canvas down to fit the preview box */
                                transform: 'scale(0.27)',
                                transformOrigin: 'top left',
                                width: '600px',
                                height: '750px',
                                pointerEvents: 'none',
                              }}
                            >
                              {(tpl.elements || []).map((el: RawTemplateElement, i: number) => (
                                <div
                                  key={i}
                                  className="absolute flex items-center justify-center"
                                  style={{
                                    left:      `${el.x}px`,
                                    top:       `${el.y}px`,
                                    width:     `${el.width}px`,
                                    height:    `${el.height}px`,
                                    transform: `rotate(${el.rotation ?? 0}deg)`,
                                    opacity:   el.opacity ?? 1,
                                  }}
                                >
                                  {el.type === 'text' ? (
                                    <div
                                      className="w-full h-full flex items-center justify-center leading-tight text-center"
                                      style={{
                                        color:      el.color      ?? '#171717',
                                        fontSize:   `${el.fontSize ?? 32}px`,
                                        fontFamily: el.fontFamily ?? 'Outfit',
                                        fontWeight: el.fontWeight ?? '700',
                                        textAlign:  el.textAlign  ?? 'center',
                                      }}
                                    >
                                      {el.content}
                                    </div>
                                  ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={el.content} className="w-full h-full object-contain" alt="" />
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-green-700/0 group-hover:bg-green-700/10 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Apply
                              </div>
                            </div>
                          </div>

                          {/* Template info */}
                          <div className="p-2.5 flex items-center gap-2 border-t border-gray-50">
                            <div className="w-6 h-6 rounded-lg bg-green-700/10 text-green-700 flex items-center justify-center shrink-0">
                              {catIcon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-zinc-800 truncate group-hover:text-green-700 transition-colors">{tpl.name}</p>
                              <p className="text-[9px] text-zinc-400 capitalize">{tpl.elements?.length} layer{tpl.elements?.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </aside>

        {/* ── Main Canvas (Center) ── */}
        <section className="flex-1 relative flex flex-col bg-gray-50 overflow-hidden">

          {/* Top Bar for Canvas */}
          <div className="h-14 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="p-1 bg-green-700/10 rounded-md flex gap-1">
              <button onClick={() => setSide('front')} className={`px-4 md:px-6 py-1.5 text-xs font-bold rounded-md transition-all ${side === 'front' ? 'bg-white text-gray-900 shadow-sm' : 'text-green-700 hover:text-gray-900'}`}>Front</button>
              <button onClick={() => setSide('back')}  className={`px-4 md:px-6 py-1.5 text-xs font-bold rounded-md transition-all ${side === 'back'  ? 'bg-white text-gray-900 shadow-sm' : 'text-green-700 hover:text-gray-900'}`}>Back</button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => selectedId && deleteElement(selectedId)}
                disabled={!selectedId}
                className="px-3 py-1.5 bg-rose-50 text-red-600 rounded flex items-center gap-1.5 text-xs font-bold hover:bg-rose-100 transition-colors border border-red-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>

          {/* Canvas Area — scrollable so oversized canvas doesn't clip on small screens */}
          <div
            className="flex-1 relative flex items-center justify-center p-4 md:p-10 overflow-auto no-scrollbar"
            onClick={() => setSelectedId(null)}
          >
            <div
              ref={workspaceRef}
              className="bg-white shadow-[0px_32px_64px_-12px_rgba(0,0,0,0.14)] relative rounded-lg overflow-hidden border border-gray-200 shrink-0"
              style={{
                width: '600px',
                height: '750px',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Product Base — opacity raised to 50% so users can see what they're designing on */}
              <div className="absolute inset-0 flex items-center justify-center p-12 bg-stone-50/50 pointer-events-none">
                <div className="relative w-full h-full">
                  <Image
                    src={selectedProduct?.images[0]?.src || `${WP_URL}/wp-content/uploads/2022/08/cropped-Screenshot_3.png`}
                    fill
                    className="object-contain opacity-50"
                    sizes="600px"
                    alt="Base Product"
                  />
                </div>
              </div>

              {/* Dynamic Elements */}
              {elements.filter(el => el.side === side).map((el) => (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  onTouchStart={(e) => handleTouchStart(e, el.id)}
                  className={`absolute cursor-move flex items-center justify-center select-none
                    ${selectedId === el.id ? 'outline outline-2 outline-green-500 shadow-2xl z-20' : 'hover:outline hover:outline-1 hover:outline-green-300 z-10'}`}
                  style={{
                    left: `${el.x}px`, top: `${el.y}px`,
                    width: `${el.width}px`, height: `${el.height}px`,
                    transform: `rotate(${el.rotation}deg)`,
                    opacity: el.opacity,
                  }}
                >
                  {el.type === 'text' ? (
                    // Inline editing mode (mobile double-tap)
                    inlineEditId === el.id ? (
                      <textarea
                        ref={inlineInputRef}
                        value={el.content}
                        onChange={(e) => updateElement(el.id, { content: e.target.value })}
                        onBlur={() => setInlineEditId(null)}
                        className="w-full h-full bg-transparent border-none outline-none resize-none text-center leading-tight p-0"
                        style={{
                          color: el.color,
                          // iOS auto-zooms when font-size < 16px — clamp to 16 minimum
                          fontSize: `${Math.max(16, el.fontSize ?? 16)}px`,
                          fontFamily: el.fontFamily,
                          fontWeight: el.fontWeight || '700',
                          textAlign: el.textAlign,
                          caretColor: el.color,
                          // Disable iOS text size adjustment
                          WebkitTextSizeAdjust: 'none',
                          touchAction: 'none',
                        }}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-center leading-tight"
                        style={{
                          color: el.color,
                          fontSize: `${el.fontSize}px`,
                          fontFamily: el.fontFamily,
                          fontWeight: el.fontWeight || '700',
                          textAlign: el.textAlign,
                          userSelect: 'none',
                        }}
                      >
                        {el.content}
                      </div>
                    )
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={el.content} className="w-full h-full object-contain pointer-events-none" alt="element" />
                  )}

                  {selectedId === el.id && inlineEditId !== el.id && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                      <Move className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Floating Zoom Bar */}
            <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-[0px_24px_48px_-12px_rgba(0,0,0,0.18)] border border-gray-100 flex items-center p-2 gap-1 z-30">
              <button onClick={() => setZoom(z => Math.max(25, z - 10))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl text-zinc-600 transition-colors"><Minus className="w-4 h-4" /></button>
              <div className="px-4 text-sm font-bold text-zinc-900 tabular-nums min-w-[70px] text-center">{zoom}%</div>
              <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl text-zinc-600 transition-colors"><Plus className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-gray-100 mx-1" />
              <button onClick={() => setZoom(100)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl text-zinc-600 transition-colors"><RefreshCw className="w-4 h-4" /></button>
            </div>

            {/* Mobile floating action bar — shown when element selected, hides when inline editing */}
            {selectedId && inlineEditId !== selectedId && (
              <div className="md:hidden fixed bottom-[80px] left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-zinc-900 rounded-2xl p-1.5 shadow-2xl">
                {/* Edit text — only for text elements */}
                {selectedElement?.type === 'text' && (
                  <button
                    onPointerDown={(e) => { e.stopPropagation(); setInlineEditId(selectedId); setTimeout(() => inlineInputRef.current?.focus(), 50); }}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <Type className="w-4 h-4 text-white" />
                    <span className="text-[9px] text-white/70 font-bold uppercase">Edit</span>
                  </button>
                )}
                {/* Color quick pick */}
                {selectedElement?.type === 'text' && (
                  <div className="flex items-center gap-1 px-2">
                    {colorPalette.slice(0, 5).map(c => (
                      <button
                        key={c}
                        onPointerDown={(e) => { e.stopPropagation(); updateElement(selectedId, { color: c }); }}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${selectedElement.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
                {/* Duplicate */}
                <button
                  onPointerDown={(e) => { e.stopPropagation(); if (selectedElement) { const newEl = { ...selectedElement, id: Date.now().toString(), x: selectedElement.x + 20, y: selectedElement.y + 20 }; setElements(prev => [...prev, newEl]); setSelectedId(newEl.id); } }}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Copy className="w-4 h-4 text-white" />
                  <span className="text-[9px] text-white/70 font-bold uppercase">Copy</span>
                </button>
                {/* Delete */}
                <button
                  onPointerDown={(e) => { e.stopPropagation(); deleteElement(selectedId); }}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span className="text-[9px] text-red-400 font-bold uppercase">Del</span>
                </button>
                {/* Deselect */}
                <button
                  onPointerDown={(e) => { e.stopPropagation(); setSelectedId(null); }}
                  className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>
            )}

            {/* Mobile Bottom Tool Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-gray-200 flex items-center justify-around px-2 z-40">
              {sidebarTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <button key={tool.id} onClick={() => setActiveTool(isActive ? null : tool.id)} className={`flex flex-col items-center gap-1 transition-all flex-1 py-2 ${isActive ? 'text-green-700 font-bold' : 'text-zinc-400'}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-[9px] uppercase tracking-tighter">{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Right Properties Panel ── */}
        <aside className={`
          fixed md:relative z-30 bg-white border-t md:border-t-0 md:border-l border-gray-200 flex-col shrink-0 transition-transform duration-300
          inset-x-0 bottom-0 h-[50dvh] md:inset-y-0 md:right-0 md:h-full md:w-80
          ${selectedId ? 'translate-y-0 md:translate-x-0 hidden md:flex' : 'translate-y-full md:translate-x-full hidden md:flex'}
        `}>
          {/* Mobile drag handle + close */}
          <div className="md:hidden w-full flex flex-col items-center pt-2 pb-0 bg-white">
            <div className="w-10 h-1 bg-gray-200 rounded-full mb-2" />
          </div>
          <div className="md:hidden w-full h-11 border-b border-gray-100 flex items-center justify-between px-6 bg-stone-50">
            <span className="text-sm font-bold text-gray-900">Adjust Property</span>
            <button type="button" onClick={() => setSelectedId(null)} className="p-1 hover:bg-gray-200 rounded-md transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-4 border-b border-gray-100 shrink-0">
            {[
              { id: 'Props',  icon: Settings2 },
              { id: 'Colors', icon: Palette   },
              { id: 'Type',   icon: Type      },
              { id: 'Layers', icon: Layers    },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActivePropertyTab(tab.id)}
                className={`py-5 flex flex-col items-center gap-1 transition-all border-b-2 ${activePropertyTab === tab.id ? 'border-green-700 text-green-700 bg-green-50/20' : 'border-transparent text-zinc-400'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-[9px] font-bold uppercase tracking-widest">{tab.id}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 no-scrollbar pb-32">

            {/* ── Props Tab ── */}
            {activePropertyTab === 'Props' && selectedElement && (
              <div className="flex flex-col gap-5">
                <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest">Position & Size</h4>
                <div className="grid grid-cols-2 gap-4">
                  {(['x','y','width','height'] as const).map(p => (
                    <div key={p} className="flex flex-col gap-1">
                      <label className="text-zinc-500 text-[9px] font-bold uppercase">{p}</label>
                      <input type="number" value={Math.round(selectedElement[p as keyof Pick<DesignElement, 'x'|'y'|'width'|'height'>] as number)}
                        onChange={(e) => updateElement(selectedId!, { [p]: Number(e.target.value) })}
                        className="w-full p-2.5 bg-stone-50 border border-gray-100 rounded-xl text-xs font-bold focus:border-green-700 outline-none" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-zinc-500 text-[9px] font-bold uppercase">Rotation ({selectedElement.rotation}°)</label>
                  <input type="range" min="-180" max="180" value={selectedElement.rotation}
                    onChange={(e) => updateElement(selectedId!, { rotation: Number(e.target.value) })}
                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-700" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-zinc-500 text-[9px] font-bold uppercase">Opacity ({Math.round(selectedElement.opacity * 100)}%)</label>
                  <input type="range" min="0" max="1" step="0.01" value={selectedElement.opacity}
                    onChange={(e) => updateElement(selectedId!, { opacity: Number(e.target.value) })}
                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-700" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => {
                    const newEl = { ...selectedElement, id: Date.now().toString(), x: selectedElement.x + 20, y: selectedElement.y + 20 };
                    setElements(prev => [...prev, newEl]);
                    setSelectedId(newEl.id);
                  }} className="flex-1 py-3 bg-neutral-100 rounded-xl border border-black/5 flex justify-center items-center gap-1.5 text-green-700 text-[10px] font-bold uppercase tracking-tight hover:bg-neutral-200 transition-all">
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>
                  <button onClick={() => deleteElement(selectedId!)}
                    className="flex-1 py-3 bg-rose-50 rounded-xl flex justify-center items-center gap-1.5 text-red-600 text-[10px] font-bold uppercase tracking-tight hover:bg-rose-100 transition-all">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            )}

            {/* ── Type Tab ── */}
            {activePropertyTab === 'Type' && selectedElement?.type === 'text' && (
              <div className="flex flex-col gap-5">
                <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest">Typography</h4>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[10px] font-semibold">Text Content</label>
                  <textarea value={selectedElement.content}
                    onChange={(e) => updateElement(selectedId!, { content: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-zinc-500/10 text-xs font-medium focus:border-green-700 outline-none min-h-[100px] resize-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[10px] font-semibold">Font Family</label>
                  <div className="relative">
                    <select value={selectedElement.fontFamily}
                      onChange={(e) => updateElement(selectedId!, { fontFamily: e.target.value })}
                      className="w-full p-3.5 bg-stone-50 border border-zinc-500/10 rounded-xl text-xs font-bold appearance-none cursor-pointer focus:border-green-700 outline-none">
                      {fontFamilies.map(f => <option key={f}>{f}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[10px] font-semibold">Font Size ({selectedElement.fontSize}px)</label>
                  <input type="range" min="8" max="120" value={selectedElement.fontSize}
                    onChange={(e) => updateElement(selectedId!, { fontSize: Number(e.target.value) })}
                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-700" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[10px] font-semibold">Font Weight</label>
                  <div className="flex gap-2">
                    {[['400','Regular'],['700','Bold'],['900','Black']].map(([w,l]) => (
                      <button key={w} onClick={() => updateElement(selectedId!, { fontWeight: w })}
                        className={`flex-1 py-2 rounded-xl border text-[10px] font-bold transition-all ${selectedElement.fontWeight === w ? 'bg-green-100 border-green-700 text-green-700' : 'bg-white border-gray-100 text-zinc-500'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[10px] font-semibold">Alignment</label>
                  <div className="flex gap-2 pt-1">
                    {[['left', <AlignLeft key="l" className="w-4 h-4"/>],['center', <AlignCenter key="c" className="w-4 h-4"/>],['right', <AlignRight key="r" className="w-4 h-4"/>]] .map(([align, icon]) => (
                      <button key={align as string} onClick={() => updateElement(selectedId!, { textAlign: align as 'left'|'center'|'right' })}
                        className={`flex-1 py-3 rounded-xl border transition-all flex justify-center items-center ${selectedElement.textAlign === align ? 'bg-green-100 border-green-700 text-green-700' : 'bg-white border-gray-100 text-zinc-500'}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activePropertyTab === 'Type' && selectedElement && selectedElement.type !== 'text' && (
              <p className="text-sm text-zinc-400 text-center pt-8">Select a text element to edit typography.</p>
            )}
            {activePropertyTab === 'Type' && !selectedElement && (
              <p className="text-sm text-zinc-400 text-center pt-8">Select an element to edit properties.</p>
            )}

            {/* ── Colors Tab ── */}
            {activePropertyTab === 'Colors' && (
              <div className="flex flex-col gap-5">
                <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest">Color Palette</h4>
                {selectedElement?.type === 'text' ? (
                  <div className="grid grid-cols-5 gap-3">
                    {colorPalette.map(color => (
                      <button key={color} onClick={() => updateElement(selectedId!, { color })}
                        className={`w-11 h-11 rounded-xl border border-black/5 transition-all hover:scale-110 shadow-sm ${selectedElement?.color === color ? 'ring-2 ring-green-700 ring-offset-2' : ''}`}
                        style={{ backgroundColor: color }} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 text-center pt-4">Select a text element to change its color.</p>
                )}
              </div>
            )}

            {/* ── Layers Tab ── */}
            {activePropertyTab === 'Layers' && (
              <div className="flex flex-col gap-3">
                <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest">Layers ({side} side)</h4>
                {elements.filter(el => el.side === side).length === 0 && (
                  <p className="text-sm text-zinc-400 text-center pt-4">No elements on this side yet.</p>
                )}
                {elements.filter(el => el.side === side).map((el) => (
                  <div key={el.id}
                    onClick={() => setSelectedId(el.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedId === el.id ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      {el.type === 'text' ? <Type className="w-4 h-4 text-zinc-400" /> : <ImageIcon className="w-4 h-4 text-zinc-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-800 capitalize truncate">{el.type}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{el.type === 'text' ? el.content : 'Image element'}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-zinc-300 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Review Action */}
          <div className="p-6 border-t border-gray-100 bg-stone-50 shrink-0">
            <button onClick={goToReview}
              className="w-full py-5 bg-green-700 hover:bg-green-800 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" /> Review Design
            </button>
          </div>
        </aside>

      </div>{/* end editor body */}

      {/* ── Preview Modal ── */}

    </main>
  );
}

// ── Page wrapper with Suspense ─────────────────────────────────────────────────
export default function DesignEditorPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center bg-white" style={{ height: '100dvh' }}>
        <Loader2 className="w-12 h-12 text-green-700 animate-spin" />
        <p className="mt-4 font-bold text-green-700 font-['Outfit'] uppercase tracking-widest">Launching Studio...</p>
      </div>
    }>
      <DesignContent />
    </Suspense>
  );
}
