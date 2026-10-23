'use client';

import React from 'react';
import Link from 'next/link';
import ToolStep1AI from '../../components/ToolStep1AI';
import ToolStep2Vocab from '../../components/ToolStep2Vocab';
import ToolStep3Ratio from '../../components/ToolStep3Ratio';
import ToolStep4Social from '../../components/ToolStep4Social';
import { useVocab } from '../../context/VocabContext';

export default function MobileEditorPage() {
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
    <div className="w-full min-h-screen flex flex-col items-center pb-24 sm:pb-16 pt-0 sm:pt-4 px-3 sm:px-6 relative overflow-x-hidden">
      {/* ElevenLabs Atmospheric Pastel Gradient Orbs (Mint, Peach, Lavender) */}
      <div
        className="pointer-events-none fixed -top-28 -left-28 w-96 h-96 rounded-full opacity-40 dark:opacity-20 blur-3xl z-0"
        style={{ background: 'radial-gradient(circle, #a7e5d3 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none fixed top-1/3 -right-28 w-96 h-96 rounded-full opacity-40 dark:opacity-20 blur-3xl z-0"
        style={{ background: 'radial-gradient(circle, #f4c5a8 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none fixed -bottom-28 left-1/4 w-96 h-96 rounded-full opacity-35 dark:opacity-15 blur-3xl z-0"
        style={{ background: 'radial-gradient(circle, #c8b8e0 0%, transparent 70%)' }}
      />

      {/* Top Sticky Header (Follows Scroll on Mobile + Quick Tool Search, Dark Mode & Language Toggle) */}
      <header className="w-full max-w-2xl sticky top-0 z-40 bg-white/95 dark:bg-[#1c1917]/95 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] rounded-b-2xl sm:rounded-2xl p-3 mb-4 shadow-[0_6px_20px_rgba(0,0,0,0.06)] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <Link
              href="/"
              className="w-9 h-9 rounded-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] hover:border-[#0c0a09] dark:hover:border-white flex items-center justify-center text-[#292524] dark:text-white shadow-2xs transition flex-shrink-0 t-btn-press"
              title="Back to Preview"
              aria-label="กลับหน้า Preview"
            >
              <i className="fa-solid fa-arrow-left text-xs" />
            </Link>
            {/* Frameless enlarged logo */}
            <img src="/icon.png" alt="movyEng Logo" className="w-10 h-10 object-contain flex-shrink-0" />
            <div>
              <h1 className="editorial-display text-xl sm:text-2xl text-[#0c0a09] dark:text-white leading-none">
                movyEng
              </h1>
              <p className="text-[10px] text-[#777169] dark:text-[#a8a29e] mt-0.5">moovying(En) Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Toggle (TH / EN) */}
            <button
              type="button"
              onClick={toggleLanguage}
              id="btn-lang-toggle"
              className="h-8 px-2.5 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-[#e7e5e4] dark:hover:bg-[#3b3633] text-[#0c0a09] dark:text-white text-xs font-semibold flex items-center gap-1 transition t-btn-press shadow-2xs"
              title="Switch Language (TH / EN)"
            >
              <i className="fa-solid fa-globe text-[11px] text-[#777169] dark:text-[#a8a29e]" />
              <span id="lang-badge-text">{lang.toUpperCase()}</span>
            </button>

            {/* Theme Toggle (Dark / Light) */}
            <button
              type="button"
              onClick={toggleTheme}
              id="btn-theme-toggle"
              className="w-8 h-8 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-[#e7e5e4] dark:hover:bg-[#3b3633] text-[#0c0a09] dark:text-white flex items-center justify-center transition t-btn-press shadow-2xs"
              title="Dark / Light Theme"
            >
              <i
                id="theme-toggle-icon"
                className={`fa-solid ${theme === 'dark' ? 'fa-sun text-amber-400' : 'fa-moon text-[#777169]'} text-xs`}
              />
            </button>

            {/* Quick Jump Tool Icons */}
            <button
              type="button"
              onClick={() => jumpToToolSection('tool-sec-ai')}
              className="w-7 h-7 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-[#0c0a09] hover:text-white text-[#292524] dark:text-[#a8a29e] transition flex items-center justify-center t-btn-press"
              title="1. AI Model"
            >
              <i className="fa-solid fa-microchip text-[10px]" />
            </button>
            <button
              type="button"
              onClick={() => jumpToToolSection('tool-sec-vocab')}
              className="w-7 h-7 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-[#0c0a09] hover:text-white text-[#292524] dark:text-[#a8a29e] transition flex items-center justify-center t-btn-press"
              title="2. Vocabulary & Clips"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-[10px]" />
            </button>
            <button
              type="button"
              onClick={() => jumpToToolSection('tool-sec-ratio')}
              className="w-7 h-7 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-[#0c0a09] hover:text-white text-[#292524] dark:text-[#a8a29e] transition flex items-center justify-center t-btn-press"
              title="3. Aspect Ratio & Background"
            >
              <i className="fa-solid fa-crop-simple text-[10px]" />
            </button>
            <button
              type="button"
              onClick={() => jumpToToolSection('tool-sec-social')}
              className="w-7 h-7 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-[#0c0a09] hover:text-white text-[#292524] dark:text-[#a8a29e] transition flex items-center justify-center t-btn-press"
              title="4. Profile & Caption"
            >
              <i className="fa-solid fa-user text-[10px]" />
            </button>
            <button
              type="button"
              onClick={toggleAllToolSections}
              className="w-7 h-7 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-[#0c0a09] hover:text-white text-[#292524] dark:text-[#a8a29e] transition flex items-center justify-center t-btn-press"
              title="Expand / Collapse All Cards"
            >
              <i id="toggle-all-cards-icon" className="fa-solid fa-compress text-[10px]" />
            </button>
          </div>
        </div>

        {/* Mobile Tool Search Bar */}
        <div className="relative w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#777169] dark:text-[#a8a29e] text-xs" />
          <input
            type="text"
            id="mobile-tool-search"
            value={toolSearch}
            onChange={(e) => setToolSearch(e.target.value)}
            placeholder="Search tools (AI, Vocab, Ratio, Queue, Profile)..."
            className="w-full bg-[#fafafa] dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-full pl-8 pr-8 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:bg-white dark:focus:bg-[#1c1917] focus:border-[#0c0a09] dark:focus:border-white focus:outline-none transition"
          />
          {toolSearch && (
            <button
              type="button"
              onClick={() => setToolSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white text-xs"
              title="Clear Search"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-2xl relative z-10 space-y-4">
        <ToolStep1AI />
        <ToolStep2Vocab />
        <ToolStep3Ratio />
        <ToolStep4Social />
      </main>

      {/* Bottom Sticky Floating Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#1c1917]/95 border-t border-[#e7e5e4] dark:border-[#292524] p-3 sm:py-3.5 sm:px-6 z-50 backdrop-blur-md flex items-center justify-center shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="w-full max-w-2xl flex items-center justify-between gap-3">
          <Link
            href="/"
            className="w-11 h-11 bg-[#0c0a09] dark:bg-white hover:bg-[#292524] text-white dark:text-[#0c0a09] rounded-full shadow-xs transition flex items-center justify-center"
            title="ดู Preview"
            aria-label="ดู Preview"
          >
            <i className="fa-solid fa-eye text-sm" />
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={resetToInitialState}
              className="w-11 h-11 bg-white dark:bg-[#292524] hover:bg-[#f0efed] text-[#0c0a09] dark:text-white rounded-full border border-[#d6d3d1] dark:border-[#44403c] transition flex items-center justify-center shadow-2xs"
              title="Reset All"
              aria-label="ล้างข้อมูล"
            >
              <i className="fa-solid fa-trash-can text-sm" />
            </button>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="w-11 h-11 bg-[#292524] dark:bg-[#f5f5f4] hover:bg-[#0c0a09] text-white dark:text-[#0c0a09] rounded-full shadow-xs transition flex items-center justify-center"
              title="Export"
              aria-label="Export"
            >
              <i className="fa-solid fa-cloud-arrow-down text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
