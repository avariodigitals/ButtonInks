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
  Move
} from 'lucide-react';

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
  const [activeTool, setActiveTool] = useState('text');
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

  // Load recent media from API Proxy
  useEffect(() => {
    fetch('/api/media')
      .then(res => res.json())
      .then(data => setRecentUploads(Array.isArray(data) ? data : []))
      .catch(err => console.error("Recent media error:", err));
  }, []);

  // Update properties helper
  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  // Handle image upload via API Proxy
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setRecentUploads(prev => [result, ...prev]);
        // Add to canvas
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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && selectedId) {
      const newX = (e.clientX - dragOffset.x) / (zoom / 100);
      const newY = (e.clientY - dragOffset.y) / (zoom / 100);
      updateElement(selectedId, { x: newX, y: newY });
    }
  }, [isDragging, selectedId, dragOffset, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
    <main className="w-full h-[calc(100vh-40px)] bg-gray-50 flex flex-col font-['Inter'] overflow-hidden">

      {/* ── Editor Workspace ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Icon Sidebar */}
        <aside className="w-16 md:w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 shrink-0 z-20 shadow-sm">
          {sidebarTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-full p-2 flex flex-col items-center gap-1 transition-all mb-2 ${isActive ? 'text-green-700' : 'text-zinc-500 hover:text-gray-900'}`}
              >
                <div className={`p-2 md:p-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-green-700 text-white shadow-lg shadow-green-700/20 scale-110' : 'hover:bg-gray-100'}`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="hidden md:block text-[10px] font-bold tracking-tight uppercase opacity-80">{tool.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Tool Content Panel */}
        <aside className={`w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col shrink-0 z-10 transition-transform duration-300 fixed md:relative h-full md:translate-x-0 ${activeTool ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-stone-50/50">
            <h2 className="text-xl font-bold text-black capitalize">{activeTool}</h2>
            <button className="md:hidden p-2" onClick={() => setActiveTool('')}><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar">
            {/* TEXT TOOL */}
            {activeTool === 'text' && (
              <>
                <p className="text-black/60 text-sm leading-relaxed">Edit your text below, or click on the field you'd like to edit directly on your design.</p>
                <button
                  onClick={() => {
                    const newId = Date.now().toString();
                    setElements([...elements, { id: newId, type: 'text', content: 'New Text', x: 200, y: 200, width: 200, height: 40, rotation: 0, opacity: 1, color: '#171717', fontFamily: 'Inter', fontSize: 24, textAlign: 'center', side }]);
                    setSelectedId(newId);
                  }}
                  className="w-full py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-xl shadow-green-700/20 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add New Text
                </button>
              </>
            )}

            {/* UPLOADS TOOL */}
            {activeTool === 'uploads' && (
              <div className="flex flex-col gap-6">
                <p className="text-black/60 text-sm">Upload existing design, images or illustrations</p>

                {/* Upload Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-8 bg-green-50 rounded-2xl outline-2 outline-dashed outline-green-700/30 hover:outline-green-700 flex flex-col justify-center items-center gap-4 cursor-pointer transition-all"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-4 w-full text-center">
                       <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
                       <span className="text-xs font-bold text-green-700">Uploading to ButtonInks...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-green-700" />
                      <div className="text-center">
                        <p className="text-gray-900 font-bold">Drag & drop files here</p>
                        <p className="text-gray-500 text-sm">Accepted: PNG, JPG, AI, SVG</p>
                      </div>
                      <button className="px-6 py-2 bg-green-700 text-white text-xs font-bold rounded-lg uppercase">Browse Files</button>
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
                        className="aspect-square bg-gray-50 rounded border border-black/5 overflow-hidden cursor-pointer hover:border-green-500 transition-all"
                      >
                        <img src={img.source_url} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* GRAPHICS TOOL */}
            {activeTool === 'graphics' && (
               <div className="flex flex-col gap-6">
                 <div className="relative">
                   <input type="text" placeholder="Search graphics..." className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-green-700 transition-all" />
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                 </div>

                 {['Shapes', 'Icons', 'Illustrations'].map(group => (
                   <div key={group} className="flex flex-col gap-3">
                      <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{group}</h4>
                      <div className="grid grid-cols-4 gap-2">
                         {Array.from({ length: 4 }).map((_, i) => (
                           <div key={i} className="aspect-square bg-stone-50 rounded border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-white transition-all">
                              <div className="w-8 h-8 bg-zinc-800 rounded-sm opacity-20" />
                           </div>
                         ))}
                      </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </aside>

        {/* ── Main Canvas Area ── */}
        <section className="flex-1 relative flex flex-col bg-gray-50 overflow-hidden">

          {/* Canvas Toolbar */}
          <div className="h-14 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="p-1 bg-gray-100 rounded-xl flex gap-1">
              <button onClick={() => setSide('front')} className={`px-4 md:px-8 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all ${side === 'front' ? 'bg-white text-gray-900 shadow-md' : 'text-zinc-500'}`}>Front</button>
              <button onClick={() => setSide('back')} className={`px-4 md:px-8 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all ${side === 'back' ? 'bg-white text-gray-900 shadow-md' : 'text-zinc-500'}`}>Back</button>
            </div>

            <button onClick={() => selectedId && deleteElement(selectedId)} className="p-2 md:px-4 md:py-2 bg-rose-50 text-red-600 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-rose-100 transition-all border border-red-100">
              <Trash2 className="w-4 h-4" />
              <span className="hidden md:inline">Delete Selected</span>
            </button>
          </div>

          {/* Canvas Workspace */}
          <div
            className="flex-1 relative flex items-center justify-center p-4 md:p-20 overflow-auto no-scrollbar"
            onClick={() => setSelectedId(null)}
          >
            <div
              ref={workspaceRef}
              className="bg-white shadow-[0px_32px_64px_-12px_rgba(0,0,0,0.14)] relative rounded-lg overflow-hidden border border-gray-200"
              style={{
                width: '600px',
                height: '750px',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Product Background Mockup */}
              <div className="absolute inset-0 flex items-center justify-center p-12 bg-stone-50/50">
                <div className="relative w-full h-full opacity-30 flex items-center justify-center">
                   <img src="https://buttoninks.com/wp-content/uploads/2022/08/cropped-Screenshot_3.png" alt="Base" className="max-w-full max-h-full object-contain pointer-events-none" />
                </div>
              </div>

              {/* Design Elements Render */}
              {elements.filter(el => el.side === side).map((el) => (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  className={`absolute cursor-move transition-shadow flex items-center justify-center ${selectedId === el.id ? 'outline-2 outline-green-500 shadow-xl z-20' : 'hover:outline-1 hover:outline-green-300 z-10'}`}
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
                      className="w-full h-full flex items-center justify-center font-bold"
                      style={{
                        color: el.color,
                        fontSize: `${el.fontSize}px`,
                        textAlign: el.textAlign,
                        fontFamily: el.fontFamily,
                        userSelect: 'none'
                      }}
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
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                         <Move className="w-4 h-4 text-white" />
                      </div>
                    </>
                  )}
                </div>
              ))}

              <div className="absolute inset-[15%] border-2 border-dashed border-green-500/10 pointer-events-none" />
            </div>

            {/* Floating Zoom Controls */}
            <div className="fixed md:absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-[20px] shadow-xl border border-gray-100 flex items-center p-1.5 gap-1 z-30 scale-90 md:scale-100">
              <button onClick={() => setZoom(Math.max(25, zoom - 10))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors text-zinc-600"><ZoomOut className="w-5 h-5" /></button>
              <div className="px-4 text-sm font-bold text-zinc-900 tabular-nums min-w-[70px] text-center">{zoom}%</div>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors text-zinc-600"><ZoomIn className="w-5 h-5" /></button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors text-zinc-600" onClick={() => setZoom(100)}><Maximize className="w-5 h-5" /></button>
            </div>
          </div>
        </section>

        {/* ── Right Properties Panel ── */}
        <aside className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0 hidden xl:flex shadow-sm z-20">
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
                className={`py-4 flex flex-col items-center gap-1.5 transition-all border-b-2 relative ${activePropertyTab === tab.id ? 'border-green-700 text-green-700 bg-green-50/20' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-[9px] font-bold uppercase tracking-widest">{tab.id}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar">
            {/* PROPERTIES TAB */}
            {activePropertyTab === 'Props' && selectedElement && (
               <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                  <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest border-b border-green-700/10 pb-2">Position & Size</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex flex-col gap-1">
                        <label className="text-zinc-400 text-[9px] font-bold uppercase">X Position</label>
                        <input type="number" value={Math.round(selectedElement.x)} onChange={(e) => updateElement(selectedId!, { x: Number(e.target.value) })} className="w-full p-2.5 bg-stone-50 border border-gray-100 rounded-lg text-xs font-bold outline-none focus:border-green-700" />
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-zinc-400 text-[9px] font-bold uppercase">Y Position</label>
                        <input type="number" value={Math.round(selectedElement.y)} onChange={(e) => updateElement(selectedId!, { y: Number(e.target.value) })} className="w-full p-2.5 bg-stone-50 border border-gray-100 rounded-lg text-xs font-bold outline-none focus:border-green-700" />
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-zinc-400 text-[9px] font-bold uppercase">Width</label>
                        <input type="number" value={Math.round(selectedElement.width)} onChange={(e) => updateElement(selectedId!, { width: Number(e.target.value) })} className="w-full p-2.5 bg-stone-50 border border-gray-100 rounded-lg text-xs font-bold outline-none focus:border-green-700" />
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-zinc-400 text-[9px] font-bold uppercase">Height</label>
                        <input type="number" value={Math.round(selectedElement.height)} onChange={(e) => updateElement(selectedId!, { height: Number(e.target.value) })} className="w-full p-2.5 bg-stone-50 border border-gray-100 rounded-lg text-xs font-bold outline-none focus:border-green-700" />
                     </div>
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-zinc-400 text-[9px] font-bold uppercase">Opacity</label>
                      <input type="range" min="0" max="1" step="0.01" value={selectedElement.opacity} onChange={(e) => updateElement(selectedId!, { opacity: Number(e.target.value) })} className="w-full accent-green-700" />
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-zinc-400 text-[9px] font-bold uppercase">Rotation ({selectedElement.rotation}°)</label>
                      <input type="range" min="0" max="360" value={selectedElement.rotation} onChange={(e) => updateElement(selectedId!, { rotation: Number(e.target.value) })} className="w-full accent-green-700" />
                  </div>
                  <div className="flex gap-2">
                     <button onClick={duplicateElement} className="flex-1 py-3 bg-stone-50 hover:bg-green-50 border border-gray-100 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-zinc-600 hover:text-green-700 transition-all"><Copy className="w-3 h-3" /> Duplicate</button>
                     <button onClick={() => deleteElement(selectedId!)} className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 border border-red-100 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-red-600 transition-all"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
               </div>
            )}

            {/* COLORS TAB */}
            {activePropertyTab === 'Colors' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest border-b border-green-700/10 pb-2">Color Palette</h4>
                <div className="grid grid-cols-5 gap-3">
                  {colorPalette.map(color => (
                    <button
                      key={color}
                      onClick={() => selectedId && updateElement(selectedId, { color })}
                      className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 ${selectedElement?.color === color ? 'border-green-700 shadow-lg' : 'border-stone-100'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TYPE TAB */}
            {activePropertyTab === 'Type' && selectedElement?.type === 'text' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest border-b border-green-700/10 pb-2">Typography</h4>
                <div className="flex flex-col gap-2">
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Text Content</label>
                  <textarea
                    value={selectedElement.content}
                    onChange={(e) => updateElement(selectedId!, { content: e.target.value })}
                    className="w-full p-4 rounded-xl bg-stone-50 border border-gray-100 text-sm font-bold focus:border-green-700 outline-none min-h-[100px]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Font Family</label>
                  <div className="relative">
                    <select
                      value={selectedElement.fontFamily}
                      onChange={(e) => updateElement(selectedId!, { fontFamily: e.target.value })}
                      className="w-full p-4 bg-stone-50 border border-gray-100 rounded-xl text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-green-700/20 transition-all cursor-pointer"
                    >
                      <option>Inter</option>
                      <option>Outfit</option>
                      <option>Montserrat</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* LAYERS TAB */}
            {activePropertyTab === 'Layers' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                <h4 className="text-green-700 text-[10px] font-black uppercase tracking-widest border-b border-green-700/10 pb-2">Canvas Layers</h4>
                <div className="flex flex-col gap-2">
                   {elements.filter(el => el.side === side).map((el, i) => (
                     <div
                      key={el.id}
                      onClick={() => setSelectedId(el.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedId === el.id ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:bg-stone-50'}`}
                     >
                        <div className="flex items-center gap-3 overflow-hidden">
                           <span className="text-[10px] font-black text-zinc-300">#{elements.length - i}</span>
                           <span className="text-xs font-bold text-zinc-600 truncate max-w-[120px]">{el.type === 'text' ? el.content : `Image Asset`}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="p-1.5 hover:bg-red-50 text-zinc-300 hover:text-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-6 border-t border-gray-100 bg-stone-50">
             <button
              onClick={() => setShowPreview(true)}
              className="w-full py-4 bg-green-700 hover:bg-green-800 text-white font-black rounded-xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-[10px]"
             >
                Review & Add to Cart
             </button>
          </div>
        </aside>
      </div>

      {/* ── Design Preview Modal ── */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl h-fit max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
            <button onClick={() => setShowPreview(false)} className="absolute top-6 right-6 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-900" /></button>

            {/* Visual Preview */}
            <div className="flex-1 bg-stone-100 flex items-center justify-center p-10 min-h-[300px]">
               <div className="relative w-full max-w-[400px] aspect-[4/5] bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center">
                  <Image src="https://buttoninks.com/wp-content/uploads/2022/08/cropped-Screenshot_3.png" alt="Mockup" width={300} height={300} className="opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black font-outfit text-zinc-800 text-center px-6">DESIGN READY</span>
                  </div>
               </div>
            </div>

            {/* Review Sidebar */}
            <div className="w-full md:w-[450px] p-8 md:p-12 flex flex-col justify-between bg-white">
               <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-3xl font-black font-outfit text-gray-900 leading-tight">Review your Design</h2>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Double-check the following details before you continue.</p>
                  </div>

                  <ul className="flex flex-col gap-3">
                     {["Text is clear", "Spellings correct", "Images sharp"].map((item) => (
                       <li key={item} className="flex items-center gap-3 text-sm font-semibold text-zinc-600">
                          <CheckCircle2 className="w-5 h-5 text-green-700" strokeWidth={3} />
                          {item}
                       </li>
                     ))}
                  </ul>
               </div>

               <div className="flex flex-col gap-4 mt-12">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${isApproved ? 'bg-green-700 border-green-700' : 'bg-white border-gray-200 group-hover:border-green-300'}`}>
                      <input type="checkbox" className="hidden" checked={isApproved} onChange={() => setIsApproved(!isApproved)} />
                      {isApproved && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-gray-600 leading-tight">I have reviewed and approve my design.</span>
                  </label>

                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      disabled={!isApproved}
                      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${isApproved ? 'bg-green-700 text-white hover:bg-green-800 shadow-green-700/30' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      Add to cart
                    </button>
                    <button onClick={() => setShowPreview(false)} className="w-full py-4 bg-white border-2 border-zinc-200 text-zinc-600 hover:bg-gray-50 font-black rounded-2xl uppercase tracking-widest text-sm transition-all">
                      Continue Editing
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
