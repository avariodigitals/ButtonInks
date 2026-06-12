import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] w-full flex flex-col items-center justify-center bg-white px-6">
      <div className="max-w-2xl w-full text-center flex flex-col items-center gap-8">

        {/* Animated Icon / Illustration Area */}
        <div className="relative">
          <div className="absolute -inset-4 bg-emerald-50 rounded-full blur-2xl opacity-70 animate-pulse" />
          <div className="relative w-32 h-32 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100 shadow-sm">
            <Search className="w-16 h-16 text-green-700" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col gap-4">
          <h1 className="text-green-700 text-8xl font-black font-['Outfit'] leading-tight">404</h1>
          <h2 className="text-slate-900 text-3xl font-bold font-['Outfit']">Oops! Page not found</h2>
          <p className="text-slate-500 text-lg font-normal font-['Inter'] leading-relaxed max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Don't worry, we'll help you get back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold font-['Inter'] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-green-900/10"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <Link
            href="/categories"
            className="px-8 py-4 bg-white border border-gray-200 hover:border-green-700 hover:bg-emerald-50 text-slate-700 hover:text-green-700 rounded-xl font-bold font-['Inter'] flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Categories
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-gray-100 w-full">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Need help?</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/contact" className="text-green-700 hover:underline font-semibold">Contact Support</Link>
            <Link href="/faq" className="text-green-700 hover:underline font-semibold">Visit FAQ</Link>
            <Link href="/blog" className="text-green-700 hover:underline font-semibold">Read Blog</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
