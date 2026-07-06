import Link from "next/link";
import { RotateCcw, CheckCircle2, XCircle, Clock } from "lucide-react";

export const metadata = { title: "Start a Return | ButtonInks", description: "Our returns and refund policy. Learn what is eligible for a return and how to start the process." };

const eligible = ["Defective or damaged items", "Wrong item received", "Significant colour mismatch from approved proof", "Items missing from your order"];
const notEligible = ["Custom items produced to your specification (correct proof approved)", "Items damaged after delivery", "Change of mind on custom orders", "Orders placed more than 30 days ago"];

export default function ReturnsPage() {
  return (
    <main className="w-full bg-white min-h-screen">
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-16 px-6 md:px-20">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-4">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest w-fit">Returns</span>
          <h1 className="text-4xl md:text-5xl font-bold font-['Outfit'] text-slate-900">Start a Return</h1>
          <p className="text-slate-500 text-base font-['Inter'] leading-7 max-w-xl">We stand behind every product we ship. If something is wrong, we will make it right.</p>
        </div>
      </section>

      <section className="w-full px-6 md:px-20 py-16">
        <div className="max-w-[800px] mx-auto flex flex-col gap-12">

          {/* Process */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold font-['Outfit'] text-slate-900">How the Process Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Clock,         step: "1", title: "Contact Us",       desc: "Email info@buttoninks.com within 30 days of delivery with your order number and photos." },
                { icon: RotateCcw,     step: "2", title: "We Review",        desc: "Our team reviews your claim within 1–2 business days and confirms eligibility." },
                { icon: CheckCircle2,  step: "3", title: "Resolution",       desc: "We offer a reprint, store credit, or refund depending on the issue." },
              ].map(item => (
                <div key={item.step} className="bg-gray-50 rounded-2xl p-6 flex flex-col gap-3 border border-gray-100">
                  <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold font-['Inter']">{item.step}</div>
                  <item.icon className="w-6 h-6 text-green-700" />
                  <h3 className="font-bold font-['Outfit'] text-slate-900">{item.title}</h3>
                  <p className="text-slate-500 text-sm font-['Inter'] leading-6">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Eligible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold font-['Outfit'] text-slate-900 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Eligible for Return</h3>
              <ul className="flex flex-col gap-2">
                {eligible.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-600 font-['Inter']">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold font-['Outfit'] text-slate-900 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-500" /> Not Eligible</h3>
              <ul className="flex flex-col gap-2">
                {notEligible.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-600 font-['Inter']">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-green-50 rounded-2xl p-8 flex flex-col gap-4 border border-green-100">
            <h3 className="text-xl font-bold font-['Outfit'] text-slate-900">Ready to Submit a Return?</h3>
            <p className="text-slate-600 text-sm font-['Inter'] leading-6">Email us at <a href="mailto:info@buttoninks.com" className="text-green-700 font-bold hover:underline">info@buttoninks.com</a> with your order number and photos of the issue. We typically respond within 1–2 business days.</p>
            <a href="mailto:info@buttoninks.com?subject=Return Request" className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] text-sm transition-all w-fit">
              Email Us Now
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
