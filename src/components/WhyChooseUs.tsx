import React from 'react';
import { Truck, ShieldCheck, Lock, Landmark } from 'lucide-react';

const WhyChooseUs = () => {
  return (
    <section className="w-full px-6 py-16 md:px-20 md:py-20 bg-stone-50 flex flex-col justify-start items-center gap-10">
      <div className="w-full max-w-[1280px] flex flex-col justify-start items-center gap-10">

        {/* Heading */}
        <div className="w-full flex flex-col justify-start items-center gap-4">
          <div className="px-4 py-[5px] bg-emerald-500/10 rounded-[20px] inline-flex justify-center items-center gap-2.5">
            <div className="text-center text-green-700 text-xs font-bold font-['Inter'] uppercase leading-5 tracking-wide">
              Why Us?
            </div>
          </div>
          <h2 className="text-center text-slate-900 text-3xl md:text-4xl font-semibold font-['Outfit'] leading-tight md:leading-10">
            Why Choose Us
          </h2>
          <div className="w-full max-w-[480px]">
            <p className="text-center text-slate-500 text-base font-normal font-['Inter'] leading-6">
              At Button Inks, we pride ourselves on delivering top-notch printing services that exceed customer expectations.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-start items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-cyan-900/10 rounded-xl flex justify-center items-center">
              <Truck className="w-6 h-6 text-cyan-900" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-slate-900 text-lg font-semibold font-['Outfit']">2–5 Day Delivery</div>
              <div className="text-slate-500 text-sm font-normal font-['Inter']">Fast production & nationwide shipping</div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-start items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex justify-center items-center">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-slate-900 text-lg font-semibold font-['Outfit']">100% Quality Guarantee</div>
              <div className="text-slate-500 text-sm font-normal font-['Inter']">We reprint or refund, no questions asked</div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-start items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-600/10 rounded-xl flex justify-center items-center">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-slate-900 text-lg font-semibold font-['Outfit']">Secure Checkout</div>
              <div className="text-slate-500 text-sm font-normal font-['Inter']">256-bit SSL encryption on all orders</div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-start items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex justify-center items-center">
              <Landmark className="w-6 h-6 text-violet-500" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-slate-900 text-lg font-semibold font-['Outfit']">Bulk Order Savings</div>
              <div className="text-slate-500 text-sm font-normal font-['Inter']">Save up to 40% on high-volume orders</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
