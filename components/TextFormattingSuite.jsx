'use client';

import React from 'react';
import { useVocab } from '../context/VocabContext';

const TARGET_TABS = [
  { id: 'all', labelTh: 'ทั้งหมด', labelEn: 'All', icon: 'fa-layer-group' },
  { id: 'word', labelTh: 'คำศัพท์', labelEn: 'Word', icon: 'fa-font' },
  { id: 'phonetic', labelTh: 'สัทอักษร', labelEn: 'IPA', icon: 'fa-volume-high' },
  { id: 'thaiRead', labelTh: 'คำอ่านไทย', labelEn: 'Thai Read', icon: 'fa-language' },
  { id: 'meaning', labelTh: 'ความหมาย', labelEn: 'Meaning', icon: 'fa-book-open' },
  { id: 'grammar', labelTh: 'ไวยากรณ์', labelEn: 'Grammar', icon: 'fa-code' },
  { id: 'ex1', labelTh: 'ตัวอย่าง 1', labelEn: 'Ex 1', icon: 'fa-quote-left' },
  { id: 'ex2', labelTh: 'ตัวอย่าง 2', labelEn: 'Ex 2', icon: 'fa-quote-right' }
];

const COLOR_PRESETS = [
  { color: '', label: 'Auto Contrast', title: 'Auto' },
  { color: '#ffffff', label: 'White', bgClass: 'bg-white border border-[#d6d3d1]' },
  { color: '#0c0a09', label: 'Dark Charcoal', bgClass: 'bg-[#0c0a09] border border-black/40' },
  { color: '#fef08a', label: 'Light Yellow', bgClass: 'bg-yellow-200 border border-yellow-400' },
  { color: '#38bdf8', label: 'Sky Blue', bgClass: 'bg-sky-400 border border-sky-500' },
  { color: '#34d399', label: 'Emerald', bgClass: 'bg-emerald-400 border border-emerald-500' },
  { color: '#fb7185', label: 'Rose Pink', bgClass: 'bg-rose-400 border border-rose-500' },
  { color: '#f59e0b', label: 'Amber', bgClass: 'bg-amber-500 border border-amber-600' },
  { color: '#dc2626', label: 'Crimson Red', bgClass: 'bg-red-600 border border-red-700' }
];

