import React from 'react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    text: "ButtonInks completely transformed how we handle branded merchandise. The quality is outstanding and delivery is always on time. Our team loves the new uniforms.",
    author: "Sarah Chen",
    role: "Marketing Director · TechCorp Inc.",
    image: "https://placehold.co/44x44"
  },
  {
    text: "Ordered 200 shirts for our summer retreat and the process was seamless. The design tool made it easy to create something our youth group is proud to wear.",
    author: "Marcus Johnson",
    role: "Youth Pastor · Grace Community Church",
    image: "https://placehold.co/44x44"
  },
  {
    text: "We've used ButtonInks for 3 major corporate events. The bulk pricing is unbeatable and their rush printing saved us when we had a last-minute order change.",
    author: "Lisa Rodriguez",
    role: "Event Coordinator · Premier Events Co.",
    image: "https://placehold.co/44x44"
  }
];

const Testimonials = () => {
  return (
    <section className="w-full py-20 bg-white flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-[1280px] flex flex-col justify-center items-center gap-10">

        {/* Header */}
        <div className="self-stretch flex flex-col justify-start items-center gap-4">
          <div className="px-4 py-[5px] bg-green-50 rounded-[20px] inline-flex justify-center items-center gap-2.5">
            <span className="text-center text-green-700 text-xs font-bold font-['Inter'] uppercase leading-5 tracking-wide">
              Testimonials
            </span>
          </div>
          <h2 className="self-stretch text-center text-slate-900 text-4xl font-semibold font-['Outfit'] leading-10">
            50,000+ Happy Customers
          </h2>
        </div>

        {/* Testimonials Content */}
        <div className="flex flex-col justify-start items-center gap-6 w-full">
          {/* Row 1 - Marquee-like or static grid */}
          <div className="w-full overflow-hidden">
            <div className="flex justify-center items-stretch gap-7 px-4">
              {testimonials.map((t, i) => (
                <div key={i} className="flex-1 min-w-[300px] max-w-[410px] p-6 bg-white rounded-2xl shadow-[0px_2px_12px_0px_rgba(13,27,46,0.04)] outline outline-[1.31px] outline-offset-[-1.31px] outline-slate-900/5 flex flex-col justify-start items-start gap-4">
                  <Quote className="w-6 h-6 text-slate-100 fill-slate-100 rotate-180" />
                  <p className="self-stretch text-gray-700 text-base font-normal font-['Inter'] leading-7">
                    &quot;{t.text}&quot;
                  </p>
                  <div className="self-stretch inline-flex justify-start items-center gap-3 mt-auto">
                    <img className="w-11 h-11 rounded-full object-cover" src={t.image} alt={t.author} />
                    <div className="flex flex-col justify-start items-start">
                      <span className="text-slate-900 text-sm font-bold font-['Inter'] leading-5">{t.author}</span>
                      <span className="text-gray-400 text-xs font-normal font-['Inter'] leading-4">{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 - Slightly offset or more items as requested in user's large HTML block */}
          <div className="w-full overflow-hidden">
             <div className="flex justify-center items-stretch gap-7 px-4">
              {[...testimonials, testimonials[0]].map((t, i) => (
                <div key={`row2-${i}`} className="flex-1 min-w-[300px] max-w-[410px] p-6 bg-white rounded-2xl shadow-[0px_2px_12px_0px_rgba(13,27,46,0.04)] outline outline-[1.31px] outline-offset-[-1.31px] outline-slate-900/5 flex flex-col justify-start items-start gap-4">
                  <Quote className="w-6 h-6 text-slate-100 fill-slate-100 rotate-180" />
                  <p className="self-stretch text-gray-700 text-base font-normal font-['Inter'] leading-7">
                    &quot;{t.text}&quot;
                  </p>
                  <div className="self-stretch inline-flex justify-start items-center gap-3 mt-auto">
                    <img className="w-11 h-11 rounded-full object-cover" src={t.image} alt={t.author} />
                    <div className="flex flex-col justify-start items-start">
                      <span className="text-slate-900 text-sm font-bold font-['Inter'] leading-5">{t.author}</span>
                      <span className="text-gray-400 text-xs font-normal font-['Inter'] leading-4">{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
