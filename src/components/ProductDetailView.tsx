"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Heart, Minus, Plus, Upload, Maximize2, FileDown, CheckCircle2 } from 'lucide-react';
import { WPProduct } from '@/lib/wordpress';

export default function ProductDetailView({ product, categorySlug }: { product: WPProduct, categorySlug: string }) {
  const [mainImage, setMainImage] = useState(product.images[0]?.src || "https://placehold.co/589x480");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");

  const tabs = ["Description", "Attributes", "Reviews"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Description":
        return (
          <div
            className="flex flex-col gap-6 text-slate-600 text-xl font-normal font-['Inter'] leading-relaxed prose max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description || product.short_description }}
          />
        );
      case "Attributes":
        return (
          <div className="flex flex-col gap-4 text-slate-600 text-xl font-normal font-['Inter'] leading-8">
            {product.attributes.map(attr => (
              <div key={attr.id} className="flex gap-4 border-b border-gray-100 pb-2">
                <span className="font-bold text-slate-900 w-40">{attr.name}:</span>
                <span>{attr.options.join(", ")}</span>
              </div>
            ))}
            {product.attributes.length === 0 && <p>No specific attributes defined for this product.</p>}
          </div>
        );
      case "Reviews":
        return (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
              <div className="w-64 p-6 bg-green-50 rounded-2xl flex flex-col items-center justify-center gap-2">
                <span className="text-green-700 text-6xl font-bold font-['Inter'] tracking-tight">{product.average_rating}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= Number(product.average_rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-zinc-500 text-sm font-normal font-['Inter']">Based on {product.rating_count} reviews</span>
              </div>
            </div>
            <p className="text-gray-500 italic">Detailed reviews are available on the main store site.</p>
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
          {product.attributes.map(attr => (
            <div key={attr.id} className="flex flex-col gap-4">
              <span className="text-slate-900 text-lg font-bold font-['Inter']">Choose {attr.name}</span>
              <div className="flex flex-wrap gap-2.5">
                {attr.options.map(option => (
                  <button
                    key={option}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:border-green-700 transition-colors font-medium text-sm"
                  >
                    {option}
                  </button>
                ))}
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
            <div className="px-5 py-4 bg-green-50/50 rounded-xl flex items-center gap-4">
              <span
                className="text-green-700 text-3xl font-extrabold font-['Outfit'] [&_del]:text-gray-400 [&_del]:text-sm [&_del]:font-normal [&_ins]:no-underline"
                dangerouslySetInnerHTML={{ __html: product.price_html }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <button className="w-full bg-green-700 hover:bg-green-800 text-white font-medium font-['Inter'] py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <Upload className="w-5 h-5" />
              Upload Design & Order
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="w-full max-w-[1280px] px-4 md:px-20 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col gap-8 shadow-sm">
          <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-2xl font-medium font-['Outfit'] transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'text-green-700 border-green-700' : 'text-zinc-500 border-transparent hover:text-green-700'}`}
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
