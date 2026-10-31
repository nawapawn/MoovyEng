'use client';

import React from 'react';
import { useVocab } from '../context/VocabContext';
import TextFormattingSuite from './TextFormattingSuite';
import MovieClipGrid from './tools/MovieClipGrid';
import VocabFieldInputs from './tools/VocabFieldInputs';

export default function ToolStep2Vocab() {
  const {
    word,
    setWord,
    updateWord,
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
    lang,
    setActiveFormatTarget,
    activeFormatTarget,
    isRegenerating,
    regeneratePhonetic,
    regenerateMeaning,
    regenerateGrammar,
    regenerateEx1,
    regenerateEx2
  } = useVocab();

  const isCollapsed = Boolean(collapsedSections['tool-sec-vocab']);
  const clipCount = cafeClipPool.length;

  return (
    <section
      id="tool-sec-vocab"
      data-tool-keywords="2 vocabulary clips word translate phonetic meaning grammar examples formatting คำศัพท์ คลิปหนัง แปล ประโยค รูปแบบอักษร"
      className={`tool-section-card card-magical relative z-20 bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${
        isCollapsed ? 'is-collapsed' : ''
      }`}
    >
      {/* Header */}
      <div
        className="tool-card-header flex items-center justify-between mb-3 pb-2 border-b border-[#f0efed] dark:border-[#292524] cursor-pointer select-none"
        onClick={() => toggleToolCard('tool-sec-vocab')}
      >
        <div className="flex items-center space-x-2 text-[#0c0a09] dark:text-white font-semibold text-sm">
          <span className="w-5 h-5 rounded-full bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] flex items-center justify-center text-[10px] font-mono">
            2
          </span>
          <span>{lang === 'th' ? '2. คำศัพท์และคลิปหนัง' : '2. Vocabulary & Clips'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {clipCount > 0 && (
            <span
              id="clip-source-indicator"
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white font-semibold uppercase tracking-wider"
            >
              {clipCount} {lang === 'th' ? 'คลิป' : 'CLIPS'}
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
            title={lang === 'th' ? 'ย่อ / ขยาย' : 'Collapse / Expand'}
          >
            <i className="fa-solid fa-chevron-down text-[10px] tool-collapse-chevron" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="tool-card-body">
        <div className="tool-card-inner space-y-3">
          {/* Movie Clip Search & Grid */}
          <MovieClipGrid
            word={word}
            setWord={setWord}
            meaning={meaning}
            setMeaning={setMeaning}
            regenerateMeaning={regenerateMeaning}
            isRegenerating={isRegenerating}
            updateWord={updateWord}
            generateAiContent={generateAiContent}
            randomWordWithAi={randomWordWithAi}
            searchClips={searchClips}
            isLoading={isLoading}
            loadingText={loadingText}
            cafeClipPool={cafeClipPool}
            activeClipSequence={activeClipSequence}
            toggleSelectClip={toggleSelectClip}
            loadMoreCafeClips={loadMoreCafeClips}
            isLoadingMoreClips={isLoadingMoreClips}
            activeFormatTarget={activeFormatTarget}
            setActiveFormatTarget={setActiveFormatTarget}
          />

          {/* Vocabulary & Short Examples Form */}
          <div className="pt-2 border-t border-[#f0efed] dark:border-[#292524] space-y-3">
            {/* Canva Text Formatting Suite */}
            <TextFormattingSuite />

            {/* Individual Field Inputs with Regenerate Buttons */}
            <VocabFieldInputs
              phonetic={phonetic}
              setPhonetic={setPhonetic}
              regeneratePhonetic={regeneratePhonetic}
              thaiRead={thaiRead}
              setThaiRead={setThaiRead}
              meaning={meaning}
              setMeaning={setMeaning}
              regenerateMeaning={regenerateMeaning}
              grammar={grammar}
              setGrammar={setGrammar}
              regenerateGrammar={regenerateGrammar}
              ex1En={ex1En}
              setEx1En={setEx1En}
              ex1Th={ex1Th}
              setEx1Th={setEx1Th}
              regenerateEx1={regenerateEx1}
              ex2En={ex2En}
              setEx2En={setEx2En}
              ex2Th={ex2Th}
              setEx2Th={setEx2Th}
              regenerateEx2={regenerateEx2}
              craftSentencesFromSelectedClip={craftSentencesFromSelectedClip}
              isCraftingSentences={isCraftingSentences}
              isRegenerating={isRegenerating}
              activeFormatTarget={activeFormatTarget}
              setActiveFormatTarget={setActiveFormatTarget}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
