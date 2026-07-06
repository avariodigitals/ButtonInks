import Link from "next/link";
import { Pen, Image, FileText, Zap } from "lucide-react";

export const metadata = { title: "Graphics Design Service | ButtonInks", description: "Professional graphic design for custom print projects — logos, apparel artwork, banners, and more." };

const offerings = [
  { icon: Pen,      title: "Logo Design",           desc: "Brand new logos or refreshes — delivered in all formats (AI, PNG, PDF, SVG)." },
  { icon: Image,    title: "Apparel Artwork",        desc: "Custom print-ready artwork for t-shirts, hoodies, caps, and bags." },
  { icon: FileText, title: "Banner & Sign Layouts",  desc: "Roll-up banners, trade show displays, and promotional signage." },
  { icon: Zap,      title: "Rush Design",            desc: "Need it fast? We offer same-day and next-day turnaround on most design projects." },
];

export default function GraphicsDesignPage() {
  return (
    <main className="w-full bg-white min-h-screen">
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-20 px-6 md:px-20">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest w-fit">Services</span>
          <h1 className="text-4xl md:text-5xl font-bold font-['Outfit'] text-slate-900 max-w-2xl leading-tight">Graphics Design</h1>
          <p className="text-slate-500 text-lg font-['Inter'] leading-8 max-w-xl">No artwork? No problem. Our in-house design team creates professional, print-ready graphics tailored to your brand.</p>
          <a href="mailto:sales@buttoninks.com?subject=Design Request" className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] transition-all w-fit">Request a Design</a>
        </div>
      </section>

      <section className="w-full px-6 md:px-20 py-20 bg-gray-50">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerings.map(o => (
            <div key={o.title} className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center"><o.icon className="w-6 h-6 text-green-700" /></div>
              <h3 className="font-bold font-['Outfit'] text-slate-900">{o.title}</h3>
              <p className="text-slate-500 text-sm font-['Inter'] leading-6">{o.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full px-6 md:px-20 py-20">
        <div className="max-w-[700px] mx-auto text-center flex flex-col gap-6">
          <h2 className="text-3xl font-bold font-['Outfit'] text-slate-900">How It Works</h2>
          <ol className="text-left flex flex-col gap-4">
            {["Send us a brief — describe your vision, brand colours, and what you need.", "We send a first draft within 1–2 business days.", "You review and request up to 3 rounds of revisions.", "We deliver print-ready files in all required formats."]
              .map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-green-700 text-white font-bold font-['Inter'] flex items-center justify-center shrink-0 text-sm">{i + 1}</span>
                  <p className="text-slate-600 font-['Inter'] text-sm leading-7 pt-1">{step}</p>
                </li>
              ))}
          </ol>
          <a href="mailto:sales@buttoninks.com?subject=Graphics Design Request" className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] transition-all w-fit mx-auto mt-4">Get Started</a>
        </div>
      </section>
    </main>
  );
}
