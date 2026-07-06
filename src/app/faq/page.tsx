import { ChevronDown } from "lucide-react";

export const metadata = { title: "Shipping FAQ | ButtonInks", description: "Answers to common questions about shipping, delivery times, and order tracking at ButtonInks." };

const faqs = [
  { q: "How long does production take?",         a: "Standard production is 3–5 business days. Urgent/Express production is 1–2 business days and carries an additional fee. Production time does not include shipping time." },
  { q: "What shipping options are available?",   a: "We ship via USPS Priority Mail (1–3 business days) and USPS Ground Advantage (2–5 business days). Rates are calculated at checkout based on your order size and destination." },
  { q: "Do you ship internationally?",           a: "Currently we ship within the United States only. International shipping options are coming soon — contact us for special arrangements." },
  { q: "How do I track my order?",               a: "Once your order ships you will receive an email with a tracking number. You can also log in to your account and view tracking under Order History." },
  { q: "What if my order arrives damaged?",      a: "Take photos immediately and email info@buttoninks.com within 7 days of delivery. We will arrange a reprint or refund promptly." },
  { q: "Can I change my shipping address?",      a: "Address changes are only possible before production begins. Contact us as soon as possible at info@buttoninks.com if you need to update your delivery address." },
  { q: "Do you offer free shipping?",            a: "We offer free shipping on orders over $75. Orders below that threshold are charged standard USPS rates at checkout." },
  { q: "What happens if my package is lost?",    a: "If your tracking shows no movement for more than 7 business days, contact us and we will file a claim with USPS and arrange a replacement." },
];

export default function FAQPage() {
  return (
    <main className="w-full bg-white min-h-screen">
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-16 px-6 md:px-20">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-4">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest w-fit">Help</span>
          <h1 className="text-4xl md:text-5xl font-bold font-['Outfit'] text-slate-900">Shipping FAQ</h1>
          <p className="text-slate-500 text-base font-['Inter'] leading-7 max-w-xl">Everything you need to know about how we ship your orders.</p>
        </div>
      </section>

      <section className="w-full px-6 md:px-20 py-16">
        <div className="max-w-[800px] mx-auto flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-bold text-slate-900 font-['Outfit'] text-base hover:text-green-700 transition-colors">
                {faq.q}
                <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-5 text-slate-600 text-sm font-['Inter'] leading-7 border-t border-gray-50 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        <div className="max-w-[800px] mx-auto mt-12 bg-green-50 rounded-2xl p-8 border border-green-100 text-center flex flex-col gap-4">
          <h3 className="text-xl font-bold font-['Outfit'] text-slate-900">Still have questions?</h3>
          <p className="text-slate-500 text-sm font-['Inter']">Our team is happy to help. Reach out any time.</p>
          <a href="mailto:info@buttoninks.com" className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl font-['Inter'] text-sm transition-all w-fit mx-auto">
            Email Us
          </a>
        </div>
      </section>
    </main>
  );
}
