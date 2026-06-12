import Link from "next/link";
import { ArrowRight, FileText, Upload, Eye, Truck } from "lucide-react";

// ── Step data ─────────────────────────────────────────────────────────────────
const steps = [
  {
    number:      "1",
    icon:        FileText,
    iconColor:   "text-cyan-900",
    badgeBg:     "bg-cyan-900",
    circleBg:    "bg-slate-100",
    circleRing:  "outline-cyan-900/10",
    title:       "Choose Your Product",
    description: "Browse 500+ customizable products across apparel, print, promo, and packaging.",
  },
  {
    number:      "2",
    icon:        Upload,
    iconColor:   "text-orange-600",
    badgeBg:     "bg-orange-600",
    circleBg:    "bg-orange-50",
    circleRing:  "outline-orange-600/10",
    title:       "Upload or Create Design",
    description: "Use our online editor with templates, or upload your own artwork in any format.",
  },
  {
    number:      "3",
    icon:        Eye,
    iconColor:   "text-emerald-500",
    badgeBg:     "bg-emerald-500",
    circleBg:    "bg-green-50",
    circleRing:  "outline-emerald-500/10",
    title:       "Review 3D Mockup",
    description: "See exactly how your product will look with our real-time preview tool.",
  },
  {
    number:      "4",
    icon:        Truck,
    iconColor:   "text-violet-500",
    badgeBg:     "bg-violet-500",
    circleBg:    "bg-fuchsia-50",
    circleRing:  "outline-violet-500/10",
    title:       "We Print & Ship Fast",
    description: "Expert printing with quality checks, delivered in 2–5 business days.",
    bold:        true,
  },
];

// ── Section ───────────────────────────────────────────────────────────────────
export default function SimpleProcess() {
  return (
    <section className="w-full p-20 bg-neutral-50 flex flex-col justify-start items-start gap-10">
      <div className="w-full flex flex-col justify-start items-center gap-10">

        {/* ── Heading block ── */}
        <div className="w-full flex flex-col items-center gap-4">
          {/* Badge */}
          <div className="px-4 py-[5px] bg-emerald-500/10 rounded-[20px] inline-flex justify-center items-center gap-2.5">
            <span
              className="text-center text-green-700 text-xs font-bold uppercase leading-5 tracking-wide"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Simple Process
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-center text-slate-900 text-4xl font-semibold leading-10"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Ordering Is Ridiculously Easy
          </h2>

          {/* Subtitle */}
          <p
            className="text-center text-slate-500 text-base font-normal leading-6 max-w-[480px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            From concept to delivery in four simple steps. No design experience needed.
          </p>
        </div>

        {/* ── Steps row ── */}
        <div className="w-full relative flex justify-center items-start">

          {/* Connecting gradient line — sits behind the icons */}
          <div
            className="absolute top-[39.24px] left-[194px] right-[194px] h-0.5 opacity-20"
            style={{
              background: "linear-gradient(to right, #94a3b8, #15803d)",
            }}
          />

          <div className="w-full flex justify-center items-start gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex-1 flex flex-col items-start gap-4"
                >
                  {/* Icon circle + number badge */}
                  <div className="w-full flex justify-center">
                    <div className={`relative w-20 h-20 ${step.circleBg} rounded-full outline outline-[1.31px] outline-offset-[-1.31px] ${step.circleRing} flex items-center justify-center`}>
                      {/* Lucide icon */}
                      <Icon className={`w-8 h-8 ${step.iconColor}`} strokeWidth={2} />

                      {/* Numbered badge */}
                      <div className={`absolute -top-[2.69px] -right-[5.31px] w-6 h-6 ${step.badgeBg} rounded-xl flex items-center justify-center`}>
                        <span
                          className="text-center text-white text-[10px] font-extrabold leading-4"
                          style={{ fontFamily: "var(--font-outfit)" }}
                        >
                          {step.number}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step title */}
                  <p
                    className={`w-full text-center text-slate-900 text-base leading-5 ${step.bold ? "font-bold" : "font-medium"}`}
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {step.title}
                  </p>

                  {/* Step description */}
                  <p
                    className="w-full text-center text-slate-500 text-sm font-normal leading-6"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CTA button ── */}
        <div className="flex justify-center w-full">
          <Link
            href="/design"
            className="h-12 px-7 py-3.5 bg-green-700 rounded-[10px] inline-flex items-center gap-2 hover:bg-green-600 active:scale-95 transition-all"
          >
            <span
              className="text-center text-white text-base font-bold leading-6"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Start Your First Order
            </span>
            <ArrowRight className="w-4 h-4 text-white" strokeWidth={1.33} />
          </Link>
        </div>

      </div>
    </section>
  );
}
