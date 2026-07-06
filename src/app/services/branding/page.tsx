import Link from "next/link";
import { Layers, Palette, Tag, Truck } from "lucide-react";

export const metadata = { title: "Branding Service | ButtonInks", description: "Full-service brand merchandise solutions for businesses of all sizes." };

const services = [
  { icon: Palette, title: "Logo Embroidery & Print", desc: "Your logo applied consistently across polo shirts, caps, bags, and more." },
  { icon: Layers,  title: "Branded Packaging",       desc: "Custom tissue paper, boxes, bags, and inserts that reinforce your brand at unboxing." },
  { icon: Tag,     title: "Custom Labels & Tags",    desc: "Woven labels, hang tags, and care labels with your brand identity." },
  { icon: Truck,   title: "Drop Shipping",           desc: "We store and ship your branded merchandise directly to your customers." },
];

export default function BrandingServicePage() {
  return (
    <main className="w-full bg-white min-h-screen">
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-20 px-6 md:px-20">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest w-fit">Services</span>
          <h1 className="text-4xl md:text-5xl font-bold font-['Outfit'] text-slate-900 max-w-2xl leading-tight">Branding Service</h1>
          <p className="text-slate-500 text-lg font-['Inter'] leading-8 max-w-xl">We help you build a cohesive brand across every physical touchpoint — clothing, packaging, signage, and gifts.</p>
          <a href="mailto:sales@buttoninks.com" className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] transition-all w-fit">Get a Free Consultation</a>
        </div>
      </section>

      <section className="w-full px-6 md:px-20 py-20 bg-gray-50">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {services.map(s => (
            <div key={s.title} className="bg-white rounded-2xl p-8 flex flex-col gap-4 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center"><s.icon className="w-6 h-6 text-green-700" /></div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-900">{s.title}</h3>
              <p className="text-slate-500 font-['Inter'] leading-7">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full px-6 md:px-20 py-20 text-center">
        <div className="max-w-[600px] mx-auto flex flex-col gap-6">
          <h2 className="text-3xl font-bold font-['Outfit'] text-slate-900">Let&apos;s Build Your Brand Together</h2>
          <p className="text-slate-500 font-['Inter'] leading-7">Tell us about your brand and what you need — we will create a package that fits your budget and timeline.</p>
          <a href="mailto:sales@buttoninks.com?subject=Branding Enquiry" className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] transition-all w-fit mx-auto">Start a Conversation</a>
        </div>
      </section>
    </main>
  );
}
