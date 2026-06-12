import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const FooterCTA = () => {
  return (
    <div className="w-full px-6 py-20 relative bg-gradient-to-br from-green-700 to-green-900 flex flex-col justify-start items-center overflow-hidden">
      <div className="relative z-10 w-full max-w-[800px] flex flex-col justify-center items-center gap-8">
        <h2 className="text-center text-white text-5xl font-bold font-['Outfit'] leading-[1.1]">
          Ready to Bring Your Brand to Life?
        </h2>
        <p className="text-center text-white/80 text-lg font-normal font-['Inter'] leading-7 max-w-[520px]">
          Start designing in minutes. No design experience needed. Free templates, instant previews, fast delivery.
        </p>

        <div className="w-full max-w-[500px] inline-flex flex-wrap justify-center items-center gap-6 mt-2">
          <Link
            href="/design"
            className="px-9 py-4 bg-white rounded-xl flex justify-start items-center gap-2 hover:bg-zinc-100 transition-colors"
          >
            <span className="text-center text-green-700 text-base font-semibold font-['Inter'] leading-6">
              Start Designing Free
            </span>
          </Link>

          <Link
            href="/products"
            className="px-7 py-4 bg-white/10 rounded-xl outline outline-[1px] outline-white/30 flex justify-start items-center gap-2 hover:bg-white/20 transition-colors"
          >
            <span className="text-center text-white text-base font-semibold font-['Inter'] leading-6">
              Browse Products
            </span>
            <Plus className="w-4 h-4 text-white" />
          </Link>
        </div>

        <div className="text-center text-white/80 text-xs font-normal font-['Inter'] leading-5">
          No credit card required · Free design tools · Ships in 2–5 days
        </div>
      </div>

      {/* Decorative circles */}
      <div className="w-96 h-96 right-[-100px] top-[-100px] absolute bg-white/5 rounded-full pointer-events-none" />
      <div className="w-72 h-72 left-[-100px] bottom-[-50px] absolute bg-black/5 rounded-full pointer-events-none" />
    </div>
  );
};

export default FooterCTA;
