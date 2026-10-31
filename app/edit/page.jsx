'use client';

import React from 'react';
import Link from 'next/link';
import ToolStep1AI from '../../components/ToolStep1AI';
import ToolStep2Vocab from '../../components/ToolStep2Vocab';
import ToolStep3Ratio from '../../components/ToolStep3Ratio';
import ToolStep4Social from '../../components/ToolStep4Social';
import MobileBottomNav from '../../components/MobileBottomNav';
import PhonePreview from '../../components/PhonePreview';
import { useVocab } from '../../context/VocabContext';

export default function MobileEditorPage() {
  const { toolSearch, setToolSearch, t, lang } = useVocab();

  return (
    <div className="w-full min-h-screen flex flex-col items-center pb-32 sm:pb-28 pt-0 sm:pt-4 px-3 sm:px-6 relative">
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

      {/* Top Sticky Header (Clean, Spacious, Uncluttered — Action buttons moved to bottom nav) */}
      <header className="w-full max-w-2xl sticky top-0 z-40 bg-white/95 dark:bg-[#1a1715]/95 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] rounded-b-2xl sm:rounded-2xl p-3 mb-4 shadow-[0_6px_24px_rgba(0,0,0,0.06)] space-y-2.5 transition-all">
        <div className="flex items-center justify-between gap-3">
          {/* Back Button + Brand Logo & Title */}
          <div className="flex items-center space-x-2.5">
            <Link
              href="/"
              className="w-11 h-11 rounded-full bg-white dark:bg-[#25211e] border border-[#d6d3d1] dark:border-[#44403c] hover:border-[#0c0a09] dark:hover:border-white flex items-center justify-center text-[#292524] dark:text-white shadow-2xs transition flex-shrink-0 t-btn-press"
              title={lang === 'th' ? 'กลับหน้าพรีวิว' : 'Back to Preview'}
              aria-label={lang === 'th' ? 'กลับหน้าพรีวิว' : 'Back to Preview'}
            >
              <i className="fa-solid fa-arrow-left text-xs" />
            </Link>

            {/* Frameless enlarged logo */}
            <img src="/icon.svg" alt="MoovyEng Logo" className="w-10 h-10 object-contain flex-shrink-0" />

            <div>
              <h1 className="editorial-display text-xl sm:text-2xl text-[#0c0a09] dark:text-white leading-none">
                MoovyEng
              </h1>
              <p className="text-[10px] text-[#777169] dark:text-[#a8a29e] mt-0.5">MoovyEng Studio</p>
            </div>
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
            placeholder={t.searchToolsPlaceholder || 'Search tools (AI, Vocab, Ratio, Queue, Profile)...'}
            className="w-full bg-[#fafafa] dark:bg-[#25211e] border border-[#d6d3d1] dark:border-[#44403c] rounded-full pl-8 pr-8 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:bg-white dark:focus:bg-[#1a1715] focus:border-[#0c0a09] dark:focus:border-white focus:outline-none transition shadow-2xs"
          />
          {toolSearch && (
            <button
              type="button"
              onClick={() => setToolSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white text-xs"
              title={lang === 'th' ? 'ล้างการค้นหา' : 'Clear Search'}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </header>

      {/* Main Container: 4 Modular Tool Steps */}
      <main className="w-full max-w-2xl relative z-10 space-y-4">
        <ToolStep1AI />
        <ToolStep2Vocab />
        <ToolStep3Ratio />
        <ToolStep4Social />
      </main>

      {/* Thumb-Friendly Floating Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Offscreen PhonePreview Canvas so ExportModal can capture #phone-container directly from /edit */}
      <div
        aria-hidden="true"
        className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 overflow-hidden"
      >
        <PhonePreview isMobile />
      </div>
    </div>
  );
}
