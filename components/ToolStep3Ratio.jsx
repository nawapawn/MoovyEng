'use client';

import React, { useState } from 'react';
import { useVocab } from '../context/VocabContext';
import { RATIO_META, normalizeThumbUrl } from '../lib/utils';

export default function ToolStep3Ratio() {
  const {
    clipAspectRatio,
    setClipAspectRatio,
    bgColor1,
    setBgColor1,
    bgColor2,
    setBgColor2,
    activeClipSequence,
    reorderClip,
    removeClip,
    playAllClipsWithPython,
    collapsedSections,
    toggleToolCard,
    lang,
    showHighlight,
    toggleHighlight,
    useMovieBackdrop,
    setUseMovieBackdrop,
    bgBlur,
    setBgBlur,
    bgOverlayOpacity,
    setBgOverlayOpacity,
    textFormat,
    setTextFormat,
    resetTextFormat,
    cleanCache,
    showCustomDialog,
    t
  } = useVocab();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isCollapsed = Boolean(collapsedSections['tool-sec-ratio']);
  const meta = RATIO_META[clipAspectRatio] || RATIO_META['9:16'];

  const handleRatioSelect = (ratio) => {
    setClipAspectRatio(ratio);
    setIsDropdownOpen(false);
  };

  const handleResetGradient = () => {
    setBgColor1('#fafafa');
    setBgColor2('#fafafa');
  };

  const setGradientPreset = (c1, c2) => {
    setBgColor1(c1);
    setBgColor2(c2);
  };

  return (
    <section
      id="tool-sec-ratio"
      data-tool-keywords="3 aspect ratio queue size tiktok reels shorts youtube สัดส่วน ขนาด คิวคลิป"
      className={`tool-section-card w-full max-w-full min-w-0 overflow-hidden bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${
        isCollapsed ? 'is-collapsed' : ''
      }`}
    >
      <div
        className="tool-card-header flex items-center justify-between mb-3 pb-2 border-b border-[#f0efed] dark:border-[#292524] cursor-pointer select-none"
        onClick={() => toggleToolCard('tool-sec-ratio')}
      >
        <div className="flex items-center space-x-2 text-[#0c0a09] dark:text-white font-semibold text-sm">
          <span className="w-5 h-5 rounded-full bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] flex items-center justify-center text-[10px] font-mono">
            3
          </span>
          <span>Aspect Ratio & Queue</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            id="selected-badge"
            className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white font-medium"
          >
            {activeClipSequence.length} {lang === 'th' ? 'clips' : 'clips'}
          </span>
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
        <div className="tool-card-inner space-y-3 w-full max-w-full min-w-0">
          {/* Brown Rectangle Aspect Ratio Dropdown Selector */}
          <div className="w-full min-w-0">
            <div className="relative w-full min-w-0" id="aspect-ratio-dropdown-wrap">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                id="btn-ratio-dropdown"
                className="w-full max-w-full min-w-0 px-3 py-2 rounded-xl border border-[#d6d3d1] dark:border-[#44403c] hover:border-[#0c0a09] dark:hover:border-white bg-[#fafafa] dark:bg-[#292524] hover:bg-white dark:hover:bg-[#1c1917] transition flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    id="current-ratio-brown-box"
                    className={`${meta.boxClass} rounded-[5px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold tracking-tight shadow-2xs transition-all flex-shrink-0`}
                  >
                    {clipAspectRatio}
                  </div>
                  <span id="current-ratio-label-text" className="text-xs font-semibold text-[#0c0a09] dark:text-white truncate">
                    {meta.text}
                  </span>
                </div>
                <i
                  id="ratio-dropdown-chevron"
                  className={`fa-solid fa-chevron-down text-[10px] text-[#777169] dark:text-[#a8a29e] transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu with ONLY Proportional Brown Rectangles */}
              {isDropdownOpen && (
                <div
                  id="aspect-ratio-dropdown-menu"
                  className="absolute left-0 right-0 mt-1.5 p-2.5 bg-white dark:bg-[#1c1917] rounded-xl border border-[#e7e5e4] dark:border-[#292524] shadow-[0_10px_28px_rgba(0,0,0,0.12)] z-40 grid grid-cols-3 gap-2 place-items-center"
                >
                  <button
                    type="button"
                    onClick={() => handleRatioSelect('9:16')}
                    data-ratio="9:16"
                    className="ratio-opt-btn flex items-center justify-center transition transform hover:scale-105"
                  >
                    <div className={`ratio-brown-shape w-6 h-10 rounded-[5px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold shadow-2xs ${
                      clipAspectRatio === '9:16' ? 'ring-2 ring-[#0c0a09] dark:ring-white ring-offset-2 dark:ring-offset-black' : ''
                    }`}>
                      9:16
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRatioSelect('2:3')}
                    data-ratio="2:3"
                    className="ratio-opt-btn flex items-center justify-center transition transform hover:scale-105"
                  >
                    <div className={`ratio-brown-shape w-7 h-10 rounded-[5px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold shadow-2xs ${
                      clipAspectRatio === '2:3' ? 'ring-2 ring-[#0c0a09] dark:ring-white ring-offset-2 dark:ring-offset-black' : ''
                    }`}>
                      2:3
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRatioSelect('4:5')}
                    data-ratio="4:5"
                    className="ratio-opt-btn flex items-center justify-center transition transform hover:scale-105"
                  >
                    <div className={`ratio-brown-shape w-8 h-10 rounded-[5px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold shadow-2xs ${
                      clipAspectRatio === '4:5' ? 'ring-2 ring-[#0c0a09] dark:ring-white ring-offset-2 dark:ring-offset-black' : ''
                    }`}>
                      4:5
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRatioSelect('1:1')}
                    data-ratio="1:1"
                    className="ratio-opt-btn flex items-center justify-center transition transform hover:scale-105"
                  >
                    <div className={`ratio-brown-shape w-8 h-8 rounded-[5px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold shadow-2xs ${
                      clipAspectRatio === '1:1' ? 'ring-2 ring-[#0c0a09] dark:ring-white ring-offset-2 dark:ring-offset-black' : ''
                    }`}>
                      1:1
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRatioSelect('3:2')}
                    data-ratio="3:2"
                    className="ratio-opt-btn flex items-center justify-center transition transform hover:scale-105"
                  >
                    <div className={`ratio-brown-shape w-11 h-7 rounded-[5px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold shadow-2xs ${
                      clipAspectRatio === '3:2' ? 'ring-2 ring-[#0c0a09] dark:ring-white ring-offset-2 dark:ring-offset-black' : ''
                    }`}>
                      3:2
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRatioSelect('16:9')}
                    data-ratio="16:9"
                    className="ratio-opt-btn flex items-center justify-center transition transform hover:scale-105"
                  >
                    <div className={`ratio-brown-shape w-12 h-7 rounded-[5px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold shadow-2xs ${
                      clipAspectRatio === '16:9' ? 'ring-2 ring-[#0c0a09] dark:ring-white ring-offset-2 dark:ring-offset-black' : ''
                    }`}>
                      16:9
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Color & Gradient Customizer (Spectrum Hex Picker & Presets) */}
          <div className="pt-2 border-t border-[#f0efed] dark:border-[#292524] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#0c0a09] dark:text-white" id="bg-color-heading">
                Background Color / Gradient
              </span>
              <button
                type="button"
                onClick={handleResetGradient}
                className="text-[10px] text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white transition"
              >
                Reset
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full min-w-0">
              <div className="flex items-center gap-1.5 p-1.5 bg-[#fafafa] dark:bg-[#292524] rounded-lg border border-[#e7e5e4] dark:border-[#44403c] min-w-0">
                <input
                  type="color"
                  id="bg-color-1"
                  value={bgColor1}
                  onChange={(e) => setBgColor1(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
                />
                <span className="text-[10px] font-mono text-[#777169] dark:text-[#a8a29e] truncate" id="bg-color-1-hex">
                  {bgColor1}
                </span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 bg-[#fafafa] dark:bg-[#292524] rounded-lg border border-[#e7e5e4] dark:border-[#44403c] min-w-0">
                <input
                  type="color"
                  id="bg-color-2"
                  value={bgColor2}
                  onChange={(e) => setBgColor2(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
                />
                <span className="text-[10px] font-mono text-[#777169] dark:text-[#a8a29e] truncate" id="bg-color-2-hex">
                  {bgColor2}
                </span>
              </div>
            </div>

            {/* Quick Gradient Presets */}
            <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => setGradientPreset('#fafafa', '#fafafa')}
                className="w-6 h-6 rounded-full border border-[#d6d3d1] bg-[#fafafa] flex-shrink-0 t-btn-press"
                title="Default Light"
              />
              <button
                type="button"
                onClick={() => setGradientPreset('#18181b', '#09090b')}
                className="w-6 h-6 rounded-full border border-black/40 bg-gradient-to-br from-zinc-900 to-black flex-shrink-0 t-btn-press"
                title="Dark Slate"
              />
              <button
                type="button"
                onClick={() => setGradientPreset('#fef3c7', '#fed7aa')}
                className="w-6 h-6 rounded-full border border-amber-200 bg-gradient-to-br from-amber-100 to-orange-200 flex-shrink-0 t-btn-press"
                title="Warm Sunset"
              />
              <button
                type="button"
                onClick={() => setGradientPreset('#e0e7ff', '#fae8ff')}
                className="w-6 h-6 rounded-full border border-indigo-200 bg-gradient-to-br from-indigo-100 to-fuchsia-100 flex-shrink-0 t-btn-press"
                title="Soft Pastel"
              />
              <button
                type="button"
                onClick={() => setGradientPreset('#dcfce7', '#e0f2fe')}
                className="w-6 h-6 rounded-full border border-emerald-200 bg-gradient-to-br from-emerald-100 to-sky-100 flex-shrink-0 t-btn-press"
                title="Mint Sky"
              />
              <button
                type="button"
                onClick={() => setGradientPreset('#312e81', '#4c1d95')}
                className="w-6 h-6 rounded-full border border-indigo-900 bg-gradient-to-br from-indigo-950 to-purple-900 flex-shrink-0 t-btn-press"
                title="Deep Indigo"
              />
            </div>
          </div>

          {/* Movie Backdrop & Blur Control */}
          <div className="pt-2 border-t border-[#f0efed] dark:border-[#292524] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#0c0a09] dark:text-white flex items-center gap-1.5">
                <i className="fa-solid fa-image text-indigo-500 text-[10px]" />
                <span>{t.movieBackdropLabel || 'Movie Backdrop & Blur'}</span>
              </span>
              <button
                type="button"
                onClick={() => setUseMovieBackdrop(!useMovieBackdrop)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition flex items-center gap-1 t-btn-press ${
                  useMovieBackdrop
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e]'
                }`}
              >
                <i className={`fa-solid ${useMovieBackdrop ? 'fa-toggle-on' : 'fa-toggle-off'}`} />
                <span>{useMovieBackdrop ? 'ON' : 'OFF'}</span>
              </button>
            </div>
            {useMovieBackdrop && (
              <div className="space-y-2 p-2.5 bg-[#fafafa] dark:bg-[#201d1a] rounded-xl border border-[#e7e5e4] dark:border-[#38332e] text-xs">
                <div>
                  <div className="flex justify-between text-[10px] text-[#777169] dark:text-[#a8a29e] mb-1">
                    <span>{t.blurSliderLabel || 'Blur'}</span>
                    <span className="font-mono">{bgBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={bgBlur}
                    onChange={(e) => setBgBlur(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-[#e7e5e4] dark:bg-[#38332e] rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-[#777169] dark:text-[#a8a29e] mb-1">
                    <span>{t.dimmingLabel || 'Dimming'}</span>
                    <span className="font-mono">{bgOverlayOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={bgOverlayOpacity}
                    onChange={(e) => setBgOverlayOpacity(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-[#e7e5e4] dark:bg-[#38332e] rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Text Formatting & Typography System */}
          <div className="pt-2 border-t border-[#f0efed] dark:border-[#292524] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#0c0a09] dark:text-white flex items-center gap-1.5">
                <i className="fa-solid fa-font text-sky-500 text-[10px]" />
                <span>{t.textFormatHeading || 'Text Formatting & Typography'}</span>
              </span>
              <button
                type="button"
                onClick={resetTextFormat}
                className="text-[10px] text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white transition"
              >
                {t.resetStyleBtn || 'Reset'}
              </button>
            </div>

            {/* Font Family Selector & Highlight Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#777169] dark:text-[#a8a29e] mb-1">
                  {t.fontFamilyLabel || 'Font Family'}
                </label>
                <select
                  value={textFormat.fontFamily || 'Inter'}
                  onChange={(e) => setTextFormat((prev) => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full px-2 py-1 text-xs bg-[#fafafa] dark:bg-[#201d1a] border border-[#d6d3d1] dark:border-[#38332e] rounded-lg text-[#0c0a09] dark:text-white focus:outline-none"
                >
                  <option value="Inter">Inter (Clean Modern)</option>
                  <option value="Prompt">Prompt (Thai / English)</option>
                  <option value="Kanit">Kanit (Bold Display)</option>
                  <option value="Sarabun">Sarabun (Clear Clean)</option>
                  <option value="Mitr">Mitr (Soft Modern)</option>
                  <option value="Chonburi">Chonburi (Classic Headline)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#777169] dark:text-[#a8a29e] mb-1">
                  {t.highlightToggleLabel || 'Keyword Highlight'}
                </label>
                <button
                  type="button"
                  onClick={toggleHighlight}
                  className={`w-full py-1 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition t-btn-press ${
                    showHighlight
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 shadow-2xs'
                      : 'bg-[#fafafa] dark:bg-[#201d1a] text-[#777169] dark:text-[#a8a29e] border-[#d6d3d1] dark:border-[#38332e]'
                  }`}
                >
                  <i className="fa-solid fa-highlighter text-[10px] text-amber-500" />
                  <span>{showHighlight ? 'Highlight ON' : 'Highlight OFF'}</span>
                </button>
              </div>
            </div>

            {/* Style Toggles: Bold, Italic, Underline, Align, and Text Color Presets */}
            <div className="flex items-center justify-between gap-1.5 p-1.5 bg-[#fafafa] dark:bg-[#201d1a] rounded-xl border border-[#e7e5e4] dark:border-[#38332e]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTextFormat((prev) => ({ ...prev, bold: !prev.bold }))}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition t-btn-press ${
                    textFormat.bold !== false
                      ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09]'
                      : 'text-[#777169] hover:bg-[#e7e5e4] dark:hover:bg-[#292524]'
                  }`}
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => setTextFormat((prev) => ({ ...prev, italic: !prev.italic }))}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs italic font-serif transition t-btn-press ${
                    textFormat.italic
                      ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09]'
                      : 'text-[#777169] hover:bg-[#e7e5e4] dark:hover:bg-[#292524]'
                  }`}
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => setTextFormat((prev) => ({ ...prev, underline: !prev.underline }))}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs underline transition t-btn-press ${
                    textFormat.underline
                      ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09]'
                      : 'text-[#777169] hover:bg-[#e7e5e4] dark:hover:bg-[#292524]'
                  }`}
                  title="Underline"
                >
                  U
                </button>
              </div>

              <div className="h-4 w-[1px] bg-[#e7e5e4] dark:bg-[#38332e]" />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTextFormat((prev) => ({ ...prev, textAlign: 'left' }))}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition t-btn-press ${
                    textFormat.textAlign !== 'center'
                      ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09]'
                      : 'text-[#777169] hover:bg-[#e7e5e4] dark:hover:bg-[#292524]'
                  }`}
                  title="Align Left"
                >
                  <i className="fa-solid fa-align-left" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextFormat((prev) => ({ ...prev, textAlign: 'center' }))}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition t-btn-press ${
                    textFormat.textAlign === 'center'
                      ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09]'
                      : 'text-[#777169] hover:bg-[#e7e5e4] dark:hover:bg-[#292524]'
                  }`}
                  title="Align Center"
                >
                  <i className="fa-solid fa-align-center" />
                </button>
              </div>

              <div className="h-4 w-[1px] bg-[#e7e5e4] dark:bg-[#38332e]" />

              {/* Text Color Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTextFormat((prev) => ({ ...prev, textColor: '' }))}
                  className={`w-5 h-5 rounded-full border text-[9px] font-mono flex items-center justify-center transition ${
                    !textFormat.textColor ? 'ring-2 ring-sky-500' : ''
                  }`}
                  title="Auto Contrast"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setTextFormat((prev) => ({ ...prev, textColor: '#ffffff' }))}
                  className={`w-5 h-5 rounded-full bg-white border border-[#d6d3d1] transition ${
                    textFormat.textColor === '#ffffff' ? 'ring-2 ring-sky-500' : ''
                  }`}
                  title="White Text"
                />
                <button
                  type="button"
                  onClick={() => setTextFormat((prev) => ({ ...prev, textColor: '#0c0a09' }))}
                  className={`w-5 h-5 rounded-full bg-[#0c0a09] border border-black/40 transition ${
                    textFormat.textColor === '#0c0a09' ? 'ring-2 ring-sky-500' : ''
                  }`}
                  title="Dark Charcoal Text"
                />
                <button
                  type="button"
                  onClick={() => setTextFormat((prev) => ({ ...prev, textColor: '#fef08a' }))}
                  className={`w-5 h-5 rounded-full bg-yellow-200 border border-yellow-400 transition ${
                    textFormat.textColor === '#fef08a' ? 'ring-2 ring-sky-500' : ''
                  }`}
                  title="Light Yellow Text"
                />
              </div>
            </div>
          </div>

          {/* Selected Clips Sequence & Python Play Queue Controls */}
          <div className="pt-2 border-t border-[#f0efed] dark:border-[#292524]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-[#777169] dark:text-[#a8a29e]">Play Queue</span>
              <button
                type="button"
                onClick={playAllClipsWithPython}
                className="w-7 h-7 bg-[#0c0a09] dark:bg-white hover:bg-[#292524] text-white dark:text-[#0c0a09] rounded-full transition flex items-center justify-center shadow-2xs"
                title="Play Queue"
                aria-label="Play Queue"
              >
                <i className="fa-solid fa-play text-[9px] ml-0.5" />
              </button>
            </div>
            <div id="sequence-list" className="space-y-1.5 w-full min-w-0">
              {activeClipSequence.length === 0 ? (
                <div className="text-center py-2 text-xs text-[#777169] dark:text-[#a8a29e]">No clips in queue</div>
              ) : (
                activeClipSequence.map((clip, index) => {
                  const thumb = normalizeThumbUrl(clip.thumb, clip.slug);
                  return (
                    <div
                      key={`${clip.id}-${index}`}
                      className="w-full min-w-0 flex items-center justify-between p-1.5 bg-white dark:bg-[#201d1a] border border-[#e7e5e4] dark:border-[#292524] rounded-xl gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-5 h-5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white flex items-center justify-center text-[10px] font-mono flex-shrink-0">
                          {index + 1}
                        </span>
                        {thumb && (
                          <img
                            src={thumb}
                            alt=""
                            className="w-10 h-7 rounded object-cover border border-[#e7e5e4] dark:border-[#44403c] flex-shrink-0"
                          />
                        )}
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <p className="text-xs font-medium text-[#0c0a09] dark:text-white truncate flex-1 min-w-0" title={clip.title}>
                            {clip.title}
                          </p>
                          {clip.duration && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white font-mono font-semibold flex-shrink-0 flex items-center gap-0.5">
                              <i className="fa-regular fa-clock text-[8px]" />
                              {clip.duration}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => reorderClip(index, -1)}
                          disabled={index === 0}
                          className="w-6 h-6 rounded-full hover:bg-[#f0efed] dark:hover:bg-zinc-700 flex items-center justify-center text-[#777169] dark:text-zinc-300 disabled:opacity-20 flex-shrink-0"
                          title="Move Up"
                        >
                          <i className="fa-solid fa-arrow-up text-[10px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderClip(index, 1)}
                          disabled={index === activeClipSequence.length - 1}
                          className="w-6 h-6 rounded-full hover:bg-[#f0efed] dark:hover:bg-zinc-700 flex items-center justify-center text-[#777169] dark:text-zinc-300 disabled:opacity-20 flex-shrink-0"
                          title="Move Down"
                        >
                          <i className="fa-solid fa-arrow-down text-[10px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeClip(index)}
                          className="w-6 h-6 rounded-full hover:bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0"
                          title="Remove"
                        >
                          <i className="fa-solid fa-trash-can text-[10px]" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Storage Cache Management Action */}
          <div className="pt-2 border-t border-[#f0efed] dark:border-[#292524] flex items-center justify-between">
            <span className="text-[10px] text-[#777169] dark:text-[#a8a29e] flex items-center gap-1.5 font-medium">
              <i className="fa-solid fa-hard-drive text-[9px]" />
              <span>Storage & Intermediate Cache</span>
            </span>
            <button
              type="button"
              onClick={() => {
                showCustomDialog({
                  title: t.cleanCacheConfirmTitle || 'Clean Cache',
                  message: t.cleanCacheConfirmMsg || 'Delete temporary intermediate files to free disk space?',
                  icon: 'fa-broom',
                  onConfirm: () => cleanCache()
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-[#fafafa] dark:bg-[#201d1a] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-[#e7e5e4] dark:border-[#38332e] text-[10px] font-semibold transition flex items-center gap-1.5 t-btn-press shadow-2xs"
              title="Clean Temporary Intermediate Cache"
            >
              <i className="fa-solid fa-broom text-[9px]" />
              <span>{t.cleanCacheBtn || 'Clean Cache'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
