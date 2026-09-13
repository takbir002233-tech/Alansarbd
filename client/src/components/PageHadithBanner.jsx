import React from 'react';
import { Sparkles } from 'lucide-react';

export default function PageHadithBanner({ 
  text, 
  defaultText, 
  className = "" 
}) {
  const displayText = text && text.trim() ? text.trim() : defaultText;

  if (!displayText) return null;

  return (
    <div className={`animate-category-grand inline-flex items-center justify-center ${className}`}>
      <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-1 rounded-xl bg-gradient-to-r from-[#031d16] via-[#062c21] to-[#031d16] border border-amber-400/80 animate-aura-pulse shadow-xs max-w-full">
        <Sparkles className="w-3 h-3 text-amber-300 animate-spin-slow flex-shrink-0" />
        <span className="text-amber-400 text-[10px] sm:text-xs font-black select-none flex-shrink-0">✦</span>
        
        <p className="text-[10px] sm:text-[11px] md:text-xs font-black animate-gold-gleam leading-tight tracking-tight drop-shadow-md truncate select-none max-w-[260px] sm:max-w-md md:max-w-xl">
          {displayText}
        </p>

        <span className="text-amber-400 text-[10px] sm:text-xs font-black select-none flex-shrink-0">✦</span>
        <Sparkles className="w-3 h-3 text-amber-300 animate-spin-reverse-slow flex-shrink-0" />
      </div>
    </div>
  );
}
