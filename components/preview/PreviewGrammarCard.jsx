'use client';

import React from 'react';
import { useVocab } from '../../context/VocabContext';
import { formatGrammarHtml, getFontFamilyCss, getTextElementStyle, getTextElementClass } from '../../lib/utils';
import DraggablePreviewItem from './DraggablePreviewItem';

/**
 * PreviewGrammarCard
 * Displays the bold Thai meaning heading and the frameless grammar formula + 2 punchy examples,
 * all independently draggable with distance guidance.
 */
export default function PreviewGrammarCard({
  isWide = false,
  cfg,
  meaning,
  grammar,
  wordKeyword,
  ex1En,
  ex1Th,
  ex2En,
  ex2Th,
  fmtMeaning,
  fmtGrammar,
  fmtEx1,
  fmtEx2,
  isDark,
  setActiveFormatTarget,
  elementPositions,
  updateElementPosition,
  activeDragInfo,
  setActiveDragInfo,
  containerRef
}) {
  const { lang } = useVocab();
  const cleanTh = (str) => (str || '').replace(/^\s*\((.*)\)\s*$/, '$1').trim();

  return (
    <div
      id="preview-bottom-grammar-block"
      className={
        isWide
          ? 'col-span-7 col-start-6 row-start-1 row-span-2 flex flex-col items-center justify-center space-y-1.5'
          : 'w-full flex flex-col items-center justify-center space-y-2 pt-0.5'
      }
    >
      {/* Thai Meaning (Big, Bold, Clean) */}
      <DraggablePreviewItem
        id="meaning"
        label={lang === 'th' ? 'คำแปลภาษาไทย' : 'Thai Meaning'}
        className="w-full flex items-center justify-center"
        elementPositions={elementPositions}
        updateElementPosition={updateElementPosition}
        activeDragInfo={activeDragInfo}
        setActiveDragInfo={setActiveDragInfo}
        containerRef={containerRef}
      >
        <div className="text-center w-full px-2 py-0.5">
          <h2
            id="preview-meaning"
            data-preview-field="meaning"
            onClick={() => setActiveFormatTarget?.('meaning')}
            className={`${cfg?.meaningClass || ''} ${getTextElementClass(fmtMeaning)} cursor-pointer transition hover:opacity-90`}
            style={getTextElementStyle(fmtMeaning, isDark)}
            title={lang === 'th' ? 'คลิกเพื่อปรับความหมาย' : 'Click to format Meaning'}
            dangerouslySetInnerHTML={{ __html: (meaning || '').replace(/["']/g, '') }}
          />
        </div>
      </DraggablePreviewItem>

      {/* Grammar Formula & Examples Container */}
      <div
        id="grammar-detail-card"
        className={cfg?.grammarCardClass || 'w-full max-w-[374px] flex flex-col items-center space-y-2.5 preview-thai-font'}
      >
        {/* Sleek Modern Formula Pill */}
        <DraggablePreviewItem
          id="grammar"
          label={lang === 'th' ? 'สูตรไวยากรณ์' : 'Grammar Formula'}
          className="w-full flex items-center justify-center"
          elementPositions={elementPositions}
          updateElementPosition={updateElementPosition}
          activeDragInfo={activeDragInfo}
          setActiveDragInfo={setActiveDragInfo}
          containerRef={containerRef}
        >
          <div
            id="preview-grammar"
            data-preview-field="grammar"
            onClick={() => setActiveFormatTarget?.('grammar')}
            className={`w-full bg-stone-50/90 dark:bg-stone-900/70 border border-stone-200/90 dark:border-stone-800/90 rounded-xl px-3.5 py-2 text-center transition hover:border-stone-400 cursor-pointer shadow-2xs ${getTextElementClass(
              fmtGrammar
            )}`}
            style={getTextElementStyle(fmtGrammar, isDark)}
            title={lang === 'th' ? 'คลิกเพื่อปรับสูตรไวยากรณ์' : 'Click to format Grammar Formula'}
            dangerouslySetInnerHTML={{ __html: formatGrammarHtml(grammar, wordKeyword, isDark) }}
          />
        </DraggablePreviewItem>

        {/* 2 Punchy Example Sentences with Stylish Left Accent Line */}
        <div className="w-full space-y-2.5 pt-1">
          {/* Example 1 */}
          <DraggablePreviewItem
            id="ex1"
            label={lang === 'th' ? 'ตัวอย่างประโยค 1' : 'Example 1'}
            className="w-full"
            elementPositions={elementPositions}
            updateElementPosition={updateElementPosition}
            activeDragInfo={activeDragInfo}
            setActiveDragInfo={setActiveDragInfo}
            containerRef={containerRef}
          >
            <div
              id="preview-ex1"
              onClick={() => setActiveFormatTarget?.('ex1')}
              className="w-full border-l-[3px] border-stone-900 dark:border-stone-200 pl-3 py-0.5 space-y-0.5 cursor-pointer transition hover:opacity-90"
              style={{ textAlign: fmtEx1?.textAlign || 'left' }}
              title={lang === 'th' ? 'คลิกเพื่อปรับตัวอย่าง 1' : 'Click to format Example 1'}
            >
              {ex1En && (
                <div
                  className={`preview-example-en text-[13.5px] sm:text-[14.5px] font-bold text-stone-900 dark:text-stone-100 leading-snug tracking-tight ${getTextElementClass(
                    fmtEx1
                  )}`}
                  style={getTextElementStyle(fmtEx1, isDark)}
                  data-preview-field="ex1En"
                  dangerouslySetInnerHTML={{ __html: ex1En }}
                />
              )}
              {ex1Th && (
                <div
                  className="preview-example-th text-[12px] sm:text-[12.5px] text-stone-600 dark:text-stone-400 font-medium leading-normal"
                  style={{
                    color: fmtEx1?.rawColor ? `${fmtEx1.rawColor}cc` : (isDark ? '#cbd5e1' : '#57534e'),
                    fontFamily: getFontFamilyCss(fmtEx1?.fontFamily)
                  }}
                  data-preview-field="ex1Th"
                  dangerouslySetInnerHTML={{ __html: cleanTh(ex1Th) }}
                />
              )}
            </div>
          </DraggablePreviewItem>

          {/* Example 2 */}
          <DraggablePreviewItem
            id="ex2"
            label={lang === 'th' ? 'ตัวอย่างประโยค 2' : 'Example 2'}
            className="w-full"
            elementPositions={elementPositions}
            updateElementPosition={updateElementPosition}
            activeDragInfo={activeDragInfo}
            setActiveDragInfo={setActiveDragInfo}
            containerRef={containerRef}
          >
            <div
              id="preview-ex2"
              onClick={() => setActiveFormatTarget?.('ex2')}
              className="w-full border-l-[3px] border-stone-900 dark:border-stone-200 pl-3 py-0.5 space-y-0.5 cursor-pointer transition hover:opacity-90"
              style={{ textAlign: fmtEx2?.textAlign || 'left' }}
              title={lang === 'th' ? 'คลิกเพื่อปรับตัวอย่าง 2' : 'Click to format Example 2'}
            >
              {ex2En && (
                <div
                  className={`preview-example-en text-[13.5px] sm:text-[14.5px] font-bold text-stone-900 dark:text-stone-100 leading-snug tracking-tight ${getTextElementClass(
                    fmtEx2
                  )}`}
                  style={getTextElementStyle(fmtEx2, isDark)}
                  data-preview-field="ex2En"
                  dangerouslySetInnerHTML={{ __html: ex2En }}
                />
              )}
              {ex2Th && (
                <div
                  className="preview-example-th text-[12px] sm:text-[12.5px] text-stone-600 dark:text-stone-400 font-medium leading-normal"
                  style={{
                    color: fmtEx2?.rawColor ? `${fmtEx2.rawColor}cc` : (isDark ? '#cbd5e1' : '#57534e'),
                    fontFamily: getFontFamilyCss(fmtEx2?.fontFamily)
                  }}
                  data-preview-field="ex2Th"
                  dangerouslySetInnerHTML={{ __html: cleanTh(ex2Th) }}
                />
              )}
            </div>
          </DraggablePreviewItem>
        </div>
      </div>
    </div>
  );
}
