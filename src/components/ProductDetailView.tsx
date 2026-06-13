"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Heart, Minus, Plus, Upload, Maximize2, FileDown, CheckCircle2, ShoppingCart } from 'lucide-react';
import { WPProduct } from '@/lib/wordpress';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';

export default function ProductDetailView({ product, categorySlug }: { product: WPProduct, categorySlug: string }) {
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const [mainImage, setMainImage] = useState(product.images[0]?.src || "https://placehold.co/589x480");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const unitPrice = parseFloat(product.price || "0");
  const regularUnitPrice = parseFloat(product.regular_price || product.price || "0");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleAttributeSelect = (attrName: string, option: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attrName]: option
    }));
  };

  const handleAddToCart = () => {
    // Check if all attributes are selected
    const unselectedAttr = product.attributes.find(attr => !selectedAttributes[attr.name]);

    if (unselectedAttr) {
      showNotification({
        title: 'Selection Required',
        message: `Please choose a ${unselectedAttr.name} before adding to cart.`,
        type: 'error'
      });
      return;
    }

    const attributeString = Object.entries(selectedAttributes)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', ');

    addToCart({
      id: product.id,
      name: attributeString ? `${product.name} (${attributeString})` : product.name,
      price: parseFloat(product.price || "0"),
      quantity: quantity,
      image: product.images[0]?.src || ""
    });
    showNotification({
      title: 'Added to Cart',
      message: `${product.name} has been successfully added to your shopping bag.`,
      type: 'cart'
    });
  };

  const tabs = ["Description", "Print Guideline", "Ordering information", "File Setup", "Template", "Reviews"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Description":
        return (
          <div
            className="flex flex-col gap-6 text-slate-600 text-base font-normal font-['Inter'] leading-relaxed prose max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description || product.short_description }}
          />
        );
      case "Print Guideline":
        return (
          <div className="flex flex-col gap-4 text-slate-600 text-base font-normal font-['Inter'] leading-7">
            <p>Please follow these guidelines for the best printing results:</p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>Use high-resolution images (300 DPI minimum).</li>
              <li>Keep important text within the safe zone.</li>
              <li>Convert all text to outlines if using custom fonts.</li>
              <li>Ensure colors are in CMYK mode for accurate color reproduction.</li>
            </ul>
          </div>
        );
      case "Ordering information":
        return (
          <div className="flex flex-col gap-4 text-slate-600 text-base font-normal font-['Inter'] leading-7">
            <p>Processing and Shipping times:</p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>Standard Production: 3-5 business days.</li>
              <li>Express Production: 1-2 business days (additional fee).</li>
              <li>Shipping: USPS Priority Mail (1-3 days) or USPS Ground (2-5 days).</li>
            </ul>
          </div>
        );
      case "File Setup":
        return (
          <div className="flex flex-col gap-4 text-slate-600 text-base font-normal font-['Inter'] leading-7">
            <p>Accepted File Formats:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {['PDF', 'AI', 'PSD', 'PNG', 'JPG', 'EPS'].map(ext => (
                <div key={ext} className="p-3 bg-gray-50 rounded-lg text-center font-bold border border-gray-100">{ext}</div>
              ))}
            </div>
          </div>
        );
      case "Template":
        return (
          <div className="flex flex-col gap-6 text-slate-600 text-base font-normal font-['Inter']">
             <p>Download our design templates to help you set up your artwork correctly:</p>
             <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 font-bold text-sm">
                   <FileDown className="w-4 h-4" /> Download PDF Template
                </button>
                <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 font-bold text-sm">
                   <FileDown className="w-4 h-4" /> Download AI Template
                </button>
             </div>
          </div>
        );
      case "Reviews":
        return (
          <div className="flex flex-col gap-10 w-full">
            {/* Review Summary */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="w-full md:w-64 h-40 p-6 bg-green-50 rounded-2xl flex flex-col justify-center items-center gap-2">
                <span className="text-green-700 text-6xl font-bold font-['Inter'] tracking-tight leading-[60px]">{product.average_rating || "4.7"}</span>
                <div className="flex gap-1 py-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className={`w-5 h-5 rounded-sm ${s <= Math.round(Number(product.average_rating || 4.7)) ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <span className="text-zinc-500 text-sm font-normal font-['Inter']">Based on {product.rating_count || "2,341"} reviews</span>
              </div>

              {/* Progress Bars */}
              <div className="flex-1 w-full max-w-[574px] flex flex-col gap-2">
                 {[
                   { stars: 5, count: "1,842", width: "80%" },
                   { stars: 4, count: "348", width: "15%" },
                   { stars: 3, count: "93", width: "4%" },
                   { stars: 2, count: "35", width: "1.5%" },
                   { stars: 1, count: "23", width: "1%" }
                 ].map((row) => (
                   <div key={row.stars} className="flex items-center gap-3 w-full">
                     <div className="flex gap-0.5 shrink-0">
                       {[1,2,3,4,5].map(s => (
                         <div key={s} className={`w-3 h-3 rounded-[1px] ${s <= row.stars ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                       ))}
                     </div>
                     <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: row.width }} />
                     </div>
                     <span className="w-12 text-right text-zinc-500 text-xs font-normal font-['Inter']">{row.count}</span>
                   </div>
                 ))}
              </div>
            </div>

            {/* Section Header */}
            <div className="flex justify-between items-center pt-4">
              <h3 className="text-slate-800 text-lg font-semibold font-['Inter']">Customer Reviews</h3>
              <button className="px-4 py-2 bg-green-700 hover:bg-green-800 rounded-[10px] text-white text-sm font-semibold transition-all">
                Write a Review
              </button>
            </div>

            {/* Individual Reviews */}
            <div className="flex flex-col gap-4">
              {[1,2,3].map((_, i) => (
                <div key={i} className="p-5 bg-white rounded-2xl border border-gray-100 flex flex-col gap-3 shadow-sm">
                   <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">JM</div>
                        <div className="flex flex-col">
                           <span className="text-slate-800 text-sm font-semibold font-['Inter']">Jessica M.</span>
                           <div className="flex items-center gap-2">
                             <div className="flex gap-0.5">
                               {[1,2,3,4,5].map(s => <div key={s} className="w-3 h-3 bg-yellow-500 rounded-[1px]" />)}
                             </div>
                             <div className="px-2 py-0.5 bg-green-50 rounded-full border border-green-100">
                                <span className="text-green-700 text-[10px] font-semibold">✓ Verified Purchase</span>
                             </div>
                           </div>
                        </div>
                     </div>
                     <span className="text-zinc-500 text-xs font-normal">May 28, 2026</span>
                   </div>
                   <h4 className="text-slate-800 text-sm font-semibold font-['Inter'] mt-1">Exceptional quality for our corporate event</h4>
                   <p className="text-zinc-500 text-sm font-normal leading-6">
                     Ordered 200 shirts for our annual conference. The colors were vibrant, the fabric felt premium, and every single one arrived on time. Will definitely order again.
                   </p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Breadcrumbs */}
      <section className="w-full px-4 md:px-20 py-4 border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 text-sm">
          <Link href="/" className="text-emerald-500 hover:underline">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href={`/products/${categorySlug}`} className="text-emerald-500 hover:underline capitalize">{categorySlug}</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 line-clamp-1">{product.name}</span>
        </div>
      </section>

      {/* Main Product Section */}
      <section className="w-full max-w-[1280px] px-4 md:px-20 py-10 flex flex-col lg:flex-row gap-10">

        {/* Left: Images */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="relative aspect-[589/480] bg-white rounded-[20px] shadow-sm border border-green-900/5 overflow-hidden flex items-center justify-center group">
            <img src={mainImage} alt={product.name} className="max-h-full object-contain" />
            <button className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-2xl flex items-center justify-center hover:bg-white transition-colors">
              <Maximize2 className="w-4 h-4 text-neutral-700" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {product.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setMainImage(img.src)}
                className={`w-16 h-16 rounded-[10px] shrink-0 overflow-hidden border-2 transition-all ${mainImage === img.src ? 'border-green-700' : 'border-transparent'}`}
              >
                <img src={img.src} alt={img.alt || product.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info & Config */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-slate-900 text-4xl font-semibold font-['Outfit'] leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                   <Star key={s} className={`w-4 h-4 ${s <= Number(product.average_rating) ? 'text-amber-300 fill-amber-300' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-neutral-900 text-sm font-semibold font-['Inter']">{product.average_rating}</span>
              <span className="text-gray-500 text-xs font-normal font-['Inter']">({product.rating_count} reviews)</span>
            </div>
            <div
              className="text-gray-600 text-sm font-normal font-['Inter'] leading-6 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          </div>

          {/* Dynamic Attributes */}
          {product.attributes.map((attr, index) => (
            <div key={attr.name || index} className="flex flex-col gap-4">
              <span className="text-slate-900 text-lg font-bold font-['Inter']">Choose {attr.name}</span>
              <div className="flex flex-wrap gap-2.5">
                {attr.options.map(option => {
                  const isSelected = selectedAttributes[attr.name] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleAttributeSelect(attr.name, option)}
                      className={`px-4 py-2 rounded-lg border transition-all font-medium text-sm ${
                        isSelected
                          ? 'border-green-700 bg-green-50 text-green-700 ring-2 ring-green-700/20'
                          : 'border-gray-300 hover:border-green-700 text-gray-700 bg-white'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-neutral-900 text-sm font-bold font-['Inter']">Quantity:</span>
            </div>
            <div className="w-40 h-12 bg-white rounded-lg border border-green-900/10 flex items-center overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4 text-neutral-700" />
              </button>
              <div className="flex-1 text-center text-neutral-900 text-base font-bold font-['Inter']">
                {quantity}
              </div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4 text-neutral-700" />
              </button>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="flex flex-col gap-2">
            <div className="px-5 py-4 bg-green-50/50 rounded-xl flex flex-col justify-center items-start gap-1">
              <div className="flex items-baseline gap-3">
                {product.on_sale && (
                  <span className="text-gray-400 text-lg font-normal line-through">
                    {formatPrice(regularUnitPrice * quantity)}
                  </span>
                )}
                <span className="text-green-700 text-3xl font-extrabold font-['Outfit']">
                  {formatPrice(unitPrice * quantity)}
                </span>
              </div>
              {quantity > 1 && (
                <span className="text-green-700/60 text-xs font-medium font-['Inter']">
                  ({formatPrice(unitPrice)} per unit)
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <button
              onClick={handleAddToCart}
              className="w-full bg-white border-2 border-green-700 text-green-700 hover:bg-green-50 font-bold font-['Inter'] py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
             <Link
                href={`/upload?product=${product.id}`}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold font-['Inter'] py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
              <Upload className="w-5 h-5" />
              Upload Design & Order
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="w-full max-w-[1280px] px-4 md:px-20 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-8 flex flex-col gap-8 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 md:px-6 py-4 text-base md:text-xl font-medium font-['Outfit'] transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'text-green-700 border-green-700' : 'text-zinc-500 border-transparent hover:text-green-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="w-full">
            {renderTabContent()}
          </div>
        </div>
      </section>
    </div>
  );
}
