"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Loader2, ArrowLeft, Truck, Zap, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { WP_URL } from '@/lib/wordpress';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';
import ColoredGraphic from '@/components/ColoredGraphic';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'graphic';
  content: string;
  x: number; y: number; width: number; height: number;
  rotation: number; opacity: number;
  color?: string; fontFamily?: string; fontSize?: number;
  fontWeight?: string; textAlign?: 'left' | 'center' | 'right';
  side: 'front' | 'back';
}

interface BulkTier {
  min_qty: number;
  pct: number;           // discount percentage, e.g. 10 = 10% off
}

interface ProductionOption {
  type: 'regular' | 'urgent';
  extra_cost: string;    // "0" for regular, "15" for urgent
  delivery_days: string; // "3-5", "1-2"
}

interface ReviewSnapshot {
  productId: number | null;
  productName: string;
  productImage: string | null;
  productPrice: string;
  designFee: number;
  bulkPricing: BulkTier[];
  productionOptions: ProductionOption[];
  elements: DesignElement[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

/** Returns the best bulk discount % for a given quantity */
function getBulkDiscount(tiers: BulkTier[], qty: number): { pct: number; tier: BulkTier | null } {
  if (!tiers || tiers.length === 0) return { pct: 0, tier: null };
  const sorted = [...tiers]
    .filter(t => t.min_qty > 0 && t.pct > 0)
    .sort((a, b) => b.min_qty - a.min_qty);
  const match = sorted.find(t => qty >= t.min_qty);
  return match ? { pct: match.pct, tier: match } : { pct: 0, tier: null };
}

// ── Canvas renderer ────────────────────────────────────────────────────────────

function DesignCanvas({
  elements, side, productImage, canvasW, canvasH, scaleW, scaleH,
}: {
  elements: DesignElement[]; side: 'front' | 'back';
  productImage: string | null; canvasW: number; canvasH: number;
  scaleW: number; scaleH: number;
}) {
  const visible = elements.filter(el => el.side === side);
  return (
    <div className="relative bg-white overflow-hidden flex items-center justify-center shadow-md"
      style={{ width: canvasW, height: canvasH }}>
      <div className="absolute inset-0 flex items-center justify-center p-4 bg-white">
        <div className="relative w-full h-full">
          <Image
            src={productImage || `${WP_URL}/wp-content/uploads/2022/08/cropped-Screenshot_3.png`}
            fill className="object-contain opacity-60" sizes={`${canvasW}px`} alt="Product"
          />
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none"
        style={{ transform: `scale(${scaleW})`, transformOrigin: 'top left',
                 width: `${canvasW / scaleW}px`, height: `${canvasH / scaleH}px` }}>
        {visible.map(el => (
          <div key={el.id} className="absolute flex items-center justify-center"
            style={{ left: el.x, top: el.y, width: el.width, height: el.height,
                     transform: `rotate(${el.rotation}deg)`, opacity: el.opacity }}>
            {el.type === 'text' ? (
              <div className="w-full h-full flex items-center justify-center leading-tight"
                style={{ color: el.color, fontSize: el.fontSize, fontFamily: el.fontFamily,
                         fontWeight: el.fontWeight, textAlign: el.textAlign }}>
                {el.content}
              </div>
            ) : (
              el.type === 'graphic' ? (
                <ColoredGraphic
                  src={el.content}
                  color={el.color}
                  className="w-full h-full object-contain"
                  alt="graphic"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={el.content} className="w-full h-full object-contain" alt="element" />
              )
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

  const [snapshot, setSnapshot]       = useState<ReviewSnapshot | null>(null);
  const [side, setSide]               = useState<'front' | 'back'>('front');
  const [isApproved, setIsApproved]   = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity]       = useState(1);
  const [delivery, setDelivery]       = useState<'regular' | 'urgent'>('regular');
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('bi_review_design');
    if (!raw) { router.replace('/design'); return; }
    try {
      const parsed = JSON.parse(raw) as ReviewSnapshot;
      setSnapshot(parsed);
      // Default to regular delivery if available
      const hasRegular = parsed.productionOptions?.some(o => o.type === 'regular');
      if (!hasRegular && parsed.productionOptions?.some(o => o.type === 'urgent')) {
        setDelivery('urgent');
      }
    } catch { router.replace('/design'); }
  }, [router]);

  // ── Pricing calculation ───────────────────────────────────────────────────
  const pricing = useMemo(() => {
    if (!snapshot) return null;

    const base      = parseFloat(snapshot.productPrice || '23.95');
    const designFee = snapshot.designFee ?? 0;
    const unitBeforeDiscount = base + designFee;

    // Bulk discount
    const { pct: discountPct, tier: activeTier } = getBulkDiscount(
      snapshot.bulkPricing ?? [], quantity
    );
    const discountAmount = discountPct > 0 ? unitBeforeDiscount * (discountPct / 100) : 0;
    const unitAfterDiscount = unitBeforeDiscount - discountAmount;

    // Delivery surcharge
    const deliveryOption = snapshot.productionOptions?.find(o => o.type === delivery);
    const deliveryCost = deliveryOption ? parseFloat(deliveryOption.extra_cost || '0') : 0;
    const deliveryDays = deliveryOption?.delivery_days ?? '3–5';

    const subtotal = (unitAfterDiscount * quantity) + deliveryCost;

    return {
      base, designFee, unitBeforeDiscount,
      discountPct, discountAmount, unitAfterDiscount,
      activeTier, deliveryCost, deliveryDays,
      subtotal,
    };
  }, [snapshot, quantity, delivery]);

  if (!snapshot || !pricing) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  const hasFront   = snapshot.elements.some(el => el.side === 'front');
  const hasBack    = snapshot.elements.some(el => el.side === 'back');
  const showToggle = hasFront && hasBack;
  const hasRegular = snapshot.productionOptions?.some(o => o.type === 'regular');
  const hasUrgent  = snapshot.productionOptions?.some(o => o.type === 'urgent');
  const showDelivery = hasRegular || hasUrgent;

  // Next bulk tier info
  const nextTier = snapshot.bulkPricing
    ?.filter(t => t.min_qty > 0 && t.pct > 0 && t.min_qty > quantity)
    .sort((a, b) => a.min_qty - b.min_qty)[0];

  const handleAddToCart = async () => {
    setAddingToCart(true);

    // Persist to saved designs
    const saved = {
      id: `design-${Date.now()}`,
      savedAt: new Date().toISOString(),
      productName: snapshot.productName,
      productImage: snapshot.productImage,
      elements: snapshot.elements,
    };
    const existing = JSON.parse(localStorage.getItem('bi_saved_designs') ?? '[]');
    localStorage.setItem('bi_saved_designs', JSON.stringify([saved, ...existing].slice(0, 20)));

    await addToCart({
      id: snapshot.productId || 999,
      name: `${snapshot.productName} (Personalised${delivery === 'urgent' ? ' · Urgent' : ''})`,
      price: pricing.subtotal / quantity, // per-unit price including delivery split
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

      {/* Back button */}
      <button onClick={() => router.back()}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-2 bg-white/90 hover:bg-white text-gray-700 text-sm font-semibold rounded-lg shadow transition-all">
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden md:inline">Back</span>
      </button>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Desktop canvas ── */}
        <div className="hidden md:flex flex-1 bg-[#c8c8c8] items-center justify-center relative overflow-hidden">
          {showToggle && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 p-1 bg-white/80 backdrop-blur-sm rounded-lg shadow">
              {(['front', 'back'] as const).map(s => (
                <button key={s} onClick={() => setSide(s)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${side === s ? 'bg-white text-gray-900 shadow-sm' : 'text-zinc-500 hover:text-gray-800'}`}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <DesignCanvas elements={snapshot.elements} side={side} productImage={snapshot.productImage}
            canvasW={420} canvasH={500} scaleW={0.7} scaleH={0.7} />
        </div>

        {/* ── Right panel ── */}
        <div className="w-full md:w-[400px] bg-white flex flex-col overflow-y-auto">

          {/* Mobile canvas */}
          <div className="md:hidden bg-[#c8c8c8] flex flex-col items-center justify-center gap-3 pt-10 pb-6 px-4">
            {showToggle && (
              <div className="flex items-center gap-0.5 p-1 bg-white/80 backdrop-blur-sm rounded-lg shadow">
                {(['front', 'back'] as const).map(s => (
                  <button key={s} onClick={() => setSide(s)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${side === s ? 'bg-white text-gray-900 shadow-sm' : 'text-zinc-500'}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <DesignCanvas elements={snapshot.elements} side={side} productImage={snapshot.productImage}
              canvasW={220} canvasH={264} scaleW={0.367} scaleH={0.367} />
          </div>

          {/* Panel content */}
          <div className="flex flex-col flex-1 p-6 md:p-7 gap-5">

            {/* Heading */}
            <div>
              <h1 className="text-lg font-bold text-gray-900">Review your Design</h1>
              <p className="text-gray-500 text-sm mt-0.5">Check the details below before adding to cart.</p>
            </div>

            {/* Checklist */}
            <ul className="flex flex-col gap-2">
              {checklist.map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* ── Quantity ── */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide w-16">Qty</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-green-600 hover:text-green-700 transition-colors text-base">−</button>
                <span className="text-sm font-black text-gray-900 min-w-[28px] text-center tabular-nums">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-green-600 hover:text-green-700 transition-colors text-base">+</button>
              </div>
              {/* Next bulk tier nudge */}
              {nextTier && (
                <span className="text-xs text-green-700 font-semibold ml-1">
                  Add {nextTier.min_qty - quantity} more → {nextTier.pct}% off
                </span>
              )}
            </div>

            {/* ── Delivery options ── */}
            {showDelivery && (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Delivery</span>
                <div className="flex gap-2">
                  {hasRegular && (
                    <button onClick={() => setDelivery('regular')}
                      className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${delivery === 'regular' ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}>
                      <Truck className={`w-4 h-4 shrink-0 ${delivery === 'regular' ? 'text-green-700' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-xs font-bold ${delivery === 'regular' ? 'text-green-700' : 'text-gray-700'}`}>Standard</p>
                        <p className="text-[10px] text-gray-400">
                          {snapshot.productionOptions.find(o => o.type === 'regular')?.delivery_days ?? '3–5'} days · Free
                        </p>
                      </div>
                    </button>
                  )}
                  {hasUrgent && (() => {
                    const opt = snapshot.productionOptions.find(o => o.type === 'urgent');
                    const cost = parseFloat(opt?.extra_cost || '0');
                    return (
                      <button onClick={() => setDelivery('urgent')}
                        className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${delivery === 'urgent' ? 'border-amber-500 bg-amber-50' : 'border-gray-100 hover:border-gray-300'}`}>
                        <Zap className={`w-4 h-4 shrink-0 ${delivery === 'urgent' ? 'text-amber-600' : 'text-gray-400'}`} />
                        <div>
                          <p className={`text-xs font-bold ${delivery === 'urgent' ? 'text-amber-700' : 'text-gray-700'}`}>Urgent</p>
                          <p className="text-[10px] text-gray-400">
                            {opt?.delivery_days ?? '1–2'} days · +{fmt(cost)}
                          </p>
                        </div>
                      </button>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ── Price breakdown ── */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden">

              {/* Active bulk discount badge */}
              {pricing.discountPct > 0 && (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-bold">
                  <Tag className="w-3.5 h-3.5" />
                  Bulk discount applied — {pricing.discountPct}% off
                </div>
              )}

              {/* Collapsed summary / expandable breakdown */}
              <button
                onClick={() => setShowBreakdown(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-gray-900">{fmt(pricing.subtotal)}</span>
                  <span className="text-xs text-gray-400">total · {quantity} {quantity === 1 ? 'unit' : 'units'}</span>
                </div>
                {showBreakdown
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {showBreakdown && (
                <div className="px-4 pb-4 flex flex-col gap-1.5 border-t border-gray-100 pt-3">
                  <Row label="Base price" value={fmt(pricing.base)} />
                  {pricing.designFee > 0 && (
                    <Row label="Personalisation fee" value={`+${fmt(pricing.designFee)}`} />
                  )}
                  {pricing.discountPct > 0 && (
                    <Row label={`Bulk discount (${pricing.discountPct}%)`}
                      value={`−${fmt(pricing.discountAmount)}`}
                      className="text-green-700 font-bold" />
                  )}
                  <Row label="Unit price" value={fmt(pricing.unitAfterDiscount)} bold />
                  <Row label={`× ${quantity} unit${quantity !== 1 ? 's' : ''}`} value={fmt(pricing.unitAfterDiscount * quantity)} />
                  {pricing.deliveryCost > 0 && (
                    <Row label={`Urgent delivery (+${pricing.deliveryDays} days)`} value={`+${fmt(pricing.deliveryCost)}`} />
                  )}
                  <div className="border-t border-gray-200 mt-1 pt-2 flex items-center justify-between">
                    <span className="text-sm font-black text-gray-900">Total</span>
                    <span className="text-sm font-black text-gray-900">{fmt(pricing.subtotal)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Approve checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => setIsApproved(v => !v)}>
              <div className={`w-4 h-4 border rounded flex items-center justify-center shrink-0 transition-colors ${isApproved ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}>
                {isApproved && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700">I have reviewed and approve my design.</span>
            </label>

            {/* Add to cart */}
            <button disabled={!isApproved || addingToCart} onClick={handleAddToCart}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isApproved ? 'bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white' : 'bg-green-600/40 text-white/70 cursor-not-allowed'
              }`}>
              {addingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
              {addingToCart ? 'Adding...' : `Add to cart · ${fmt(pricing.subtotal)}`}
            </button>

            {/* Continue editing */}
            <button onClick={() => router.back()}
              className="w-full py-3.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all -mt-1">
              Continue Editing
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small helper component ────────────────────────────────────────────────────
function Row({ label, value, bold = false, className = '' }: {
  label: string; value: string; bold?: boolean; className?: string;
}) {
  return (
    <div className={`flex items-center justify-between text-sm ${className}`}>
      <span className={`text-gray-500 ${bold ? 'font-bold text-gray-700' : ''}`}>{label}</span>
      <span className={`tabular-nums ${bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{value}</span>
    </div>
  );
}
