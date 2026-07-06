"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Layout, Pencil, Trash2, Loader2, RefreshCw, Package,
} from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SavedDesign {
  id: number;
  title: string;
  preview_url?: string;
  product_name?: string;
  updated_at?: string;
  created_at?: string;
}

function getToken(): string | null {
  try { return localStorage.getItem('bi_token'); } catch { return null; }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }).format(new Date(dateStr));
  } catch { return ''; }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SavedDesignsPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [designs,  setDesigns]  = useState<SavedDesign[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadDesigns = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/login?redirect=/account/designs'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/designs', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      setDesigns(Array.isArray(data) ? data : (data?.designs ?? []));
    } catch {
      showNotification({ title: 'Error', message: 'Could not load your saved designs.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [router, showNotification]);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login?redirect=/account/designs'); return; }

    let cancelled = false;

    fetch('/api/designs', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then(res => {
        if (res.status === 401) { router.push('/login'); return null; }
        return res.json();
      })
      .then(data => {
        if (cancelled || data == null) return;
        setDesigns(Array.isArray(data) ? data : (data?.designs ?? []));
      })
      .catch(() => {
        if (!cancelled) showNotification({ title: 'Error', message: 'Could not load your saved designs.', type: 'error' });
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [router, showNotification]);

  const handleDelete = async (id: number) => {
    const token = getToken();
    if (!token) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/designs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDesigns(prev => prev.filter(d => d.id !== id));
        showNotification({ title: 'Deleted', message: 'Design removed.', type: 'info' });
      } else {
        showNotification({ title: 'Error', message: 'Could not delete design.', type: 'error' });
      }
    } finally {
      setDeleting(null);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pb-20">
        <div className="w-full bg-white border-b border-gray-200 py-12 px-6">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-4 animate-pulse">
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-52 h-8 bg-gray-200 rounded-xl" />
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border border-gray-100">
              <div className="aspect-video bg-gray-100" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">

      {/* ── Header ── */}
      <div className="w-full bg-white border-b border-gray-200 py-12 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-4">
          <Link href="/account" className="flex items-center gap-2 text-green-700 font-bold text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Account
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Layout className="w-8 h-8 text-green-700" />
              <div>
                <h1 className="text-4xl font-bold font-['Outfit'] text-slate-900">Saved Designs</h1>
                <p className="text-slate-500 text-sm mt-0.5 font-['Inter']">Continue editing your custom creations</p>
              </div>
              {designs.length > 0 && (
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full font-['Inter']">
                  {designs.length}
                </span>
              )}
            </div>
            <button
              onClick={loadDesigns}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-10">

        {/* ── Empty state ── */}
        {designs.length === 0 ? (
          <div className="w-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-200" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">No saved designs yet</h2>
              <p className="text-slate-500 max-w-sm font-['Inter']">
                Start designing and save your work — it&apos;ll appear here so you can continue anytime.
              </p>
            </div>
            <Link
              href="/design"
              className="px-8 py-4 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-900/10 font-['Inter']"
            >
              Start Designing
            </Link>
          </div>
        ) : (

          /* ── Design grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {designs.map(design => (
              <div
                key={design.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md hover:border-green-200 transition-all flex flex-col"
              >
                {/* Preview */}
                <div className="relative aspect-video bg-gray-50 overflow-hidden">
                  {design.preview_url ? (
                    <Image
                      src={design.preview_url}
                      alt={design.title || 'Design preview'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Layout className="w-10 h-10 text-gray-200" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex-1">
                    <h3 className="font-bold text-zinc-900 text-sm leading-snug line-clamp-2 font-['Outfit']">
                      {design.title || 'Untitled Design'}
                    </h3>
                    {design.product_name && (
                      <p className="text-xs text-zinc-400 mt-0.5 font-['Inter']">{design.product_name}</p>
                    )}
                    {(design.updated_at || design.created_at) && (
                      <p className="text-xs text-zinc-300 mt-1 font-['Inter']">
                        Last edited {formatDate(design.updated_at || design.created_at)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/design?designId=${design.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl transition-all active:scale-95 font-['Inter']"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Design
                    </Link>
                    <button
                      onClick={() => handleDelete(design.id)}
                      disabled={deleting === design.id}
                      className="p-2.5 border border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500 text-zinc-400 rounded-xl transition-all"
                      aria-label="Delete design"
                    >
                      {deleting === design.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
