export default function AnnouncementBar() {
  return (
    <div className="w-full min-h-[48px] px-6 py-2.5 bg-green-700 flex items-center justify-center shrink-0 z-[60] relative border-b border-white/5 shadow-sm">
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
        <p className="text-center text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-tight">
          Free shipping on orders over $75
        </p>
        <span className="hidden sm:inline text-white/30 font-light">|</span>
        <div className="flex items-center gap-2">
          <p className="text-center text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-tight">
            Use code
          </p>
          <span className="bg-white text-green-700 px-2 py-0.5 rounded-md font-black text-[11px] sm:text-xs shadow-[0_2px_4px_rgba(0,0,0,0.1)] transform hover:scale-105 transition-transform cursor-default">
            PRINT15
          </span>
          <p className="text-center text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-tight">
            for 15% off
          </p>
        </div>
      </div>

      {/* Professional subtle highlight overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
    </div>
  );
}
