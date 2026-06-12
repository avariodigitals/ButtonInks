import React from 'react';
import { Truck, ShieldCheck, Lock, Landmark } from 'lucide-react';

const WhyChooseUs = () => {
  return (
    <section className="self-stretch px-20 py-10 bg-stone-50 flex flex-col justify-start items-start gap-10">
      <div className="self-stretch flex flex-col justify-start items-center gap-10">

        {/* Heading */}
        <div className="self-stretch flex flex-col justify-start items-center gap-4">
          <div className="px-4 py-[5px] bg-emerald-500/10 rounded-[20px] inline-flex justify-center items-center gap-2.5">
            <div className="text-center text-green-700 text-xs font-bold font-['Inter'] uppercase leading-5 tracking-wide">
              Simple Process
            </div>
          </div>
          <h2 className="text-center text-slate-900 text-4xl font-semibold font-['Outfit'] leading-10">
            Why Choose Us
          </h2>
          <div className="w-full max-w-[480px]">
            <p className="text-center text-slate-500 text-base font-normal font-['Inter'] leading-6">
              At button inks we pride ourselves in delivering top notch printing services that exceeds customer expectations
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="self-stretch flex flex-col justify-start items-start">
          <div className="self-stretch inline-flex justify-center items-start gap-6">

            {/* Feature 1 */}
            <div className="flex-1 p-4 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-300 inline-flex flex-col justify-start items-start gap-4">
              <div className="w-12 h-12 bg-cyan-900/10 rounded-xl outline outline-[1.31px] outline-offset-[-1.31px] outline-cyan-900/10 inline-flex justify-center items-center">
                <Truck className="w-6 h-6 text-cyan-900" />
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className="self-stretch text-slate-900 text-base font-semibold font-['Outfit'] leading-5">2–5 Day Delivery</div>
                <div className="self-stretch text-gray-400 text-xs font-normal font-['Inter'] leading-5">Fast production & nationwide shipping</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex-1 p-4 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-300 inline-flex flex-col justify-start items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl outline outline-[1.31px] outline-offset-[-1.31px] outline-emerald-500/10 inline-flex justify-center items-center">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className="text-slate-900 text-base font-semibold font-['Outfit'] leading-5">100% Quality Guarantee</div>
                <div className="self-stretch text-gray-400 text-xs font-normal font-['Inter'] leading-5">We reprint or refund, no questions</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex-1 p-4 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-300 inline-flex flex-col justify-start items-start gap-4">
              <div className="w-12 h-12 bg-orange-600/10 rounded-xl outline outline-[1.31px] outline-offset-[-1.31px] outline-orange-600/10 inline-flex justify-center items-center">
                <Lock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className="text-slate-900 text-base font-semibold font-['Outfit'] leading-5">Secure Checkout</div>
                <div className="self-stretch text-gray-400 text-xs font-normal font-['Inter'] leading-5">256-bit SSL · All major cards accepted</div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex-1 p-4 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-300 inline-flex flex-col justify-start items-start gap-4">
              <div className="w-12 h-12 bg-violet-500/10 rounded-xl outline outline-[1.31px] outline-offset-[-1.31px] outline-violet-500/10 inline-flex justify-center items-center">
                <Landmark className="w-6 h-6 text-violet-500" />
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className="text-slate-900 text-base font-semibold font-['Outfit'] leading-5">Bulk Order Savings</div>
                <div className="self-stretch text-gray-400 text-xs font-normal font-['Inter'] leading-5">Save up to 40% on large orders</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
