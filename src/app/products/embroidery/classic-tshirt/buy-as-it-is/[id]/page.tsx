"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { X, Heart, Share2, Star } from 'lucide-react';

const relatedTemplates = [
  { id: 101, title: "Geometric Shapes", industry: "Creative", tags: ["Modern", "Abstract"], image: "https://placehold.co/300x300" },
  { id: 102, title: "Floral Elegance", industry: "Beauty & Spa", tags: ["Elegant", "Decorative"], image: "https://placehold.co/300x300" },
  { id: 103, title: "Bold Typography", industry: "Tech", tags: ["Modern", "Minimalist"], image: "https://placehold.co/300x300" },
  { id: 104, title: "Vintage Badge", industry: "Food & Beverage", tags: ["Retro", "Classic"], image: "https://placehold.co/300x300" },
  { id: 105, title: "Geometric Shapes", industry: "Creative", tags: ["Modern", "Abstract"], image: "https://placehold.co/300x300" },
  { id: 106, title: "Bold Typography", industry: "Tech", tags: ["Modern", "Minimalist"], image: "https://placehold.co/300x300" },
];

export default function TemplatePreviewPage() {
  const params = useParams();
  const id = params.id;

  return (
    <main className="w-full bg-gray-50 flex flex-col items-center py-10">
      <div className="w-full max-w-[978px] bg-white rounded-2xl shadow-lg flex flex-col gap-10 overflow-hidden relative">

        {/* Close Button */}
        <Link
          href="/products/embroidery/classic-tshirt/buy-as-it-is"
          className="absolute top-6 right-6 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-20"
        >
          <X className="w-5 h-5 text-gray-900" />
        </Link>

        {/* Main Preview Content */}
        <div className="flex flex-col md:flex-row items-stretch border-b border-gray-100">
          <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-[475px]">
            <img
              className="w-full h-full object-contain"
              src="https://placehold.co/589x475"
              alt="Template Preview"
            />
          </div>

          <div className="w-full md:w-80 p-8 flex flex-col gap-6 bg-white">
            <div className="flex flex-col gap-3">
              <h1 className="text-gray-900 text-2xl font-semibold font-['Inter'] leading-tight">Floral Elegance</h1>
              <p className="text-gray-600 text-base font-normal font-['Inter'] leading-5">Beauty & Spa</p>

              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs font-normal font-['Inter']">Elegant</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs font-normal font-['Inter']">Decorative</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
                    <Heart className="w-5 h-5 text-zinc-400 group-hover:text-red-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
                    <Share2 className="w-5 h-5 text-zinc-400 group-hover:text-blue-500" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <button className="w-full px-6 py-4 bg-green-700 hover:bg-green-800 rounded-[10px] flex justify-center items-center text-white text-lg font-medium font-['Inter'] transition-all active:scale-95 shadow-md">
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Related Section */}
        <div className="p-10 flex flex-col gap-8 bg-white">
          <h2 className="text-slate-900 text-4xl font-bold font-['Outfit'] leading-10">More like this</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedTemplates.map((item) => (
              <Link
                href={`/products/embroidery/classic-tshirt/buy-as-it-is/${item.id}`}
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-4 h-4 text-zinc-500" />
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <h3 className="text-gray-900 text-lg font-bold font-['Inter'] leading-tight">{item.title}</h3>
                  <p className="text-gray-600 text-sm font-normal font-['Inter'] leading-5">{item.industry}</p>
                  <div className="flex gap-2 mt-1">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 text-xs font-normal font-['Inter']">{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
