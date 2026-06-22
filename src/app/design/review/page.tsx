"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Loader2, ArrowLeft } from 'lucide-react';
import { WP_URL } from '@/lib/wordpress';
import { useCart } from '@/context/CartContext';
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

interface ReviewSnapshot {
  productId: number | null;
  productName: string;
  productImage: string | null;
  productPrice: string;
  elements: DesignElement[];
}

// ── Canvas renderer (shared for front/back) ───────────────────────────────────

function DesignCanvas({
  elements,
  side,
  productImage,
  canvasW,
  canvasH,
  scaleW,
  scaleH,
}: {
  elements: DesignElement[];
  side: 'front' | 'back';
  productImage: string | null;
  canvasW: number;
  canvasH: number;
  scaleW: number;
  scaleH: number;
}) {
  const visible = elements.filter(el => el.side === side);
  return (
    <div
      className="relative bg-white overflow-hidden flex items-center justify-center shadow-md"
      style={{ width: canvasW, height: canvasH }}
    >
      {/* Product base */}
      <div className="absolute inset-0 flex items-center justify-center p-4 bg-white">
        <div className="relative w-full h-full">
          <Image
            src={productImage || `${WP_URL}/wp-content/uploads/2022/08/cropped-Screenshot_3.png`}
            fill
            className="object-contain opacity-60"
            sizes={`${canvasW}px`}
            alt="Product"
          />
        </div>
      </div>

      {/* Design elements scaled */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `scale(${scaleW})`,
          transformOrigin: 'top left',
          width: `${canvasW / scaleW}px`,
          height: `${canvasH / scaleH}px`,
        }}
      >
        {visible.map(el => (
          <div
            key={el.id}
            className="absolute flex items-center justify-center"
            style={{
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              transform: `rotate(${el.rotation}deg)`,
              opacity: el.opacity,
            }}
          >
            {el.type === 'text' ? (
              <div
                className="w-full h-full flex items-center justify-center leading-tight"
                style={{
                  color: el.color,
                  fontSize: el.fontSize,
                  fontFamily: el.fontFamily,
                  fontWeight: el.fontWeight,
                  textAlign: el.textAlign,
                }}
              >
                {el.content}
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={el.content} className="w-full h-full object-contain" alt="element" />
            )}
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-zinc-400 text-xs font-medium z-10 relative">No design on {side} side</p>
      )}
    </div>
  );
}

// ── Review Page ───────────────────────────────────────────────────────────────

export default function DesignReviewPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  const [snapshot, setSnapshot] = useState<ReviewSnapshot | null>(null);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [isApproved, setIsApproved] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const raw = localStorage.getItem('bi_review_design');
    if (!raw) { router.replace('/design'); return; }
    try { setSnapshot(JSON.parse(raw)); } catch { router.replace('/design'); }
  }, [router]);

  if (!snapshot) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  const hasFront = snapshot.elements.some(el => el.side === 'front');
  const hasBack  = snapshot.elements.some(el => el.side === 'back');
  const showToggle = hasFront && hasBack;

  const handleAddToCart = () => {
    setAddingToCart(true);

    // Also persist to saved designs
    const saved = {
      id: `design-${Date.now()}`,
      savedAt: new Date().toISOString(),
      productName: snapshot.productName,
      productImage: snapshot.productImage,
      elements: snapshot.elements,
    };
    const existing = JSON.parse(localStorage.getItem('bi_saved_designs') ?? '[]');
    localStorage.setItem('bi_saved_designs', JSON.stringify([saved, ...existing].slice(0, 20)));

    addToCart({
      id: snapshot.productId || 999,
      name: `${snapshot.productName} (Personalized)`,
      price: parseFloat(snapshot.productPrice || '23.95'),
      quantity,
      image: snapshot.productImage || '',
    });
    showNotification({ title: 'Added to cart', message: 'Your custom design is in your bag!', type: 'cart' });
    setTimeout(() => router.push('/cart'), 900);
  };

  const checklist = [
    'Text is clear and easy to read',
    'Spellings are correct',
    'Images are not blurry',
    'Correct images are uploaded',
  ];

  return (
    <div className="w-full h-screen bg-[#6b6b6b] flex flex-col overflow-hidden">

      {/* ── Fixed back button — top-left of the whole page ── */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 text-sm font-semibold rounded-lg shadow transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden md:inline">Back</span>
      </button>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: canvas (desktop only) ── */}
        <div className="hidden md:flex flex-1 bg-[#c8c8c8] items-center justify-center relative overflow-hidden">
          {showToggle && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 p-1 bg-white/80 backdrop-blur-sm rounded-lg shadow">
              {(['front', 'back'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${side === s ? 'bg-white text-gray-900 shadow-sm' : 'text-zinc-500 hover:text-gray-800'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <DesignCanvas
            elements={snapshot.elements}
            side={side}
            productImage={snapshot.productImage}
            canvasW={420}
            canvasH={500}
            scaleW={0.7}
            scaleH={0.7}
          />
        </div>

        {/* ── Right panel ── */}
        <div className="w-full md:w-[380px] bg-white flex flex-col overflow-y-auto">

          {/* ── Mobile-only canvas ── */}
          <div className="md:hidden bg-[#c8c8c8] flex flex-col items-center justify-center gap-3 pt-10 pb-6 px-4">
            {showToggle && (
              <div className="flex items-center gap-0.5 p-1 bg-white/80 backdrop-blur-sm rounded-lg shadow">
                {(['front', 'back'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${side === s ? 'bg-white text-gray-900 shadow-sm' : 'text-zinc-500'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <DesignCanvas
              elements={snapshot.elements}
              side={side}
              productImage={snapshot.productImage}
              canvasW={220}
              canvasH={264}
              scaleW={0.367}
              scaleH={0.367}
            />
          </div>

          {/* ── Panel content ── */}
          <div className="flex flex-col flex-1 p-6 md:p-8">

            {/* Heading */}
            <div className="mb-5">
              <h1 className="text-lg font-bold text-gray-900">Review your Design</h1>
              <p className="text-gray-500 text-sm mt-0.5">Double-check the following details before you continue.</p>
            </div>

            {/* Checklist */}
            <ul className="flex flex-col gap-2.5 mb-6">
              {checklist.map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Qty</span>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:border-green-600 transition-colors text-base leading-none"
              >−</button>
              <span className="text-sm font-bold text-gray-900 min-w-[20px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:border-green-600 transition-colors text-base leading-none"
              >+</button>
            </div>

            {/* Spacer on desktop */}
            <div className="flex-1" />

            {/* Approve checkbox */}
            <label
              className="flex items-center gap-2.5 cursor-pointer mb-4 select-none"
              onClick={() => setIsApproved(v => !v)}
            >
              <div
                className={`w-4 h-4 border rounded flex items-center justify-center shrink-0 transition-colors ${
                  isApproved ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'
                }`}
              >
                {isApproved && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700">I have reviewed and approve my design.</span>
            </label>

            {/* Add to cart */}
            <button
              disabled={!isApproved || addingToCart}
              onClick={handleAddToCart}
              className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 mb-2.5 ${
                isApproved
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-600/40 text-white/70 cursor-not-allowed'
              }`}
            >
              {addingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
              {addingToCart ? 'Adding...' : 'Add to cart'}
            </button>

            {/* Continue editing */}
            <button
              onClick={() => router.back()}
              className="w-full py-3.5 rounded-lg font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Continue Editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
