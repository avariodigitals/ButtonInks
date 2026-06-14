"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Type,
  UploadCloud,
  Sticker,
  LayoutTemplate,
  Package,
  X,
  Trash2,
  ChevronDown,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Layers,
  Palette,
  Settings2,
  Search,
  Copy,
  CheckCircle2,
  Loader2,
  Move,
  Maximize2,
  ShoppingCart,
  SlidersHorizontal,
  Minus,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { WPProduct } from '@/lib/wordpress';
import { useNotification } from '@/context/NotificationContext';
import { useCart } from '@/context/CartContext';

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
  textAlign?: 'left' | 'center' | 'right';
  side: 'front' | 'back';
}

const sidebarTools = [
  { id: 'product', icon: Package, label: 'Product' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'uploads', icon: UploadCloud, label: 'Uploads' },
  { id: 'graphics', icon: Sticker, label: 'Graphics' },
  { id: 'template', icon: LayoutTemplate, label: 'Template' },
];

const colorPalette = [
  "#FFFFFF", "#171717", "#064E3B", "#B45309", "#22C55E",
  "#DC2626", "#8B5CF6", "#0EA5E9", "#F59E0B", "#4B5563",
  "#374151", "#EC4899", "#14B8A6", "#EF4444", "#84CC16"
];

// ── Design Content Component ──────────────────────────────────────────────────

function DesignContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialProductId = searchParams.get('product');
  const { showNotification } = useNotification();
  const { addToCart } = useCart();

  const [activeTool, setActiveTool] = useState<string | null>('text');
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [zoom, setZoom] = useState(100);
  const [activePropertyTab, setActivePropertyTab] = useState('Type');
  const [elements, setElements] = useState<DesignElement[]>([
    { id: '1', type: 'text', content: 'Your Design Here', x: 150, y: 300, width: 300, height: 60, rotation: 0, opacity: 1, color: '#171717', fontFamily: 'Outfit', fontSize: 32, textAlign: 'center', side: 'front' }
  ]);
  const [selectedId, setSelectedId] = useState<string | null>('1');

  const [wpProducts, setWpProducts] = useState<WPProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<WPProduct | null>(null);
  const [recentUploads, setRecentUploads] = useState<{ source_url: string; id: number }[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const selectedElement = elements.find(el => el.id === selectedId);

  // 1. Fetch Products & Initial Product
  useEffect(() => {
    fetch('/api/products-list')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setWpProducts(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Error listing products:", err));

    if (initialProductId) {
      fetch(`/api/products/${initialProductId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setSelectedProduct(data);
        })
        .catch(err => console.error("Error fetching product details:", err));
    }
  }, [initialProductId]);

  // 2. Load Recent Media
  useEffect(() => {
    fetch('/api/media')
      .then(res => res.json())
      .then(data => setRecentUploads(Array.isArray(data) ? data : []))
      .catch(err => console.error("Recent media error:", err));
  }, []);

  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
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
        const newEl: DesignElement = {
          id: Date.now().toString(),
          type: 'image',
          content: result.source_url,
          x: 200, y: 200, width: 200, height: 200,
          rotation: 0, opacity: 1, side
        };
        setElements(prev => [...prev, newEl]);
        setSelectedId(newEl.id);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      showNotification({ title: 'Upload Failed', message: err.message, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find(item => item.id === id);
    if (el) {
      setIsDragging(true);
      setDragOffset({ x: e.clientX - el.x * (zoom / 100), y: e.clientY - el.y * (zoom / 100) });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && selectedId) {
      const newX = (e.clientX - dragOffset.x) / (zoom / 100);
      const newY = (e.clientY - dragOffset.y) / (zoom / 100);
      updateElement(selectedId, { x: newX, y: newY });
    }
  }, [isDragging, selectedId, dragOffset, zoom]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <main className="w-full h-full flex flex-col bg-gray-50 overflow-hidden font-['Inter'] relative">

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
          top-[104px] md:top-0 bottom-0 left-0 w-full md:w-96
          ${activeTool ? 'translate-x-0' : '-translate-x-full md:-translate-x-full absolute'}
          flex
        `}>
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-stone-50/50">
            <h2 className="text-xl font-bold text-black capitalize font-['Outfit']">{activeTool}</h2>
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setActiveTool(null)}
            >
              <X className="w-5 h-5 text-neutral-950" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar">
            {activeTool === 'product' && (
              <div className="grid grid-cols-2 gap-4">
                {wpProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedProduct(p); setActiveTool(null); }}
                    className={`p-4 bg-gray-50 rounded-2xl border-2 transition-all cursor-pointer ${selectedProduct?.id === p.id ? 'border-green-700 bg-green-50' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <img src={p.images[0]?.src || "https://placehold.co/150x150"} className="w-full aspect-square object-contain" />
                    <span className="text-xs font-bold mt-2 block text-center line-clamp-1">{p.name}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTool === 'text' && (
              <div className="flex flex-col gap-6">
                <p className="text-black/60 text-sm leading-relaxed">Edit your text below, or click on the field you&apos;d like to edit directly on your design.</p>
                <button
                  onClick={() => {
                    const newId = Date.now().toString();
                    setElements([...elements, { id: newId, type: 'text', content: 'New Text', x: 200, y: 300, width: 200, height: 40, rotation: 0, opacity: 1, color: '#171717', fontFamily: 'Outfit', fontSize: 32, textAlign: 'center', side }]);
                    setSelectedId(newId);
                  }}
                  className="w-full py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add New Text
                </button>
              </div>
            )}

            {activeTool === 'uploads' && (
              <div className="flex flex-col gap-6">
                <div onClick={() => fileInputRef.current?.click()} className="px-8 py-8 bg-green-50 rounded-2xl border-2 border-dashed border-green-700/30 hover:border-green-700 flex flex-col justify-center items-center gap-4 cursor-pointer transition-all">
                  {isUploading ? <Loader2 className="w-8 h-8 text-green-700 animate-spin" /> : <UploadCloud className="w-8 h-8 text-green-700" />}
                  <div className="text-center">
                    <p className="text-gray-900 font-bold">Upload Design</p>
                    <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest">Browse Files</p>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*" />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Recent uploads</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {recentUploads.map((img) => (
                      <div key={img.id} onClick={() => {
                        const newId = Date.now().toString();
                        setElements([...elements, { id: newId, type: 'image', content: img.source_url, x: 200, y: 200, width: 150, height: 150, rotation: 0, opacity: 1, side }]);
                        setSelectedId(newId);
                      }} className="aspect-square bg-white rounded-lg border border-black/5 overflow-hidden cursor-pointer hover:border-green-500 transition-all hover:scale-105">
                        <img src={img.source_url} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Canvas (Center) ── */}
        <section className="flex-1 relative flex flex-col bg-gray-50 overflow-hidden">

          {/* Top Bar for Canvas */}
          <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="p-1 bg-green-700/10 rounded-md flex gap-1">
              <button onClick={() => setSide('front')} className={`px-6 py-1.5 text-xs font-bold rounded-md transition-all ${side === 'front' ? 'bg-white text-gray-900 shadow-sm' : 'text-green-700 hover:text-gray-900'}`}>Front</button>
              <button onClick={() => setSide('back')} className={`px-6 py-1.5 text-xs font-bold rounded-md transition-all ${side === 'back' ? 'bg-white text-gray-900 shadow-sm' : 'text-green-700 hover:text-gray-900'}`}>Back</button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => selectedId && deleteElement(selectedId)} className="px-3 py-1.5 bg-rose-50 text-red-600 rounded flex items-center gap-1.5 text-xs font-bold hover:bg-rose-100 transition-colors border border-red-100">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative flex items-center justify-center p-4 md:p-20 overflow-auto no-scrollbar" onClick={() => setSelectedId(null)}>
            <div
              ref={workspaceRef}
              className="bg-white shadow-[0px_32px_64px_-12px_rgba(0,0,0,0.14)] relative rounded-lg overflow-hidden border border-gray-200 shrink-0"
              style={{
                width: '600px',
                height: '750px',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Product Base */}
              <div className="absolute inset-0 flex items-center justify-center p-12 bg-stone-50/50">
                 <img
                   src={selectedProduct?.images[0]?.src || "https://buttoninks.com/wp-content/uploads/2022/08/cropped-Screenshot_3.png"}
                   alt="Base"
                   className="max-w-full max-h-full object-contain pointer-events-none opacity-20"
                 />
              </div>

              {/* Dynamic Elements */}
              {elements.filter(el => el.side === side).map((el) => (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  className={`absolute cursor-move flex items-center justify-center transition-all ${selectedId === el.id ? 'outline-2 outline-green-500 shadow-2xl z-20' : 'hover:outline-1 hover:outline-green-300 z-10'}`}
                  style={{ left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: `${el.height}px`, transform: `rotate(${el.rotation}deg)`, opacity: el.opacity }}
                >
                  {el.type === 'text' ? (
                    <div className="w-full h-full flex items-center justify-center font-bold text-center leading-tight" style={{ color: el.color, fontSize: `${el.fontSize}px`, fontFamily: el.fontFamily, userSelect: 'none' }}>
                      {el.content}
                    </div>
                  ) : (
                    <img src={el.content} className="w-full h-full object-contain pointer-events-none" />
                  )}

                  {selectedId === el.id && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <Move className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Floating Zoom Bar */}
            <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-[0px_24px_48px_-12px_rgba(0,0,0,0.18)] border border-gray-100 flex items-center p-2 gap-1 z-30">
              <button onClick={() => setZoom(Math.max(25, zoom - 10))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl text-zinc-600 transition-colors"><Minus className="w-4 h-4" /></button>
              <div className="px-4 text-sm font-bold text-zinc-900 tabular-nums min-w-[70px] text-center">{zoom}%</div>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl text-zinc-600 transition-colors"><Plus className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-gray-100 mx-1" />
              <button onClick={() => setZoom(100)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl text-zinc-600 transition-colors"><RefreshCw className="w-4 h-4" /></button>
            </div>

            {/* Mobile Bottom Tool Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex items-center justify-around px-2 z-40 pb-safe">
               {sidebarTools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  return (
                     <button key={tool.id} onClick={() => setActiveTool(isActive ? null : tool.id)} className={`flex flex-col items-center gap-1 transition-all flex-1 ${isActive ? 'text-green-700 font-bold' : 'text-zinc-400'}`}>
                        <Icon className="w-5 h-5" />
                        <span className="text-[9px] uppercase tracking-tighter">{tool.label}</span>
                     </button>
                  )
               })}
            </div>
          </div>
        </section>

        {/* ── Right Properties Panel ── */}
        <aside className={`
          fixed md:relative z-30 bg-white border-t md:border-t-0 md:border-l border-gray-200 flex-col shrink-0 transition-transform duration-300
          inset-x-0 bottom-0 h-[70vh] md:inset-y-0 md:right-0 md:h-full md:w-80
          ${selectedId ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full md:flex hidden'}
          flex
        `}>
          <div className="md:hidden w-full h-12 border-b border-gray-100 flex items-center justify-between px-6 bg-stone-50">
             <span className="text-sm font-bold text-gray-900">Adjust Property</span>
             <button type="button" onClick={() => setSelectedId(null)} className="p-1 hover:bg-gray-200 rounded-md transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
          </div>

          <div className="grid grid-cols-4 border-b border-gray-100">
             {[
               { id: 'Props', icon: Settings2 },
               { id: 'Colors', icon: Palette },
               { id: 'Type', icon: Type },
               { id: 'Layers', icon: Layers }
             ].map((tab) => (
               <button
                key={tab.id}
                onClick={() => setActivePropertyTab(tab.id)}
                className={`py-5 flex flex-col items-center gap-1 transition-all border-b-2 ${activePropertyTab === tab.id ? 'border-green-700 text-green-700 bg-green-50/20' : 'border-transparent text-zinc-400'}`}
               >
                 <tab.icon className="w-4 h-4" />
                 <span className="text-[9px] font-bold uppercase tracking-widest">{tab.id}</span>
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 no-scrollbar pb-32">
             {activePropertyTab === 'Props' && selectedElement && (
                <div className="flex flex-col gap-5">
                   <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest">Position & Size</h4>
                   <div className="grid grid-cols-2 gap-4">
                      {['x', 'y', 'width', 'height'].map(p => (
                        <div key={p} className="flex flex-col gap-1">
                          <label className="text-zinc-500 text-[9px] font-bold uppercase">{p}</label>
                          <input type="number" value={Math.round((selectedElement as any)[p])} onChange={(e) => updateElement(selectedId!, { [p]: Number(e.target.value) })} className="w-full p-2.5 bg-stone-50 border border-gray-100 rounded-xl text-xs font-bold focus:border-green-700 outline-none" />
                        </div>
                      ))}
                   </div>
                   <div className="flex flex-col gap-1">
                      <label className="text-zinc-500 text-[9px] font-bold uppercase">Opacity</label>
                      <input type="range" min="0" max="1" step="0.01" value={selectedElement.opacity} onChange={(e) => updateElement(selectedId!, { opacity: Number(e.target.value) })} className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-700" />
                   </div>
                   <div className="flex gap-2 pt-2">
                      <button onClick={() => {
                        const newEl = { ...selectedElement, id: Date.now().toString(), x: selectedElement.x + 20, y: selectedElement.y + 20 };
                        setElements([...elements, newEl]);
                        setSelectedId(newEl.id);
                      }} className="flex-1 py-3 bg-neutral-100 rounded-xl border border-black/5 flex justify-center items-center gap-1.5 text-green-700 text-[10px] font-bold uppercase tracking-tight hover:bg-neutral-200 transition-all"><Copy className="w-3.5 h-3.5" /> Duplicate</button>
                      <button onClick={() => deleteElement(selectedId!)} className="flex-1 py-3 bg-rose-50 rounded-xl flex justify-center items-center gap-1.5 text-red-600 text-[10px] font-bold uppercase tracking-tight hover:bg-rose-100 transition-all"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                   </div>
                </div>
             )}

             {activePropertyTab === 'Type' && selectedElement?.type === 'text' && (
                <div className="flex flex-col gap-5">
                   <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest">Typography</h4>
                   <div className="flex flex-col gap-1">
                      <label className="text-zinc-500 text-[10px] font-semibold leading-4">Text Content</label>
                      <textarea value={selectedElement.content} onChange={(e) => updateElement(selectedId!, { content: e.target.value })} className="w-full p-3.5 rounded-xl border border-zinc-500/10 text-xs font-medium focus:border-green-700 outline-none min-h-[100px] resize-none" />
                   </div>
                   <div className="flex flex-col gap-1">
                      <label className="text-zinc-500 text-[10px] font-semibold leading-4">Font Family</label>
                      <div className="relative">
                        <select value={selectedElement.fontFamily} onChange={(e) => updateElement(selectedId!, { fontFamily: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-zinc-500/10 rounded-xl text-xs font-bold appearance-none cursor-pointer focus:border-green-700 outline-none">
                          <option>Inter</option><option>Outfit</option><option>Montserrat</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                   </div>
                   <div className="flex flex-col gap-1">
                      <label className="text-zinc-500 text-[10px] font-semibold leading-4">Font Size ({selectedElement.fontSize}px)</label>
                      <input type="range" min="8" max="120" value={selectedElement.fontSize} onChange={(e) => updateElement(selectedId!, { fontSize: Number(e.target.value) })} className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-700" />
                   </div>
                   <div className="flex flex-col gap-1">
                      <label className="text-zinc-500 text-[10px] font-semibold leading-4">Alignment</label>
                      <div className="flex gap-2 pt-1">
                         <button onClick={() => updateElement(selectedId!, { textAlign: 'left' })} className={`flex-1 py-3 rounded-xl border transition-all flex justify-center items-center ${selectedElement.textAlign === 'left' ? 'bg-green-100 border-green-700 text-green-700' : 'bg-white border-gray-100 text-zinc-500'}`}><ChevronLeft className="w-4 h-4" /></button>
                         <button onClick={() => updateElement(selectedId!, { textAlign: 'center' })} className={`flex-1 py-3 rounded-xl border transition-all flex justify-center items-center ${selectedElement.textAlign === 'center' ? 'bg-green-100 border-green-700 text-green-700' : 'bg-white border-gray-100 text-zinc-500'}`}><ChevronDown className="w-4 h-4" /></button>
                         <button onClick={() => updateElement(selectedId!, { textAlign: 'right' })} className={`flex-1 py-3 rounded-xl border transition-all flex justify-center items-center ${selectedElement.textAlign === 'right' ? 'bg-green-100 border-green-700 text-green-700' : 'bg-white border-gray-100 text-zinc-500'}`}><ChevronRight className="w-4 h-4" /></button>
                      </div>
                   </div>
                </div>
             )}

             {activePropertyTab === 'Colors' && (
                <div className="flex flex-col gap-5">
                   <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest">Color Palette</h4>
                   <div className="grid grid-cols-5 gap-3">
                      {colorPalette.map(color => (
                        <button key={color} onClick={() => updateElement(selectedId!, { color })} className={`w-11 h-11 rounded-xl border border-black/5 transition-all hover:scale-110 shadow-sm ${selectedElement?.color === color ? 'ring-2 ring-green-700 ring-offset-2' : ''}`} style={{ backgroundColor: color }} />
                      ))}
                   </div>
                </div>
             )}
          </div>

          {/* Review Action */}
          <div className="p-6 border-t border-gray-100 bg-stone-50">
             <button onClick={() => setShowPreview(true)} className="w-full py-5 bg-green-700 hover:bg-green-800 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" /> Review Design
             </button>
          </div>
        </aside>
      </div>

      {/* ── Preview Modal (Premium) ── */}
      {showPreview && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-6xl h-fit max-h-[95vh] rounded-[48px] overflow-hidden flex flex-col md:flex-row relative shadow-2xl">
              <button onClick={() => setShowPreview(false)} className="absolute top-8 right-8 z-20 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="w-6 h-6 text-gray-900" /></button>

              <div className="flex-1 bg-zinc-50 flex items-center justify-center p-4 md:p-8 min-h-[400px] border-r border-gray-100">
                 <div
                   className="relative bg-white shadow-2xl rounded-[40px] border border-gray-100 overflow-hidden flex items-center justify-center"
                   style={{
                     width: '420px',
                     height: '525px',
                   }}
                 >
                    {/* Render Product Base (Clearer visibility) */}
                    <div className="absolute inset-0 flex items-center justify-center p-8 bg-white">
                       <img
                         src={selectedProduct?.images[0]?.src || "https://buttoninks.com/wp-content/uploads/2022/08/cropped-Screenshot_3.png"}
                         className="max-h-full opacity-60"
                         alt="Product Base"
                       />
                    </div>

                    {/* Design Layers with corrected top-left scaling for precise alignment */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        transform: 'scale(0.7)',
                        transformOrigin: 'top left',
                        width: '600px',
                        height: '750px'
                      }}
                    >
                       {elements.filter(el => el.side === side).map((el) => (
                          <div
                            key={el.id}
                            className="absolute flex items-center justify-center"
                            style={{
                              left: `${el.x}px`,
                              top: `${el.y}px`,
                              width: `${el.width}px`,
                              height: `${el.height}px`,
                              transform: `rotate(${el.rotation}deg)`,
                              opacity: el.opacity
                            }}
                          >
                            {el.type === 'text' ? (
                              <div className="w-full h-full flex items-center justify-center font-bold text-center leading-tight" style={{ color: el.color, fontSize: `${el.fontSize}px`, fontFamily: el.fontFamily }}>
                                {el.content}
                              </div>
                            ) : (
                              <img src={el.content} className="w-full h-full object-contain" alt="Custom Graphic" />
                            )}
                          </div>
                       ))}
                    </div>

                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-green-700 text-white text-[10px] font-black rounded-full shadow-xl z-20">PRODUCTION PREVIEW</div>
                 </div>
              </div>

              <div className="w-full md:w-[480px] p-10 md:p-16 flex flex-col justify-between bg-white">
                 <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-3">
                       <h2 className="text-4xl md:text-5xl font-black font-outfit text-gray-900 leading-tight">Review Your Art</h2>
                       <p className="text-gray-400 font-medium">Please verify your design details before we start production.</p>
                    </div>
                    <ul className="flex flex-col gap-5">
                       {[
                         { label: "Vibrant CMYK Colors", icon: CheckCircle2 },
                         { label: "High Resolution Result", icon: CheckCircle2 },
                         { label: "Correct Safe-Area Layout", icon: CheckCircle2 },
                         { label: "Premium Product Quality", icon: CheckCircle2 }
                       ].map((item, idx) => (
                         <li key={idx} className="flex items-center gap-4 text-base font-bold text-zinc-600">
                            <item.icon className="w-6 h-6 text-green-700" strokeWidth={3} />
                            {item.label}
                         </li>
                       ))}
                    </ul>
                 </div>

                 <div className="flex flex-col gap-6 mt-12">
                    <label className="flex items-center gap-4 cursor-pointer group p-5 bg-gray-50 rounded-[28px] border border-transparent hover:border-green-200 transition-all" onClick={() => setIsApproved(!isApproved)}>
                       <div className={`w-7 h-7 rounded-xl border-2 transition-all flex items-center justify-center ${isApproved ? 'bg-green-700 border-green-700 shadow-lg' : 'bg-white border-gray-200 group-hover:border-green-400'}`}>
                          {isApproved && <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={4} /> }
                       </div>
                       <span className="text-sm font-black text-gray-700 uppercase tracking-wider">Approve Production</span>
                    </label>
                    <button
                      disabled={!isApproved || addingToCart}
                      onClick={() => {
                        setAddingToCart(true);
                        addToCart({
                          id: selectedProduct?.id || 999,
                          name: `${selectedProduct?.name || 'Custom Design'} (Personalized)`,
                          price: parseFloat(selectedProduct?.price || "23.95"),
                          quantity: 1,
                          image: selectedProduct?.images[0]?.src || ""
                        });
                        showNotification({ title: 'Success', message: 'Added to your shopping bag!', type: 'cart' });
                        setTimeout(() => router.push('/cart'), 1000);
                      }}
                      className={`w-full py-6 rounded-[28px] font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl flex items-center justify-center gap-3 ${isApproved ? 'bg-green-700 text-white hover:bg-green-800 scale-[1.02]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                       {addingToCart ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                       {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </main>
  );
}

export default function DesignEditorPage() {
  return (
    <Suspense fallback={<div className="h-screen flex flex-col items-center justify-center bg-white"><Loader2 className="w-12 h-12 text-green-700 animate-spin" /><p className="mt-4 font-bold text-green-700 font-['Outfit'] uppercase tracking-widest">Launching Studio...</p></div>}>
      <DesignContent />
    </Suspense>
  );
}
