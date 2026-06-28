"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, Package, Loader2, RefreshCw, Clock,
  CheckCircle2, XCircle, Truck, AlertCircle, ShoppingBag,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderItem {
  name:     string;
  quantity: number;
  total:    string;
  image:    string;
}

interface Order {
  id:                   number;
  number:               string;
  status:               string;
  date_created:         string;
  total:                string;
  currency:             string;
  item_count:           number;
  items:                OrderItem[];
  shipping_total:       string;
  payment_method_title: string;
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending Payment', color: 'bg-amber-50  text-amber-700  border-amber-200',  icon: <Clock          className="w-3.5 h-3.5" /> },
  'on-hold':  { label: 'On Hold',         color: 'bg-orange-50 text-orange-700 border-orange-200', icon: <AlertCircle    className="w-3.5 h-3.5" /> },
  processing: { label: 'Processing',      color: 'bg-blue-50   text-blue-700   border-blue-200',   icon: <RefreshCw      className="w-3.5 h-3.5" /> },
  completed:  { label: 'Completed',       color: 'bg-green-50  text-green-700  border-green-200',  icon: <CheckCircle2   className="w-3.5 h-3.5" /> },
  cancelled:  { label: 'Cancelled',       color: 'bg-red-50    text-red-600    border-red-200',    icon: <XCircle        className="w-3.5 h-3.5" /> },
  refunded:   { label: 'Refunded',        color: 'bg-purple-50 text-purple-600 border-purple-200', icon: <XCircle        className="w-3.5 h-3.5" /> },
  shipped:    { label: 'Shipped',         color: 'bg-teal-50   text-teal-700   border-teal-200',   icon: <Truck          className="w-3.5 h-3.5" /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' '),
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    icon:  <Clock className="w-3.5 h-3.5" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold font-['Inter'] ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── Format helpers ────────────────────────────────────────────────────────────
function formatPrice(amount: string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(amount) || 0);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const router = useRouter();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bi_token') : null;
    if (!token) { router.push('/login?redirect=/account/orders'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (res.status === 401) { router.push('/login?redirect=/account/orders'); return; }
      if (!res.ok) throw new Error('Could not load your orders');

      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">

      {/* Header banner */}
      <div className="w-full bg-green-700 pt-12 pb-28 px-6">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-['Outfit']">My Orders</h1>
              <p className="text-white/60 text-sm font-['Inter']">Track and review your order history</p>
            </div>
          </div>
          <button onClick={fetchOrders} disabled={loading}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all disabled:opacity-50" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content card */}
      <div className="max-w-[1280px] mx-auto px-6 -mt-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm font-['Inter']">
          <Link href="/"        className="text-white/70 hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          <Link href="/account" className="text-white/70 hover:text-white transition-colors">Account</Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          <span className="text-white">Orders</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
              <p className="text-gray-500 text-sm font-['Inter']">Loading your orders…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 px-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-gray-700 font-semibold font-['Outfit']">Couldn&apos;t load orders</p>
              <p className="text-gray-500 text-sm font-['Inter']">{error}</p>
              <button onClick={fetchOrders}
                className="px-6 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors">
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 px-6 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-green-700" />
              </div>
              <p className="text-gray-700 font-semibold text-lg font-['Outfit']">No orders yet</p>
              <p className="text-gray-500 text-sm font-['Inter']">Once you place an order it will appear here.</p>
              <Link href="/categories"
                className="px-8 py-3 bg-green-700 text-white rounded-3xl text-sm font-semibold hover:bg-green-600 transition-colors">
                Start Shopping
              </Link>
            </div>
          )}

          {/* Orders list */}
          {!loading && !error && orders.length > 0 && (
            <div className="divide-y divide-gray-100">
              {orders.map(order => (
                <div key={order.id} className="p-6">

                  {/* Order header row */}
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold font-['Outfit'] text-base">Order #{order.number}</span>
                        <span className="text-gray-400 text-xs font-['Inter']">{formatDate(order.date_created)}</span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <span className="text-green-700 font-bold text-lg font-['Outfit']">
                          {formatPrice(order.total, order.currency)}
                        </span>
                        <span className="text-gray-400 text-xs font-['Inter']">
                          {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform ${expanded === order.id ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {expanded === order.id && (
                    <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col gap-4">

                      {/* Items */}
                      <div className="flex flex-col gap-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="w-14 h-14 shrink-0 bg-gray-50 rounded-xl overflow-hidden relative">
                              {item.image
                                ? <Image src={item.image} alt={item.name} fill className="object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 text-sm font-semibold font-['Outfit'] line-clamp-2">{item.name}</p>
                              <p className="text-gray-500 text-xs font-['Inter']">Qty: {item.quantity}</p>
                            </div>
                            <span className="text-gray-700 text-sm font-bold font-['Inter'] shrink-0">
                              {formatPrice(item.total, order.currency)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Totals row */}
                      <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100 text-sm font-['Inter']">
                        {parseFloat(order.shipping_total) > 0 && (
                          <div className="flex justify-between text-gray-500">
                            <span>Shipping</span>
                            <span>{formatPrice(order.shipping_total, order.currency)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>Total</span>
                          <span className="text-green-700">{formatPrice(order.total, order.currency)}</span>
                        </div>
                        {order.payment_method_title && (
                          <p className="text-gray-400 text-xs mt-1">Paid via {order.payment_method_title}</p>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Back link */}
        <div className="mt-6">
          <Link href="/account" className="text-green-700 text-sm font-semibold font-['Inter'] hover:underline flex items-center gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Account
          </Link>
        </div>
      </div>
    </main>
  );
}
