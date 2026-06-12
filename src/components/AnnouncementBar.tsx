export default function AnnouncementBar() {
  return (
    <div className="w-full h-8 px-4 py-1.5 bg-green-700 flex flex-col justify-center items-center shrink-0">
      <p className="text-center text-white text-xs font-normal leading-5" style={{ fontFamily: "var(--font-inter)" }}>
        🚀 Free shipping on orders over $75 · Use code{" "}
        <strong className="font-bold">PRINT15</strong>
        {" "}for 15% off your first order
      </p>
    </div>
  );
}
