'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useVocab } from '../context/VocabContext';
import { normalizeThumbUrl, getFontFamilyCss } from '../lib/utils';
import CanvaColorPicker from './CanvaColorPicker';

const TARGET_TABS = [
  { id: 'all', labelTh: 'ทั้งหมด', labelEn: 'All', icon: 'fa-layer-group' },
  { id: 'word', labelTh: 'คำศัพท์', labelEn: 'Word', icon: 'fa-font' },
  { id: 'phonetic', labelTh: 'สัทอักษร', labelEn: 'IPA', icon: 'fa-volume-high' },
  { id: 'thaiRead', labelTh: 'คำอ่านไทย', labelEn: 'Thai Read', icon: 'fa-language' },
  { id: 'meaning', labelTh: 'ความหมาย', labelEn: 'Meaning', icon: 'fa-book-open' },
  { id: 'grammar', labelTh: 'ไวยากรณ์', labelEn: 'Grammar', icon: 'fa-code' },
  { id: 'ex1', labelTh: 'ตัวอย่าง 1', labelEn: 'Ex 1', icon: 'fa-quote-left' },
  { id: 'ex2', labelTh: 'ตัวอย่าง 2', labelEn: 'Ex 2', icon: 'fa-quote-right' },
  { id: 'channel', labelTh: 'ชื่อช่อง', labelEn: 'Channel', icon: 'fa-at' }
];

const FONT_OPTIONS = [
  { id: 'Biscuit', name: 'Biscuit', thName: 'บิสกิต', sample: 'บิสกิต ลายมือน่ารัก อ่านง่าย', category: 'Handwriting' },
  { id: 'Chonburi', name: 'Chonburi', thName: 'ชลบุรี', sample: 'หัวข้อสวยงาม คลาสสิก มีหัว', category: 'Display' },
  { id: 'EB Garamond', name: 'EB Garamond', thName: 'การามอนด์', sample: 'Editorial Serif Display 123', category: 'Serif' },
  { id: 'Fredoka', name: 'Fredoka', thName: 'เฟรโดก้า', sample: 'น่ารัก สดใส เป็นกันเอง', category: 'Rounded' },
  { id: 'Garuda', name: 'Garuda', thName: 'การูด้า', sample: 'สวยงาม เรียบง่าย ทันสมัย', category: 'Modern' },
  { id: 'Inter', name: 'Inter', thName: 'อินเตอร์', sample: 'Modern & Clean English Vocab', category: 'Clean' },
  { id: 'Itim', name: 'Itim', thName: 'ไอติม', sample: 'ไอติม ลายมือสดใส น่าอ่าน', category: 'Handwriting' },
  { id: 'Kanit', name: 'Kanit', thName: 'คณิต', sample: 'คณิต ตัวหนา โดดเด่น ชัดเจน', category: 'Popular' },
  { id: 'Lemon', name: 'Lemon', thName: 'เลมอน', sample: 'เลมอน ลายมือซนๆ เปรี้ยวสดใส', category: 'Handwriting' },
  { id: 'MiPancake', name: 'MiPancake', thName: 'หมีแพนเค้ก', sample: 'หมีแพนเค้ก ตัวผอม น่ารักมาก', category: 'Handwriting' },
  { id: 'Mitr', name: 'Mitr', thName: 'มิตร', sample: 'มุมโค้งมน เป็นมิตร ไร้หัว', category: 'Modern' },
  { id: 'MN PangPing', name: 'MN PangPing', thName: 'ปังปิ้ง', sample: 'ปังปิ้ง นุ่มนวล อบอุ่น อ่านเพลิน', category: 'Handwriting' },
  { id: 'Prompt', name: 'Prompt', thName: 'พร้อมท์', sample: 'พร้อมท์ ทันสมัย เป็นระเบียบ', category: 'Modern' },
  { id: 'Sarabun', name: 'Sarabun', thName: 'สารบรรณ', sample: 'สารบรรณ อ่านง่าย เป็นทางการ', category: 'Formal' }
];

