'use client';

import React from 'react';

/**
 * PreviewStatusBar
 * Minimalist iOS status bar for phone preview.
 * Hidden on export / download.
 */
export default function PreviewStatusBar({ cfg, isDark }) {
  if (!cfg?.showStatusBar) return null;

  return (
    <div
      id="preview-ios-statusbar"
      data-export-ignore="true"
      className={`hidden sm:flex absolute top-0 left-0 w-full z-30 justify-between items-center px-7 pt-3.5 text-xs font-medium ${
        isDark ? 'text-white/80' : 'text-[#292524]'
      }`}
    >
      <span className="tracking-tight">9:41</span>
      <div className={`w-16 h-3 rounded-full mx-auto -mt-0.5 ${isDark ? 'bg-white/40' : 'bg-[#0c0a09]'}`} />
      <div className={`flex items-center space-x-1.5 text-[11px] ${isDark ? 'text-white/80' : 'text-[#292524]'}`}>
        <i className="fa-solid fa-signal" />
        <i className="fa-solid fa-wifi" />
        <i className="fa-solid fa-battery-full text-sm" />
      </div>
    </div>
  );
}
