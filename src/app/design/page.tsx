"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Maximize2
} from 'lucide-react';
import { uploadMedia, getRecentMedia } from '@/lib/wordpress';

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

// ── Main Component ────────────────────────────────────────────────────────────

export default function DesignEditorPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [zoom, setZoom] = useState(100);
  const [activePropertyTab, setActivePropertyTab] = useState('Type');
  const [elements, setElements] = useState<DesignElement[]>([
    { id: '1', type: 'text', content: 'Your Design Here', x: 150, y: 300, width: 300, height: 60, rotation: 0, opacity: 1, color: '#171717', fontFamily: 'Outfit', fontSize: 32, textAlign: 'center', side: 'front' }
  ]);
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [recentUploads, setRecentUploads] = useState<{ source_url: string; id: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const selectedElement = elements.find(el => el.id === selectedId);

  // Load recent media
  useEffect(() => {
    fetch('/api/media')
      .then(res => res.json())
      .then(data => setRecentUploads(Array.isArray(data) ? data : []))
      .catch(err => console.error("Recent media error:", err));
  }, []);

  // Update properties
  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  // Handle upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

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
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const duplicateElement = () => {
    if (!selectedElement) return;
    const newEl = { ...selectedElement, id: Date.now().toString(), x: selectedElement.x + 20, y: selectedElement.y + 20 };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // ── Drag Logic ──────────────────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find(item => item.id === id);
    if (el) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - el.x * (zoom / 100),
        y: e.clientY - el.y * (zoom / 100)
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find(item => item.id === id);
    const touch = e.touches[0];
    if (el && touch) {
      setIsDragging(true);
      setDragOffset({
        x: touch.clientX - el.x * (zoom / 100),
        y: touch.clientY - el.y * (zoom / 100)
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && selectedId) {
      const newX = (e.clientX - dragOffset.x) / (zoom / 100);
      const newY = (e.clientY - dragOffset.y) / (zoom / 100);
      updateElement(selectedId, { x: newX, y: newY });
    }
  }, [isDragging, selectedId, dragOffset, zoom]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && selectedId) {
      const touch = e.touches[0];
      if (touch) {
        const newX = (touch.clientX - dragOffset.x) / (zoom / 100);
        const newY = (touch.clientY - dragOffset.y) / (zoom / 100);
        updateElement(selectedId, { x: newX, y: newY });
      }
    }
  }, [isDragging, selectedId, dragOffset, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp]);

  return (
    <main className="w-full h-screen bg-gray-50 flex flex-col font-['Inter'] overflow-hidden">

      {/* ── Editor Body ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Toolbar (Figma: w-20) */}
        <aside className="hidden md:flex w-20 bg-white border-r border-gray-200 flex-col items-center py-4 shrink-0 z-20">
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

        {/* Tool Content Panel (Figma: w-96) */}
        <aside className={`w-96 bg-white border-r border-gray-200 flex-col shrink-0 z-10 transition-transform duration-300 hidden md:flex ${activeTool ? 'translate-x-0' : '-translate-x-full absolute'}`}>
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-stone-50/50">
            <h2 className="text-xl font-bold text-black capitalize">{activeTool}</h2>
            <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => setActiveTool(null)}><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar">
            {activeTool === 'text' && (
              <>
                <p className="text-black/60 text-sm leading-relaxed">Edit your text below, or click on the field you'd like to edit directly on your design.</p>
                <button
                  onClick={() => {
                    const newId = Date.now().toString();
                    setElements([...elements, { id: newId, type: 'text', content: 'New Text', x: 200, y: 200, width: 200, height: 40, rotation: 0, opacity: 1, color: '#171717', fontFamily: 'Inter', fontSize: 24, textAlign: 'center', side }]);
                    setSelectedId(newId);
                  }}
                  className="w-full py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add New Text
                </button>
              </>
            )}

            {activeTool === 'uploads' && (
              <div className="flex flex-col gap-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-8 bg-green-50 rounded-2xl border-2 border-dashed border-green-700/30 hover:border-green-700 flex flex-col justify-center items-center gap-4 cursor-pointer transition-all"
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-green-700" />
                      <div className="text-center">
                        <p className="text-gray-900 font-bold">Upload Design</p>
                        <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">Browse Files</p>
                      </div>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*" />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Recent uploads</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {recentUploads.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => {
                          const newId = Date.now().toString();
                          setElements([...elements, { id: newId, type: 'image', content: img.source_url, x: 200, y: 200, width: 150, height: 150, rotation: 0, opacity: 1, side }]);
                          setSelectedId(newId);
                        }}
                        className="aspect-square bg-gray-50 rounded border border-black/5 overflow-hidden cursor-pointer hover:border-green-500"
                      >
                        <img src={img.source_url} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Canvas ────────────────────────────────────────────────────── */}
        <section className="flex-1 relative flex flex-col bg-gray-50 overflow-hidden">

          {/* Canvas Header (Figma) */}
          <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="p-1 bg-gray-100 rounded-lg flex gap-1">
              <button onClick={() => setSide('front')} className={`px-6 py-1.5 text-xs font-bold rounded-md transition-all ${side === 'front' ? 'bg-white text-gray-900 shadow-sm' : 'text-zinc-500 hover:text-gray-700'}`}>Front</button>
              <button onClick={() => setSide('back')} className={`px-6 py-1.5 text-xs font-bold rounded-md transition-all ${side === 'back' ? 'bg-white text-gray-900 shadow-sm' : 'text-zinc-500 hover:text-gray-700'}`}>Back</button>
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
                transformOrigin: 'center center',
                margin: '200px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Product Base */}
              <div className="absolute inset-0 flex items-center justify-center p-12 bg-stone-50/50">
                 <img src="https://buttoninks.com/wp-content/uploads/2022/08/cropped-Screenshot_3.png" alt="Base" className="max-w-full max-h-full object-contain pointer-events-none opacity-20" />
              </div>

              {/* Elements */}
              {elements.filter(el => el.side === side).map((el) => (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  onTouchStart={(e) => handleTouchStart(e, el.id)}
                  className={`absolute cursor-move flex items-center justify-center ${selectedId === el.id ? 'outline-2 outline-green-500 shadow-2xl z-20' : 'hover:outline-1 hover:outline-green-300 z-10'}`}
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
                    <div
                      className="w-full h-full flex items-center justify-center font-bold text-center leading-tight"
                      style={{ color: el.color, fontSize: `${el.fontSize}px`, fontFamily: el.fontFamily, userSelect: 'none' }}
                    >
                      {el.content}
                    </div>
                  ) : (
                    <img src={el.content} className="w-full h-full object-contain pointer-events-none" />
                  )}

                  {selectedId === el.id && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-green-500 rounded-full" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-green-500 rounded-full" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-green-500 rounded-full" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-green-500 rounded-full" />
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <Move className="w-4 h-4 text-white" />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-2xl border border-gray-100 flex items-center p-1.5 gap-1 z-30">
              <button onClick={() => setZoom(Math.max(25, zoom - 10))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full text-zinc-600"><ZoomOut className="w-5 h-5" /></button>
              <div className="px-4 text-xs font-black text-zinc-900 tabular-nums min-w-[70px] text-center">{zoom}%</div>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full text-zinc-600"><ZoomIn className="w-5 h-5" /></button>
            </div>
          </div>
        </section>

        {/* ── Right Properties Panel ────────────────────────────────────────── */}
        <aside className={`w-72 bg-white border-l border-gray-200 flex-col shrink-0 z-30
          fixed md:relative inset-y-0 right-0 h-full transition-transform duration-300 md:translate-x-0
          ${selectedId ? 'translate-x-0' : 'translate-x-full'} md:flex`}>

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
                className={`py-4 flex flex-col items-center gap-1 transition-all border-b-2 ${activePropertyTab === tab.id ? 'border-green-700 text-green-700 bg-green-50/20' : 'border-transparent text-zinc-400'}`}
               >
                 <tab.icon className="w-4 h-4" />
                 <span className="text-[9px] font-bold uppercase tracking-widest">{tab.id}</span>
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 no-scrollbar pb-32">
             {activePropertyTab === 'Props' && selectedElement && (
                <div className="flex flex-col gap-4">
                   <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest">Position & Size</h4>
                   <div className="grid grid-cols-2 gap-3">
                      {['x', 'y', 'width', 'height'].map(p => (
                        <div key={p} className="flex flex-col gap-1">
                          <label className="text-zinc-500 text-[9px] font-bold uppercase">{p}</label>
                          <input
                            type="number"
                            value={Math.round((selectedElement as any)[p])}
                            onChange={(e) => updateElement(selectedId!, { [p]: Number(e.target.value) })}
                            className="w-full p-2 bg-stone-50 border border-gray-200 rounded-md text-xs font-bold outline-none focus:border-green-700"
                          />
                        </div>
                      ))}
                   </div>
                   <div className="flex flex-col gap-1 mt-2">
                      <label className="text-zinc-500 text-[9px] font-bold uppercase">Opacity</label>
                      <input type="range" min="0" max="1" step="0.01" value={selectedElement.opacity} onChange={(e) => updateElement(selectedId!, { opacity: Number(e.target.value) })} className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-700" />
                   </div>
                   <div className="flex flex-col gap-1 mt-2">
                      <label className="text-zinc-500 text-[9px] font-bold uppercase">Rotation ({selectedElement.rotation}°)</label>
                      <input type="range" min="0" max="360" value={selectedElement.rotation} onChange={(e) => updateElement(selectedId!, { rotation: Number(e.target.value) })} className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-700" />
                   </div>
                   <div className="flex gap-2 mt-4">
                      <button onClick={duplicateElement} className="flex-1 py-2 bg-neutral-100 rounded-md border border-green-900/10 flex justify-center items-center gap-1 text-green-700 text-[10px] font-bold uppercase tracking-tight hover:bg-neutral-200"><Copy className="w-3 h-3" /> Duplicate</button>
                      <button onClick={() => deleteElement(selectedId!)} className="flex-1 py-2 bg-rose-50 rounded-md flex justify-center items-center gap-1 text-red-600 text-[10px] font-bold uppercase tracking-tight hover:bg-rose-100"><Trash2 className="w-3 h-3" /> Delete</button>
                   </div>
                </div>
             )}

             {activePropertyTab === 'Colors' && (
                <div className="flex flex-col gap-4">
                   <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest">Color Palette</h4>
                   <div className="grid grid-cols-5 gap-2">
                      {colorPalette.map(color => (
                        <button
                          key={color}
                          onClick={() => updateElement(selectedId!, { color })}
                          className={`w-9 h-9 rounded-md border border-green-900/10 transition-all hover:scale-110 ${selectedElement?.color === color ? 'ring-2 ring-green-700' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                   </div>
                </div>
             )}

             {activePropertyTab === 'Type' && selectedElement?.type === 'text' && (
                <div className="flex flex-col gap-4">
                   <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest">Typography</h4>
                   <div className="flex flex-col gap-1">
                      <label className="text-zinc-500 text-[9px] font-bold uppercase">Text Content</label>
                      <textarea value={selectedElement.content} onChange={(e) => updateElement(selectedId!, { content: e.target.value })} className="w-full p-3 rounded-md border border-zinc-500/10 text-xs font-medium focus:border-green-700 outline-none min-h-[80px]" />
                   </div>
                   <div className="flex flex-col gap-1">
                      <label className="text-zinc-500 text-[9px] font-bold uppercase">Font Family</label>
                      <select value={selectedElement.fontFamily} onChange={(e) => updateElement(selectedId!, { fontFamily: e.target.value })} className="w-full p-2 bg-stone-50 border border-zinc-500/10 rounded-md text-xs font-bold appearance-none">
                         <option>Inter</option>
                         <option>Outfit</option>
                         <option>Montserrat</option>
                      </select>
                   </div>
                   <div className="flex flex-col gap-1">
                      <label className="text-zinc-500 text-[9px] font-bold uppercase">Font Size</label>
                      <div className="h-8 px-2 py-1.5 rounded-md outline outline-1 outline-zinc-500/10 flex items-center text-neutral-900 text-xs font-normal">
                         {selectedElement.fontSize}px
                      </div>
                   </div>
                   <div className="flex flex-col gap-1">
                      <label className="text-zinc-500 text-[9px] font-bold uppercase">Alignment</label>
                      <div className="flex h-9 pt-1 gap-1">
                         <button onClick={() => updateElement(selectedId!, { textAlign: 'left' })} className={`flex-1 h-8 rounded-md outline outline-1 outline-green-700/10 flex justify-center items-center ${selectedElement.textAlign === 'left' ? 'bg-green-100 text-green-700' : 'bg-white text-zinc-500'}`}><ChevronLeft className="w-3 h-3" /></button>
                         <button onClick={() => updateElement(selectedId!, { textAlign: 'center' })} className={`flex-1 h-8 rounded-md outline outline-1 outline-green-700/10 flex justify-center items-center ${selectedElement.textAlign === 'center' ? 'bg-green-100 text-green-700' : 'bg-white text-zinc-500'}`}><ChevronDown className="w-3 h-3" /></button>
                         <button onClick={() => updateElement(selectedId!, { textAlign: 'right' })} className={`flex-1 h-8 rounded-md outline outline-1 outline-green-700/10 flex justify-center items-center ${selectedElement.textAlign === 'right' ? 'bg-green-100 text-green-700' : 'bg-white text-zinc-500'}`}><ChevronRight className="w-3 h-3" /></button>
                      </div>
                   </div>
                </div>
             )}

             {activePropertyTab === 'Layers' && (
                <div className="flex flex-col gap-3">
                   <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest">Layers</h4>
                   {elements.filter(el => el.side === side).map(el => (
                     <div key={el.id} onClick={() => setSelectedId(el.id)} className={`px-2.5 py-2 rounded-md outline outline-1 flex items-center justify-between transition-all ${selectedId === el.id ? 'bg-gray-200 outline-green-700' : 'bg-neutral-100 outline-black/0'}`}>
                        <span className="text-zinc-500 text-xs font-normal truncate max-w-[150px]">{el.type === 'text' ? el.content : 'Image Asset'}</span>
                        <Trash2 className="w-3 h-3 text-zinc-500 hover:text-red-500" onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} />
                     </div>
                   ))}
                </div>
             )}
          </div>

          {/* Action Bar */}
          <div className="p-6 border-t border-gray-100 bg-stone-50">
             <button onClick={() => setShowPreview(true)} className="w-full py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">
                Review & Checkout
             </button>
          </div>
        </aside>
      </div>

      {/* ── Preview Modal ─────────────────────────────────────────────────── */}
      {showPreview && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-5xl h-fit max-h-[95vh] rounded-[40px] overflow-hidden flex flex-col md:flex-row relative">
              <button onClick={() => setShowPreview(false)} className="absolute top-6 right-6 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X className="w-5 h-5 text-gray-900" /></button>

              <div className="flex-1 bg-stone-100 flex items-center justify-center p-10 md:p-16 min-h-[300px]">
                 <div className="relative w-full max-w-[360px] aspect-[4/5] bg-white shadow-2xl rounded-[32px] border border-gray-100 flex items-center justify-center">
                    <div className="text-2xl font-black font-outfit text-green-700 uppercase tracking-tighter">Production Preview</div>
                 </div>
              </div>

              <div className="w-full md:w-[450px] p-8 md:p-12 flex flex-col justify-between bg-white">
                 <div className="flex flex-col gap-8">
                    <h2 className="text-3xl md:text-4xl font-black font-outfit text-gray-900 leading-tight">Review your Design</h2>
                    <ul className="flex flex-col gap-4">
                       {["Vibrant Colors", "Sharp Graphics", "Proper Layout"].map(check => (
                         <li key={check} className="flex items-center gap-4 text-sm font-bold text-zinc-600">
                            <CheckCircle2 className="w-5 h-5 text-green-700" strokeWidth={3} />
                            {check}
                         </li>
                       ))}
                    </ul>
                 </div>

                 <div className="flex flex-col gap-5 mt-16">
                    <label className="flex items-center gap-4 cursor-pointer group justify-center p-4 bg-gray-50 rounded-[24px]" onClick={() => setIsApproved(!isApproved)}>
                       <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${isApproved ? 'bg-green-700 border-green-700 shadow-lg shadow-green-700/20' : 'bg-white border-gray-200 group-hover:border-green-400'}`}>
                          {isApproved && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={4} /> }
                       </div>
                       <span className="text-sm font-black text-gray-600">I Approve Production</span>
                    </label>
                    <button
                      disabled={!isApproved}
                      className={`w-full py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl ${isApproved ? 'bg-green-700 text-white hover:bg-green-800 scale-[1.02]' : 'bg-gray-100 text-gray-400'}`}
                    >
                       Add to Cart
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </main>
  );
}
