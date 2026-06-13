"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, LogOut, ChevronRight, Settings, Layout } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bi_token');
    const name = localStorage.getItem('bi_user_name');
    const email = localStorage.getItem('bi_user_email');

    if (!token) {
      router.push('/login');
    } else {
      setUser({ name: name || 'User', email: email || '' });
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('bi_token');
    localStorage.removeItem('bi_user_name');
    localStorage.removeItem('bi_user_email');
    router.push('/login');
    router.refresh();
  };

  if (loading) return null;

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
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2 transition-all backdrop-blur-md"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 -mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Navigation Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AccountCard
            title="My Orders"
            desc="Track, return or buy things again"
            icon={Package}
            href="/account/orders"
          />
          <AccountCard
            title="My Wishlist"
            desc="Items you've saved for later"
            icon={Heart}
            href="/wishlist"
            badge="0"
          />
          <AccountCard
            title="Saved Designs"
            desc="Continue editing your creations"
            icon={Layout}
            href="/account/designs"
          />
          <AccountCard
            title="Account Settings"
            desc="Edit name, email and password"
            icon={Settings}
            href="/account/settings"
          />
        </div>

        {/* Support Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Need Help?</h2>
            <p className="text-slate-500 text-sm font-['Inter']">Our support team is available 24/7 to help you with your orders and designs.</p>
            <Link
              href="/contact"
              className="w-full py-4 bg-green-50 text-green-700 rounded-xl font-bold text-center hover:bg-green-100 transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function AccountCard({ title, desc, icon: Icon, href, badge }: { title: string; desc: string; icon: any; href: string; badge?: string }) {
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
