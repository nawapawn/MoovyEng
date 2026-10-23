'use client';

import React from 'react';
import { useVocab } from '../context/VocabContext';

export default function StudioHeader() {
  const {
    theme,
    toggleTheme,
    lang,
    toggleLanguage,
    toolSearch,
    setToolSearch,
    jumpToToolSection,
    toggleAllToolSections,
    resetToInitialState,
    setIsExportModalOpen,
    t
  } = useVocab();

  return (
    <header className="w-full bg-white/90 dark:bg-[#1c1917]/95 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex flex-wrap items-center justify-between gap-3 sticky top-3 z-40 transition-all">
      <div className="flex items-center gap-3">
        {/* Frameless Enlarged Brand Logo */}
        <img src="/icon.svg" alt="MoovyEng Logo" className="w-11 h-11 object-contain drop-shadow-sm flex-shrink-0" />
        <div>
          <h2 className="editorial-display text-2xl text-[#0c0a09] dark:text-white leading-none">
            MoovyEng
          </h2>
          <p className="text-[10px] text-[#777169] dark:text-[#a8a29e] mt-0.5" id="brand-tagline">
            AI Vocab & Movie Studio • MoovyEng
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-1 max-w-sm justify-end">
        {/* Language Switcher (EN / TH) */}
        <button
          type="button"
          onClick={toggleLanguage}
          id="btn-lang-toggle"
          className="px-2.5 py-1 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-[#f5f5f4] text-xs font-semibold border border-[#d6d3d1] dark:border-[#44403c] transition t-btn-press"
          title="Switch Language"
        >
          <span id="lang-badge-text">{lang.toUpperCase()}</span>
        </button>

        {/* Theme Switcher (Dark / Light) */}
        <button
          type="button"
          onClick={toggleTheme}
          id="btn-theme-toggle"
          className="w-9 h-9 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-amber-300 border border-[#d6d3d1] dark:border-[#44403c] transition flex items-center justify-center t-btn-press"
          title="Toggle Theme"
        >
          <i
            id="theme-toggle-icon"
            className={`fa-solid ${theme === 'dark' ? 'fa-sun text-amber-300' : 'fa-moon'} text-xs`}
          />
        </button>

        {/* Search Bar */}
        <div className="relative flex-1 min-w-[120px]">
          <i className="fa-solid fa-magnifying-glass text-[11px] text-[#777169] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="desktop-tool-search"
            value={toolSearch}
            onChange={(e) => setToolSearch(e.target.value)}
            placeholder={t.searchToolsPlaceholder}
            className="w-full bg-[#fafafa] dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-full pl-8 pr-4 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:outline-none transition"
          />
        </div>

        {/* Reset / Clear All Data (Trash Can) */}
        <button
          type="button"
          id="btn-trash-reset"
          onClick={resetToInitialState}
          className="w-9 h-9 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#777169] hover:text-rose-600 dark:text-[#a8a29e] dark:hover:text-rose-400 border border-[#d6d3d1] dark:border-[#44403c] transition flex items-center justify-center flex-shrink-0 t-btn-press"
          title={lang === 'th' ? 'ล้างข้อมูลทั้งหมด (Clear / Reset All)' : 'Reset All Data'}
          aria-label="Clear All Data"
        >
          <i className="fa-solid fa-trash-can text-xs" />
        </button>

        {/* Export Button */}
        <button
          type="button"
          id="btn-export-studio"
          onClick={() => setIsExportModalOpen(true)}
          className="w-9 h-9 bg-[#292524] dark:bg-[#f5f5f4] hover:bg-[#0c0a09] text-white dark:text-[#0c0a09] rounded-full shadow-xs transition flex items-center justify-center flex-shrink-0 t-btn-press"
          title="Export Video / PNG"
          aria-label="Export"
        >
          <i className="fa-solid fa-cloud-arrow-down text-xs" />
        </button>
      </div>
    </header>
  );
}
