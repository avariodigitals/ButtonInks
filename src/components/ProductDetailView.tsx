"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, Star, Minus, Plus, Upload, Maximize2,
  FileDown, ShoppingCart, SlidersHorizontal, Palette, X
} from 'lucide-react';
import { WPProduct, decodeHTMLEntities } from '@/lib/wordpress';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';

export default function ProductDetailView({
  product,
  categorySlug,
}: {
  product: WPProduct;
  categorySlug: string;
}) {
  const { addToCart }        = useCart();
  const { showNotification } = useNotification();

  // De-duplicate images by id so the same WP media ID never appears twice
  const uniqueImages = product.images.filter(
    (img, idx, arr) => arr.findIndex(x => x.id === img.id) === idx
  );

  const [mainImage,          setMainImage]          = useState(uniqueImages[0]?.src || 'https://placehold.co/589x480');
  const [lightboxOpen,       setLightboxOpen]       = useState(false);
  const [quantity,           setQuantity]           = useState(1);
  const [activeTab,          setActiveTab]          = useState('Description');
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedProduction, setSelectedProduction] = useState<string>(
    product.acf?.production_options?.[0]?.type || 'regular'
  );

  // ── ACF flags ─────────────────────────────────────────────────────────────
  const enableDesigner = product.acf?.enable_designer === true;
  const enableUpload   = product.acf?.enable_upload   === true;
  const buyAsIs        = product.acf?.buy_as_is       === true;
  // If none are set yet (plugin not run on this product), show upload by default
  const showUploadBtn  = enableUpload || (!enableDesigner && !buyAsIs);
  const showDesignBtn  = enableDesigner;

  // ── Price ─────────────────────────────────────────────────────────────────
  const getUnitPrice = () => {
    let price = parseFloat(product.price || '0');
    if (product.acf?.bulk_pricing) {
      const sorted = [...product.acf.bulk_pricing].sort((a, b) => b.min_qty - a.min_qty);
      const tier   = sorted.find(b => quantity >= b.min_qty);
      if (tier) price = parseFloat(tier.discount_price);
    }
    return price;
  };

  const getFinalUnitPrice = () => {
    let price    = getUnitPrice();
    const option = product.acf?.production_options?.find(o => o.type === selectedProduction);
    if (option) price += parseFloat(option.extra_cost || '0');
    return price;
  };

  const unitPrice        = getFinalUnitPrice();
  const regularUnitPrice = parseFloat(product.regular_price || product.price || '0');

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAttributeSelect = (name: string, option: string) =>
    setSelectedAttributes(prev => ({ ...prev, [name]: option }));

  const handleAddToCart = () => {
    const missing = product.attributes.find(a => !selectedAttributes[a.name]);
    if (missing) {
      showNotification({ title: 'Selection Required', message: `Please choose a ${missing.name}.`, type: 'error' });
      return;
    }
    const attrStr   = Object.entries(selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(', ');
    const speedLabel = selectedProduction === 'urgent' ? 'Urgent' : 'Standard';
    addToCart({
      id:       product.id,
      name:     `${product.name}${attrStr ? ` (${attrStr}, ${speedLabel})` : ''}`,
      price:    unitPrice,
      quantity,
      image:    uniqueImages[0]?.src || '',
    });
    showNotification({ title: 'Added to Cart', message: `${product.name} added to your bag.`, type: 'cart' });
  };

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabs = ['Description', 'Print Guideline', 'Ordering information', 'File Setup', 'Template', 'Reviews'];

  const tabContent = () => {
    switch (activeTab) {
      case 'Description':
        return (
          <div
            className="prose max-w-none text-slate-600 text-base leading-relaxed font-['Inter']"
            dangerouslySetInnerHTML={{ __html: product.description || product.short_description }}
          />
        );
      case 'Print Guideline':
        return (
          <div className="flex flex-col gap-4 text-slate-600 text-base font-['Inter'] leading-7">
            {product.acf?.print_notes
              ? <p>{product.acf.print_notes}</p>
              : (
                <ul className="list-disc pl-5 flex flex-col gap-2">
                  <li>Use high-resolution images (300 DPI minimum).</li>
                  <li>Keep important text within the safe zone.</li>
                  <li>Convert all text to outlines if using custom fonts.</li>
                  <li>Ensure colors are in CMYK mode for accurate reproduction.</li>
                </ul>
              )
            }
          </div>
        );
      case 'Ordering information':
        return (
          <div className="flex flex-col gap-4 text-slate-600 text-base font-['Inter'] leading-7">
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>Standard Production: 3–5 business days.</li>
              <li>Express Production: 1–2 business days (additional fee).</li>
              <li>Shipping: USPS Priority Mail (1–3 days) or Ground (2–5 days).</li>
            </ul>
          </div>
        );
      case 'File Setup':
        return (
          <div className="flex flex-col gap-4 text-slate-600 text-base font-['Inter'] leading-7">
            <p>Accepted file formats:</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {['PDF', 'AI', 'PSD', 'PNG', 'JPG', 'EPS'].map(ext => (
                <div key={ext} className="p-3 bg-gray-50 rounded-lg text-center font-bold border border-gray-100">{ext}</div>
              ))}
            </div>
          </div>
        );
      case 'Template':
        return (
          <div className="flex flex-col gap-6 text-slate-600 text-base font-['Inter']">
            <p>Download our design templates to set up your artwork correctly:</p>
            <div className="flex flex-wrap gap-4">
              {['PDF', 'AI'].map(t => (
                <button key={t} className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 font-bold text-sm">
                  <FileDown className="w-4 h-4" /> Download {t} Template
                </button>
              ))}
            </div>
          </div>
        );
      case 'Reviews':
        return (
          <div className="flex flex-col gap-10 w-full">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="w-full md:w-64 h-40 p-6 bg-green-50 rounded-2xl flex flex-col justify-center items-center gap-2">
                <span className="text-green-700 text-6xl font-bold font-['Inter'] tracking-tight leading-[60px]">
                  {product.average_rating || '4.7'}
                </span>
                <div className="flex gap-1 py-1">
                  {[1,2,3,4,5].map(s => (
                    <div key={s} className={`w-5 h-5 rounded-sm ${s <= Math.round(Number(product.average_rating || 4.7)) ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <span className="text-zinc-500 text-sm font-normal font-['Inter']">
                  Based on {product.rating_count || '2,341'} reviews
                </span>
              </div>
              <div className="flex-1 w-full max-w-[574px] flex flex-col gap-2">
                {[{stars:5,count:'1,842',w:'80%'},{stars:4,count:'348',w:'15%'},{stars:3,count:'93',w:'4%'},{stars:2,count:'35',w:'1.5%'},{stars:1,count:'23',w:'1%'}].map(row => (
                  <div key={row.stars} className="flex items-center gap-3 w-full">
                    <div className="flex gap-0.5 shrink-0">
                      {[1,2,3,4,5].map(s => <div key={s} className={`w-3 h-3 rounded-[1px] ${s <= row.stars ? 'bg-yellow-500' : 'bg-gray-200'}`} />)}
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: row.w }} />
                    </div>
                    <span className="w-12 text-right text-zinc-500 text-xs font-normal font-['Inter']">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <h3 className="text-slate-800 text-lg font-semibold font-['Inter']">Customer Reviews</h3>
              <button className="px-4 py-2 bg-green-700 hover:bg-green-800 rounded-[10px] text-white text-sm font-semibold transition-all">
                Write a Review
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="p-5 bg-white rounded-2xl border border-gray-100 flex flex-col gap-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">JM</div>
                      <div className="flex flex-col">
                        <span className="text-slate-800 text-sm font-semibold font-['Inter']">Jessica M.</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <div key={s} className="w-3 h-3 bg-yellow-500 rounded-[1px]" />)}</div>
                          <span className="text-green-700 text-[10px] font-semibold bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">✓ Verified</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-zinc-500 text-xs">May 28, 2026</span>
                  </div>
                  <h4 className="text-slate-800 text-sm font-semibold font-['Inter'] mt-1">Exceptional quality for our corporate event</h4>
                  <p className="text-zinc-500 text-sm font-normal leading-6">
                    Ordered 200 shirts for our annual conference. Colors were vibrant, fabric felt premium, and everything arrived on time.
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="w-full flex flex-col items-center">

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-full max-w-3xl aspect-square" onClick={e => e.stopPropagation()}>
            <Image src={mainImage} alt={product.name} fill className="object-contain" sizes="800px" />
          </div>
        </div>
      )}

      {/* ── Breadcrumbs ── */}
      <section className="w-full px-4 md:px-20 py-4 border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 text-sm flex-wrap">
          <Link href="/" className="text-emerald-500 hover:underline">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          <Link href={`/products/${categorySlug}`} className="text-emerald-500 hover:underline capitalize">
            {decodeHTMLEntities(categorySlug.replace(/-/g, ' '))}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-gray-600 line-clamp-1">{decodeHTMLEntities(product.name)}</span>
        </div>
      </section>

      {/* ── Main Product Section ── */}
      <section className="w-full max-w-[1280px] px-4 md:px-20 py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 items-start">

          {/* LEFT — Images */}
          <div className="w-full lg:w-[480px] xl:w-[540px] shrink-0 flex flex-col gap-4">

            {/* Main image */}
            <div className="relative w-full aspect-square bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden group">
              <Image
                src={mainImage}
                alt={decodeHTMLEntities(product.name)}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 540px"
                priority
              />
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 transition-colors"
              >
                <Maximize2 className="w-4 h-4 text-neutral-700" />
              </button>
            </div>

            {/* Thumbnails */}
            {uniqueImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {uniqueImages.map((img, idx) => (
                  <button
                    key={`${img.id}-${idx}`}
                    onClick={() => setMainImage(img.src)}
                    className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img.src ? 'border-green-700' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt || product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Info & Config */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Title + Rating */}
            <div className="flex flex-col gap-3">
              <h1 className="text-slate-900 text-3xl xl:text-4xl font-semibold font-['Outfit'] leading-tight">
                {decodeHTMLEntities(product.name)}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Number(product.average_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-neutral-900 text-sm font-semibold font-['Inter']">{product.average_rating || '0.0'}</span>
                <span className="text-gray-500 text-xs font-normal font-['Inter']">({product.rating_count} reviews)</span>
              </div>
              <div
                className="text-gray-600 text-sm font-normal font-['Inter'] leading-6"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            </div>

            {/* Attributes (Color, Size etc) */}
            {product.attributes.map((attr, idx) => (
              <div key={`${attr.name}-${idx}`} className="flex flex-col gap-3">
                <span className="text-slate-900 text-sm font-bold font-['Inter'] uppercase tracking-wide">
                  {attr.name}
                  {selectedAttributes[attr.name] && (
                    <span className="ml-2 text-green-700 normal-case font-semibold">— {selectedAttributes[attr.name]}</span>
                  )}
                </span>
                <div className="flex flex-wrap gap-2">
                  {attr.options.map(option => {
                    const isSelected = selectedAttributes[attr.name] === option;
                    const isColor    = attr.name.toLowerCase() === 'color';
                    return (
                      <button
                        key={option}
                        onClick={() => handleAttributeSelect(attr.name, option)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-green-700 bg-green-50 text-green-700 ring-2 ring-green-700/20'
                            : 'border-gray-200 hover:border-green-700 text-gray-700 bg-white'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Production Speed */}
            {product.acf?.production_options && product.acf.production_options.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-slate-900 text-sm font-bold font-['Inter'] uppercase tracking-wide">Production Speed</span>
                <div className="flex flex-col gap-2">
                  {product.acf.production_options.map(option => (
                    <button
                      key={option.type}
                      onClick={() => setSelectedProduction(option.type)}
                      className={`p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
                        selectedProduction === option.type
                          ? 'border-green-700 bg-green-50'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedProduction === option.type ? 'border-green-700' : 'border-gray-300'}`}>
                          {selectedProduction === option.type && <div className="w-2 h-2 rounded-full bg-green-700" />}
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-gray-900 text-sm capitalize block">{option.type}</span>
                          <span className="text-xs text-gray-500">{option.delivery_days} business days</span>
                        </div>
                      </div>
                      {parseFloat(option.extra_cost) > 0 && (
                        <span className="text-green-700 font-bold text-sm">+{fmt(parseFloat(option.extra_cost))}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bulk Pricing */}
            {product.acf?.bulk_pricing && product.acf.bulk_pricing.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h4 className="text-gray-900 font-bold mb-3 flex items-center gap-2 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-green-700" />
                  Bulk Pricing
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.acf.bulk_pricing.map((tier, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all ${
                        quantity >= tier.min_qty
                          ? 'bg-white border-green-700 shadow-sm'
                          : 'bg-transparent border-gray-200 opacity-60'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">{tier.min_qty}+ units</span>
                      <span className="text-lg font-black text-green-700">{fmt(parseFloat(tier.discount_price))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Price row */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Quantity</span>
                <div className="w-36 h-11 bg-white rounded-lg border border-gray-200 flex items-center overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 transition-colors border-r border-gray-200">
                    <Minus className="w-4 h-4 text-neutral-700" />
                  </button>
                  <div className="flex-1 text-center text-neutral-900 text-base font-bold font-['Inter']">{quantity}</div>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 transition-colors border-l border-gray-200">
                    <Plus className="w-4 h-4 text-neutral-700" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total</span>
                <div className="flex items-baseline gap-2">
                  {product.on_sale && (
                    <span className="text-gray-400 text-base font-normal line-through">{fmt(regularUnitPrice * quantity)}</span>
                  )}
                  <span className="text-green-700 text-3xl font-extrabold font-['Outfit']">{fmt(unitPrice * quantity)}</span>
                </div>
                {quantity > 1 && (
                  <span className="text-green-700/60 text-xs font-medium font-['Inter']">{fmt(unitPrice)} per unit</span>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-white border-2 border-green-700 text-green-700 hover:bg-green-50 font-bold font-['Inter'] py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              {showDesignBtn && (
                <Link
                  href={`/design?product=${product.id}`}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-bold font-['Inter'] py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Palette className="w-5 h-5" />
                  Design Your Own
                </Link>
              )}

              {showUploadBtn && (
                <Link
                  href={`/upload?product=${product.id}`}
                  className={`w-full font-bold font-['Inter'] py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    showDesignBtn
                      ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-700 hover:text-green-700'
                      : 'bg-green-700 hover:bg-green-800 text-white'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  Upload Design & Order
                </Link>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── Tabs Section ── */}
      <section className="w-full max-w-[1280px] px-4 md:px-20 pb-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-8 flex flex-col gap-8 shadow-sm">
          <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 md:px-6 py-4 text-base md:text-lg font-medium font-['Outfit'] transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-green-700 border-green-700'
                    : 'text-zinc-500 border-transparent hover:text-green-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="w-full">{tabContent()}</div>
        </div>
      </section>

    </div>
  );
}
