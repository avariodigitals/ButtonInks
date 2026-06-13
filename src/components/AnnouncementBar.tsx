export default function AnnouncementBar() {
  return (
    <div className="w-full min-h-[40px] px-4 py-2.5 bg-green-700 flex flex-col justify-center items-center shrink-0">
      <p className="text-center text-white text-[11px] sm:text-sm font-medium leading-tight tracking-wide font-['Inter']">
        Free shipping on orders over $75 · Use code{" "}
        <span className="font-bold underline decoration-white/30 underline-offset-2">PRINT15</span>
        {" "}for 15% off your first order
      </p>
    </div>
  );
}