export default function TextFormattingSuite({ compact = false }) {
  const {
    textFormat,
    updateTextFormat,
    resetItemTextFormat,
    activeFormatTarget,
    setActiveFormatTarget,
    showHighlight,
    toggleHighlight,
    lang,
    t
  } = useVocab();

  // Resolve current active item settings, falling back to global
  const globalFmt = textFormat?.global || {};
  const activeFmt = (activeFormatTarget === 'all' || activeFormatTarget === 'global')
    ? globalFmt
    : (textFormat?.[activeFormatTarget] || globalFmt);

  const activeFontFamily = activeFmt.fontFamily || globalFmt.fontFamily || 'Inter';
  const activeFontSize = activeFmt.fontSize || globalFmt.fontSize || 'normal';
  const activeBold = activeFmt.bold !== undefined ? activeFmt.bold : (globalFmt.bold !== false);
  const activeItalic = activeFmt.italic !== undefined ? activeFmt.italic : Boolean(globalFmt.italic);
  const activeUnderline = activeFmt.underline !== undefined ? activeFmt.underline : Boolean(globalFmt.underline);
  const activeTextAlign = activeFmt.textAlign || globalFmt.textAlign || 'left';
  const activeColor = activeFmt.textColor !== undefined ? activeFmt.textColor : (globalFmt.textColor || '');

  const activeTabMeta = TARGET_TABS.find((tab) => tab.id === activeFormatTarget) || TARGET_TABS[0];

  return (
    <div className="text-formatting-suite space-y-2.5 p-3 bg-[#fafafa] dark:bg-[#201d1a] rounded-2xl border border-[#e7e5e4] dark:border-[#38332e] shadow-2xs">
      {/* Header with Title and Reset Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <i className="fa-solid fa-font text-sky-500 text-xs" />
          <span className="text-xs font-semibold text-[#0c0a09] dark:text-white">
            {lang === 'th' ? 'ปรับแต่งตัวอักษรรายองค์ประกอบ' : 'Vocabulary Text Formatting'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 font-medium">
            {lang === 'th' ? activeTabMeta.labelTh : activeTabMeta.labelEn}
          </span>
        </div>
        <button
          type="button"
          onClick={() => resetItemTextFormat(activeFormatTarget)}
          className="text-[10.5px] text-[#777169] hover:text-rose-500 dark:text-[#a8a29e] dark:hover:text-rose-400 transition flex items-center gap-1 t-btn-press"
          title={`Reset style for ${activeTabMeta.labelEn}`}
        >
          <i className="fa-solid fa-rotate-left text-[9px]" />
          <span>{lang === 'th' ? 'รีเซ็ต' : 'Reset'}</span>
        </button>
      </div>

      {/* Target Selector Tabs: Horizontal scrolling pill bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-[#f0efed] dark:border-[#2e2a26]">
        {TARGET_TABS.map((tab) => {
          const isSelected = activeFormatTarget === tab.id;
          const hasCustomStyle = tab.id !== 'all' && Boolean(textFormat?.[tab.id]);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFormatTarget(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 t-btn-press relative flex-shrink-0 ${
                isSelected
                  ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-2xs'
                  : 'bg-white dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white border border-[#e7e5e4] dark:border-[#38332e]'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-[10px]`} />
              <span>{lang === 'th' ? tab.labelTh : tab.labelEn}</span>
              {hasCustomStyle && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-sky-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Row 1: Font Family Selector & Font Size Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
        {/* Font Family Selector */}
        <div className="sm:col-span-7">
          <label className="block text-[10px] text-[#777169] dark:text-[#a8a29e] mb-1 font-medium">
            {lang === 'th' ? 'แบบอักษร (Font Family)' : 'Font Family'}
          </label>
          <select
            value={activeFontFamily}
            onChange={(e) => updateTextFormat('fontFamily', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#38332e] rounded-xl text-[#0c0a09] dark:text-white focus:outline-none transition shadow-2xs font-medium"
          >
            <option value="Inter">Inter (Clean Modern English)</option>
            <option value="Prompt">Prompt (Thai / English Clean)</option>
            <option value="Kanit">Kanit (Bold Display)</option>
            <option value="Sarabun">Sarabun (Clear Clean)</option>
            <option value="Mitr">Mitr (Soft Rounded Thai)</option>
            <option value="Chonburi">Chonburi (Classic Headline)</option>
          </select>
        </div>

        {/* Font Size Pills */}
        <div className="sm:col-span-5">
          <label className="block text-[10px] text-[#777169] dark:text-[#a8a29e] mb-1 font-medium">
            {lang === 'th' ? 'ขนาด (Size)' : 'Font Size'}
          </label>
          <div className="grid grid-cols-4 gap-1 p-0.5 bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#38332e] rounded-xl">
            {[
              { id: 'small', label: 'S', title: 'Small' },
              { id: 'normal', label: 'M', title: 'Normal' },
              { id: 'large', label: 'L', title: 'Large' },
              { id: 'xl', label: 'XL', title: 'Extra Large' }
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => updateTextFormat('fontSize', s.id)}
                className={`py-1 text-[11px] font-semibold rounded-lg transition t-btn-press ${
                  activeFontSize === s.id
                    ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-2xs'
                    : 'text-[#777169] hover:bg-[#f0efed] dark:hover:bg-[#38332e]'
                }`}
                title={s.title}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Typography Toggles (Bold, Italic, Underline), Alignment, and Keyword Highlight */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white dark:bg-[#292524] rounded-xl border border-[#e7e5e4] dark:border-[#38332e]">
        {/* Style Toggles: B, I, U */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => updateTextFormat('bold', !activeBold)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition t-btn-press ${
              activeBold
                ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-2xs'
                : 'text-[#777169] hover:bg-[#f0efed] dark:hover:bg-[#38332e]'
            }`}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => updateTextFormat('italic', !activeItalic)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs italic font-serif transition t-btn-press ${
              activeItalic
                ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-2xs'
                : 'text-[#777169] hover:bg-[#f0efed] dark:hover:bg-[#38332e]'
            }`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => updateTextFormat('underline', !activeUnderline)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs underline transition t-btn-press ${
              activeUnderline
                ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-2xs'
                : 'text-[#777169] hover:bg-[#f0efed] dark:hover:bg-[#38332e]'
            }`}
            title="Underline"
          >
            U
          </button>
        </div>

        <div className="h-5 w-[1px] bg-[#e7e5e4] dark:border-[#38332e]" />

        {/* Text Alignment */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => updateTextFormat('textAlign', 'left')}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition t-btn-press ${
              activeTextAlign === 'left'
                ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-2xs'
                : 'text-[#777169] hover:bg-[#f0efed] dark:hover:bg-[#38332e]'
            }`}
            title="Align Left"
          >
            <i className="fa-solid fa-align-left text-[11px]" />
          </button>
          <button
            type="button"
            onClick={() => updateTextFormat('textAlign', 'center')}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition t-btn-press ${
              activeTextAlign === 'center'
                ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-2xs'
                : 'text-[#777169] hover:bg-[#f0efed] dark:hover:bg-[#38332e]'
            }`}
            title="Align Center"
          >
            <i className="fa-solid fa-align-center text-[11px]" />
          </button>
          <button
            type="button"
            onClick={() => updateTextFormat('textAlign', 'right')}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition t-btn-press ${
              activeTextAlign === 'right'
                ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-2xs'
                : 'text-[#777169] hover:bg-[#f0efed] dark:hover:bg-[#38332e]'
            }`}
            title="Align Right"
          >
            <i className="fa-solid fa-align-right text-[11px]" />
          </button>
        </div>

        <div className="h-5 w-[1px] bg-[#e7e5e4] dark:border-[#38332e]" />

        {/* Highlight Keyword Toggle */}
        <button
          type="button"
          onClick={toggleHighlight}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition t-btn-press ${
            showHighlight
              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 shadow-2xs'
              : 'bg-[#fafafa] dark:bg-[#201d1a] text-[#777169] dark:text-[#a8a29e] border-[#d6d3d1] dark:border-[#38332e]'
          }`}
          title="Highlight target keyword in examples"
        >
          <i className="fa-solid fa-highlighter text-[10px] text-amber-500" />
          <span>{showHighlight ? 'Highlight ON' : 'Highlight OFF'}</span>
        </button>
      </div>

      {/* Row 3: Color Palette & Custom Color Picker */}
      <div className="p-2 bg-white dark:bg-[#292524] rounded-xl border border-[#e7e5e4] dark:border-[#38332e] space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-[#777169] dark:text-[#a8a29e] font-medium">
          <span>{lang === 'th' ? 'สีข้อความ (Text Color)' : 'Text Color'}</span>
          <span className="font-mono">{activeColor || (lang === 'th' ? 'อัตโนมัติ (Auto)' : 'Auto')}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Auto Contrast Chip */}
          <button
            type="button"
            onClick={() => updateTextFormat('textColor', '')}
            className={`w-6 h-6 rounded-full border text-[10px] font-mono font-bold flex items-center justify-center transition ${
              !activeColor
                ? 'ring-2 ring-sky-500 ring-offset-1 dark:ring-offset-black bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 border-sky-400'
                : 'border-[#d6d3d1] dark:border-[#44403c] text-[#777169]'
            }`}
            title="Auto Contrast (Adapts to background)"
          >
            A
          </button>

          {/* Color Presets */}
          {COLOR_PRESETS.filter((p) => p.color).map((preset) => (
            <button
              key={preset.color}
              type="button"
              onClick={() => updateTextFormat('textColor', preset.color)}
              className={`w-6 h-6 rounded-full ${preset.bgClass} transition shadow-2xs ${
                activeColor.toLowerCase() === preset.color.toLowerCase()
                  ? 'ring-2 ring-sky-500 ring-offset-1 dark:ring-offset-black scale-110'
                  : 'hover:scale-105'
              }`}
              title={preset.label}
            />
          ))}

          {/* Custom Color Input Swatch */}
          <label
            className="relative w-6 h-6 rounded-full border border-[#d6d3d1] dark:border-[#44403c] cursor-pointer flex items-center justify-center overflow-hidden hover:scale-105 transition shadow-2xs"
            title="Custom Color Picker"
          >
            <input
              type="color"
              value={activeColor || '#0c0a09'}
              onChange={(e) => updateTextFormat('textColor', e.target.value)}
              className="absolute inset-0 w-8 h-8 -top-1 -left-1 opacity-0 cursor-pointer"
            />
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-[9px]"
              style={{
                background: activeColor
                  ? activeColor
                  : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'
              }}
            >
              {!activeColor && <i className="fa-solid fa-palette text-white text-[8px] drop-shadow-xs" />}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
