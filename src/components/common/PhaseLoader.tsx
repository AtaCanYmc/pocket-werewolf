import React from 'react';
import { Moon } from 'lucide-react';

export default function PhaseLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[350px] p-6 text-center animate-in fade-in duration-300">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-2 border-blood/30 border-t-blood animate-spin" />
        <Moon className="w-6 h-6 text-blood/70 absolute inset-0 m-auto animate-pulse" />
      </div>
      <p className="mt-4 text-xs sm:text-sm font-medium text-slate-400">
        Loading phase...
      </p>
    </div>
  );
}
