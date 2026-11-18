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
 * Ultra-Clean Floating Popover Color Picker
 * Zero redundant text labels — pure swatches, HEX, 2D canvas, hue bar, and R/G/B.
 */
export default function CanvaColorPicker({
  activeColor = '',
  onColorChange,
  onClose,
  lang = 'th'
}) {
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

  useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

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

    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    const gradWhite = ctx.createLinearGradient(0, 0, width, 0);
    gradWhite.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradWhite.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradWhite;
    ctx.fillRect(0, 0, width, height);

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
    <div className="w-[268px] sm:w-[280px] bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#38332e] rounded-2xl p-2.5 shadow-[0_18px_42px_rgba(0,0,0,0.16)] relative select-none space-y-2">
      {/* 1. Top Row: 6 Neutral Presets + Reset & Close */}
      <div className="flex items-center gap-1.5">
        <div className="grid grid-cols-6 gap-1 flex-1">
          {['#FFFFFF', '#F4F4F5', '#E4E4E7', '#A1A1AA', '#52525B', '#18181B'].map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => loadColor(hex)}
              className="h-5 rounded-md border border-[#d6d3d1] dark:border-[#44403c] hover:scale-105 transition-transform"
              style={{ backgroundColor: hex }}
              title={hex}
              aria-label={`Preset ${hex}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            onColorChange?.('');
            setHexInput('');
          }}
          className="w-6 h-5 rounded-md bg-[#fafafa] dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white flex items-center justify-center transition shrink-0"
          title={lang === 'th' ? 'รีเซ็ตสีอัตโนมัติ' : 'Auto Reset'}
          aria-label="Auto Reset"
        >
          <i className="fa-solid fa-rotate-left text-[10px]" />
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-5 rounded-md hover:bg-[#f0efed] dark:hover:bg-[#292524] text-[#777169] hover:text-[#0c0a09] dark:hover:text-white flex items-center justify-center transition shrink-0"
            title={lang === 'th' ? 'ปิด' : 'Close'}
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        )}
      </div>

      {/* 2. Accent Swatches Row */}
      <div className="grid grid-cols-6 gap-1">
        {['#FDE047', '#38BDF8', '#34D399', '#FB7185', '#A855F7', '#F97316'].map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => loadColor(hex)}
            className="h-5 rounded-md border border-[#d6d3d1] dark:border-[#44403c] hover:scale-105 transition-transform"
            style={{ backgroundColor: hex }}
            title={hex}
            aria-label={`Accent ${hex}`}
          />
        ))}
      </div>

      {/* 3. Clean HEX Bar (No noisy text labels) */}
      <div className="bg-[#fafafa] dark:bg-[#25211e] border border-[#e7e5e4] dark:border-[#292524] rounded-lg px-2 py-1 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div
            id="previewBox"
            className="w-5 h-5 border border-[#d6d3d1] dark:border-[#44403c] rounded flex-shrink-0 transition-colors duration-200"
            style={{ backgroundColor: hexInput || '#FFFFFF' }}
            title={hexInput || 'Auto'}
          />
          <input
            id="inputHex"
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            className="text-xs font-mono tracking-wider text-[#0c0a09] dark:text-white bg-transparent uppercase font-semibold focus:outline-none w-20"
            maxLength={7}
            placeholder="#FFFFFF"
            aria-label="Hex Color Code"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {hasEyeDropper && (
            <button
              type="button"
              onClick={handleEyeDropper}
              className="w-6 h-6 text-[#777169] hover:text-[#0c0a09] dark:hover:text-white transition rounded flex items-center justify-center hover:bg-[#e7e5e4] dark:hover:bg-[#292524]"
              title={lang === 'th' ? 'ดูดสี' : 'Eyedropper'}
              aria-label="Eyedropper"
            >
              <i className="fa-solid fa-eye-dropper text-[10px]" />
            </button>
          )}
          <button
            type="button"
            onClick={copyHexCode}
            className="w-6 h-6 text-[#777169] hover:text-[#0c0a09] dark:hover:text-white rounded flex items-center justify-center hover:bg-[#e7e5e4] dark:hover:bg-[#292524] transition-colors cursor-pointer"
            title={lang === 'th' ? 'คัดลอกโค้ดสี' : 'Copy HEX'}
            aria-label="Copy HEX"
          >
            <i className={`fa-solid ${toastVisible ? 'fa-check text-emerald-500' : 'fa-copy'} text-[10px]`} />
          </button>
          <span id="toast" className="sr-only">
            {toastVisible ? 'COPIED' : ''}
          </span>
        </div>
      </div>

      {/* 4. Compact 2D Color Canvas */}
      <div
        id="canvasContainer"
        ref={canvasContainerRef}
        onPointerDown={(e) => {
          isDraggingCanvas.current = true;
          pickColorFromCanvas(e.clientX, e.clientY);
        }}
        className="relative w-full h-24 cursor-crosshair group overflow-hidden border border-[#e7e5e4] dark:border-[#292524] rounded-lg"
      >
        <canvas id="colorCanvas" ref={canvasRef} className="w-full h-full block" />
        <div
          id="canvasReticle"
          className="absolute w-3 h-3 border border-[#0c0a09] dark:border-white bg-transparent pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${sat * 100}%`,
            top: `${(1 - val) * 100}%`
          }}
        >
          <div className="absolute inset-0 border border-white/80 dark:border-[#0c0a09]/80" />
        </div>
      </div>

      {/* 5. Pure Hue Spectrum Bar (No text clutter) */}
      <div className="relative h-3.5 flex items-center">
        <span id="hueVal" className="sr-only">{hue}°</span>
        <div
          className="absolute inset-x-0 h-2 rounded-full"
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
          className="absolute inset-x-0 w-full bg-transparent appearance-none cursor-pointer h-5 z-10 spectrum-slider"
          aria-label="Hue Spectrum Slider"
        />
      </div>

      {/* 6. Clean 3-Column RGB Strip (Removed redundant sRGB box) */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-[#fafafa] dark:bg-[#25211e] border border-[#e7e5e4] dark:border-[#292524] rounded-md px-2 py-0.5 flex items-center justify-between gap-1">
          <span className="text-[10px] font-mono text-[#777169] dark:text-[#a8a29e]">R</span>
          <input
            type="number"
            id="inputR"
            min="0"
            max="255"
            value={rgb.r}
            onChange={(e) => handleRgbChange('r', e.target.value)}
            className="w-full text-right bg-transparent text-[11px] font-mono text-[#0c0a09] dark:text-white focus:outline-none hide-spinners"
            aria-label="Red channel"
          />
        </div>

        <div className="bg-[#fafafa] dark:bg-[#25211e] border border-[#e7e5e4] dark:border-[#292524] rounded-md px-2 py-0.5 flex items-center justify-between gap-1">
          <span className="text-[10px] font-mono text-[#777169] dark:text-[#a8a29e]">G</span>
          <input
            type="number"
            id="inputG"
            min="0"
            max="255"
            value={rgb.g}
            onChange={(e) => handleRgbChange('g', e.target.value)}
            className="w-full text-right bg-transparent text-[11px] font-mono text-[#0c0a09] dark:text-white focus:outline-none hide-spinners"
            aria-label="Green channel"
          />
        </div>

        <div className="bg-[#fafafa] dark:bg-[#25211e] border border-[#e7e5e4] dark:border-[#292524] rounded-md px-2 py-0.5 flex items-center justify-between gap-1">
          <span className="text-[10px] font-mono text-[#777169] dark:text-[#a8a29e]">B</span>
          <input
            type="number"
            id="inputB"
            min="0"
            max="255"
            value={rgb.b}
            onChange={(e) => handleRgbChange('b', e.target.value)}
            className="w-full text-right bg-transparent text-[11px] font-mono text-[#0c0a09] dark:text-white focus:outline-none hide-spinners"
            aria-label="Blue channel"
          />
        </div>
      </div>
    </div>
  );
}
