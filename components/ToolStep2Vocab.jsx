'use client';

import React, { useState, useRef } from 'react';
import { useVocab } from '../context/VocabContext';
import { normalizeThumbUrl } from '../lib/utils';
import TextFormattingSuite from './TextFormattingSuite';

function MovieClipCard({ clip, seqIdx, isSelected, onToggle }) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const touchTimerRef = useRef(null);
  const thumbSrc = normalizeThumbUrl(clip.thumb, clip.slug);
  const videoSrc = clip.localVideoUrl || `/api/cafe/stream?url=${encodeURIComponent(clip.videoUrl || clip.slug)}`;

  const startPreview = () => setIsPreviewing(true);
  const stopPreview = () => setIsPreviewing(false);

  const handleTouchStart = () => {
    touchTimerRef.current = setTimeout(() => {
      startPreview();
    }, 280);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    stopPreview();
  };

  return (
    <div
      onClick={onToggle}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onPointerEnter={startPreview}
      onPointerLeave={stopPreview}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative aspect-[3/2] rounded-xl overflow-hidden border-2 cursor-pointer transition select-none ${
        isSelected
          ? 'border-[#0c0a09] dark:border-white ring-2 ring-[#0c0a09]/20 shadow-xs'
          : 'border-[#e7e5e4] dark:border-[#44403c] opacity-90 hover:opacity-100 hover:shadow-md'
      }`}
    >
      {/* Video Preview on Hover / Touch-Hold */}
      {isPreviewing ? (
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      ) : (
        <img src={thumbSrc} alt={clip.title} className="w-full h-full object-cover" />
      )}

      {/* Card Info Overlay (No MOVIE badge) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-2 pointer-events-none z-20">
        <div className="flex justify-between items-start gap-1">
          <div className="flex items-center gap-1 flex-wrap">
            {isPreviewing ? (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-semibold flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Preview
              </span>
            ) : null}
            {clip.duration && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-white font-mono font-medium">
                {clip.duration}
              </span>
            )}
          </div>
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
              isSelected
                ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] ring-1 ring-white/50'
                : 'bg-black/60 text-white'
            }`}
          >
            {isSelected ? seqIdx + 1 : <i className="fa-solid fa-plus text-[9px]" />}
          </div>
        </div>
        <div className="text-left space-y-0.5">
          <p className="text-[10px] font-semibold text-white truncate drop-shadow-sm">{clip.title}</p>
          {clip.quote && (
            <p className="text-[8.5px] text-amber-200/95 truncate italic">"{clip.quote}"</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ToolStep2Vocab() {
  const {
    word,
    setWord,
    phonetic,
    setPhonetic,
    thaiRead,
    setThaiRead,
    meaning,
    setMeaning,
    grammar,
    setGrammar,
    ex1En,
    setEx1En,
    ex1Th,
    setEx1Th,
    ex2En,
    setEx2En,
    ex2Th,
    setEx2Th,
    cafeClipPool,
    activeClipSequence,
    toggleSelectClip,
    searchClips,
    loadMoreCafeClips,
    isLoadingMoreClips,
    randomWordWithAi,
    generateAiContent,
    craftSentencesFromSelectedClip,
    isCraftingSentences,
    isLoading,
    loadingText,
    collapsedSections,
    toggleToolCard,
    clearVocabData,
    lang
  } = useVocab();

  const isCollapsed = Boolean(collapsedSections['tool-sec-vocab']);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      generateAiContent(word);
    }
  };

  const clipCount = cafeClipPool.length;

  return (
    <section
      id="tool-sec-vocab"
      data-tool-keywords="2 vocabulary clips word translate phonetic meaning grammar examples formatting คำศัพท์ คลิปหนัง แปล ประโยค รูปแบบอักษร"
      className={`tool-section-card bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${
        isCollapsed ? 'is-collapsed' : ''
      }`}
    >
      <div
        className="tool-card-header flex items-center justify-between mb-3 pb-2 border-b border-[#f0efed] dark:border-[#292524] cursor-pointer select-none"
        onClick={() => toggleToolCard('tool-sec-vocab')}
      >
        <div className="flex items-center space-x-2 text-[#0c0a09] dark:text-white font-semibold text-sm">
          <span className="w-5 h-5 rounded-full bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] flex items-center justify-center text-[10px] font-mono">
            2
          </span>
          <span>Vocabulary & Clips</span>
        </div>
        <div className="flex items-center gap-1.5">
          {clipCount > 0 && (
            <span
              id="clip-source-indicator"
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white font-semibold uppercase tracking-wider"
            >
              {clipCount} CLIPS
            </span>
          )}
          {/* Step 2 Trash Button */}
          <button
            type="button"
            id="btn-clear-vocab-card"
            onClick={(e) => {
              e.stopPropagation();
              clearVocabData();
            }}
            className="w-6 h-6 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#777169] hover:text-rose-500 dark:text-[#a8a29e] dark:hover:text-rose-400 flex items-center justify-center transition t-btn-press"
            title={lang === 'th' ? 'ล้างข้อมูลคำศัพท์ (Clear Vocab)' : 'Clear Vocab Data'}
            aria-label="Clear Vocab"
          >
            <i className="fa-solid fa-trash-can text-[10.5px]" />
          </button>
          <button
            type="button"
            className="w-6 h-6 rounded-full hover:bg-[#f0efed] dark:hover:bg-[#292524] text-[#777169] hover:text-[#0c0a09] dark:hover:text-white flex items-center justify-center transition"
            title="Collapse / Expand"
          >
            <i className="fa-solid fa-chevron-down text-[10px] tool-collapse-chevron" />
          </button>
        </div>
      </div>

      <div className="tool-card-body">
        <div className="tool-card-inner space-y-3">
          {/* Unified Input: Search English Movie Clips & Translate Simultaneously */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                id="target-word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter English word or idiom..."
                className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg pl-3.5 pr-8 py-2 text-sm font-serif text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none transition"
              />
              {word && (
                <button
                  type="button"
                  onClick={() => setWord('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white text-xs p-1"
                  title="Clear input"
                  aria-label="Clear input"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
            <input type="hidden" id="clip-query" value={word} />

            {/* Random Word Generator via Selected AI */}
            <button
              type="button"
              onClick={randomWordWithAi}
              id="btn-random-word"
              className="w-9 h-9 bg-[#f0efed] dark:bg-[#292524] hover:bg-[#e7e5e4] text-[#0c0a09] dark:text-white border border-[#d6d3d1] dark:border-[#44403c] rounded-full transition flex items-center justify-center flex-shrink-0 t-btn-press"
              title="Random Word via AI"
              aria-label="Random Word"
            >
              <i id="random-dice-icon" className="fa-solid fa-dice text-sm text-[#0c0a09] dark:text-amber-300" />
            </button>

            {/* AI Generate Wand */}
            <button
              type="button"
              onClick={() => generateAiContent(word)}
              className="w-9 h-9 bg-[#0c0a09] dark:bg-white hover:bg-[#292524] text-white dark:text-[#0c0a09] rounded-full shadow-xs transition flex items-center justify-center flex-shrink-0 t-btn-press"
              title="Search Clips & Translate"
              aria-label="Search Clips & Translate"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-xs" />
            </button>

            {/* Film Search Only */}
            <button
              type="button"
              onClick={() => searchClips(word, true)}
              className="w-9 h-9 bg-white dark:bg-[#292524] hover:bg-[#f0efed] text-[#0c0a09] dark:text-white border border-[#d6d3d1] dark:border-[#44403c] rounded-full transition flex items-center justify-center flex-shrink-0 t-btn-press"
              title="Search Clips Only"
              aria-label="Search Clips Only"
            >
              <i className="fa-solid fa-film text-xs" />
            </button>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div id="ai-loading" className="p-2.5 bg-[#fafafa] dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-xl text-center">
              <div className="flex items-center justify-center space-x-2 text-[#292524] dark:text-[#f5f5f4] text-xs font-medium">
                <i className="fa-solid fa-circle-notch fa-spin" />
                <span id="ai-loading-text">{loadingText || 'Searching clips & translating...'}</span>
              </div>
            </div>
          )}

          {/* Scraped English Movie Clips Grid */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e]">Movie Clips</label>
              <button
                type="button"
                id="btn-load-more"
                onClick={loadMoreCafeClips}
                disabled={isLoadingMoreClips}
                className="w-7 h-7 bg-white dark:bg-[#292524] hover:bg-[#f0efed] text-[#292524] dark:text-white rounded-full border border-[#d6d3d1] dark:border-[#44403c] transition flex items-center justify-center t-btn-press disabled:opacity-50"
                title="Load More Clips"
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

            <div
              id="clip-grid"
              className="grid grid-cols-3 gap-2 max-h-[210px] overflow-y-auto p-2 bg-[#fafafa] dark:bg-[#201d1a] rounded-xl border border-[#e7e5e4] dark:border-[#292524]"
            >
              {cafeClipPool.length === 0 ? (
                <div className="col-span-full py-5 text-center text-[#777169] dark:text-[#a8a29e] text-xs">
                  Enter a word and click <i className="fa-solid fa-wand-magic-sparkles mx-0.5" /> to fetch clips & translate
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

          {/* Vocabulary & Short Examples Form */}
          <div className="pt-2 border-t border-[#f0efed] dark:border-[#292524] space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e] mb-1">IPA Phonetic</label>
                <input
                  type="text"
                  id="res-phonetic"
                  value={phonetic}
                  onChange={(e) => setPhonetic(e.target.value)}
                  placeholder="/.../"
                  className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-3 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e] mb-1">Thai Reading</label>
                <input
                  type="text"
                  id="res-thai-read"
                  value={thaiRead}
                  onChange={(e) => setThaiRead(e.target.value)}
                  placeholder="คำอ่านไทย"
                  className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-3 py-1.5 text-xs text-[#0c0a09] dark:text-white font-medium focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e] mb-1">Meaning (TH)</label>
              <input
                type="text"
                id="res-meaning"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="คำแปลภาษาไทย..."
                className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-3 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e] mb-1">Grammar Formula</label>
              <input
                type="text"
                id="res-grammar"
                value={grammar}
                onChange={(e) => setGrammar(e.target.value)}
                placeholder="[Subject] + ..."
                className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-3 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e]">Examples (2 Punchy Sentences)</label>
                <button
                  type="button"
                  id="btn-craft-examples"
                  onClick={craftSentencesFromSelectedClip}
                  disabled={isCraftingSentences}
                  className="w-7 h-7 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-[#e7e5e4] text-[#0c0a09] dark:text-white flex items-center justify-center transition disabled:opacity-50"
                  title="Regenerate Examples"
                  aria-label="Regenerate Examples"
                >
                  <i className={`fa-solid fa-wand-magic-sparkles text-[10px] ${isCraftingSentences ? 'fa-spin text-amber-500' : ''}`} />
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    id="res-ex1-en"
                    value={ex1En}
                    onChange={(e) => setEx1En(e.target.value)}
                    placeholder="Sentence 1 (EN)"
                    className="bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-2.5 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
                  />
                  <input
                    type="text"
                    id="res-ex1-th"
                    value={ex1Th}
                    onChange={(e) => setEx1Th(e.target.value)}
                    placeholder="คำแปล 1 (TH)"
                    className="bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-2.5 py-1.5 text-xs text-[#777169] dark:text-[#a8a29e] focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    id="res-ex2-en"
                    value={ex2En}
                    onChange={(e) => setEx2En(e.target.value)}
                    placeholder="Sentence 2 (EN)"
                    className="bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-2.5 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
                  />
                  <input
                    type="text"
                    id="res-ex2-th"
                    value={ex2Th}
                    onChange={(e) => setEx2Th(e.target.value)}
                    placeholder="คำแปล 2 (TH)"
                    className="bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-2.5 py-1.5 text-xs text-[#777169] dark:text-[#a8a29e] focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Text Formatting Suite for All Vocabulary Elements */}
            <div className="pt-2">
              <TextFormattingSuite />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
