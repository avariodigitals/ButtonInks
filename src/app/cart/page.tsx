"use client";

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subTotal } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white px-4">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-green-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-['Outfit']">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-xs">Looks like you haven't added any products to your cart yet.</p>
        <Link href="/categories" className="px-8 py-3 bg-green-700 text-white rounded-3xl font-medium hover:bg-green-600 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Breadcrumbs */}
      <div className="w-full px-4 md:px-20 py-4 bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2">
          <Link href="/" className="text-emerald-500 text-sm font-normal">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-zinc-500 text-sm font-normal">Cart</span>
        </div>
      </div>

      {/* Cart Title Section */}
      <div className="w-full px-4 md:px-20 py-8 bg-emerald-50 border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto">
          <h1 className="text-green-700 text-3xl md:text-4xl font-bold font-['Outfit']">Cart</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-4 md:px-20 py-10 bg-white flex-1">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-10">

          {/* Cart Items List */}
          <div className="flex-1 p-4 md:p-8 bg-white rounded-[10px] border border-gray-200 flex flex-col gap-6">
            {cart.map((item, index) => (
              <React.Fragment key={item.id}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-32 h-28 relative bg-stone-50 rounded-2xl overflow-hidden shrink-0">
                      <Image
                        src={item.image || "https://placehold.co/128x112?text=No+Image"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <h3 className="text-gray-900 text-xl font-bold font-['Outfit']">{item.name}</h3>
                      <p className="text-zinc-500 text-lg font-medium">{formatPrice(item.price)}</p>
                      <Link href={`/products/${item.id}`} className="w-fit text-green-700 text-sm font-medium border-b border-green-700">
                        Edit selection
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-7 self-end md:self-auto">
                    <div className="px-4 py-2 bg-stone-50 rounded-3xl border border-zinc-200 flex items-center gap-7">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-zinc-500 hover:text-green-700 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-green-700 text-base font-medium min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-green-700 hover:text-green-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                {index < cart.length - 1 && (
                  <div className="w-full h-px bg-gray-200" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="w-full lg:w-[448px] p-6 md:p-8 bg-white rounded-[10px] border border-gray-200 flex flex-col gap-6 h-fit">
            <h2 className="text-gray-900 text-2xl font-medium font-['Outfit'] leading-7">Summary</h2>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-gray-900 text-base font-normal font-['Inter'] leading-6">Apply Discount</label>
                <div className="flex items-start gap-4">
                  <div className="flex-1 max-w-[240px] bg-gray-50 rounded-[30px] border border-transparent focus-within:border-green-700 overflow-hidden">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code"
                      className="w-full h-14 px-5 bg-transparent outline-none text-sm font-['Inter']"
                    />
                  </div>
                  <button className="w-28 h-14 bg-green-700 rounded-3xl text-white text-base font-medium font-['Inter'] hover:bg-green-600 transition-colors shrink-0">
                    Apply
                  </button>
                </div>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="text-slate-600 text-sm font-medium font-['Inter'] leading-5">Sub Total</span>
                  <span className="text-slate-600 text-sm font-normal font-['Inter'] leading-5 text-right">{formatPrice(subTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm font-medium font-['Inter'] leading-5">Tax (10%)</span>
                  <span className="text-slate-600 text-sm font-normal font-['Inter'] leading-5 text-right">$0.00</span>
                </div>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm font-medium font-['Space_Grotesk'] leading-5">Total</span>
                <span className="text-slate-800 text-base font-medium font-['Inter'] leading-6 text-right">{formatPrice(subTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <Link href="/checkout" className="w-full py-4 bg-green-700 rounded-3xl text-white text-base font-medium font-['Inter'] text-center hover:bg-green-600 transition-colors shadow-lg shadow-green-700/20">
                Proceed to check out
              </Link>
              <Link href="/categories" className="w-full py-4 rounded-3xl border border-green-700 text-green-700 text-base font-medium font-['Inter'] text-center hover:bg-green-50 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
