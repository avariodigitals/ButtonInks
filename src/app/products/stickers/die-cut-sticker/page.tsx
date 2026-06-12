"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Heart, Minus, Plus, Upload, Maximize2, FileDown, CheckCircle2 } from 'lucide-react';

const productImages = [
  "https://placehold.co/589x480",
  "https://placehold.co/72x72",
  "https://placehold.co/72x72"
];

const stickerFinishes = ["Matte", "Glossy", "Holographic"];

const tabs = [
  "Description",
  "Print Guidelines",
  "Ordering information",
  "File Setup",
  "Template",
  "Reviews"
];

const relatedProducts = [
  { name: "Custom Die-Cut Sticker", price: "from $0.50", minQty: "min 50", image: "https://placehold.co/310x220", badge: "Best Seller", category: "Stickers" },
  { name: "Kiss-Cut Sticker", price: "from $0.45", minQty: "min 50", image: "https://placehold.co/310x220", category: "Stickers" },
  { name: "Clear Sticker", price: "from $0.60", minQty: "min 50", image: "https://placehold.co/310x220", category: "Stickers" },
  { name: "Bumper Sticker", price: "from $1.20", minQty: "min 10", image: "https://placehold.co/310x220", category: "Stickers" },
];

export default function ProductDetailsPage() {
  const [mainImage, setMainImage] = useState(productImages[0]);
  const [selectedFinish, setSelectedFinish] = useState('Matte');
  const [quantity, setQuantity] = useState(50);
  const [activeTab, setActiveTab] = useState("Description");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Description":
        return (
          <div className="flex flex-col gap-6 text-slate-600 text-xl font-normal font-['Inter'] leading-relaxed">
            <p>Vibrant, durable, and precisely cut to any shape. Our vinyl stickers are waterproof and sun-resistant, making them perfect for laptops, water bottles, car windows, and product packaging.</p>
            <ul className="list-disc list-inside flex flex-col gap-2">
              <li>High-quality durable vinyl</li>
              <li>Waterproof and UV resistant</li>
              <li>Contour-cut to your custom shape</li>
              <li>Easy-peel backing</li>
            </ul>
          </div>
        );
      case "Ordering information":
        return (
          <div className="flex flex-col gap-4 text-slate-600 text-xl font-normal font-['Inter'] leading-8">
            <p>• Minimum order quantity is 50 units for die-cut stickers.</p>
            <p>• Standard turnaround is 2-4 business days.</p>
            <p>• Custom shapes are included at no extra cost.</p>
            <p>• Satisfaction is guaranteed on all orders.</p>
          </div>
        );
      case "File Setup":
        return (
          <div className="flex flex-col gap-6 text-slate-600 text-xl font-['Inter'] leading-8">
            <h3 className="font-bold text-slate-900 mb-2">Cut Line Guidelines</h3>
            <p>If possible, provide a vector path for your cut line. If not, our designers will create one for you and send a proof for approval.</p>
          </div>
        );
      case "Template":
        return (
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-slate-900 mb-2">Download Layout Templates</h3>
            <div className="self-stretch px-4 py-4 rounded-[10px] border border-gray-300 flex justify-between items-center gap-4">
              <span className="text-slate-900 text-base font-bold font-['Inter']">Sticker Cut Guide</span>
              <button className="flex items-center gap-2 text-green-700 text-sm font-semibold hover:underline">
                <FileDown className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        );
      case "Reviews":
        return (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
              <div className="w-64 p-6 bg-green-50 rounded-2xl flex flex-col items-center justify-center gap-2">
                <span className="text-green-700 text-6xl font-bold font-['Inter'] tracking-tight">4.9</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 text-yellow-500 fill-yellow-500" />)}
                </div>
                <span className="text-zinc-500 text-sm font-normal font-['Inter']">Based on 2,100 reviews</span>
              </div>
            </div>
          </div>
        );
      default:
        return <p className="italic text-gray-400">Content for {activeTab} will be pulled from WordPress...</p>;
    }
  };

  return (
    <main className="w-full bg-white flex flex-col items-center">
      {/* Breadcrumbs */}
      <section className="w-full px-4 md:px-20 py-4 border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 text-sm">
          <Link href="/" className="text-emerald-500 hover:underline">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/products/stickers" className="text-emerald-500 hover:underline">Stickers</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Custom Die-Cut Sticker</span>
        </div>
      </section>

      {/* Main Product Section */}
      <section className="w-full max-w-[1280px] px-4 md:px-20 py-10 flex flex-col lg:flex-row gap-10">

        {/* Left: Images */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="relative aspect-[589/480] bg-white rounded-[20px] shadow-sm border border-green-900/5 overflow-hidden flex items-center justify-center group">
            <img src={mainImage} alt="Product" className="max-h-full object-contain" />
            <button className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-2xl flex items-center justify-center hover:bg-white transition-colors">
              <Maximize2 className="w-4 h-4 text-neutral-700" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {productImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(img)}
                className={`w-16 h-16 rounded-[10px] shrink-0 overflow-hidden border-2 transition-all ${mainImage === img ? 'border-green-700' : 'border-transparent'}`}
              >
                <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info & Config */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-slate-900 text-4xl font-semibold font-['Outfit'] leading-tight">Custom Die-Cut Sticker</h1>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-amber-300 fill-amber-300" />)}
              </div>
              <span className="text-neutral-900 text-sm font-semibold font-['Inter']">4.9</span>
              <span className="text-gray-500 text-xs font-normal font-['Inter']">(2,100 reviews)</span>
            </div>
            <p className="text-gray-600 text-sm font-normal font-['Inter'] leading-6">
              Precisely cut to any shape. Durable vinyl, waterproof, and sun-resistant. Perfect for branding.
            </p>
          </div>

          {/* Finish Selection */}
          <div className="flex flex-col gap-3">
            <span className="text-slate-900 text-lg font-semibold font-['Inter']">Select Finish</span>
            <div className="flex gap-3">
              {stickerFinishes.map((finish) => (
                <button
                  key={finish}
                  onClick={() => setSelectedFinish(finish)}
                  className={`flex-1 min-w-[100px] px-4 py-3 rounded-[10px] font-bold font-['Inter'] border transition-all ${selectedFinish === finish ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-700 border-gray-300 hover:border-green-700'}`}
                >
                  {finish}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-neutral-900 text-sm font-bold font-['Inter']">Quantity:</span>
              <span className="text-gray-500 text-xs font-normal font-['Inter']">Min. 50</span>
            </div>
            <div className="w-40 h-12 bg-white rounded-lg border border-green-900/10 flex items-center overflow-hidden">
              <button onClick={() => setQuantity(Math.max(50, quantity - 50))} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"><Minus className="w-4 h-4 text-neutral-700" /></button>
              <div className="flex-1 text-center text-neutral-900 text-base font-bold font-['Inter']">{quantity}</div>
              <button onClick={() => setQuantity(quantity + 50)} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"><Plus className="w-4 h-4 text-neutral-700" /></button>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="flex flex-col gap-2">
            <div className="px-5 py-4 bg-green-50/50 rounded-xl flex items-center gap-4">
              <span className="text-green-700 text-3xl font-extrabold font-['Outfit']">$0.50</span>
              <div className="text-zinc-500 text-sm font-normal font-['Inter']">
                per sticker · Total: <span className="text-green-700 font-bold">${(0.50 * quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <button className="w-full bg-green-700 hover:bg-green-800 text-white font-medium font-['Inter'] py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <Upload className="w-5 h-5" />
              Upload Design & Get Stickers
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="w-full max-w-[1280px] px-4 md:px-20 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col gap-8 shadow-sm">
          <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 text-xl font-medium font-['Outfit'] transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'text-green-700 border-green-700' : 'text-zinc-500 border-transparent hover:text-green-700'}`}>{tab}</button>
            ))}
          </div>
          <div className="w-full">{renderTabContent()}</div>
        </div>
      </section>

      {/* Related Products */}
      <section className="w-full max-w-[1280px] px-4 md:px-20 py-10 flex flex-col gap-10">
        <h2 className="text-slate-900 text-4xl font-semibold font-['Outfit'] leading-10">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-900/5 flex flex-col overflow-hidden group hover:shadow-md transition-all">
              <div className="relative h-56 p-2.5 flex items-center justify-center bg-gray-50/30">
                <img className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" src={p.image} alt={p.name} />
              </div>
              <div className="p-4 flex flex-col gap-3">
                <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">{p.category}</span>
                <h3 className="text-slate-900 text-base font-medium font-['Outfit'] leading-5">{p.name}</h3>
                <div className="flex items-center gap-1.5"><div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-orange-600 fill-orange-600" />)}</div><span className="text-slate-500 text-xs">4.9 (2,100)</span></div>
                <div className="flex justify-between items-center mt-1">
                  <div><span className="text-slate-900 text-base font-semibold">{p.price}</span><span className="text-gray-400 text-[10px] ml-1">· {p.minQty}</span></div>
                  <button className="px-3 py-1.5 bg-green-700 rounded-lg text-white text-xs font-semibold hover:bg-green-800 transition-colors">Shop</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
