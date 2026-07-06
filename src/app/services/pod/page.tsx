import Link from "next/link";
import { Printer, Store, Globe, RefreshCw } from "lucide-react";

export const metadata = { title: "Print on Demand | ButtonInks", description: "Sell custom branded products without holding inventory. We print and ship each order as it comes in." };

const benefits = [
  { icon: Store,     title: "No Inventory Risk",     desc: "We only print when an order is placed — no upfront stock costs." },
  { icon: Globe,     title: "Nationwide Shipping",   desc: "We ship your customers' orders anywhere in the US under your brand." },
  { icon: Printer,   title: "Premium Quality Print", desc: "Every item is produced on our professional equipment to the same high standards as bulk orders." },
  { icon: RefreshCw, title: "Auto Fulfilment",       desc: "Connect your store and orders flow directly to us for production and dispatch." },
];

export default function PrintOnDemandPage() {
  return (
    <main className="w-full bg-white min-h-screen">
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-20 px-6 md:px-20">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest w-fit">Services</span>
          <h1 className="text-4xl md:text-5xl font-bold font-['Outfit'] text-slate-900 max-w-2xl leading-tight">Print on Demand</h1>
          <p className="text-slate-500 text-lg font-['Inter'] leading-8 max-w-xl">Launch a custom merchandise store without the overhead. We print, pack, and ship each order as it comes in — under your brand.</p>
          <a href="mailto:sales@buttoninks.com?subject=Print on Demand Enquiry" className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] transition-all w-fit">Talk to Us</a>
        </div>
      </section>

      <section className="w-full px-6 md:px-20 py-20 bg-gray-50">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(b => (
            <div key={b.title} className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center"><b.icon className="w-6 h-6 text-green-700" /></div>
              <h3 className="font-bold font-['Outfit'] text-slate-900">{b.title}</h3>
              <p className="text-slate-500 text-sm font-['Inter'] leading-6">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full px-6 md:px-20 py-20 text-center">
        <div className="max-w-[600px] mx-auto flex flex-col gap-6">
          <h2 className="text-3xl font-bold font-['Outfit'] text-slate-900">Ready to Launch?</h2>
          <p className="text-slate-500 font-['Inter'] leading-7">Tell us about your store and product requirements. We will set up a fulfilment workflow that works for your business.</p>
          <a href="mailto:sales@buttoninks.com?subject=Print on Demand Setup" className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] transition-all w-fit mx-auto">Contact Us</a>
        </div>
      </section>
    </main>
  );
}
