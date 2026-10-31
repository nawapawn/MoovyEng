'use client';

import React from 'react';
import { useVocab } from '../../context/VocabContext';

/**
 * VocabFieldInputs
 * Individual vocabulary input fields with per-field Regenerate buttons,
 * Canva formatting target selectors, and substring selection support.
 */
export default function VocabFieldInputs({
  phonetic,
  setPhonetic,
  regeneratePhonetic,
  thaiRead,
  setThaiRead,
  meaning,
  setMeaning,
  regenerateMeaning,
  grammar,
  setGrammar,
  regenerateGrammar,
  ex1En,
  setEx1En,
  ex1Th,
  setEx1Th,
  regenerateEx1,
  ex2En,
  setEx2En,
  ex2Th,
  setEx2Th,
  regenerateEx2,
  craftSentencesFromSelectedClip,
  isCraftingSentences,
  isRegenerating = {},
  activeFormatTarget,
  setActiveFormatTarget
}) {
  const { setActiveSelection, clearSelectionFormat, lang } = useVocab();

  const handleInputSelect = (fieldName, e) => {
    const input = e.target;
    if (
      input.selectionStart !== undefined &&
      input.selectionEnd !== undefined &&
      input.selectionStart !== input.selectionEnd
    ) {
      const selectedText = input.value.slice(input.selectionStart, input.selectionEnd);
      setActiveSelection?.({
        fieldName,
        text: selectedText,
        start: input.selectionStart,
        end: input.selectionEnd,
        isInputField: true
      });
    }
  };

  const hasStyledSpan = (val) => Boolean(val && typeof val === 'string' && val.includes('<span'));

  return (
    <div className="space-y-3">
      {/* IPA Phonetic and Thai Reading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* IPA Phonetic */}
        <div>
          <div className="flex items-center justify-between mb-1 gap-1">
            <label htmlFor="res-phonetic" className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e] truncate">
              {lang === 'th' ? 'สัทอักษร (IPA Phonetic)' : 'IPA Phonetic'}
            </label>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={regeneratePhonetic}
                disabled={isRegenerating?.phonetic}
                className="w-5 h-5 rounded-full hover:bg-[#f0efed] dark:hover:bg-[#292524] text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white flex items-center justify-center transition"
                title={lang === 'th' ? 'สร้างสัทอักษรใหม่' : 'Regenerate IPA'}
              >
                <i className={`fa-solid fa-arrows-rotate text-[9px] ${isRegenerating?.phonetic ? 'fa-spin text-amber-500' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setActiveFormatTarget?.('phonetic')}
                className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap transition ${
                  activeFormatTarget === 'phonetic'
                    ? 'bg-[#f0ebf8] text-[#6b38c2] dark:bg-[#34244d] dark:text-[#c4a5f3] font-bold'
                    : 'text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white'
                }`}
                title={lang === 'th' ? 'ปรับฟอนต์/สไตล์ สัทอักษร' : 'Style IPA'}
              >
                {lang === 'th' ? 'Aa สไตล์' : 'Aa Style'}
              </button>
            </div>
          </div>
          <input
            type="text"
            id="res-phonetic"
            value={phonetic}
            onChange={(e) => setPhonetic(e.target.value)}
            onSelect={(e) => handleInputSelect('phonetic', e)}
            onFocus={() => setActiveFormatTarget?.('phonetic')}
            placeholder="/.../"
            className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-3 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
          />
          {hasStyledSpan(phonetic) && (
            <div className="flex items-center justify-between text-[10px] text-violet-600 dark:text-violet-400 font-mono px-1 pt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <span>{lang === 'th' ? 'มีสไตล์แบบกำหนดเอง' : 'Custom styled'}</span>
              </span>
              <button
                type="button"
                onClick={() => clearSelectionFormat?.('phonetic')}
                className="text-rose-500 hover:underline uppercase text-[9px]"
              >
                {lang === 'th' ? 'รีเซ็ต' : 'Reset'}
              </button>
            </div>
          )}
        </div>

        {/* Thai Reading */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="res-thai-read" className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e]">
              {lang === 'th' ? 'คำอ่านภาษาไทย' : 'Thai Reading'}
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={regeneratePhonetic}
                disabled={isRegenerating?.phonetic}
                className="w-5 h-5 rounded-full hover:bg-[#f0efed] dark:hover:bg-[#292524] text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white flex items-center justify-center transition"
                title={lang === 'th' ? 'สร้างคำอ่านใหม่' : 'Regenerate Thai Reading'}
              >
                <i className={`fa-solid fa-arrows-rotate text-[9px] ${isRegenerating?.phonetic ? 'fa-spin text-amber-500' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setActiveFormatTarget?.('thaiRead')}
                className={`text-[10px] px-1.5 py-0.5 rounded transition ${
                  activeFormatTarget === 'thaiRead'
                    ? 'bg-[#f0ebf8] text-[#6b38c2] dark:bg-[#34244d] dark:text-[#c4a5f3] font-bold'
                    : 'text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white'
                }`}
                title={lang === 'th' ? 'ปรับฟอนต์/สไตล์ คำอ่านไทย' : 'Style Thai Reading'}
              >
                {lang === 'th' ? 'Aa สไตล์' : 'Aa Style'}
              </button>
            </div>
          </div>
          <input
            type="text"
            id="res-thai-read"
            value={thaiRead}
            onChange={(e) => setThaiRead(e.target.value)}
            onSelect={(e) => handleInputSelect('thaiRead', e)}
            onFocus={() => setActiveFormatTarget?.('thaiRead')}
            placeholder={lang === 'th' ? 'คำอ่านไทย...' : 'Thai reading...'}
            className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-3 py-1.5 text-xs text-[#0c0a09] dark:text-white font-medium focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
          />
          {hasStyledSpan(thaiRead) && (
            <div className="flex items-center justify-between text-[10px] text-violet-600 dark:text-violet-400 font-mono px-1 pt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <span>{lang === 'th' ? 'มีสไตล์แบบกำหนดเอง' : 'Custom styled'}</span>
              </span>
              <button
                type="button"
                onClick={() => clearSelectionFormat?.('thaiRead')}
                className="text-rose-500 hover:underline uppercase text-[9px]"
              >
                {lang === 'th' ? 'รีเซ็ต' : 'Reset'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grammar Formula (Extracted from Selected Movie Clip) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="res-grammar" className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e]">
            {lang === 'th' ? 'โครงสร้างหลักจากบทหนัง (Movie Sentence Pattern)' : 'Movie Sentence Pattern (Grammar)'}
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={regenerateGrammar}
              disabled={isRegenerating?.grammar}
              className="w-5 h-5 rounded-full hover:bg-[#f0efed] dark:hover:bg-[#292524] text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white flex items-center justify-center transition"
              title={lang === 'th' ? 'สร้างสูตรไวยากรณ์ใหม่จากคลิปหนัง' : 'Regenerate Grammar Formula'}
            >
              <i className={`fa-solid fa-arrows-rotate text-[9px] ${isRegenerating?.grammar ? 'fa-spin text-amber-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setActiveFormatTarget?.('grammar')}
              className={`text-[10px] px-1.5 py-0.5 rounded transition ${
                activeFormatTarget === 'grammar'
                  ? 'bg-[#f0ebf8] text-[#6b38c2] dark:bg-[#34244d] dark:text-[#c4a5f3] font-bold'
                  : 'text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white'
              }`}
              title={lang === 'th' ? 'ปรับฟอนต์/สไตล์ ไวยากรณ์' : 'Style Grammar'}
            >
              {lang === 'th' ? 'Aa สไตล์' : 'Aa Style'}
            </button>
          </div>
        </div>
        <input
          type="text"
          id="res-grammar"
          value={grammar}
          onChange={(e) => setGrammar(e.target.value)}
          onSelect={(e) => handleInputSelect('grammar', e)}
          onFocus={() => setActiveFormatTarget?.('grammar')}
          placeholder="Subject + need to + [Vocabulary] + (Time/Place)"
          className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-3 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
        />
        {hasStyledSpan(grammar) && (
          <div className="flex items-center justify-between text-[10px] text-violet-600 dark:text-violet-400 font-mono px-1 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span>{lang === 'th' ? 'มีสไตล์แบบกำหนดเอง' : 'Custom styled'}</span>
            </span>
            <button
              type="button"
              onClick={() => clearSelectionFormat?.('grammar')}
              className="text-rose-500 hover:underline uppercase text-[9px]"
            >
              {lang === 'th' ? 'รีเซ็ต' : 'Reset'}
            </button>
          </div>
        )}
      </div>

      {/* Step 3: 1 Movie Pattern Sentence + 1 Freestyle Sentence */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <label className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e]">
              {lang === 'th' ? 'ขั้นตอนที่ 3: แต่งประโยคตามโครงสร้างหนัง (1) & ประโยคอิสระ (2)' : 'Step 3: Movie Pattern (1) & Freestyle Sentence (2)'}
            </label>
            <button
              type="button"
              onClick={() => setActiveFormatTarget?.('ex1')}
              className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap transition ${
                activeFormatTarget === 'ex1' || activeFormatTarget === 'ex2'
                  ? 'bg-[#f0ebf8] text-[#6b38c2] dark:bg-[#34244d] dark:text-[#c4a5f3] font-bold'
                  : 'text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white'
              }`}
              title={lang === 'th' ? 'ปรับฟอนต์/สไตล์ ตัวอย่างประโยค' : 'Style Examples'}
            >
              {lang === 'th' ? 'Aa สไตล์' : 'Aa Style'}
            </button>
          </div>
          <button
            type="button"
            id="btn-craft-examples"
            onClick={craftSentencesFromSelectedClip}
            disabled={isCraftingSentences}
            className="px-2 py-1 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-[#e7e5e4] text-[#0c0a09] dark:text-white flex items-center gap-1.5 transition disabled:opacity-50 text-[10px] font-medium whitespace-nowrap"
            title={lang === 'th' ? 'แกะโครงสร้างจากคลิปที่เลือกและแต่งใหม่ทั้ง 2 ประโยค' : 'Analyze Selected Clip & Regenerate Both'}
            aria-label={lang === 'th' ? 'สร้างตัวอย่างประโยคใหม่' : 'Regenerate Examples'}
          >
            <i className={`fa-solid fa-wand-magic-sparkles text-[9px] ${isCraftingSentences ? 'fa-spin text-amber-500' : ''}`} />
            <span>{lang === 'th' ? 'แต่งจากคลิปที่เลือก' : 'Craft from Clip'}</span>
          </button>
        </div>

        <div className="space-y-2">
          {/* Example 1: Movie Pattern Sentence */}
          <div>
            <div className="text-[10px] font-medium text-[#777169] dark:text-[#a8a29e] mb-1">
              {lang === 'th'
                ? '1. ประโยคตามโครงสร้างหนัง (คงโครงสร้างเดิม เปลี่ยนประธาน/กรรม)'
                : '1. Movie Pattern Sentence (Same grammar structure, new subject/object)'}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
                <input
                  type="text"
                  id="res-ex1-en"
                  value={ex1En}
                  onChange={(e) => setEx1En(e.target.value)}
                  onSelect={(e) => handleInputSelect('ex1En', e)}
                  onFocus={() => setActiveFormatTarget?.('ex1')}
                  placeholder={lang === 'th' ? 'ประโยคตามโครงสร้างหนัง (EN)' : 'Pattern Sentence (EN)'}
                  className="bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-2.5 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
                />
                <input
                  type="text"
                  id="res-ex1-th"
                  value={ex1Th}
                  onChange={(e) => setEx1Th(e.target.value)}
                  onSelect={(e) => handleInputSelect('ex1Th', e)}
                  onFocus={() => setActiveFormatTarget?.('ex1')}
                  placeholder={lang === 'th' ? 'คำแปลประโยค 1 (TH)' : 'Translation 1 (TH)'}
                  className="bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-2.5 py-1.5 text-xs text-[#777169] dark:text-[#a8a29e] focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={regenerateEx1}
                disabled={isRegenerating?.ex1}
                className="w-7 h-7 rounded-lg bg-[#fafafa] dark:bg-[#292524] hover:bg-[#e7e5e4] border border-[#e7e5e4] dark:border-[#44403c] text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white flex items-center justify-center transition flex-shrink-0 t-btn-press"
                title={lang === 'th' ? 'สร้างประโยคตามโครงสร้างหนังใหม่' : 'Regenerate Movie Pattern Sentence'}
              >
                <i className={`fa-solid fa-arrows-rotate text-[10px] ${isRegenerating?.ex1 ? 'fa-spin text-amber-500' : ''}`} />
              </button>
            </div>
            {hasStyledSpan(ex1En) && (
              <div className="flex items-center justify-between text-[10px] text-violet-600 dark:text-violet-400 font-mono px-1 pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span>{lang === 'th' ? 'มีสไตล์แบบกำหนดเอง' : 'Custom styled'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => clearSelectionFormat?.('ex1En')}
                  className="text-rose-500 hover:underline uppercase text-[9px]"
                >
                  {lang === 'th' ? 'รีเซ็ต' : 'Reset'}
                </button>
              </div>
            )}
          </div>

          {/* Example 2: Freestyle Sentence */}
          <div>
            <div className="text-[10px] font-medium text-[#777169] dark:text-[#a8a29e] mb-1">
              {lang === 'th'
                ? '2. ประโยคอิสระ (Freestyle — สร้างประโยคใหม่ในบริบทอื่นอย่างอิสระ)'
                : '2. Freestyle Sentence (New sentence in another everyday context)'}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
                <input
                  type="text"
                  id="res-ex2-en"
                  value={ex2En}
                  onChange={(e) => setEx2En(e.target.value)}
                  onSelect={(e) => handleInputSelect('ex2En', e)}
                  onFocus={() => setActiveFormatTarget?.('ex2')}
                  placeholder={lang === 'th' ? 'ประโยคอิสระ (EN)' : 'Freestyle Sentence (EN)'}
                  className="bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-2.5 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
                />
                <input
                  type="text"
                  id="res-ex2-th"
                  value={ex2Th}
                  onChange={(e) => setEx2Th(e.target.value)}
                  onSelect={(e) => handleInputSelect('ex2Th', e)}
                  onFocus={() => setActiveFormatTarget?.('ex2')}
                  placeholder={lang === 'th' ? 'คำแปลประโยค 2 (TH)' : 'Translation 2 (TH)'}
                  className="bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-2.5 py-1.5 text-xs text-[#777169] dark:text-[#a8a29e] focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={regenerateEx2}
                disabled={isRegenerating?.ex2}
                className="w-7 h-7 rounded-lg bg-[#fafafa] dark:bg-[#292524] hover:bg-[#e7e5e4] border border-[#e7e5e4] dark:border-[#44403c] text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white flex items-center justify-center transition flex-shrink-0 t-btn-press"
                title={lang === 'th' ? 'สร้างประโยคอิสระใหม่' : 'Regenerate Freestyle Sentence'}
              >
                <i className={`fa-solid fa-arrows-rotate text-[10px] ${isRegenerating?.ex2 ? 'fa-spin text-amber-500' : ''}`} />
              </button>
            </div>
            {hasStyledSpan(ex2En) && (
              <div className="flex items-center justify-between text-[10px] text-violet-600 dark:text-violet-400 font-mono px-1 pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span>{lang === 'th' ? 'มีสไตล์แบบกำหนดเอง' : 'Custom styled'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => clearSelectionFormat?.('ex2En')}
                  className="text-rose-500 hover:underline uppercase text-[9px]"
                >
                  {lang === 'th' ? 'รีเซ็ต' : 'Reset'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
