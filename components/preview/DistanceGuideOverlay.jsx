'use client';

import React from 'react';
import { useVocab } from '../../context/VocabContext';

/**
 * DistanceGuideOverlay
 * Renders real-time Canva/Figma-style smart alignment guides,
 * vertical/horizontal distance dimension scales, center snapping line,
 * and edge ruler while dragging any element in the preview.
 * Fully marked with data-export-ignore="true".
 */
export default function DistanceGuideOverlay({ activeDragInfo, containerHeight = 736 }) {
  const { lang } = useVocab();
  if (!activeDragInfo) return null;

  const {
    id,
    label,
    x = 0,
    y = 0,
    top = 0,
    bottom = 0,
    left = 0,
    right = 0,
    width = 0,
    height = 0,
    isNearCenter = false
  } = activeDragInfo;

  return (
    <div
      id="distance-guide-overlay"
      data-export-ignore="true"
      className="absolute inset-0 pointer-events-none z-40 overflow-hidden"
    >
      {/* 1. Center Vertical Axis Guide Line (Snaps to 0px) */}
      <div
        className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 transition-colors duration-100 ${
          isNearCenter
            ? 'w-[2px] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]'
            : 'w-[1px] border-l border-dashed border-indigo-400/50'
        }`}
      >
        {/* Center Badge Indicator */}
        <div
          className={`absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase shadow-xs transition-all ${
            isNearCenter
              ? 'bg-indigo-600 text-white scale-105 ring-2 ring-white/60'
              : 'bg-black/60 text-indigo-200'
          }`}
        >
          {isNearCenter ? (lang === 'th' ? 'กึ่งกลาง 0px' : 'Center 0px') : (lang === 'th' ? 'กึ่งกลาง' : 'Center')}
        </div>
      </div>

      {/* 2. Top Edge Distance Measurement Ruler Line */}
      {top > 25 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none"
          style={{ top: 0, height: `${top}px` }}
        >
          {/* Top Line */}
          <div className="w-[1px] h-full bg-indigo-400/70 border-l border-dashed border-indigo-500" />
          {/* Top Distance Badge */}
          <div className="absolute top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-indigo-950/80 text-white text-[9px] font-mono font-semibold backdrop-blur-xs border border-indigo-400/40 shadow-xs flex items-center gap-1">
            <span className="text-indigo-300">{lang === 'th' ? 'บน' : 'Top'}</span>
            <span>{Math.max(0, top)}px</span>
          </div>
        </div>
      )}

      {/* 3. Bottom Edge Distance Measurement Ruler Line */}
      {bottom > 25 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none"
          style={{ bottom: 0, height: `${bottom}px` }}
        >
          {/* Bottom Line */}
          <div className="w-[1px] h-full bg-indigo-400/70 border-l border-dashed border-indigo-500" />
          {/* Bottom Distance Badge */}
          <div className="absolute top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-indigo-950/80 text-white text-[9px] font-mono font-semibold backdrop-blur-xs border border-indigo-400/40 shadow-xs flex items-center gap-1">
            <span className="text-indigo-300">{lang === 'th' ? 'ล่าง' : 'Bottom'}</span>
            <span>{Math.max(0, bottom)}px</span>
          </div>
        </div>
      )}

      {/* 4. Vertical Pixel Scale Ruler on the Left Margin */}
      <div className="absolute top-0 bottom-0 left-0 w-5 bg-black/15 dark:bg-white/5 border-r border-black/10 dark:border-white/10 flex flex-col justify-between py-2 text-[8px] font-mono text-[#777169] dark:text-[#a8a29e] select-none">
        {[0, 100, 200, 300, 400, 500, 600, 700].map((tick) => (
          <div
            key={tick}
            className="absolute left-0 w-full flex items-center justify-between pr-0.5"
            style={{ top: `${(tick / Math.max(1, containerHeight)) * 100}%` }}
          >
            <span className="scale-75 origin-left pl-0.5">{tick}</span>
            <div className="w-1.5 h-[1px] bg-black/40 dark:bg-white/40" />
          </div>
        ))}

        {/* Current Active Element Indicator Marker on Ruler */}
        <div
          className="absolute left-0 w-full flex items-center transition-all duration-75"
          style={{ top: `${top}px` }}
        >
          <div className="w-2.5 h-[2px] bg-indigo-600 shadow-sm" />
          <div className="w-0 h-0 border-y-[3px] border-y-transparent border-l-[4px] border-l-indigo-600" />
        </div>
      </div>

      {/* 5. Live Coordinates Pill Floating on Top Right */}
      <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/80 text-white text-[10px] font-mono font-medium border border-white/20 shadow-md backdrop-blur-xs flex items-center gap-2">
        <span className="text-indigo-300 font-bold">{label || id}</span>
        <span>X: {Math.round(x)}px</span>
        <span>Y: {Math.round(y)}px</span>
      </div>
    </div>
  );
}
