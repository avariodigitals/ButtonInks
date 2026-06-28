import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <Loader2 className="w-10 h-10 text-green-700 animate-spin" strokeWidth={1.5} />
    </div>
  );
}
