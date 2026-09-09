import React from 'react';

/**
 * Clean SVG Barcode Component
 * Generates deterministic vertical barcode lines (varying widths)
 * and displays the code number underneath.
 */
export default function Barcode({ 
  value = 'ANSAR-VIP-7861-2026', 
  className = '', 
  height = 42,
  barColor = 'currentColor',
  showText = true,
  textColor = 'text-slate-700'
}) {
  // Generate deterministic bar widths based on input string
  const bars = [];
  
  // Guard start (3 bars)
  bars.push({ width: 2.2, space: 1.2 });
  bars.push({ width: 1.2, space: 2.2 });
  bars.push({ width: 1.8, space: 1.4 });

  // Data pattern from characters
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const w1 = ((code * 7) % 3) + 1.2;
    const s1 = ((code * 3) % 2) + 1.1;
    const w2 = (((code >> 2) * 5) % 3) + 1.1;
    const s2 = (((code >> 1) * 3) % 2) + 1.2;
    bars.push({ width: Number(w1.toFixed(1)), space: Number(s1.toFixed(1)) });
    bars.push({ width: Number(w2.toFixed(1)), space: Number(s2.toFixed(1)) });
  }

  // Guard stop (3 bars)
  bars.push({ width: 1.5, space: 1.2 });
  bars.push({ width: 2.4, space: 1.5 });
  bars.push({ width: 1.8, space: 0 });

  let currentX = 0;
  const rects = bars.map((b, idx) => {
    const rect = (
      <rect
        key={`b-${idx}`}
        x={currentX}
        y={0}
        width={b.width}
        height={height}
        fill={barColor}
      />
    );
    currentX += b.width + b.space;
    return rect;
  });

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${currentX} ${height}`}
        className="w-full h-8 sm:h-9"
        preserveAspectRatio="none"
      >
        {rects}
      </svg>
      {showText && (
        <span className={`text-[10px] sm:text-[11px] font-mono tracking-widest font-black mt-1 ${textColor}`}>
          * {value} *
        </span>
      )}
    </div>
  );
}
