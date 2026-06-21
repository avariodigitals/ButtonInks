"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, LogOut, ChevronRight, Settings, Layout, Loader2, RefreshCw } from 'lucide-react';

const WP_API = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.buttoninks.com/wp-json';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('bi_token');
    if (!token) { router.push('/login'); return; }

    setLoading(true);
    try {
      // Fetch profile and wishlist count in parallel
      const [profileRes, wishlistRes] = await Promise.all([
        fetch(`${WP_API}/wp/v2/users/me?context=edit`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }),
        fetch('/api/wishlist', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }),
      ]);

      if (profileRes.status === 401) { router.push('/login'); return; }
      if (!profileRes.ok) throw new Error('Could not load profile');

      const data = await profileRes.json();
      const name = `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || data.name || 'User';
      setUser({ name, email: data.email ?? '', username: data.username ?? '' });
      localStorage.setItem('bi_user_name',  name);
      localStorage.setItem('bi_user_email', data.email ?? '');

      // Parse wishlist count — API may return { items: [...] } or an array
      if (wishlistRes.ok) {
        const wlData = await wishlistRes.json();
        const items  = Array.isArray(wlData) ? wlData : (wlData?.items ?? []);
        setWishlistCount(items.length);
      }
    } catch {
      // fallback to cached values if WP is unreachable
      const name  = localStorage.getItem('bi_user_name')  ?? 'User';
      const email = localStorage.getItem('bi_user_email') ?? '';
      setUser({ name, email, username: '' });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleLogout = () => {
    localStorage.removeItem('bi_token');
    localStorage.removeItem('bi_user_name');
    localStorage.removeItem('bi_user_email');
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="w-full bg-green-700 pt-16 pb-32 px-6">
          <div className="max-w-[1280px] mx-auto flex items-center gap-6 animate-pulse">
            <div className="w-24 h-24 bg-white/20 rounded-full" />
            <div className="flex flex-col gap-3">
              <div className="w-40 h-5 bg-white/20 rounded-lg" />
              <div className="w-56 h-3.5 bg-white/10 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 -mt-16 flex items-center justify-center pt-20">
          <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full bg-green-700 pt-16 pb-32 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full border-4 border-white/20 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-white font-['Outfit']">{user?.name}</h1>
              <p className="text-white/70 font-['Inter']">{user?.email}</p>
              {user?.username && (
                <p className="text-white/40 text-xs mt-0.5 font-['Inter']">@{user.username}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchProfile}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              title="Refresh from WordPress"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2 transition-all backdrop-blur-md"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 -mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Navigation Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AccountCard title="My Orders"        desc="Track, return or buy things again"    icon={Package} href="/account/orders"   />
          <AccountCard title="My Wishlist"       desc="Items you've saved for later"         icon={Heart}   href="/wishlist"         badge={wishlistCount > 0 ? String(wishlistCount) : undefined} />
          <AccountCard title="Saved Designs"     desc="Continue editing your creations"      icon={Layout}  href="/account/designs"  />
          <AccountCard title="Account Settings"  desc="Edit name, email and password"        icon={Settings} href="/account/settings" />
        </div>

        {/* Support Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Need Help?</h2>
            <p className="text-slate-500 text-sm font-['Inter']">Our support team is available 24/7 to help you with your orders and designs.</p>
            <Link href="/contact" className="w-full py-4 bg-green-50 text-green-700 rounded-xl font-bold text-center hover:bg-green-100 transition-all">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function AccountCard({ title, desc, icon: Icon, href, badge }: { title: string; desc: string; icon: React.ElementType; href: string; badge?: string }) {
  return (
    <Link href={href} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-green-700 transition-all">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-700 transition-all">
          <Icon className="w-6 h-6 text-green-700 group-hover:text-white transition-all" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-900 group-hover:text-green-700 transition-colors">{title}</h3>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      {badge ? (
        <span className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center text-white text-[10px] font-bold">{badge}</span>
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-700 group-hover:translate-x-1 transition-all" />
      )}
    </Link>
  );
}
