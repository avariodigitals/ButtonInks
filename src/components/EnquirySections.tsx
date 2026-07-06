"use client";

import { useState } from "react";
import { Building2, Palette, Send, CheckCircle2, Loader2 } from "lucide-react";

type FormType = "corporate" | "design";

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

const EMPTY: FormState = { name: "", email: "", phone: "", company: "", message: "" };

function EnquiryForm({ type }: { type: FormType }) {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const isCorporate = type === "corporate";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type, ...form }),
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

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
        <h3 className="text-xl font-bold font-['Outfit'] text-slate-900">Enquiry Sent!</h3>
        <p className="text-slate-500 font-['Inter'] text-sm max-w-xs">
          Thanks for reaching out. Our team will get back to you within 1 business day.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-2 text-sm text-green-700 font-bold hover:underline font-['Inter']"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Row: Name + Email */}
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

      {/* Row: Phone + Company */}
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
          <label className="text-sm font-bold text-slate-700 font-['Inter']">
            {isCorporate ? "Company / Organisation" : "Brand / Project Name"}
          </label>
          <input
            type="text"
            value={form.company}
            onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
            placeholder={isCorporate ? "Acme Corp" : "My Brand"}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-['Inter'] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-green-600 transition-colors"
          />
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-slate-700 font-['Inter']">
          {isCorporate ? "Tell us about your order" : "Describe your design needs"}{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          placeholder={
            isCorporate
              ? "Quantity, product type, timeline, any special requirements…"
              : "Colours, style, file format, deadline, reference images…"
          }
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
          <><Send className="w-4 h-4" /> Send Enquiry</>
        )}
      </button>
    </form>
  );
}

export default function EnquirySections() {
  return (
    <section className="w-full bg-gray-50 py-16 px-4 md:px-20">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-16">

        {/* ── Corporate Sales ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left — copy */}
          <div className="flex flex-col gap-5">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-700" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl sm:text-4xl font-bold font-['Outfit'] text-slate-900">
                Corporate Sales
              </h2>
              <p className="text-slate-500 font-['Inter'] leading-7 text-base">
                Looking to outfit your team, brand an event, or run a large promotional campaign? We specialise in bulk corporate orders with fast turnaround, competitive pricing, and dedicated account support.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {[
                "Volume discounts on 50+ units",
                "Branded packaging & labelling",
                "Dedicated account manager",
                "Net-30 payment terms available",
                "White-label & co-branding options",
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-600 font-['Inter']">
                  <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-green-600 block" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold font-['Outfit'] text-slate-900 mb-5">Get a Corporate Quote</h3>
            <EnquiryForm type="corporate" />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* ── Graphics Design Request ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left — copy */}
          <div className="flex flex-col gap-5">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-green-700" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl sm:text-4xl font-bold font-['Outfit'] text-slate-900">
                Graphics Design Request
              </h2>
              <p className="text-slate-500 font-['Inter'] leading-7 text-base">
                Don&apos;t have artwork ready? Our in-house design team can create logos, layouts, and full print-ready files tailored to your brand. Fast, affordable, and print-perfect.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
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
          </div>

          {/* Right — form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold font-['Outfit'] text-slate-900 mb-5">Request a Design</h3>
            <EnquiryForm type="design" />
          </div>
        </div>

      </div>
    </section>
  );
}
