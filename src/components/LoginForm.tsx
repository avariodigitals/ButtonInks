"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const isSignupSuccess = searchParams.get('signup') === 'success';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const wpBaseUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.buttoninks.com/wp-json';
      const res = await fetch(`${wpBaseUrl}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('bi_token', data.token);
        // Fetch full profile from WP to ensure data is fresh
        try {
          const wpBaseUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.buttoninks.com/wp-json';
          const profileRes = await fetch(`${wpBaseUrl}/wp/v2/users/me?context=edit`, {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            const fullName = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.name || data.user_display_name;
            localStorage.setItem('bi_user_name',  fullName);
            localStorage.setItem('bi_user_email', profile.email ?? data.user_email);
          } else {
            // fallback to JWT payload values
            localStorage.setItem('bi_user_name',  data.user_display_name);
            localStorage.setItem('bi_user_email', data.user_email);
          }
        } catch {
          localStorage.setItem('bi_user_name',  data.user_display_name);
          localStorage.setItem('bi_user_email', data.user_email);
        }
        router.push('/account');
        router.refresh();
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-green-900/5 p-6 md:p-10 flex flex-col gap-6 md:gap-8">

      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl md:text-3xl font-bold font-['Outfit'] text-slate-900">Welcome Back</h1>
        <p className="text-slate-500 text-sm md:text-base font-['Inter']">Sign in to access your designs, orders, and wishlist.</p>
      </div>

      {isSignupSuccess && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-bold">
          Registration successful! Please login below.
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Username or Email</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="Username"
              className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-all font-['Inter']"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-all font-['Inter']"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-green-900/20 mt-4 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </button>
      </form>

      <div className="text-center text-sm font-medium text-slate-500">
        Don't have an account? <Link href="/signup" className="text-green-700 font-bold hover:underline">Sign up now</Link>
      </div>
    </div>
  );
}
