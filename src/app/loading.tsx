import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Rolling/Spinning Animation */}
        <div className="relative">
          <Loader2 className="w-12 h-12 text-green-700 animate-spin" strokeWidth={1.5} />
          <div className="absolute inset-0 w-12 h-12 border-4 border-green-700/10 rounded-full" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-green-700 font-bold font-['Outfit'] text-lg animate-pulse">
            ButtonInks
          </p>
          <p className="text-gray-400 text-xs font-medium font-['Inter'] uppercase tracking-widest">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}
