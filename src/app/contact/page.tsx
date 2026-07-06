"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [form, setForm]       = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "general", ...form }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setSuccess(true);
    } catch { setError("Network error. Please try again."); }
    finally   { setLoading(false); }
  };

  return (
    <main className="w-full bg-white min-h-screen">
      {/* Hero */}
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-16 px-6 md:px-20">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-4">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest w-fit">Contact</span>
          <h1 className="text-4xl md:text-5xl font-bold font-['Outfit'] text-slate-900">Get in Touch</h1>
          <p className="text-slate-500 text-base font-['Inter'] leading-7 max-w-xl">Have a question about an order, a custom quote, or just want to say hello? We are here to help.</p>
        </div>
      </section>

      <section className="w-full px-6 md:px-20 py-16">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Contact info */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              {[
                { icon: Phone,  label: "Phone",   value: "+1 (409) 800-3195",                         href: "tel:+14098003195" },
                { icon: Mail,   label: "Email",   value: "info@buttoninks.com",                       href: "mailto:info@buttoninks.com" },
                { icon: MapPin, label: "Address", value: "1853 Pearland Pkwy Ste #123 Unit #2161\nPearland, TX 77581", href: "https://maps.google.com/?q=1853+Pearland+Pkwy+Pearland+TX" },
              ].map(item => (
                <a key={item.label} href={item.href} target={item.label === "Address" ? "_blank" : undefined} rel="noopener noreferrer"
                  className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-700 transition-colors">
                    <item.icon className="w-5 h-5 text-green-700 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-['Inter']">{item.label}</p>
                    <p className="text-slate-800 font-['Inter'] text-sm leading-6 whitespace-pre-line group-hover:text-green-700 transition-colors">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold font-['Outfit'] text-slate-900 mb-2">Business Hours</h3>
              <ul className="flex flex-col gap-1.5 text-sm font-['Inter'] text-slate-600">
                <li className="flex justify-between"><span>Monday – Friday</span><span className="font-bold">9 AM – 6 PM CST</span></li>
                <li className="flex justify-between"><span>Saturday</span><span className="font-bold">10 AM – 4 PM CST</span></li>
                <li className="flex justify-between"><span>Sunday</span><span className="text-gray-400">Closed</span></li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            {success ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
                <h3 className="text-xl font-bold font-['Outfit'] text-slate-900">Message Sent!</h3>
                <p className="text-slate-500 font-['Inter'] text-sm">We will get back to you within 1 business day.</p>
                <button onClick={() => { setSuccess(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="text-green-700 font-bold text-sm hover:underline font-['Inter']">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h2 className="text-xl font-bold font-['Outfit'] text-slate-900 mb-2">Send us a Message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 font-['Inter']">Name <span className="text-red-500">*</span></label>
                    <input required type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-['Inter'] focus:outline-none focus:border-green-600 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 font-['Inter']">Email <span className="text-red-500">*</span></label>
                    <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@email.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-['Inter'] focus:outline-none focus:border-green-600 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 font-['Inter']">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-['Inter'] focus:outline-none focus:border-green-600 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 font-['Inter']">Subject</label>
                    <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Order enquiry, quote, etc."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-['Inter'] focus:outline-none focus:border-green-600 transition-colors" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 font-['Inter']">Message <span className="text-red-500">*</span></label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us how we can help…"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-['Inter'] focus:outline-none focus:border-green-600 transition-colors resize-none" />
                </div>
                {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-100 font-['Inter']">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 font-['Inter'] text-sm transition-all active:scale-[0.98]">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
