import Link from "next/link";
import { Building2, Users, Package, CreditCard } from "lucide-react";

export const metadata = { title: "Corporate Printing | ButtonInks", description: "Bulk branded merchandise for businesses, events, and organisations. Volume discounts, dedicated account managers, and fast turnaround." };

const features = [
  { icon: Package,    title: "50+ Unit Minimums",        desc: "Competitive bulk pricing kicks in from 50 units, with bigger discounts at 100, 250, and 500+." },
  { icon: Users,      title: "Account Manager",          desc: "A dedicated contact handles your order from quote to delivery — no chasing tickets." },
  { icon: CreditCard, title: "Net-30 Terms Available",   desc: "Established businesses can apply for invoiced payment terms." },
  { icon: Building2,  title: "White-Label Options",      desc: "Remove ButtonInks branding and ship direct to your customers under your own brand." },
];

export default function CorporatePrintingPage() {
  return (
    <main className="w-full bg-white min-h-screen">
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-20 px-6 md:px-20">
        <div className="max-w-[1280px] mx-auto flex flex-col items-start gap-6">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest">Services</span>
          <h1 className="text-4xl md:text-5xl font-bold font-['Outfit'] text-slate-900 max-w-2xl leading-tight">Corporate Printing &amp; Bulk Orders</h1>
          <p className="text-slate-500 text-lg font-['Inter'] leading-8 max-w-xl">From team uniforms to event merchandise — we handle large corporate orders with the quality, speed, and support your brand deserves.</p>
          <div className="flex flex-wrap gap-4 mt-2">
            <Link href="/categories" className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] transition-all">Browse Products</Link>
            <a href="mailto:sales@buttoninks.com" className="px-8 py-4 border-2 border-green-700 text-green-700 hover:bg-green-50 font-bold rounded-xl font-['Inter'] transition-all">Get a Quote</a>
          </div>
        </div>
      </section>

      <section className="w-full px-6 md:px-20 py-20 bg-gray-50">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center"><f.icon className="w-6 h-6 text-green-700" /></div>
              <h3 className="font-bold font-['Outfit'] text-slate-900">{f.title}</h3>
              <p className="text-slate-500 text-sm font-['Inter'] leading-6">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full px-6 md:px-20 py-20">
        <div className="max-w-[800px] mx-auto text-center flex flex-col gap-6">
          <h2 className="text-3xl font-bold font-['Outfit'] text-slate-900">Ready to Place a Corporate Order?</h2>
          <p className="text-slate-500 font-['Inter'] leading-7">Email our sales team with your requirements — product type, quantity, timeline, and any artwork you have — and we will get back to you with a quote within 24 hours.</p>
          <a href="mailto:sales@buttoninks.com?subject=Corporate Order Enquiry" className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] transition-all w-fit mx-auto">
            Contact Sales Team
          </a>
        </div>
      </section>
    </main>
  );
}
