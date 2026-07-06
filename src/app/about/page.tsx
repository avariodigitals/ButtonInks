"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, Award, Truck, Headphones } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, enabled = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, enabled]);
  return count;
}

// ── Stat counter card ─────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, enabled }: { value: number; suffix: string; label: string; enabled: boolean }) {
  const count = useCounter(value, 2000, enabled);
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <span className="text-4xl md:text-5xl font-bold font-['Outfit'] text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-green-100 text-sm font-['Inter']">{label}</span>
    </div>
  );
}

const stats = [
  { value: 50000, suffix: "+", label: "Happy Customers" },
  { value: 10,    suffix: "+", label: "Years in Business" },
  { value: 500,   suffix: "+", label: "Products Available" },
  { value: 24,    suffix: "hr", label: "Support Response" },
];

const values = [
  { icon: Award,      title: "Premium Quality",  desc: "Every product goes through rigorous quality checks before it ships." },
  { icon: Truck,      title: "Fast Delivery",    desc: "Standard 3–5 day production with 1–2 day express options." },
  { icon: Users,      title: "Customer First",   desc: "Real humans available to help at every step of your order." },
  { icon: Headphones, title: "Dedicated Support",desc: "Phone, email, and live chat — we are always here." },
];

export default function AboutPage() {
  // Trigger counters when stats section enters viewport
  const statsRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="w-full bg-white">

      {/* ── Hero ── */}
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-20 px-6 md:px-20">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center gap-6">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest">About Us</span>
          <h1 className="text-4xl md:text-5xl font-bold font-['Outfit'] text-slate-900 max-w-3xl leading-tight">
            We Make Your Brand Look Great — Everywhere
          </h1>
          <p className="text-slate-500 text-lg font-['Inter'] leading-8 max-w-2xl">
            ButtonInks is a custom printing company based in Pearland, TX. We help businesses, organisations, and individuals create premium branded merchandise with fast turnaround and bulk pricing.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <Link href="/categories" className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] transition-all">
              Shop Products
            </Link>
            <Link href="/design" className="px-8 py-4 border-2 border-green-700 text-green-700 hover:bg-green-50 font-bold rounded-xl font-['Inter'] transition-all">
              Start Designing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Animated Stats ── */}
      <section ref={statsRef} className="w-full py-16 px-6 md:px-20 bg-green-700">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} enabled={started} />
          ))}
        </div>
      </section>

      {/* ── Story ── */}
      <section className="w-full py-20 px-6 md:px-20">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl md:text-4xl font-bold font-['Outfit'] text-slate-900">Our Story</h2>
            <div className="flex flex-col gap-4 text-slate-600 font-['Inter'] leading-8 text-base">
              <p>ButtonInks was founded with a simple belief: every business deserves access to high-quality branded merchandise without the complexity or high minimum orders that large print houses demand.</p>
              <p>From our facility in Pearland, TX, we serve thousands of clients across the country — from small startups ordering their first branded t-shirts to Fortune 500 companies running large corporate campaigns.</p>
              <p>We invest in the latest printing technology and maintain strict quality standards so every item that leaves our facility represents your brand at its best.</p>
            </div>
          </div>

          {/* Site logo as the story image */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
            <Image
              src="https://central.buttoninks.com/wp-content/uploads/2026/06/cropped-Screenshot_3-removebg-preview.png"
              alt="ButtonInks"
              fill
              className="object-contain p-10"
              sizes="(max-width:1024px) 100vw, 50vw"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="w-full py-20 px-6 md:px-20 bg-gray-50">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-12">
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl md:text-4xl font-bold font-['Outfit'] text-slate-900">What We Stand For</h2>
            <p className="text-slate-500 font-['Inter'] text-base">The principles that guide every order we fulfil.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <v.icon className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-bold font-['Outfit'] text-slate-900">{v.title}</h3>
                <p className="text-slate-500 text-sm font-['Inter'] leading-6">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="w-full py-20 px-6 md:px-20 text-center">
        <div className="max-w-[600px] mx-auto flex flex-col gap-6">
          <h2 className="text-3xl font-bold font-['Outfit'] text-slate-900">Ready to Get Started?</h2>
          <p className="text-slate-500 font-['Inter'] leading-7">Browse our full product range or reach out — we are happy to help with any order, big or small.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/categories" className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] transition-all">Browse Products</Link>
            <a href="mailto:info@buttoninks.com" className="px-8 py-4 border-2 border-gray-200 text-slate-700 hover:border-green-700 hover:text-green-700 font-bold rounded-xl font-['Inter'] transition-all">Contact Us</a>
          </div>
        </div>
      </section>
    </main>
  );
}
