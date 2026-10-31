'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useVocab } from '../context/VocabContext';
import CanvaColorPicker from './CanvaColorPicker';

const QUICK_COLORS = [
  { id: 'yellow', hex: '#fde047', label: 'Yellow' },
  { id: 'red', hex: '#ef4444', label: 'Red' },
  { id: 'sky', hex: '#38bdf8', label: 'Sky' },
  { id: 'emerald', hex: '#10b981', label: 'Emerald' },
  { id: 'purple', hex: '#a855f7', label: 'Purple' },
  { id: 'white', hex: '#ffffff', label: 'White' },
  { id: 'charcoal', hex: '#0c0a09', label: 'Dark' }
];

const QUICK_FONTS = [
  { id: 'Garuda', name: 'Garuda' },
  { id: 'Inter', name: 'Inter' },
  { id: 'Prompt', name: 'Prompt' },
  { id: 'Kanit', name: 'Kanit' },
  { id: 'Itim', name: 'Itim' },
  { id: 'Chonburi', name: 'Chonburi' }
];

export default function CanvaSelectionToolbar() {
  const {
    activeSelection,
    setActiveSelection,
    applySelectionFormat,
    clearSelectionFormat
  } = useVocab();

  const [coords, setCoords] = useState(null);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const toolbarRef = useRef(null);

  // Monitor mouseup / selectionchange to detect text selection inside preview card
  useEffect(() => {
    let timeoutId = null;

    const isFormattingUI = (el) => {
      if (!el) return false;
      return Boolean(
        el.closest?.('.canva-text-tools-container') ||
        el.closest?.('.canva-floating-toolbar') ||
        el.closest?.('.canva-color-picker-container') ||
        el.closest?.('#canva-selection-toolbar') ||
        (toolbarRef.current && toolbarRef.current.contains(el))
      );
    };

    const handleSelectionChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // If clicking inside formatting UI or toolbar, keep current selection
        if (isFormattingUI(document.activeElement)) {
          return;
        }

        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
          // If activeSelection is from an input field, do not clear from DOM selection change
          if (activeSelection?.isInputField) {
            return;
          }
          setCoords(null);
          return;
        }

        const selectedText = sel.toString().trim();
        if (!selectedText) {
          setCoords(null);
          return;
        }

        const range = sel.getRangeAt(0);
        let node = range.commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;

        const fieldEl = node.closest('[data-preview-field]');
        if (!fieldEl) {
          setCoords(null);
          return;
        }

        const fieldName = fieldEl.getAttribute('data-preview-field');
        const phoneContainer = document.getElementById('phone-container');
        if (!phoneContainer || !phoneContainer.contains(fieldEl)) {
          setCoords(null);
          return;
        }

        const rect = range.getBoundingClientRect();
        const phoneRect = phoneContainer.getBoundingClientRect();

        // Calculate relative position inside phone container
        const relTop = rect.top - phoneRect.top - 52;
        const relLeft = rect.left - phoneRect.left + (rect.width / 2);

        setCoords({
          top: Math.max(10, Math.min(phoneRect.height - 70, relTop)),
          left: Math.max(130, Math.min(phoneRect.width - 130, relLeft)),
          text: selectedText,
          fieldName
        });

        setActiveSelection?.({
          fieldName,
          text: selectedText,
          range,
          rect
        });
      }, 50);
    };

    const handleDocumentMouseDown = (e) => {
      if (isFormattingUI(e.target)) {
        return;
      }
      const fieldEl = e.target.closest?.('[data-preview-field]');
      if (!fieldEl) {
        setCoords(null);
        setActiveSelection?.(null);
      }
    };

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleDocumentMouseDown);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [activeSelection, setActiveSelection]);

  if (!coords || !activeSelection) return null;

  return (
    <div
      id="canva-selection-toolbar"
      ref={toolbarRef}
      onMouseDown={(e) => {
        // Prevent selection collapse when clicking toolbar buttons
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        transform: 'translateX(-50%)'
      }}
      className="absolute z-50 flex items-center gap-1 p-1.5 rounded-full bg-zinc-950/95 text-white shadow-2xl backdrop-blur-md border border-zinc-700/60 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Bold Button */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => applySelectionFormat?.({ toggleBold: true })}
        className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center font-bold text-xs transition"
        title="หนา (Bold)"
      >
        <span className="font-extrabold text-[13px]">B</span>
      </button>

      {/* Italic Button */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => applySelectionFormat?.({ toggleItalic: true })}
        className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center italic text-xs transition"
        title="เอียง (Italic)"
      >
        <span className="font-serif italic text-[13px]">I</span>
      </button>

      {/* Underline Button */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => applySelectionFormat?.({ toggleUnderline: true })}
        className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-xs transition"
        title="ขีดเส้นใต้ (Underline)"
      >
        <span className="underline font-semibold text-[13px]">U</span>
      </button>

      {/* Divider */}
      <div className="w-[1px] h-4 bg-zinc-700 mx-0.5" />

      {/* Quick Color Swatches */}
      <div className="flex items-center gap-1 px-0.5">
        {QUICK_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applySelectionFormat?.({ color: c.hex })}
            style={{ backgroundColor: c.hex }}
            className="w-4 h-4 rounded-full border border-white/40 hover:scale-125 transition-transform"
            title={`สี ${c.label}`}
          />
        ))}
        {/* Custom Color Laboratory Studio Button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowFontMenu(false);
          }}
          className={`w-5 h-5 rounded-none border border-white/50 flex items-center justify-center hover:scale-110 transition-transform ${
            showColorPicker ? 'ring-2 ring-white' : ''
          }`}
          style={{
            background: 'linear-gradient(135deg, #18181b 0%, #38bdf8 50%, #fde047 100%)'
          }}
          title="Color Laboratory Studio"
          aria-label="Color Laboratory Studio"
        >
          <i className="fa-solid fa-palette text-[8px] text-white" />
        </button>
      </div>

      {showColorPicker && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-80 sm:w-96 shadow-2xl">
          <CanvaColorPicker
            activeColor={activeSelection?.color || '#FFFFFF'}
            onColorChange={(newColor) => applySelectionFormat?.({ color: newColor })}
            activeTargetLabel="Selection"
            onClose={() => setShowColorPicker(false)}
          />
        </div>
      )}

      {/* Divider */}
      <div className="w-[1px] h-4 bg-zinc-700 mx-0.5" />

      {/* Font Size (+ / -) */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => applySelectionFormat?.({ sizeDelta: -2 })}
        className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center text-[10px] font-semibold transition"
        title="ลดขนาดตัวอักษร (A-)"
      >
        A-
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => applySelectionFormat?.({ sizeDelta: 2 })}
        className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center text-[11px] font-bold transition"
        title="เพิ่มขนาดตัวอักษร (A+)"
      >
        A+
      </button>

      {/* Divider */}
      <div className="w-[1px] h-4 bg-zinc-700 mx-0.5" />

      {/* Quick Font Selector Button */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowFontMenu(!showFontMenu);
          }}
          className={`px-2 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 transition ${
            showFontMenu ? 'bg-white text-zinc-950' : 'hover:bg-white/20'
          }`}
          title="เลือกฟอนต์"
        >
          <i className="fa-solid fa-font text-[9px]" />
          <span>ฟอนต์</span>
        </button>

        {showFontMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-32 bg-zinc-900 border border-zinc-700 rounded-xl p-1 shadow-2xl space-y-0.5">
            {QUICK_FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  applySelectionFormat?.({ fontFamily: f.id });
                  setShowFontMenu(false);
                }}
                className="w-full text-left px-2 py-1 rounded-lg text-[11px] hover:bg-white/20 transition"
              >
                {f.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-[1px] h-4 bg-zinc-700 mx-0.5" />

      {/* Clear Formatting (Eraser) */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => clearSelectionFormat?.()}
        className="w-7 h-7 rounded-full hover:bg-rose-500/30 text-rose-300 flex items-center justify-center text-xs transition"
        title="ล้างสไตล์ที่คลุม (Clear Style)"
      >
        <i className="fa-solid fa-eraser text-[10.5px]" />
      </button>
    </div>
  );
}
