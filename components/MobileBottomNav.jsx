'use client';

import React from 'react';
import Link from 'next/link';
import { useVocab } from '../context/VocabContext';

/**
 * MobileBottomNav Component
 * Provides a thumb-friendly, floating bottom action bar for mobile editor view.
 * Consolidates the actions previously clustered in the top header:
 * - Quick Step 1-4 Jumps
 * - Expand / Collapse All Cards
 * - Undo & Redo Canvas History
 * - Language Toggle (TH / EN)
 * - Dark / Light Theme Toggle
 * - Clear / Reset All Data
 * - Export Video / Slides
 * - Return to Phone Preview
 */
export default function MobileBottomNav() {
  const {
    theme,
    toggleTheme,
    lang,
    toggleLanguage,
    jumpToToolSection,
    toggleAllToolSections,
    resetToInitialState,
    setIsExportModalOpen,
    undo,
    redo,
    canUndo,
    canRedo,
    t
  } = useVocab();

  return (
    <aside
      id="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 w-full max-w-[100vw] box-border z-50 bg-white/95 dark:bg-[#1a1715]/95 border-t border-[#e7e5e4] dark:border-[#2b2724] px-2.5 pt-2 pb-2.5 backdrop-blur-lg shadow-[0_-6px_24px_rgba(0,0,0,0.08)] transition-all select-none overflow-hidden"
      aria-label="Mobile Bottom Actions Navigation"
    >
      <div className="max-w-2xl mx-auto space-y-1.5 w-full">
        {/* Row 1: Quick Jump Step Pills + Expand/Collapse (Thumb reachable, >= 40px touch target) */}
        <div className="flex items-center justify-between gap-1 py-0.5 w-full">
          <button
            type="button"
            onClick={() => jumpToToolSection('tool-sec-ai')}
            className="flex-1 min-w-0 h-10 px-1.5 rounded-xl bg-[#fafafa] dark:bg-[#25211e] hover:bg-[#0c0a09] hover:text-white dark:hover:bg-white dark:hover:text-[#0c0a09] text-[#292524] dark:text-[#d6d3d1] border border-[#e7e5e4] dark:border-[#38332e] text-[11px] font-semibold flex items-center justify-center gap-1 transition t-btn-press truncate"
            title={lang === 'th' ? '1. โมเดล AI & API Key' : '1. AI Model & Key'}
          >
            <i className="fa-solid fa-microchip text-[10px] flex-shrink-0" />
            <span className="truncate">{t.step1Short || '1. AI'}</span>
          </button>

          <button
            type="button"
            onClick={() => jumpToToolSection('tool-sec-vocab')}
            className="flex-1 min-w-0 h-10 px-1.5 rounded-xl bg-[#fafafa] dark:bg-[#25211e] hover:bg-[#0c0a09] hover:text-white dark:hover:bg-white dark:hover:text-[#0c0a09] text-[#292524] dark:text-[#d6d3d1] border border-[#e7e5e4] dark:border-[#38332e] text-[11px] font-semibold flex items-center justify-center gap-1 transition t-btn-press truncate"
            title={lang === 'th' ? '2. คำศัพท์ & ค้นหาคลิป' : '2. Vocabulary & Clips'}
          >
            <i className="fa-solid fa-wand-magic-sparkles text-[10px] flex-shrink-0" />
            <span className="truncate">{t.step2Short || '2. Vocab'}</span>
          </button>

          <button
            type="button"
            onClick={() => jumpToToolSection('tool-sec-ratio')}
            className="flex-1 min-w-0 h-10 px-1.5 rounded-xl bg-[#fafafa] dark:bg-[#25211e] hover:bg-[#0c0a09] hover:text-white dark:hover:bg-white dark:hover:text-[#0c0a09] text-[#292524] dark:text-[#d6d3d1] border border-[#e7e5e4] dark:border-[#38332e] text-[11px] font-semibold flex items-center justify-center gap-1 transition t-btn-press truncate"
            title={lang === 'th' ? '3. สัดส่วนภาพ & คิวคลิป' : '3. Aspect Ratio & Bg'}
          >
            <i className="fa-solid fa-crop-simple text-[10px] flex-shrink-0" />
            <span className="truncate">{t.step3Short || '3. Ratio'}</span>
          </button>

          <button
            type="button"
            onClick={() => jumpToToolSection('tool-sec-social')}
            className="flex-1 min-w-0 h-10 px-1.5 rounded-xl bg-[#fafafa] dark:bg-[#25211e] hover:bg-[#0c0a09] hover:text-white dark:hover:bg-white dark:hover:text-[#0c0a09] text-[#292524] dark:text-[#d6d3d1] border border-[#e7e5e4] dark:border-[#38332e] text-[11px] font-semibold flex items-center justify-center gap-1 transition t-btn-press truncate"
            title={lang === 'th' ? '4. โปรไฟล์ & แคปชั่น' : '4. Profile & Caption'}
          >
            <i className="fa-solid fa-user text-[10px] flex-shrink-0" />
            <span className="truncate">{t.step4Short || '4. Social'}</span>
          </button>

          <button
            type="button"
            onClick={toggleAllToolSections}
            className="w-10 h-10 rounded-xl bg-[#fafafa] dark:bg-[#25211e] hover:bg-[#0c0a09] hover:text-white dark:hover:bg-white dark:hover:text-[#0c0a09] text-[#777169] dark:text-[#a8a29e] border border-[#e7e5e4] dark:border-[#38332e] flex items-center justify-center transition t-btn-press flex-shrink-0"
            title={t.expandCollapseCards || 'Expand / Collapse Cards'}
            aria-label={lang === 'th' ? 'ย่อหรือขยายการ์ดทั้งหมด' : 'Expand or Collapse All Cards'}
          >
            <i className="fa-solid fa-compress text-[10px]" />
          </button>
        </div>

        {/* Row 2: Undo, Redo, Theme, Lang, Reset, Export & View Preview */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5 w-full">
          {/* Left Group: Undo / Redo History */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              id="btn-mobile-undo"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition shadow-2xs ${
                canUndo
                  ? 'bg-white dark:bg-[#25211e] text-[#0c0a09] dark:text-white border-[#d6d3d1] dark:border-[#44403c] hover:bg-[#f0efed] t-btn-press'
                  : 'bg-[#f5f4f0] dark:bg-[#1f1c19] text-[#a8a29e] dark:text-[#57534e] border-transparent opacity-50 cursor-not-allowed'
              }`}
              title={t.undoBtn || 'Undo (Ctrl+Z)'}
              aria-label={lang === 'th' ? 'เลิกทำ' : 'Undo'}
            >
              <i className="fa-solid fa-rotate-left text-xs" />
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              id="btn-mobile-redo"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition shadow-2xs ${
                canRedo
                  ? 'bg-white dark:bg-[#25211e] text-[#0c0a09] dark:text-white border-[#d6d3d1] dark:border-[#44403c] hover:bg-[#f0efed] t-btn-press'
                  : 'bg-[#f5f4f0] dark:bg-[#1f1c19] text-[#a8a29e] dark:text-[#57534e] border-transparent opacity-50 cursor-not-allowed'
              }`}
              title={t.redoBtn || 'Redo (Ctrl+Y)'}
              aria-label={lang === 'th' ? 'ทำซ้ำ' : 'Redo'}
            >
              <i className="fa-solid fa-rotate-right text-xs" />
            </button>
          </div>

          {/* Center Group: Language, Theme & Reset */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              id="btn-mobile-lang"
              className="h-10 px-2.5 rounded-xl bg-white dark:bg-[#25211e] hover:bg-[#f0efed] text-[#0c0a09] dark:text-white text-xs font-bold border border-[#d6d3d1] dark:border-[#44403c] flex items-center gap-1 transition t-btn-press shadow-2xs"
              title={t.langToggle || 'Switch Language (TH / EN)'}
            >
              <i className="fa-solid fa-globe text-[11px] text-[#777169] dark:text-[#a8a29e]" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              id="btn-mobile-theme"
              className="w-10 h-10 rounded-xl bg-white dark:bg-[#25211e] hover:bg-[#f0efed] text-[#0c0a09] dark:text-white border border-[#d6d3d1] dark:border-[#44403c] flex items-center justify-center transition t-btn-press shadow-2xs"
              title={t.themeToggle || 'Toggle Theme'}
              aria-label={lang === 'th' ? 'สลับธีม' : 'Toggle Theme'}
            >
              <i
                className={`fa-solid ${
                  theme === 'dark' ? 'fa-sun text-amber-400' : 'fa-moon text-[#777169]'
                } text-xs`}
              />
            </button>

            {/* Clear All / Reset Data */}
            <button
              type="button"
              onClick={resetToInitialState}
              id="btn-mobile-trash"
              className="w-10 h-10 rounded-xl bg-white dark:bg-[#25211e] hover:bg-rose-50 text-[#777169] hover:text-rose-600 dark:text-[#a8a29e] dark:hover:text-rose-400 border border-[#d6d3d1] dark:border-[#44403c] flex items-center justify-center transition t-btn-press shadow-2xs"
              title={lang === 'th' ? 'ล้างข้อมูลทั้งหมด (Reset All)' : 'Reset All Data'}
              aria-label={lang === 'th' ? 'ล้างข้อมูลทั้งหมด' : 'Reset All Data'}
            >
              <i className="fa-solid fa-trash-can text-xs" />
            </button>
          </div>

          {/* Right Group: Export & Preview Jump */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Export Button */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              id="btn-mobile-export"
              className="min-w-[40px] h-10 px-3 bg-[#292524] dark:bg-[#f5f5f4] hover:bg-[#0c0a09] text-white dark:text-[#0c0a09] rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 t-btn-press"
              title={lang === 'th' ? 'ส่งออก' : 'Export'}
            >
              <i className="fa-solid fa-cloud-arrow-down text-xs" />
              <span className="hidden sm:inline">{t.exportBtnText || 'Export'}</span>
            </button>

            {/* Return to Phone Preview */}
            <Link
              href="/"
              className="w-10 h-10 bg-[#0c0a09] dark:bg-white hover:bg-[#292524] text-white dark:text-[#0c0a09] rounded-xl shadow-xs transition flex items-center justify-center t-btn-press"
              title={t.viewPreview || 'View Preview'}
              aria-label={lang === 'th' ? 'ดูพรีวิว' : 'View Preview'}
            >
              <i className="fa-solid fa-eye text-xs" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
