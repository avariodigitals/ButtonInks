"use client";

import { useState } from "react";
import { Palette, Send, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

const EMPTY: FormState = { name: "", email: "", phone: "", company: "", message: "" };

export default function DesignRequestPage() {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type: "design", ...form }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setSuccess(true);
      setForm(EMPTY);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4 md:px-20">
      <div className="max-w-[1280px] mx-auto">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-['Inter'] mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

          {/* Left — info */}
          <div className="flex flex-col gap-6">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <Palette className="w-7 h-7 text-green-700" />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-4xl sm:text-5xl font-bold font-['Outfit'] text-slate-900 leading-tight">
                Graphics Design Request
              </h1>
              <p className="text-slate-500 font-['Inter'] leading-7 text-base mt-1">
                Don&apos;t have artwork ready? Our in-house design team can create logos, layouts, and full print-ready files tailored to your brand. Fast, affordable, and print-perfect.
              </p>
            </div>

            <ul className="flex flex-col gap-3 mt-2">
              {[
                "Logo design & brand identity",
                "Custom apparel & product artwork",
                "Banner & signage layouts",
                "Print-ready file delivery (PDF / AI / PNG)",
                "Revisions included",
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-600 font-['Inter']">
                  <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-green-600 block" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Trust note */}
            <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-sm text-green-800 font-['Inter'] leading-6">
                <span className="font-bold">Typical turnaround:</span> 1–3 business days for initial concepts.
                We&apos;ll confirm your brief before starting any work.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold font-['Outfit'] text-slate-900 mb-6">
              Tell us about your project
            </h2>

            {success ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
                <h3 className="text-xl font-bold font-['Outfit'] text-slate-900">Request Sent!</h3>
                <p className="text-slate-500 font-['Inter'] text-sm max-w-xs">
                  Thanks for reaching out. Our design team will get back to you within 1 business day.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-sm text-green-700 font-bold hover:underline font-['Inter']"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 font-['Inter']">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Jane Smith"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-['Inter'] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-green-600 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 font-['Inter']">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@company.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-['Inter'] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-green-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Phone + Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 font-['Inter']">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-['Inter'] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-green-600 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 font-['Inter']">Brand / Project Name</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                      placeholder="My Brand"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-['Inter'] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-green-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 font-['Inter']">
                    Describe your design needs <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Colours, style, file format, deadline, reference images…"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-['Inter'] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-green-600 transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm font-['Inter'] bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Request</>
                  )}
                </button>

                <p className="text-xs text-center text-slate-400 font-['Inter']">
                  No payment required to submit a request
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
