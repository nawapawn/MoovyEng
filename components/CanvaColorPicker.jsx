'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Math helpers for HSV, RGB, and HEX conversion
function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function rgbToHsv(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    if (max === rn) h = ((gn - bn) / diff) % 6;
    else if (max === gn) h = (bn - rn) / diff + 2;
    else h = (rn - gn) / diff + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  return { h, s, v };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 234, g: 234, b: 234 };
  let clean = hex.trim().replace('#', '');
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  if (clean.length !== 6) return { r: 234, g: 234, b: 234 };
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 234, g: 234, b: 234 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Minimalist Luxury Light Color Picker (Studio Color Laboratory)
 * Matches exact high-end studio specification:
 * - 2D Canvas Area (Saturation & Brightness) with crosshair reticle
 * - Preview & Hue Spectrum Row with range slider
 * - Technical Inputs Grid (HEX with Copy action, R, G, B, sRGB)
 * - Curated Neutral & Studio Accent Palette
 */
export default function CanvaColorPicker({
  activeColor = '',
  onColorChange,
  activeTargetLabel = 'ทั้งหมด',
  onClose,
  lang = 'th'
}) {
  // Initial values
  const initRgb = hexToRgb(activeColor || '#EAEAEA');
  const initHsv = rgbToHsv(initRgb.r, initRgb.g, initRgb.b);

  const [hue, setHue] = useState(initHsv.h || 165);
  const [sat, setSat] = useState(initHsv.s !== undefined ? initHsv.s : 0.5);
  const [val, setVal] = useState(initHsv.v !== undefined ? initHsv.v : 0.85);
  const [rgb, setRgb] = useState(initRgb);
  const [hexInput, setHexInput] = useState(
    activeColor && activeColor.startsWith('#') ? activeColor.toUpperCase() : '#EAEAEA'
  );
  const [toastVisible, setToastVisible] = useState(false);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);

  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const isDraggingCanvas = useRef(false);

  // Check Eyedropper API support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

  // Sync external activeColor changes
  useEffect(() => {
    if (activeColor && typeof activeColor === 'string' && activeColor.startsWith('#')) {
      const cleanHex = activeColor.toUpperCase();
      setHexInput(cleanHex);
      const newRgb = hexToRgb(cleanHex);
      setRgb(newRgb);
      const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setHue(newHsv.h);
      setSat(newHsv.s);
      setVal(newHsv.v);
    } else if (activeColor === '') {
      setHexInput('');
      const defaultRgb = hexToRgb('#EAEAEA');
      setRgb(defaultRgb);
      const defaultHsv = rgbToHsv(defaultRgb.r, defaultRgb.g, defaultRgb.b);
      setHue(defaultHsv.h || 165);
      setSat(defaultHsv.s);
      setVal(defaultHsv.v);
    }
  }, [activeColor]);

  // Draw 2D canvas with current hue
  const drawCanvas = useCallback(() => {
    const container = canvasContainerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // 1. Base pure hue fill
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    // 2. White to transparent horizontal gradient (Saturation)
    const gradWhite = ctx.createLinearGradient(0, 0, width, 0);
    gradWhite.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradWhite.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradWhite;
    ctx.fillRect(0, 0, width, height);

    // 3. Transparent to black vertical gradient (Brightness / Value)
    const gradBlack = ctx.createLinearGradient(0, 0, 0, height);
    gradBlack.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradBlack.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = gradBlack;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  useEffect(() => {
    drawCanvas();
    const handleResize = () => drawCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  // Handle color picking from canvas coordinates
  const pickColorFromCanvas = useCallback((clientX, clientY) => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    let x = clientX - rect.left;
    let y = clientY - rect.top;

    x = Math.max(0, Math.min(rect.width, x));
    y = Math.max(0, Math.min(rect.height, y));

    const s = rect.width > 0 ? x / rect.width : 0;
    const v = rect.height > 0 ? 1 - (y / rect.height) : 0;

    setSat(s);
    setVal(v);

    const newRgb = hsvToRgb(hue, s, v);
    setRgb(newRgb);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHexInput(newHex);
    onColorChange?.(newHex);
  }, [hue, onColorChange]);

  // Pointer move / up listeners for smooth canvas dragging
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDraggingCanvas.current) return;
      pickColorFromCanvas(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      isDraggingCanvas.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [pickColorFromCanvas]);

  // Copy HEX Code to clipboard with toast notification
  const copyHexCode = () => {
    const textToCopy = hexInput || '#FFFFFF';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 1200);
      }).catch(() => {
        fallbackCopy(textToCopy);
      });
    } else {
      fallbackCopy(textToCopy);
    }
  };

  const fallbackCopy = (text) => {
    try {
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 1200);
    } catch (e) {}
  };

  // Load preset color
  const loadColor = (hex) => {
    if (!hex) {
      onColorChange?.('');
      setHexInput('');
      return;
    }
    const cleanHex = hex.toUpperCase();
    setHexInput(cleanHex);
    const newRgb = hexToRgb(cleanHex);
    setRgb(newRgb);
    const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    setHue(newHsv.h);
    setSat(newHsv.s);
    setVal(newHsv.v);
    onColorChange?.(cleanHex);
  };

  // Eyedropper API
  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          loadColor(result.sRGBHex);
        }
      } catch (err) {}
    }
  };

  // Input changes
  const handleHexInputChange = (e) => {
    let raw = e.target.value.toUpperCase();
    if (!raw.startsWith('#') && raw.length > 0) raw = '#' + raw;
    setHexInput(raw);

    const clean = raw.replace('#', '');
    if (/^[0-9A-F]{6}$/i.test(clean)) {
      const hex = '#' + clean;
      const newRgb = hexToRgb(hex);
      setRgb(newRgb);
      const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setHue(newHsv.h);
      setSat(newHsv.s);
      setVal(newHsv.v);
      onColorChange?.(hex);
    }
  };

  const handleRgbChange = (channel, rawValue) => {
    let valNum = parseInt(rawValue, 10);
    if (isNaN(valNum)) valNum = 0;
    valNum = Math.max(0, Math.min(255, valNum));

    const newRgb = { ...rgb, [channel]: valNum };
    setRgb(newRgb);

    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHexInput(newHex);

    const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    setHue(newHsv.h);
    setSat(newHsv.s);
    setVal(newHsv.v);
    onColorChange?.(newHex);
  };

  return (
    <div className="w-full max-w-md mx-auto luxury-card rounded-2xl p-5 sm:p-7 relative select-none animate-in fade-in-50 zoom-in-98 duration-150">
      {/* Header / Title */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h1 className="text-xs font-semibold tracking-[0.25em] text-neutral-400 dark:text-neutral-500 uppercase">
            {activeTargetLabel ? `STUDIO • ${activeTargetLabel}` : 'STUDIO'}
          </h1>
          <p className="text-sm font-medium tracking-wide text-neutral-800 dark:text-neutral-100 mt-0.5">
            Color Laboratory
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Toast */}
          <div
            id="toast"
            className={`text-[11px] font-mono tracking-wider uppercase text-neutral-400 dark:text-neutral-500 transition-opacity duration-300 pointer-events-none ${
              toastVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {lang === 'th' ? 'COPIED' : 'COPIED'}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition p-1"
              title={lang === 'th' ? 'ปิด' : 'Close'}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* 2D Canvas Area (Saturation & Brightness) */}
      <div
        id="canvasContainer"
        ref={canvasContainerRef}
        onPointerDown={(e) => {
          isDraggingCanvas.current = true;
          pickColorFromCanvas(e.clientX, e.clientY);
        }}
        className="relative w-full h-44 sm:h-52 mb-6 cursor-crosshair group overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-none shadow-none"
      >
        <canvas id="colorCanvas" ref={canvasRef} className="w-full h-full block" />
        <div
          id="canvasReticle"
          className="absolute w-3.5 h-3.5 border border-black dark:border-white bg-transparent pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{
            left: `${sat * 100}%`,
            top: `${(1 - val) * 100}%`
          }}
        >
          <div className="absolute inset-0 border border-white/80 dark:border-black/80" />
        </div>
      </div>

      {/* Preview & Hue Spectrum Row */}
      <div className="flex items-center gap-4 sm:gap-5 mb-6">
        {/* Minimalist Color Preview Square */}
        <div
          id="previewBox"
          className="w-12 h-12 border border-neutral-200 dark:border-neutral-800 rounded-none flex-shrink-0 transition-colors duration-200"
          style={{ backgroundColor: hexInput || '#FFFFFF' }}
          title={hexInput || 'Auto'}
        />

        {/* Spectrum Hue Slider */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex justify-between text-[11px] font-mono text-neutral-400 dark:text-neutral-500 mb-2 tracking-wider">
            <span>HUE</span>
            <span id="hueVal">{hue}°</span>
          </div>
          <div className="relative h-4 flex items-center">
            <div
              className="absolute inset-x-0 h-2 rounded-none"
              style={{
                background:
                  'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
              }}
            />
            <input
              type="range"
              id="hueSlider"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => {
                const newHue = parseInt(e.target.value, 10);
                setHue(newHue);
                const newRgb = hsvToRgb(newHue, sat, val);
                setRgb(newRgb);
                const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
                setHexInput(newHex);
                onColorChange?.(newHex);
              }}
              className="absolute inset-x-0 w-full bg-transparent appearance-none cursor-pointer h-6 z-10 spectrum-slider"
              aria-label="Hue Spectrum Slider"
            />
          </div>
        </div>
      </div>

      {/* Technical Inputs Grid (HEX, RGB) */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {/* HEX Input Card (Clickable to Copy & Direct Edit) */}
        <div className="col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none p-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors group flex items-center justify-between">
          <div className="flex-1">
            <span className="block text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest uppercase mb-0.5">
              HEX CODE
            </span>
            <input
              id="inputHex"
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              className="text-sm font-mono tracking-wider text-neutral-800 dark:text-neutral-100 bg-transparent uppercase font-semibold focus:outline-none w-28"
              maxLength={7}
              placeholder="#EAEAEA"
              aria-label="Hex Color Code"
            />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {hasEyeDropper && (
              <button
                type="button"
                onClick={handleEyeDropper}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition rounded-none hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title={lang === 'th' ? 'ดูดสีจากหน้าจอ (Eyedropper)' : 'Eyedropper'}
                aria-label="Eyedropper"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m14.33 8.26-6.8 6.8a4.5 4.5 0 0 0-.65.82h3.57l5.75-5.75-1.87-1.87zm1.06-1.06 1.87 1.87 2.4-2.41a1.32 1.32 0 1 0-1.86-1.87l-2.4 2.4zm2.93 2.93 1.54 1.54a.75.75 0 0 1-1.06 1.06l-1.54-1.54-6.81 6.8a6 6 0 0 1-2.04 1.34l-3.83 1.52a.75.75 0 0 1-.97-.98l1.51-3.83a6 6 0 0 1 1.34-2.03l6.8-6.81-1.53-1.54a.75.75 0 0 1 1.06-1.06l1.54 1.54 2.41-2.41a2.82 2.82 0 0 1 3.99 3.99l-2.41 2.4z" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={copyHexCode}
              className="text-[10px] font-mono tracking-widest text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 py-1 rounded-none transition-colors uppercase cursor-pointer"
            >
              COPY
            </button>
          </div>
        </div>

        {/* R Input */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none p-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
          <span className="block text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest uppercase mb-1">
            R
          </span>
          <input
            type="number"
            id="inputR"
            min="0"
            max="255"
            value={rgb.r}
            onChange={(e) => handleRgbChange('r', e.target.value)}
            className="w-full bg-transparent text-sm font-mono text-neutral-800 dark:text-neutral-100 focus:outline-none hide-spinners"
            aria-label="Red channel"
          />
        </div>

        {/* G Input */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none p-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
          <span className="block text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest uppercase mb-1">
            G
          </span>
          <input
            type="number"
            id="inputG"
            min="0"
            max="255"
            value={rgb.g}
            onChange={(e) => handleRgbChange('g', e.target.value)}
            className="w-full bg-transparent text-sm font-mono text-neutral-800 dark:text-neutral-100 focus:outline-none hide-spinners"
            aria-label="Green channel"
          />
        </div>

        {/* B Input */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none p-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
          <span className="block text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest uppercase mb-1">
            B
          </span>
          <input
            type="number"
            id="inputB"
            min="0"
            max="255"
            value={rgb.b}
            onChange={(e) => handleRgbChange('b', e.target.value)}
            className="w-full bg-transparent text-sm font-mono text-neutral-800 dark:text-neutral-100 focus:outline-none hide-spinners"
            aria-label="Blue channel"
          />
        </div>

        {/* Alpha / Mode */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none p-3 flex flex-col justify-center">
          <span className="block text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest uppercase mb-1">
            RGB
          </span>
          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 tracking-wider">
            sRGB
          </span>
        </div>
      </div>

      {/* Curated Neutral & Accent Palette Bar */}
      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest uppercase">
            Presets
          </span>
          <button
            type="button"
            onClick={() => {
              onColorChange?.('');
              setHexInput('');
            }}
            className="text-[10px] font-mono text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 tracking-wider uppercase transition"
            title={lang === 'th' ? 'สีอัตโนมัติตามธีม' : 'Auto Contrast Theme'}
          >
            AUTO THEME
          </button>
        </div>

        {/* Neutral Studio Palette */}
        <div className="grid grid-cols-6 gap-2 mb-2">
          {['#FFFFFF', '#F4F4F5', '#E4E4E7', '#A1A1AA', '#52525B', '#18181B'].map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => loadColor(hex)}
              className="h-6 rounded-none border border-neutral-200 dark:border-neutral-700 hover:opacity-80 transition-opacity"
              style={{ backgroundColor: hex }}
              title={hex}
              aria-label={`Preset ${hex}`}
            />
          ))}
        </div>

        {/* Vibrant Studio Accent Palette */}
        <div className="grid grid-cols-6 gap-2">
          {['#FDE047', '#38BDF8', '#34D399', '#FB7185', '#A855F7', '#F97316'].map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => loadColor(hex)}
              className="h-6 rounded-none border border-neutral-200 dark:border-neutral-700 hover:opacity-80 transition-opacity"
              style={{ backgroundColor: hex }}
              title={hex}
              aria-label={`Accent ${hex}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
