"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages:  number;
  categorySlug?: string;
}

function buildUrl(page: number, categorySlug?: string) {
  const params = new URLSearchParams();
  if (categorySlug) params.set('category', categorySlug);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return `/categories${qs ? `?${qs}` : ''}`;
}

export default function CategoriesPagination({ currentPage, totalPages, categorySlug }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const cls = (active: boolean) =>
    `w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-bold transition-all min-h-[44px] ${
      active
        ? 'bg-green-700 border-green-700 text-white cursor-default pointer-events-none'
        : 'border-gray-200 text-gray-500 hover:border-green-700 hover:text-green-700 active:scale-95'
    }`;

  return (
    <div className="w-full flex justify-center items-center gap-1.5 pt-8 pb-4 flex-wrap">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1, categorySlug)}
          className="h-10 px-3 rounded-xl border border-gray-200 flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:border-green-700 hover:text-green-700 active:scale-95 transition-all min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </Link>
      ) : (
        <span className="h-10 px-3 rounded-xl border border-gray-100 flex items-center gap-1.5 text-sm font-bold text-gray-300 cursor-not-allowed min-h-[44px]">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm select-none">…</span>
        ) : (
          <Link key={p} href={buildUrl(p, categorySlug)} className={cls(p === currentPage)}>
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1, categorySlug)}
          className="h-10 px-3 rounded-xl border border-gray-200 flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:border-green-700 hover:text-green-700 active:scale-95 transition-all min-h-[44px]"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="h-10 px-3 rounded-xl border border-gray-100 flex items-center gap-1.5 text-sm font-bold text-gray-300 cursor-not-allowed min-h-[44px]">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