const COLOR_PRESETS = [
  { color: '', label: 'Auto Contrast', title: 'Auto' },
  { color: '#0c0a09', label: 'Dark Charcoal', bgClass: 'bg-[#0c0a09]' },
  { color: '#ffffff', label: 'White', bgClass: 'bg-white border border-[#d6d3d1]' },
  { color: '#fde047', label: 'Bright Yellow', bgClass: 'bg-yellow-300' },
  { color: '#38bdf8', label: 'Sky Blue', bgClass: 'bg-sky-400' },
  { color: '#34d399', label: 'Emerald Green', bgClass: 'bg-emerald-400' },
  { color: '#fb7185', label: 'Rose Pink', bgClass: 'bg-rose-400' },
  { color: '#f59e0b', label: 'Amber Orange', bgClass: 'bg-amber-500' },
  { color: '#dc2626', label: 'Crimson Red', bgClass: 'bg-red-600' },
  { color: '#a855f7', label: 'Purple Violet', bgClass: 'bg-purple-500' },
  { color: '#6366f1', label: 'Indigo', bgClass: 'bg-indigo-500' },
  { color: '#14b8a6', label: 'Teal', bgClass: 'bg-teal-500' }
];

export default function TextFormattingSuite({ compact = false }) {
  const {
    word,
    phonetic,
    thaiRead,
    meaning,
    textFormat,
    updateTextFormat,
    resetItemTextFormat,
    activeFormatTarget,
    setActiveFormatTarget,
    lang,
    activeClipSequence,
    currentSequenceIndex,
    cafeClipPool,
    activeSelection,
    applySelectionFormat,
    clearSelectionFormat
  } = useVocab();

  const currentClip = activeClipSequence?.[currentSequenceIndex] || cafeClipPool?.[0];
  const thumbUrl = currentClip?.thumbUrl ? normalizeThumbUrl(currentClip.thumbUrl, currentClip.slug) : '';

  // Popover state toggles
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [fontSearch, setFontSearch] = useState('');

  // Ref for click outside detection
  const toolbarRef = useRef(null);
  const tabsScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [mounted, setMounted] = useState(false);

  const checkTabsScroll = useCallback(() => {
    const el = tabsScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const handleScrollTabs = (delta) => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
      setTimeout(checkTabsScroll, 200);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkTabsScroll();
    window.addEventListener('resize', checkTabsScroll);
    return () => window.removeEventListener('resize', checkTabsScroll);
  }, [checkTabsScroll]);

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setShowFontMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered fonts based on search
  const filteredFonts = FONT_OPTIONS.filter((f) => {
    if (!fontSearch.trim()) return true;
    const q = fontSearch.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      (f.thName && f.thName.toLowerCase().includes(q)) ||
      (f.category && f.category.toLowerCase().includes(q)) ||
      (f.sample && f.sample.toLowerCase().includes(q))
    );
  });

  // Resolve current active item settings, falling back to global
  const globalFmt = textFormat?.global || {};
  const activeFmt = (activeFormatTarget === 'all' || activeFormatTarget === 'global')
    ? globalFmt
    : (textFormat?.[activeFormatTarget] || globalFmt);

  const activeFontFamily = activeFmt.fontFamily || globalFmt.fontFamily || 'Garuda';
  const numericFontSize = typeof activeFmt.fontSize === 'number'
    ? activeFmt.fontSize
    : (!isNaN(Number(activeFmt.fontSize)) ? Number(activeFmt.fontSize) : 26);
  const activeBold = activeFmt.bold !== undefined ? activeFmt.bold : (globalFmt.bold !== false);
  const activeItalic = activeFmt.italic !== undefined ? activeFmt.italic : Boolean(globalFmt.italic);
  const activeUnderline = activeFmt.underline !== undefined ? activeFmt.underline : Boolean(globalFmt.underline);
  const activeStrikethrough = activeFmt.strikethrough !== undefined ? activeFmt.strikethrough : Boolean(globalFmt.strikethrough);
  const activeTextTransform = activeFmt.textTransform || globalFmt.textTransform || 'none';
  const activeTextAlign = activeFmt.textAlign || globalFmt.textAlign || 'left';
  const activeColor = activeFmt.textColor !== undefined ? activeFmt.textColor : (globalFmt.textColor || '');

  const activeTabMeta = TARGET_TABS.find((tab) => tab.id === activeFormatTarget) || TARGET_TABS[0];

  // Font Size +/- handlers
  const handleSizeChange = (delta) => {
    if (activeSelection) {
      applySelectionFormat?.({ sizeDelta: delta });
      return;
    }
    const next = Math.max(8, Math.min(180, numericFontSize + delta));
    updateTextFormat('fontSize', next);
  };

  const handleSizeInput = (val) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0 && n <= 300) {
      if (activeSelection) {
        applySelectionFormat?.({ fontSize: n });
      } else {
        updateTextFormat('fontSize', n);
      }
    }
  };

  // Alignment cycler: left -> center -> right -> justify
  const cycleAlignment = () => {
    const order = ['left', 'center', 'right', 'justify'];
    const idx = order.indexOf(activeTextAlign);
    const next = order[(idx + 1) % order.length];
    updateTextFormat('textAlign', next);
  };

  // Case cycler: none -> uppercase -> lowercase -> capitalize
  const cycleCase = () => {
    const order = ['none', 'uppercase', 'lowercase', 'capitalize'];
    const idx = order.indexOf(activeTextTransform);
    const next = order[(idx + 1) % order.length];
    updateTextFormat('textTransform', next);
  };

  return (
    <div
      ref={toolbarRef}
      className="canva-text-tools-container relative z-25 bg-[#fafafa] dark:bg-[#1f1c19] border border-[#e7e5e4] dark:border-[#38332e] rounded-2xl p-2.5 space-y-2.5 shadow-xs transition-all select-none"
    >
      {/* Active Selection Banner when user highlights text */}
      {activeSelection && (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-300 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 truncate">
            <i className="fa-solid fa-i-cursor text-[10.5px] text-violet-600 dark:text-violet-400" />
            <span className="truncate">
              {lang === 'th' ? 'คลุมข้อความ:' : 'Selected:'} <strong className="font-bold underline">"{activeSelection.text}"</strong> ({lang === 'th' ? 'ปรับแต่งเฉพาะส่วนนี้' : 'formats this selection only'})
            </span>
          </div>
          <button
            type="button"
            onClick={() => clearSelectionFormat?.()}
            className="text-[10px] text-rose-500 hover:underline flex-shrink-0 ml-2 font-medium"
          >
            {lang === 'th' ? 'ล้างสไตล์ที่คลุม' : 'Clear Style'}
          </button>
        </div>
      )}

      {/* Top Header: Target Selector Tabs with Left/Right Scroll Arrows */}
      <div className="flex items-center justify-between gap-1 pb-1 border-b border-[#f0efed] dark:border-[#2b2724] relative">
        {/* Left Scroll Arrow */}
        <button
          type="button"
          onClick={() => handleScrollTabs(-140)}
          className={`w-6 h-7 rounded-lg flex items-center justify-center transition flex-shrink-0 t-btn-press ${
            canScrollLeft
              ? 'text-[#0c0a09] dark:text-white bg-white dark:bg-[#25211e] border border-[#e7e5e4] dark:border-[#38332e] shadow-2xs hover:bg-[#f0efed]'
              : 'text-[#d6d3d1] dark:text-[#44403c] cursor-default opacity-40'
          }`}
          title={lang === 'th' ? 'เลื่อนซ้าย' : 'Scroll Left'}
          aria-label="Scroll Tabs Left"
        >
          <i className="fa-solid fa-chevron-left text-[9px]" />
        </button>

        {/* Scrollable Tabs Wrapper */}
        <div
          ref={tabsScrollRef}
          onScroll={checkTabsScroll}
          className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 scroll-smooth"
        >
          {TARGET_TABS.map((tab) => {
            const isSelected = activeFormatTarget === tab.id;
            const hasCustomStyle = tab.id !== 'all' && Boolean(textFormat?.[tab.id]);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFormatTarget(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 t-btn-press ${
                  isSelected
                    ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-2xs font-semibold'
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

        {/* Right Scroll Arrow */}
        <button
          type="button"
          onClick={() => handleScrollTabs(140)}
          className={`w-6 h-7 rounded-lg flex items-center justify-center transition flex-shrink-0 t-btn-press ${
            canScrollRight
              ? 'text-[#0c0a09] dark:text-white bg-white dark:bg-[#25211e] border border-[#e7e5e4] dark:border-[#38332e] shadow-2xs hover:bg-[#f0efed]'
              : 'text-[#d6d3d1] dark:text-[#44403c] cursor-default opacity-40'
          }`}
          title={lang === 'th' ? 'เลื่อนขวา' : 'Scroll Right'}
          aria-label="Scroll Tabs Right"
        >
          <i className="fa-solid fa-chevron-right text-[9px]" />
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={() => resetItemTextFormat(activeFormatTarget)}
          className="text-[11px] text-[#777169] hover:text-rose-500 dark:text-[#a8a29e] dark:hover:text-rose-400 transition flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 t-btn-press ml-0.5"
          title={lang === 'th' ? `รีเซ็ตสไตล์ของ ${activeTabMeta.labelTh}` : `Reset style for ${activeTabMeta.labelEn}`}
        >
          <i className="fa-solid fa-rotate-left text-[10px]" />
          <span>{lang === 'th' ? 'รีเซ็ต' : 'Reset'}</span>
        </button>
      </div>

      {/* Main Canva-Style Floating Formatting Toolbar */}
      <div className="canva-floating-toolbar w-full flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 py-1.5 px-1.5 bg-white dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#38332e] rounded-xl shadow-xs relative overflow-visible z-20">
        {/* 1. Font Family Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowFontMenu(!showFontMenu);
            }}
            className="h-8 px-2.5 rounded-lg border border-[#e7e5e4] dark:border-[#38332e] hover:border-[#d6d3d1] bg-white dark:bg-[#1f1c19] text-[#0c0a09] dark:text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs hover:bg-[#fafaf9] dark:hover:bg-[#25211e] transition t-btn-press"
            title={lang === 'th' ? 'แบบอักษร' : 'Font Family'}
          >
            <span
              className="truncate max-w-[85px] sm:max-w-[110px]"
              style={{ fontFamily: getFontFamilyCss(activeFontFamily) }}
            >
              {activeFontFamily}
            </span>
            <i className="fa-solid fa-chevron-down text-[9px] text-[#a8a29e]" />
          </button>

          {showFontMenu && (
            <div className="absolute left-0 top-full mt-2 w-[min(288px,calc(100vw-48px))] sm:w-80 max-h-80 overflow-y-auto no-scrollbar bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#38332e] rounded-2xl shadow-2xl z-[70] p-2 space-y-1 animate-in fade-in-0 zoom-in-95 duration-100 backdrop-blur-md">
              <div className="px-2 py-1 flex items-center justify-between border-b border-[#f0efed] dark:border-[#2b2724] pb-1.5 mb-1">
                <div className="text-[10px] font-bold text-[#777169] dark:text-[#a8a29e] uppercase tracking-wider">
                  {lang === 'th' ? `แบบอักษร (${filteredFonts.length})` : `Fonts (${filteredFonts.length})`}
                </div>
                <div className="text-[9px] text-[#a8a29e] font-mono">A → Z</div>
              </div>

              {/* Font Search Filter Input */}
              <div className="px-1 pb-1">
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#a8a29e]" />
                  <input
                    type="text"
                    value={fontSearch}
                    onChange={(e) => setFontSearch(e.target.value)}
                    placeholder={lang === 'th' ? 'ค้นหาชื่อฟอนต์...' : 'Search font name...'}
                    className="w-full bg-[#fafafa] dark:bg-[#25211e] border border-[#e7e5e4] dark:border-[#38332e] rounded-lg pl-7 pr-6 py-1 text-xs text-[#0c0a09] dark:text-white outline-none focus:border-violet-500"
                  />
                  {fontSearch && (
                    <button
                      type="button"
                      onClick={() => setFontSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#0c0a09] text-[10px]"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  )}
                </div>
              </div>

              {/* Font Options List with Live Preview */}
              <div className="space-y-1 pt-0.5">
                {filteredFonts.map((f) => {
                  const isCurrent = activeFontFamily === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (activeSelection) {
                          applySelectionFormat?.({ fontFamily: f.id });
                        } else {
                          updateTextFormat('fontFamily', f.id);
                        }
                        setShowFontMenu(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left transition flex items-center justify-between gap-3 group ${
                        isCurrent
                          ? 'bg-[#f0ebf8] dark:bg-[#34244d] border border-[#d8c2f8] dark:border-[#53387d] shadow-2xs'
                          : 'hover:bg-[#fafafa] dark:hover:bg-[#25211e] border border-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-xs font-bold ${isCurrent ? 'text-[#6b38c2] dark:text-[#c4a5f3]' : 'text-[#0c0a09] dark:text-white group-hover:text-violet-600'}`}>
                            {f.name}
                          </span>
                          {f.thName && (
                            <span className="text-[10px] text-[#777169] dark:text-[#a8a29e]">
                              ({f.thName})
                            </span>
                          )}
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#f0efed] dark:bg-[#2e2a26] text-[#777169] dark:text-[#a8a29e] font-mono">
                            {f.category}
                          </span>
                        </div>
                        {/* Live Font Preview rendered in that exact font */}
                        <div
                          className="text-sm truncate text-[#44403c] dark:text-[#d6d3d1] select-none pt-0.5"
                          style={{ fontFamily: getFontFamilyCss(f.id) }}
                        >
                          {f.sample}
                        </div>
                      </div>

                      {isCurrent && (
                        <i className="fa-solid fa-check text-xs text-[#6b38c2] dark:text-[#c4a5f3] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Font Size Control: [- 26 +] */}
        <div className="flex items-center h-8 rounded-lg border border-[#e7e5e4] dark:border-[#38332e] bg-white dark:bg-[#1f1c19] shadow-2xs flex-shrink-0 px-0.5">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSizeChange(-1)}
            className="w-6 h-7 flex items-center justify-center text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white rounded hover:bg-[#f0efed] dark:hover:bg-[#2e2a26] transition"
            title={lang === 'th' ? 'ลดขนาดฟอนต์ (-)' : 'Decrease font size (-)'}
          >
            <i className="fa-solid fa-minus text-[9px]" />
          </button>
          <input
            type="number"
            value={numericFontSize}
            onChange={(e) => handleSizeInput(e.target.value)}
            className="w-9 h-7 text-center text-xs font-semibold bg-transparent text-[#0c0a09] dark:text-white outline-none font-mono"
            title={lang === 'th' ? 'ขนาดฟอนต์' : 'Font size'}
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSizeChange(1)}
            className="w-6 h-7 flex items-center justify-center text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white rounded hover:bg-[#f0efed] dark:hover:bg-[#2e2a26] transition"
            title={lang === 'th' ? 'เพิ่มขนาดฟอนต์ (+)' : 'Increase font size (+)'}
          >
            <i className="fa-solid fa-plus text-[9px]" />
          </button>
        </div>

        {/* 3. Text Color Button (A with rainbow or current color bar) */}
        <button
          id="btn-canva-color"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowFontMenu(false);
          }}
          className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center text-xs font-bold hover:bg-[#fafaf9] dark:hover:bg-[#2e2a26] transition t-btn-press flex-shrink-0 ${
            showColorPicker ? 'bg-[#f0ebf8] dark:bg-[#34244d]' : ''
          }`}
          title={lang === 'th' ? 'สีข้อความ' : 'Text Color'}
        >
          <span className="leading-none text-xs text-[#0c0a09] dark:text-white">A</span>
          <div
            className="w-4 h-1 rounded-full mt-0.5"
            style={{
              background: activeColor || 'linear-gradient(90deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7)'
            }}
          />
        </button>

        {/* 4. Bold Button (B) */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (activeSelection) {
              applySelectionFormat?.({ toggleBold: true });
            } else {
              updateTextFormat('bold', !activeBold);
            }
          }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition flex-shrink-0 t-btn-press ${
            activeBold
              ? 'bg-[#f0ebf8] text-[#6b38c2] dark:bg-[#34244d] dark:text-[#c4a5f3] font-bold'
              : 'text-[#777169] hover:bg-[#fafaf9] dark:hover:bg-[#2e2a26]'
          }`}
          title={lang === 'th' ? 'ตัวหนา' : 'Bold'}
        >
          B
        </button>

        {/* 5. Italic Button (I) */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (activeSelection) {
              applySelectionFormat?.({ toggleItalic: true });
            } else {
              updateTextFormat('italic', !activeItalic);
            }
          }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs italic font-serif transition flex-shrink-0 t-btn-press ${
            activeItalic
              ? 'bg-[#f0ebf8] text-[#6b38c2] dark:bg-[#34244d] dark:text-[#c4a5f3]'
              : 'text-[#777169] hover:bg-[#fafaf9] dark:hover:bg-[#2e2a26]'
          }`}
          title={lang === 'th' ? 'ตัวเอียง' : 'Italic'}
        >
          I
        </button>

        {/* 6. Underline Button (U) */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (activeSelection) {
              applySelectionFormat?.({ toggleUnderline: true });
            } else {
              updateTextFormat('underline', !activeUnderline);
            }
          }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs underline transition flex-shrink-0 t-btn-press ${
            activeUnderline
              ? 'bg-[#f0ebf8] text-[#6b38c2] dark:bg-[#34244d] dark:text-[#c4a5f3]'
              : 'text-[#777169] hover:bg-[#fafaf9] dark:hover:bg-[#2e2a26]'
          }`}
          title={lang === 'th' ? 'ขีดเส้นใต้' : 'Underline'}
        >
          U
        </button>

        {/* 7. Strikethrough Button (S) */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (activeSelection) {
              applySelectionFormat?.({ strikethrough: !activeStrikethrough });
            } else {
              updateTextFormat('strikethrough', !activeStrikethrough);
            }
          }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs line-through transition flex-shrink-0 t-btn-press ${
            activeStrikethrough
              ? 'bg-[#f0ebf8] text-[#6b38c2] dark:bg-[#34244d] dark:text-[#c4a5f3]'
              : 'text-[#777169] hover:bg-[#fafaf9] dark:hover:bg-[#2e2a26]'
          }`}
          title={lang === 'th' ? 'ขีดทับ' : 'Strikethrough'}
        >
          S
        </button>

        {/* 8. Text Case Toggle Button (aA) */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={cycleCase}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition flex-shrink-0 t-btn-press ${
            activeTextTransform !== 'none'
              ? 'bg-[#f0ebf8] text-[#6b38c2] dark:bg-[#34244d] dark:text-[#c4a5f3] font-semibold'
              : 'text-[#777169] hover:bg-[#fafaf9] dark:hover:bg-[#2e2a26]'
          }`}
          title={lang === 'th' ? `สลับพิมพ์เล็ก-ใหญ่ (${activeTextTransform})` : `Text Case (${activeTextTransform})`}
        >
          aA
        </button>

        {/* Divider */}
        <div className="h-5 w-[1px] bg-[#e7e5e4] dark:bg-[#38332e] flex-shrink-0" />

        {/* 9. Text Alignment Toggle */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={cycleAlignment}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[#0c0a09] dark:text-white hover:bg-[#fafaf9] dark:hover:bg-[#2e2a26] transition flex-shrink-0 t-btn-press"
          title={lang === 'th' ? `จัดตำแหน่งข้อความ (${activeTextAlign})` : `Text Alignment (${activeTextAlign})`}
        >
          <i
            className={`fa-solid ${
              activeTextAlign === 'center'
                ? 'fa-align-center'
                : activeTextAlign === 'right'
                ? 'fa-align-right'
                : activeTextAlign === 'justify'
                ? 'fa-align-justify'
                : 'fa-align-left'
            } text-xs`}
          />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* CANVA COLOR PICKER CONTROLS (Underneath Toolbar)                          */}
      {/* Strictly 4 items + Spectrum Card, NO side drawer                          */}
      {/* ========================================================================= */}
      {showColorPicker && (
        <CanvaColorPicker
          activeColor={activeColor}
          onColorChange={(newColor) => {
            if (activeSelection) {
              applySelectionFormat?.({ color: newColor });
            } else {
              updateTextFormat('textColor', newColor);
            }
          }}
          activeTargetLabel={lang === 'th' ? activeTabMeta.labelTh : activeTabMeta.labelEn}
          onClose={() => setShowColorPicker(false)}
          lang={lang}
        />
      )}
    </div>
  );
}
