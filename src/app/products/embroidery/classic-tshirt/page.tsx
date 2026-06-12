"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Heart, Minus, Plus, Upload, Maximize2, FileDown, CheckCircle2 } from 'lucide-react';

const productImages = [
  "https://placehold.co/589x480",
  "https://placehold.co/69x69",
  "https://placehold.co/72x72",
  "https://placehold.co/72x72",
  "https://placehold.co/72x72"
];

const colors = [
  { name: 'White', class: 'bg-white border-gray-300' },
  { name: 'Black', class: 'bg-black' },
  { name: 'Navy', class: 'bg-blue-900' },
  { name: 'Red', class: 'bg-red-600' },
  { name: 'Forest Green', class: 'bg-green-700' },
  { name: 'Royal Blue', class: 'bg-blue-700' },
  { name: 'Yellow', class: 'bg-yellow-400' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Purple', class: 'bg-purple-600' },
  { name: 'Pink', class: 'bg-pink-500' },
  { name: 'Gray', class: 'bg-gray-500' },
  { name: 'Light Blue', class: 'bg-blue-300' },
];

const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

const tabs = [
  "Description",
  "Print Guidelines",
  "Ordering information",
  "File Setup",
  "Template",
  "Reviews"
];

const relatedProducts = [
  { name: "Classic Unisex Tee", price: "from $8.99", minQty: "min 12", image: "https://placehold.co/310x220", badge: "Best Seller", category: "Apparel" },
  { name: "Premium Business Cards", price: "from $8.99", minQty: "min 12", image: "https://placehold.co/310x220", badge: "Popular", category: "Business Cards" },
  { name: "Retractable Roll Banner", price: "from $8.99", minQty: "min 12", image: "https://placehold.co/310x220", category: "SIGNAGE" },
  { name: "Premium Pullover Hoodie", price: "from $8.99", minQty: "min 12", image: "https://placehold.co/310x220", badge: "Best Seller", category: "Apparel" },
];

export default function ProductDetailsPage() {
  const [mainImage, setMainImage] = useState(productImages[0]);
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedSize, setSelectedSize] = useState('S');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");
  const [printArea, setPrintArea] = useState("Front");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Description":
        return (
          <div className="flex flex-col gap-6 text-slate-600 text-xl font-normal font-['Inter'] leading-relaxed">
            <p>
              A timeless wardrobe essential designed for everyday comfort and style. Made from premium quality fabric, this classic t-shirt offers a soft feel, breathable fit, and long lasting durability. Its versatile design makes it perfect for casual wear, team events, promotional campaigns, corporate branding, or custom printing projects.
            </p>
            <p>
              Available in a wide range of colors and sizes, each t-shirt provides a smooth printing surface that delivers vibrant, high quality results for logos, artwork, and personalized designs. Whether you are ordering a single shirt or bulk quantities, this classic tee combines comfort, quality, and value in one reliable product.
            </p>
            <ul className="list-disc list-inside flex flex-col gap-2">
              <li>Soft and comfortable fabric</li>
              <li>Durable construction for everyday wear</li>
              <li>Unisex fit suitable for all occasions</li>
              <li>Available in multiple colors and sizes</li>
              <li>Ideal for screen printing, DTF, DTG, embroidery, and heat transfer</li>
              <li>Breathable and lightweight material</li>
              <li>Perfect for personal, business, promotional, and event use</li>
            </ul>
            <div className="mt-4">
              <h3 className="text-slate-900 font-bold mb-4">Best For</h3>
              <ul className="list-disc list-inside flex flex-col gap-2">
                <li>Custom apparel</li>
                <li>Corporate uniforms</li>
                <li>School and club merchandise</li>
                <li>Event giveaways</li>
                <li>Fashion brands</li>
                <li>Team wear and group orders</li>
              </ul>
            </div>
          </div>
        );
      case "Ordering information":
        return (
          <div className="flex flex-col gap-4 text-slate-600 text-xl font-normal font-['Inter'] leading-8">
            <p>• All products will be embroidered with the logo provided.</p>
            <p>• Logo placement is on the left chest of all apparel unless otherwise noted.</p>
            <p>• Every new logo is proofed for your approval before production.</p>
            <p>• If you do not approve the proof and we cannot fix it to your satisfaction, we will cancel the order and charge you nothing.</p>
            <p>• If there is a date that you need the order in your hands, please tell us that at time of order so we can be sure to get it to you in time.</p>
            <p>• If you have ordered from us in the past, we still have your logo. We keep them forever.</p>
            <p>• Sizing advice: If you find yourself between sizes, get the bigger size.</p>
            <p>• Satisfaction is guaranteed on all workmanship.</p>
          </div>
        );
      case "File Setup":
        return (
          <div className="flex flex-col gap-6 text-slate-600 text-xl font-['Inter'] leading-8">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Preparing Your Design Files</h3>
              <p className="font-normal">To ensure the best print quality, please follow these file setup guidelines:</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Vector Files (Recommended)</h3>
              <p className="font-normal">
                Use Adobe Illustrator, CorelDRAW, or Inkscape<br/>
                Save as AI, EPS, or SVG format<br/>
                Convert all text to outlines/paths<br/>
                Use Pantone or CMYK color values
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Raster Files</h3>
              <p className="font-normal">
                Minimum 300 DPI at actual size<br/>
                PNG with transparent background preferred<br/>
                Save in CMYK color mode<br/>
                Avoid heavy JPEG compression
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Common Mistakes to Avoid</h3>
              <p className="font-normal">
                Using RGB instead of CMYK<br/>
                Low resolution images (under 300 DPI)<br/>
                Leaving text as editable type instead of outlines<br/>
                Not accounting for bleed on edge-to-edge designs
              </p>
            </div>
          </div>
        );
      case "Template":
        return (
          <div className="flex flex-col gap-6">
            <div className="text-slate-600 text-xl font-['Inter'] leading-8">
              <h3 className="font-bold text-slate-900 mb-2">Download Design Templates</h3>
              <p className="font-normal">We provide free design templates to help you create print-ready artwork. Download the template that matches your product and print location:</p>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="self-stretch px-4 py-4 rounded-[10px] border border-gray-300 flex justify-between items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-900 text-base font-bold font-['Inter']">Front / Back Print Template</span>
                  <span className="text-slate-600 text-sm font-normal font-['Inter']">12" x 16" print area</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-green-700 text-sm font-semibold hover:underline">
                    <FileDown className="w-4 h-4" />
                    Download PSD
                  </button>
                  <div className="w-px h-6 bg-gray-200" />
                  <button className="flex items-center gap-2 text-green-700 text-sm font-semibold hover:underline">
                    <FileDown className="w-4 h-4" />
                    Download PDF
                  </button>
                  <div className="w-px h-6 bg-gray-200" />
                  <button className="flex items-center gap-2 text-green-700 text-sm font-semibold hover:underline">
                    <FileDown className="w-4 h-4" />
                    Download JPG
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case "Reviews":
        return (
          <div className="flex flex-col gap-10">
            {/* Review Summary */}
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
              <div className="w-64 p-6 bg-green-50 rounded-2xl flex flex-col items-center justify-center gap-2">
                <span className="text-green-700 text-6xl font-bold font-['Inter'] tracking-tight">4.7</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(s => <Star key={s} className="w-5 h-5 text-yellow-500 fill-yellow-500" />)}
                  <Star className="w-5 h-5 text-gray-200 fill-gray-200" />
                </div>
                <span className="text-zinc-500 text-sm font-normal font-['Inter']">Based on 2,341 reviews</span>
              </div>

              <div className="flex-1 flex flex-col gap-3 w-full">
                {[
                  { star: 5, count: 1842, percent: 80 },
                  { star: 4, count: 348, percent: 15 },
                  { star: 3, count: 93, percent: 4 },
                  { star: 2, count: 35, percent: 1.5 },
                  { star: 1, count: 23, percent: 1 },
                ].map((row) => (
                  <div key={row.star} className="flex items-center gap-3">
                    <div className="flex gap-0.5 w-20">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < row.star ? "text-yellow-500 fill-yellow-500" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${row.percent}%` }} />
                    </div>
                    <span className="text-zinc-500 text-xs font-normal font-['Inter'] w-10 text-right">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review List */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-slate-800 text-lg font-semibold font-['Inter']">Customer Reviews</h3>
                <button className="px-6 py-2 bg-green-700 rounded-[10px] text-white text-sm font-semibold hover:bg-green-800 transition-colors">
                  Write a Review
                </button>
              </div>

              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 flex flex-col gap-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">JM</div>
                      <div className="flex flex-col">
                        <span className="text-slate-800 text-sm font-semibold font-['Inter']">Jessica M.</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 text-yellow-500 fill-yellow-500" />)}
                          </div>
                          <div className="px-2 py-0.5 bg-green-50 rounded-full border border-green-100 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-700" />
                            <span className="text-green-700 text-[10px] font-semibold">Verified Purchase</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-zinc-500 text-xs font-normal font-['Inter']">May 28, 2026</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-slate-800 text-sm font-semibold">Exceptional quality for our corporate event</h4>
                    <p className="text-zinc-500 text-sm leading-6">
                      Ordered 200 shirts for our annual conference. The colors were vibrant, the fabric felt premium, and every single one arrived on time. Will definitely order again.
                    </p>
                  </div>
                </div>
              ))}
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
          <Link href="/products/embroidery" className="text-emerald-500 hover:underline">Embroidery</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Classic Tshirt</span>
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
            <h1 className="text-slate-900 text-4xl font-semibold font-['Outfit'] leading-tight">Classic Tshirt</h1>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4].map(s => <Star key={s} className="w-4 h-4 text-amber-300 fill-amber-300" />)}
                <Star className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-neutral-900 text-sm font-semibold font-['Inter']">4.7</span>
              <span className="text-gray-500 text-xs font-normal font-['Inter']">(2,341 reviews)</span>
            </div>
            <p className="text-gray-600 text-sm font-normal font-['Inter'] leading-6">
              Full-color vinyl banners for indoor and outdoor use. Grommets included, hemmed edges, UV-resistant inks. Multiple sizes available.
            </p>
          </div>

          {/* Color Selection */}
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-slate-900 text-lg font-bold font-['Inter']">Choose Color</span>
              <span className="text-slate-500 text-base font-normal font-['Inter']">(Select Multiple colors)</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-6 h-6 rounded-full transition-all ring-offset-2 ${color.class} ${selectedColor === color.name ? 'ring-2 ring-green-500' : ''}`}
                  title={color.name}
                >
                  {selectedColor === color.name && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-1.5 border-b-2 border-l-2 border-white -rotate-45 mb-0.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="flex flex-col gap-3">
            <span className="text-slate-900 text-lg font-semibold font-['Inter']">Choose Size</span>
            <div className="flex flex-wrap gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`flex-1 min-w-[60px] h-12 rounded-[10px] font-bold font-['Inter'] border transition-all ${selectedSize === size ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-700 border-gray-300 hover:border-green-700'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-neutral-900 text-sm font-bold font-['Inter']">Quantity:</span>
              <span className="text-gray-500 text-xs font-normal font-['Inter']">Min. 1</span>
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
              <span className="text-green-700 text-3xl font-extrabold font-['Outfit']">$34.99</span>
              <div className="text-zinc-500 text-sm font-normal font-['Inter']">
                per unit (With your Logo) · Total: <span className="text-green-700 font-bold">${(34.99 * quantity).toFixed(2)}</span>
              </div>
            </div>
            <span className="text-green-700 text-sm font-normal font-['Inter']">Shipping and final pricing is calculated at checkout</span>
          </div>

          {/* Print Area */}
          <div className="flex flex-col gap-3">
            <span className="text-slate-900 text-lg font-semibold font-['Inter']">Print Area</span>
            <div className="flex gap-3">
              {["Front", "Back", "Front and Back"].map((area) => (
                <button
                  key={area}
                  onClick={() => setPrintArea(area)}
                  className={`flex-1 py-3 px-4 rounded-[10px] flex flex-col items-center gap-1 border transition-all ${printArea === area ? 'border-green-700 bg-white' : 'border-gray-300 bg-white hover:border-green-700'}`}
                >
                  <span className={`text-base font-bold font-['Inter'] ${printArea === area ? 'text-green-700' : 'text-gray-700'}`}>{area}</span>
                  <span className={`text-xs font-normal font-['Inter'] ${printArea === area ? 'text-green-700' : 'text-gray-500'}`}>{area === 'Front and Back' ? '+50%' : 'Free'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Material Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-neutral-900 text-sm font-bold font-['Inter']">Material:</span>
            <div className="relative">
              <select className="w-full p-4 bg-white rounded-lg border border-green-900/10 appearance-none text-gray-700 text-sm font-medium font-['Inter'] focus:outline-none focus:ring-1 focus:ring-green-700 cursor-pointer">
                <option>Performance Poly</option>
                <option>100% Cotton</option>
                <option>Tri-Blend</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 pointer-events-none" />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
             <button className="w-full bg-green-700 hover:bg-green-800 text-white font-medium font-['Inter'] py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <Upload className="w-5 h-5" />
              Upload your Design
            </button>
            <Link
              href="/products/embroidery/classic-tshirt/buy-as-it-is"
              className="w-full bg-white border border-green-700 text-green-700 hover:bg-green-50 font-medium font-['Inter'] py-4 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Choose a template
            </Link>
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

      {/* Related Products */}
      <section className="w-full max-w-[1280px] px-4 md:px-20 py-10 flex flex-col gap-10">
        <h2 className="text-slate-900 text-4xl font-semibold font-['Outfit'] leading-10">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-900/5 flex flex-col overflow-hidden group hover:shadow-md transition-all">
              <div className="relative h-56 p-2.5 flex items-center justify-center bg-gray-50/30">
                {p.badge && (
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-green-700 rounded-full text-white text-[10px] font-bold z-10">
                    {p.badge}
                  </div>
                )}
                <img className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" src={p.image} alt={p.name} />
              </div>
              <div className="p-4 flex flex-col gap-3">
                <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">{p.category}</span>
                <h3 className="text-slate-900 text-base font-medium font-['Outfit'] leading-5">{p.name}</h3>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-orange-600 fill-orange-600" />)}
                  </div>
                  <span className="text-slate-500 text-xs">4.9 (2,847)</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div>
                    <span className="text-slate-900 text-base font-semibold">{p.price}</span>
                    <span className="text-gray-400 text-[10px] ml-1">· {p.minQty}</span>
                  </div>
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
