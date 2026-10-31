'use client';

import React from 'react';
import { useVocab } from '../../context/VocabContext';
import { getTextElementStyle, getTextElementClass } from '../../lib/utils';
import DraggablePreviewItem from './DraggablePreviewItem';

/**
 * PreviewWordBlock
 * Displays the main target word (either curved SVG or straight heading),
 * IPA phonetic guide, and Thai pronunciation guide with draggable support.
 */
export default function PreviewWordBlock({
  isWide = false,
  cfg,
  word,
  phonetic,
  thaiRead,
  fmtWord,
  fmtPhonetic,
  fmtThaiRead,
  isDark,
  setActiveFormatTarget,
  elementPositions,
  updateElementPosition,
  activeDragInfo,
  setActiveDragInfo,
  containerRef
}) {
  const { lang } = useVocab();
  return (
    <div
      id="preview-top-vocab-block"
      className={
        isWide
          ? 'col-span-5 flex flex-col items-center justify-center space-y-0.5 text-center'
          : 'w-full flex flex-col items-center justify-center space-y-0.5 text-center'
      }
    >
      {/* Target Word (Straight or Curved Text) */}
      <DraggablePreviewItem
        id="word"
        label={lang === 'th' ? 'คำศัพท์' : 'English Word'}
        className="w-full flex items-center justify-center"
        elementPositions={elementPositions}
        updateElementPosition={updateElementPosition}
        activeDragInfo={activeDragInfo}
        setActiveDragInfo={setActiveDragInfo}
        containerRef={containerRef}
      >
        <div className="flex items-center justify-center w-full px-2 py-0.5">
          {fmtWord?.shape === 'curved' ? (
            <svg
              id="preview-word-curved"
              data-preview-field="word"
              onClick={() => setActiveFormatTarget?.('word')}
              className="w-full max-w-[340px] h-[90px] overflow-visible cursor-pointer transition hover:opacity-90"
              viewBox="0 0 340 90"
              title={lang === 'th' ? 'คลิกเพื่อปรับสไตล์คำศัพท์' : 'Click to format Word'}
            >
              <path
                id="phoneWordCurvePath"
                d={`M 20,80 Q 170,${90 - (fmtWord.curvature || 80) * 0.7} 320,80`}
                fill="transparent"
              />
              <text
                className={`${cfg?.wordClass || ''} ${getTextElementClass(fmtWord)}`}
                textAnchor="middle"
              >
                <textPath
                  href="#phoneWordCurvePath"
                  startOffset="50%"
                  style={getTextElementStyle(fmtWord, isDark)}
                >
                  {word}
                </textPath>
              </text>
            </svg>
          ) : (
            <h1
              id="preview-word"
              data-preview-field="word"
              onClick={() => setActiveFormatTarget?.('word')}
              className={`${cfg?.wordClass || ''} ${getTextElementClass(fmtWord)} cursor-pointer transition hover:opacity-90`}
              style={getTextElementStyle(fmtWord, isDark)}
              title={lang === 'th' ? 'คลิกเพื่อปรับสไตล์คำศัพท์' : 'Click to format Word'}
              dangerouslySetInnerHTML={{ __html: word || '' }}
            />
          )}
        </div>
      </DraggablePreviewItem>

      {/* IPA Phonetic Guide */}
      <DraggablePreviewItem
        id="phonetic"
        label={lang === 'th' ? 'สัทอักษร (IPA)' : 'Phonetic (IPA)'}
        className="w-full flex items-center justify-center"
        elementPositions={elementPositions}
        updateElementPosition={updateElementPosition}
        activeDragInfo={activeDragInfo}
        setActiveDragInfo={setActiveDragInfo}
        containerRef={containerRef}
      >
        <div className="flex items-center justify-center pt-0.5 w-full px-2">
          <p
            id="preview-phonetic"
            data-preview-field="phonetic"
            onClick={() => setActiveFormatTarget?.('phonetic')}
            className={`text-xs sm:text-[13px] font-mono tracking-wider ${getTextElementClass(fmtPhonetic)} cursor-pointer transition hover:opacity-90`}
            style={{
              color: fmtPhonetic?.rawColor || (isDark ? '#94a3b8' : '#78716c'),
              ...getTextElementStyle(fmtPhonetic, isDark)
            }}
            title={lang === 'th' ? 'คลิกเพื่อปรับสัทอักษร' : 'Click to format IPA Phonetic'}
            dangerouslySetInnerHTML={{ __html: phonetic || '' }}
          />
        </div>
      </DraggablePreviewItem>

      {/* Thai Pronunciation */}
      <DraggablePreviewItem
        id="thaiRead"
        label={lang === 'th' ? 'คำอ่านไทย' : 'Thai Reading'}
        className="w-full flex items-center justify-center"
        elementPositions={elementPositions}
        updateElementPosition={updateElementPosition}
        activeDragInfo={activeDragInfo}
        setActiveDragInfo={setActiveDragInfo}
        containerRef={containerRef}
      >
        <div className="flex items-center justify-center w-full px-2">
          <p
            id="preview-thai-read"
            data-preview-field="thaiRead"
            onClick={() => setActiveFormatTarget?.('thaiRead')}
            className={`thai-vocab-font text-sm sm:text-base w-full font-semibold ${getTextElementClass(fmtThaiRead)} cursor-pointer transition hover:opacity-90`}
            style={{
              color: fmtThaiRead?.rawColor || (isDark ? '#e2e8f0' : '#44403c'),
              ...getTextElementStyle(fmtThaiRead, isDark)
            }}
            title={lang === 'th' ? 'คลิกเพื่อปรับคำอ่านไทย' : 'Click to format Thai Reading'}
            dangerouslySetInnerHTML={{ __html: thaiRead || '' }}
          />
        </div>
      </DraggablePreviewItem>
    </div>
  );
}
