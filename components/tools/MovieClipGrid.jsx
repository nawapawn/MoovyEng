'use client';

import React from 'react';
import { useVocab } from '../../context/VocabContext';
import MovieClipCard from './MovieClipCard';

/**
 * MovieClipGrid
 * Search bar, AI buttons, and 3-column movie clip selector grid.
 */
export default function MovieClipGrid({
  word,
  setWord,
  meaning,
  setMeaning,
  regenerateMeaning,
  isRegenerating,
  updateWord,
  generateAiContent,
  randomWordWithAi,
  searchClips,
  isLoading,
  loadingText,
  cafeClipPool = [],
  activeClipSequence = [],
  toggleSelectClip,
  loadMoreCafeClips,
  isLoadingMoreClips,
  activeFormatTarget,
  setActiveFormatTarget
}) {
  const { setActiveSelection, clearSelectionFormat, lang } = useVocab();
  const hasStyledSpan = (val) => Boolean(val && typeof val === 'string' && val.includes('<span'));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (updateWord) {
        updateWord(word, true, meaning);
      } else {
        generateAiContent(word, meaning);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Step 1 User Input: Target Vocabulary + Thai Translation */}
      <div className="p-2.5 bg-[#fafafa] dark:bg-[#201d1a] rounded-xl border border-[#e7e5e4] dark:border-[#292524] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#0c0a09] dark:text-white">
            {lang === 'th' ? 'ขั้นตอนที่ 1: กรอกคำศัพท์ + คำแปลไทยที่ต้องการ' : 'Step 1: Enter Vocabulary & Intended Thai Meaning'}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Random Word Generator */}
            <button
              type="button"
              onClick={randomWordWithAi}
              id="btn-random-word"
              className="w-8 h-8 bg-white dark:bg-[#292524] hover:bg-[#e7e5e4] text-[#0c0a09] dark:text-white border border-[#d6d3d1] dark:border-[#44403c] rounded-full transition flex items-center justify-center flex-shrink-0 t-btn-press"
              title={lang === 'th' ? 'สุ่มคำศัพท์ภาษาอังกฤษ' : 'Random Word via AI'}
              aria-label="Random Word"
            >
              <i id="random-dice-icon" className="fa-solid fa-dice text-xs text-[#0c0a09] dark:text-amber-300" />
            </button>

            {/* AI Generate Wand (Process Word + Thai Meaning -> Match Clips -> Extract Pattern & Sentences -> SEO Caption) */}
            <button
              type="button"
              id="btn-ai-process-vocab"
              onClick={() => {
                if (updateWord) {
                  updateWord(word, true, meaning);
                } else {
                  generateAiContent(word, meaning);
                }
              }}
              className="btn-magical px-3.5 h-8 bg-[#0c0a09] dark:bg-white hover:bg-[#292524] text-white dark:text-[#0c0a09] rounded-full shadow-sm flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold"
              title={lang === 'th' ? 'เสกสรรคำแปล ดึงคลิปหนังแท้ และแต่งประโยคเสร็จสรรพ' : 'Analyze Meaning, Match Clips & Generate Pattern Sentences'}
              aria-label="Search Clips & Translate"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-[11px] text-amber-300 dark:text-amber-500" />
              <span>{lang === 'th' ? 'AI วิเคราะห์ & ดึงคลิป' : 'AI Analyze & Fetch'}</span>
            </button>

            {/* Film Search Only */}
            <button
              type="button"
              onClick={() => searchClips(word, true)}
              className="w-8 h-8 bg-white dark:bg-[#292524] hover:bg-[#f0efed] text-[#0c0a09] dark:text-white border border-[#d6d3d1] dark:border-[#44403c] rounded-full transition flex items-center justify-center flex-shrink-0 t-btn-press"
              title={lang === 'th' ? 'ค้นหาคลิปหนังอย่างเดียว' : 'Search Clips Only'}
              aria-label="Search Clips Only"
            >
              <i className="fa-solid fa-film text-xs" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* 1. Target Vocabulary Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="target-word" className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e]">
                {lang === 'th' ? '1. คำศัพท์ (Target Vocabulary)' : '1. Target Vocabulary'}
              </label>
              <button
                type="button"
                onClick={() => setActiveFormatTarget?.('word')}
                className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap transition ${
                  activeFormatTarget === 'word'
                    ? 'bg-[#f0ebf8] text-[#6b38c2] dark:bg-[#34244d] dark:text-[#c4a5f3] font-bold'
                    : 'text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white'
                }`}
                title={lang === 'th' ? 'ปรับฟอนต์/สไตล์ คำศัพท์' : 'Style Vocabulary'}
              >
                {lang === 'th' ? 'Aa สไตล์' : 'Aa Style'}
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                id="target-word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onSelect={(e) => {
                  const input = e.target;
                  if (
                    input.selectionStart !== undefined &&
                    input.selectionEnd !== undefined &&
                    input.selectionStart !== input.selectionEnd
                  ) {
                    setActiveSelection?.({
                      fieldName: 'word',
                      text: input.value.slice(input.selectionStart, input.selectionEnd),
                      start: input.selectionStart,
                      end: input.selectionEnd,
                      isInputField: true
                    });
                  }
                }}
                onFocus={() => setActiveFormatTarget?.('word')}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'th' ? 'เช่น Break a leg' : 'e.g. Break a leg'}
                className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg pl-3 pr-7 py-1.5 text-xs font-serif text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none transition"
              />
              {word && (
                <button
                  type="button"
                  onClick={() => setWord('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white text-xs p-0.5"
                  title={lang === 'th' ? 'ล้างคำศัพท์' : 'Clear word'}
                  aria-label="Clear input"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Thai Translation Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="res-meaning" className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e]">
                {lang === 'th' ? '2. คำแปลไทย (Thai Translation)' : '2. Thai Translation'}
              </label>
              <div className="flex items-center gap-1">
                {regenerateMeaning && (
                  <button
                    type="button"
                    onClick={regenerateMeaning}
                    disabled={isRegenerating?.meaning}
                    className="w-5 h-5 rounded-full hover:bg-[#f0efed] dark:hover:bg-[#292524] text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white flex items-center justify-center transition"
                    title={lang === 'th' ? 'ให้ AI ช่วยคิดคำแปลใหม่' : 'Regenerate Meaning'}
                  >
                    <i className={`fa-solid fa-arrows-rotate text-[9px] ${isRegenerating?.meaning ? 'fa-spin text-amber-500' : ''}`} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveFormatTarget?.('meaning')}
                  className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap transition ${
                    activeFormatTarget === 'meaning'
                      ? 'bg-[#f0ebf8] text-[#6b38c2] dark:bg-[#34244d] dark:text-[#c4a5f3] font-bold'
                      : 'text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white'
                  }`}
                  title={lang === 'th' ? 'ปรับฟอนต์/สไตล์ ความหมาย' : 'Style Meaning'}
                >
                  {lang === 'th' ? 'Aa สไตล์' : 'Aa Style'}
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                id="res-meaning"
                value={meaning}
                onChange={(e) => setMeaning?.(e.target.value)}
                onSelect={(e) => {
                  const input = e.target;
                  if (
                    input.selectionStart !== undefined &&
                    input.selectionEnd !== undefined &&
                    input.selectionStart !== input.selectionEnd
                  ) {
                    setActiveSelection?.({
                      fieldName: 'meaning',
                      text: input.value.slice(input.selectionStart, input.selectionEnd),
                      start: input.selectionStart,
                      end: input.selectionEnd,
                      isInputField: true
                    });
                  }
                }}
                onFocus={() => setActiveFormatTarget?.('meaning')}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'th' ? 'เช่น ขอให้โชคดี' : 'e.g. Good luck'}
                className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg pl-3 pr-7 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none transition"
              />
              {meaning && (
                <button
                  type="button"
                  onClick={() => setMeaning?.('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white text-xs p-0.5"
                  title={lang === 'th' ? 'ล้างคำแปล' : 'Clear meaning'}
                  aria-label="Clear meaning"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
            {hasStyledSpan(meaning) && (
              <div className="flex items-center justify-between text-[10px] text-violet-600 dark:text-violet-400 font-mono px-1 pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span>{lang === 'th' ? 'มีสไตล์แบบกำหนดเอง' : 'Custom styled'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => clearSelectionFormat?.('meaning')}
                  className="text-rose-500 hover:underline uppercase text-[9px]"
                >
                  {lang === 'th' ? 'รีเซ็ต' : 'Reset'}
                </button>
              </div>
            )}
          </div>
        </div>
        <input type="hidden" id="clip-query" value={word} />
      </div>

      {/* Loading Indicator with Magical Shimmer */}
      {isLoading && (
        <div id="ai-loading" className="relative overflow-hidden p-3 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 dark:from-amber-400/10 dark:via-zinc-800 dark:to-amber-400/10 border border-amber-500/30 dark:border-amber-400/30 rounded-xl text-center shadow-xs">
          <div className="absolute inset-0 shimmer-magic pointer-events-none" />
          <div className="relative z-10 flex items-center justify-center space-x-2 text-[#0c0a09] dark:text-[#f5f5f4] text-xs font-semibold">
            <i className="fa-solid fa-wand-magic-sparkles text-amber-500 animate-pulse" />
            <span id="ai-loading-text">
              {loadingText || (lang === 'th' ? 'กำลังร่ายมนตร์ค้นหาคลิปและจัดคำศัพท์...' : 'Summoning authentic cinema clips & nuances...')}
            </span>
          </div>
        </div>
      )}

      {/* Scraped Movie Clips Header & Load More */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e]">
            {lang === 'th' ? 'คลิปภาพยนตร์ภาษาอังกฤษ' : 'Movie Clips'}
          </label>
          <button
            type="button"
            id="btn-load-more"
            onClick={loadMoreCafeClips}
            disabled={isLoadingMoreClips}
            className="w-7 h-7 bg-white dark:bg-[#292524] hover:bg-[#f0efed] text-[#292524] dark:text-white rounded-full border border-[#d6d3d1] dark:border-[#44403c] transition flex items-center justify-center t-btn-press disabled:opacity-50"
            title={lang === 'th' ? 'โหลดคลิปเพิ่ม' : 'Load More Clips'}
            aria-label="Load More Clips"
          >
            <i
              id="load-more-spinner"
              className={`fa-solid fa-arrows-rotate text-[11px] text-[#777169] dark:text-[#a8a29e] transition-transform ${
                isLoadingMoreClips ? 'fa-spin' : ''
              }`}
            />
          </button>
        </div>

        {/* 3-Column Grid */}
        <div
          id="clip-grid"
          className="grid grid-cols-3 gap-2 max-h-[210px] overflow-y-auto no-scrollbar p-2 bg-[#fafafa] dark:bg-[#201d1a] rounded-xl border border-[#e7e5e4] dark:border-[#292524]"
        >
          {cafeClipPool.length === 0 ? (
            <div className="col-span-full py-5 text-center text-[#777169] dark:text-[#a8a29e] text-xs">
              {lang === 'th' ? 'พิมพ์คำศัพท์แล้วคลิก' : 'Enter a word and click'}{' '}
              <i className="fa-solid fa-wand-magic-sparkles mx-0.5 text-amber-500" />{' '}
              {lang === 'th' ? 'เพื่อค้นหาคลิปและแปลคำศัพท์' : 'to fetch clips & translate'}
            </div>
          ) : (
            cafeClipPool.map((clip) => {
              const seqIdx = activeClipSequence.findIndex((s) => s.id === clip.id);
              const isSelected = seqIdx !== -1;

              return (
                <MovieClipCard
                  key={clip.id}
                  clip={clip}
                  seqIdx={seqIdx}
                  isSelected={isSelected}
                  onToggle={() => toggleSelectClip(clip)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
