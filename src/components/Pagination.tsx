"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build the page number list with ellipsis
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3)       pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btn = (
    page: number | '...',
    label: React.ReactNode,
    extra?: string
  ) => {
    if (page === '...') {
      return (
        <span key={`ellipsis-${label}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm select-none">
          …
        </span>
      );
    }
    const isActive = page === currentPage;
    return (
      <button
        key={page}
        onClick={() => onPageChange(page)}
        disabled={isActive}
        className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-bold transition-all min-h-[44px] ${extra ?? ''} ${
          isActive
            ? 'bg-green-700 border-green-700 text-white cursor-default'
            : 'border-gray-200 text-gray-500 hover:border-green-700 hover:text-green-700 active:scale-95'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="w-full flex justify-center items-center gap-1.5 pt-8 pb-4 flex-wrap">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-10 px-3 rounded-xl border border-gray-200 flex items-center gap-1.5 text-sm font-bold text-gray-500
          hover:border-green-700 hover:text-green-700 disabled:opacity-30 disabled:cursor-not-allowed
          active:scale-95 transition-all min-h-[44px]"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page numbers */}
      {pages.map((p, i) => btn(p, p, `key-${i}`))}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-10 px-3 rounded-xl border border-gray-200 flex items-center gap-1.5 text-sm font-bold text-gray-500
          hover:border-green-700 hover:text-green-700 disabled:opacity-30 disabled:cursor-not-allowed
          active:scale-95 transition-all min-h-[44px]"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
