import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const FooterCTA = () => {
  return (
    <section className="w-full px-6 py-16 md:py-24 relative bg-gradient-to-br from-green-700 to-green-900 flex flex-col justify-start items-center overflow-hidden">
      <div className="relative z-10 w-full max-w-[800px] flex flex-col justify-center items-center gap-6 md:gap-8">
        <h2 className="text-center text-white text-3xl md:text-5xl font-bold font-['Outfit'] leading-tight">
          Ready to Bring Your Brand to Life?
        </h2>
        <p className="text-center text-white/80 text-base md:text-lg font-normal font-['Inter'] leading-relaxed max-w-[520px]">
          Start designing in minutes. No design experience needed. Free templates, instant previews, fast delivery.
        </p>

        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 mt-4">
          <Link
            href="/design"
            className="w-full sm:w-auto px-8 md:px-9 py-4 bg-white rounded-xl flex justify-center items-center gap-2 hover:bg-zinc-100 transition-colors"
          >
            <span className="text-center text-green-700 text-base font-semibold font-['Inter'] leading-6">
              Start Designing Free
            </span>
          </Link>

          <Link
            href="/categories"
            className="w-full sm:w-auto px-8 md:px-7 py-4 bg-white/10 rounded-xl outline outline-1 outline-white/30 flex justify-center items-center gap-2 hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            <span className="text-center text-white text-base font-semibold font-['Inter'] leading-6">
              Browse Products
            </span>
            <Plus className="w-4 h-4 text-white" />
          </Link>
        </div>

        <div className="text-center text-white/70 text-[10px] md:text-xs font-normal font-['Inter'] leading-5 tracking-wide uppercase">
          No credit card required · Free design tools · Ships in 2–5 days
        </div>
      </div>

      {/* Decorative circles */}
      <div className="w-96 h-96 right-[-100px] top-[-100px] absolute bg-white/5 rounded-full pointer-events-none" />
      <div className="w-72 h-72 left-[-100px] bottom-[-50px] absolute bg-black/5 rounded-full pointer-events-none" />
    </section>
  );
};

export default FooterCTA;
