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
    lang
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
      className={`tool-section-card bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${
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
        <div className="tool-card-inner space-y-3">
          {/* Brown Rectangle Aspect Ratio Dropdown Selector */}
          <div>
            <div className="relative" id="aspect-ratio-dropdown-wrap">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                id="btn-ratio-dropdown"
                className="w-full px-3 py-2 rounded-xl border border-[#d6d3d1] dark:border-[#44403c] hover:border-[#0c0a09] dark:hover:border-white bg-[#fafafa] dark:bg-[#292524] hover:bg-white dark:hover:bg-[#1c1917] transition flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    id="current-ratio-brown-box"
                    className={`${meta.boxClass} rounded-[5px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold tracking-tight shadow-2xs transition-all flex-shrink-0`}
                  >
                    {clipAspectRatio}
                  </div>
                  <span id="current-ratio-label-text" className="text-xs font-semibold text-[#0c0a09] dark:text-white">
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
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 p-1.5 bg-[#fafafa] dark:bg-[#292524] rounded-lg border border-[#e7e5e4] dark:border-[#44403c]">
                <input
                  type="color"
                  id="bg-color-1"
                  value={bgColor1}
                  onChange={(e) => setBgColor1(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-[10px] font-mono text-[#777169] dark:text-[#a8a29e]" id="bg-color-1-hex">
                  {bgColor1}
                </span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 bg-[#fafafa] dark:bg-[#292524] rounded-lg border border-[#e7e5e4] dark:border-[#44403c]">
                <input
                  type="color"
                  id="bg-color-2"
                  value={bgColor2}
                  onChange={(e) => setBgColor2(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-[10px] font-mono text-[#777169] dark:text-[#a8a29e]" id="bg-color-2-hex">
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
            <div id="sequence-list" className="space-y-1.5">
              {activeClipSequence.length === 0 ? (
                <div className="text-center py-2 text-xs text-[#777169] dark:text-[#a8a29e]">No clips in queue</div>
              ) : (
                activeClipSequence.map((clip, index) => {
                  const thumb = normalizeThumbUrl(clip.thumb, clip.slug);
                  return (
                    <div
                      key={`${clip.id}-${index}`}
                      className="flex items-center justify-between p-1.5 bg-white dark:bg-[#201d1a] border border-[#e7e5e4] dark:border-[#292524] rounded-xl space-x-2"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
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
                        <div className="truncate text-left flex items-center gap-1.5 min-w-0">
                          <p className="text-xs font-medium text-[#0c0a09] dark:text-white truncate">{clip.title}</p>
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
                          className="w-6 h-6 rounded-full hover:bg-[#f0efed] dark:hover:bg-zinc-700 flex items-center justify-center text-[#777169] dark:text-zinc-300 disabled:opacity-20"
                          title="Move Up"
                        >
                          <i className="fa-solid fa-arrow-up text-[10px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderClip(index, 1)}
                          disabled={index === activeClipSequence.length - 1}
                          className="w-6 h-6 rounded-full hover:bg-[#f0efed] dark:hover:bg-zinc-700 flex items-center justify-center text-[#777169] dark:text-zinc-300 disabled:opacity-20"
                          title="Move Down"
                        >
                          <i className="fa-solid fa-arrow-down text-[10px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeClip(index)}
                          className="w-6 h-6 rounded-full hover:bg-rose-50 text-rose-600 flex items-center justify-center"
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
        </div>
      </div>
    </section>
  );
}
