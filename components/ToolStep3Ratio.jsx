'use client';

import React, { useState } from 'react';
import { useVocab } from '../context/VocabContext';
import { RATIO_META, normalizeThumbUrl } from '../lib/utils';
import CanvaColorPicker from './CanvaColorPicker';

export default function ToolStep3Ratio() {
  const {
    clipAspectRatio,
    setClipAspectRatio,
    bgColor,
    setBgColor,
    activeClipSequence,
    reorderClip,
    removeClip,
    playAllClipsWithPython,
    collapsedSections,
    toggleToolCard,
    lang,
    resetElementPositions,
    cleanCache,
    showCustomDialog,
    t
  } = useVocab();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const isCollapsed = Boolean(collapsedSections['tool-sec-ratio']);
  const meta = RATIO_META[clipAspectRatio] || RATIO_META['9:16'];

  const handleRatioSelect = (ratio) => {
    setClipAspectRatio(ratio);
    setIsDropdownOpen(false);
  };

  const handleResetBgColor = () => {
    setBgColor('#ffffff');
  };

  return (
    <section
      id="tool-sec-ratio"
      data-tool-keywords="3 aspect ratio queue size tiktok reels shorts youtube สัดส่วน ขนาด คิวคลิป"
      className={`tool-section-card relative z-20 w-full max-w-full min-w-0 bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${
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
          <span>{lang === 'th' ? 'สัดส่วนภาพ & คิวคลิป' : 'Aspect Ratio & Queue'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            id="selected-badge"
            className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white font-medium"
          >
            {activeClipSequence.length} {lang === 'th' ? 'คลิป' : 'clips'}
          </span>
          <button
            type="button"
            className="w-6 h-6 rounded-full hover:bg-[#f0efed] dark:hover:bg-[#292524] text-[#777169] hover:text-[#0c0a09] dark:hover:text-white flex items-center justify-center transition"
            title={lang === 'th' ? 'ย่อ / ขยาย' : 'Collapse / Expand'}
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

              {/* Dropdown Menu with ONLY 9:16 and 16:9 */}
              {isDropdownOpen && (
                <div
                  id="aspect-ratio-dropdown-menu"
                  className="absolute left-0 right-0 mt-1.5 p-2 bg-white dark:bg-[#1c1917] rounded-xl border border-[#e7e5e4] dark:border-[#292524] shadow-[0_10px_28px_rgba(0,0,0,0.12)] z-40 grid grid-cols-2 gap-2 place-items-center"
                >
                  <button
                    type="button"
                    onClick={() => handleRatioSelect('9:16')}
                    data-ratio="9:16"
                    className="w-full ratio-opt-btn flex items-center justify-center p-2 rounded-lg hover:bg-[#f0efed] dark:hover:bg-[#292524] transition transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`ratio-brown-shape w-6 h-10 rounded-[5px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold shadow-2xs ${
                        clipAspectRatio === '9:16' ? 'ring-2 ring-[#0c0a09] dark:ring-white ring-offset-2 dark:ring-offset-black' : ''
                      }`}>
                        9:16
                      </div>
                      <span className="text-xs font-semibold text-[#0c0a09] dark:text-white">TikTok / Reels</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRatioSelect('16:9')}
                    data-ratio="16:9"
                    className="w-full ratio-opt-btn flex items-center justify-center p-2 rounded-lg hover:bg-[#f0efed] dark:hover:bg-[#292524] transition transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`ratio-brown-shape w-12 h-7 rounded-[5px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold shadow-2xs ${
                        clipAspectRatio === '16:9' ? 'ring-2 ring-[#0c0a09] dark:ring-white ring-offset-2 dark:ring-offset-black' : ''
                      }`}>
                        16:9
                      </div>
                      <span className="text-xs font-semibold text-[#0c0a09] dark:text-white">YouTube / X</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Studio Color Laboratory Background Selector */}
          <div className="pt-2 border-t border-[#f0efed] dark:border-[#292524] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#0c0a09] dark:text-white" id="bg-color-heading">
                {lang === 'th' ? 'สีพื้นหลัง (Background Color)' : 'Background Color'}
              </span>
              <button
                type="button"
                onClick={handleResetBgColor}
                className="text-[10px] text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white transition"
              >
                {lang === 'th' ? 'รีเซ็ตเป็นสีขาว' : 'Reset White'}
              </button>
            </div>

            {/* Studio Color Box Trigger */}
            <div className="w-full">
              <button
                type="button"
                id="btn-bg-color-picker-trigger"
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                className="w-full flex items-center justify-between p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs group text-left cursor-pointer"
                aria-label={lang === 'th' ? 'เลือกสีพื้นหลัง' : 'Background Color Picker'}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-none border border-neutral-200 dark:border-neutral-800 flex-shrink-0 transition-colors duration-200"
                    style={{ backgroundColor: bgColor || '#FFFFFF' }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none mb-1">
                      HEX CODE
                    </span>
                    <span
                      id="bg-color-hex"
                      className="text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-100 uppercase tracking-wider"
                    >
                      {bgColor}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition">
                    {showBgColorPicker ? (lang === 'th' ? 'ปิดถาดสี' : 'CLOSE') : (lang === 'th' ? 'เลือกสี' : 'PICK COLOR')}
                  </span>
                  <i className={`fa-solid ${showBgColorPicker ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px] text-neutral-400`} />
                </div>
              </button>

              {/* Studio Color Laboratory Embedded Picker */}
              {showBgColorPicker && (
                <div className="mt-3 p-1 animate-in fade-in-50 zoom-in-98 duration-150">
                  <CanvaColorPicker
                    activeColor={bgColor}
                    onColorChange={(newColor) => setBgColor(newColor || '#ffffff')}
                    activeTargetLabel={lang === 'th' ? 'พื้นหลัง' : 'BACKGROUND'}
                    onClose={() => setShowBgColorPicker(false)}
                    lang={lang}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Interactive Free Drag Layout & Guides Control */}
          <div className="pt-2 border-t border-[#f0efed] dark:border-[#292524] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0c0a09] dark:text-white">
              <i className="fa-solid fa-arrows-up-down-left-right text-indigo-500 text-[10px]" />
              <span>{lang === 'th' ? 'เลื่อนขยับอิสระในพรีวิว' : 'Free Drag & Guides'}</span>
            </div>
            <button
              type="button"
              onClick={resetElementPositions}
              className="text-[10px] px-2 py-0.5 rounded-md bg-[#fafafa] dark:bg-[#201d1a] border border-[#e7e5e4] dark:border-[#38332e] text-[#777169] dark:text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white transition flex items-center gap-1 t-btn-press"
              title={lang === 'th' ? 'รีเซ็ตตำแหน่งทั้งหมดเป็นค่าเริ่มต้น' : 'Reset all element positions to default'}
            >
              <i className="fa-solid fa-rotate-left text-[9px]" />
              <span>{lang === 'th' ? 'รีเซ็ตตำแหน่ง' : 'Reset Positions'}</span>
            </button>
          </div>

          {/* Selected Clips Sequence & Python Play Queue Controls */}
          <div className="pt-2 border-t border-[#f0efed] dark:border-[#292524]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-[#777169] dark:text-[#a8a29e]">
                {lang === 'th' ? 'คิวคลิปเล่นต่อเนื่อง' : 'Play Queue'}
              </span>
              <button
                type="button"
                onClick={playAllClipsWithPython}
                className="w-7 h-7 bg-[#0c0a09] dark:bg-white hover:bg-[#292524] text-white dark:text-[#0c0a09] rounded-full transition flex items-center justify-center shadow-2xs"
                title={lang === 'th' ? 'เล่นคิวคลิปทั้งหมด' : 'Play Queue'}
                aria-label={lang === 'th' ? 'เล่นคิวคลิปทั้งหมด' : 'Play Queue'}
              >
                <i className="fa-solid fa-play text-[9px] ml-0.5" />
              </button>
            </div>
            <div id="sequence-list" className="space-y-1.5 w-full min-w-0">
              {activeClipSequence.length === 0 ? (
                <div className="text-center py-2 text-xs text-[#777169] dark:text-[#a8a29e]">
                  {lang === 'th' ? 'ยังไม่มีคลิปในคิว' : 'No clips in queue'}
                </div>
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
                          className="w-6 h-6 rounded-full hover:bg-[#f0efed] dark:hover:zinc-700 flex items-center justify-center text-[#777169] dark:text-zinc-300 disabled:opacity-20 flex-shrink-0"
                          title={lang === 'th' ? 'เลื่อนขึ้น' : 'Move Up'}
                        >
                          <i className="fa-solid fa-arrow-up text-[10px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderClip(index, 1)}
                          disabled={index === activeClipSequence.length - 1}
                          className="w-6 h-6 rounded-full hover:bg-[#f0efed] dark:hover:zinc-700 flex items-center justify-center text-[#777169] dark:text-zinc-300 disabled:opacity-20 flex-shrink-0"
                          title={lang === 'th' ? 'เลื่อนลง' : 'Move Down'}
                        >
                          <i className="fa-solid fa-arrow-down text-[10px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeClip(index)}
                          className="w-6 h-6 rounded-full hover:bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0"
                          title={lang === 'th' ? 'ลบออกจากคิว' : 'Remove'}
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
              <span>{lang === 'th' ? 'พื้นที่จัดเก็บและแคชชั่วคราว' : 'Storage & Intermediate Cache'}</span>
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
              title={lang === 'th' ? 'ล้างไฟล์แคชชั่วคราวเพื่อคืนพื้นที่' : 'Clean Temporary Intermediate Cache'}
            >
              <i className="fa-solid fa-broom text-[9px]" />
              <span>{t.cleanCacheBtn || (lang === 'th' ? 'ล้างแคช' : 'Clean Cache')}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
