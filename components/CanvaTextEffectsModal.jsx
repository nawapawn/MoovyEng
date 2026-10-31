'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { adjustHex } from '../lib/utils';
import CanvaColorPicker from './CanvaColorPicker';

// แม่แบบสไตล์เริ่มต้นสำหรับแต่ละเอฟเฟกต์ตามสเปก Canva 100%
export const DEFAULT_THEME_COLORS = {
  'fx-none': '#8b5cf6',
  'fx-shadow': '#8b5cf6',
  'fx-lift': '#8b5cf6',
  'fx-reflection': '#8b5cf6',
  'fx-outline': '#8b5cf6',
  'fx-background-box': '#8b5cf6',
  'fx-splice': '#8b5cf6',
  'fx-hollow': '#7c3aed',
  'fx-neon': '#c084fc',
  'fx-glitch-instant': '#a855f7',
  'fx-scifi': '#86efac',
  'fx-tv-glitch': '#38bdf8',
  'fx-retro70s': '#f59e0b',
  'fx-screen-print': '#db2777',
  'fx-western': '#e06d53',
  'fx-graffiti': '#10b981',
  'fx-bubble': '#38bdf8',
  'fx-aerobic': '#f43f5e',
  'fx-arcade': '#22c55e',
  'fx-cosmic': '#a5b4fc',
  'fx-pixel': '#ec4899'
};

// 1. หมวดลักษณะพิเศษ (Special Styles - 10 effects)
export const SPECIAL_STYLES = [
  { id: 'fx-none', nameTh: 'ไม่มี', nameEn: 'None', previewText: 'None', textClass: 'text-2xl font-bold text-slate-400 group-hover:text-slate-600 transition' },
  { id: 'fx-shadow', nameTh: 'เงา', nameEn: 'Shadow', previewText: 'Ag', textClass: 'text-3xl font-bold fx-shadow' },
  { id: 'fx-lift', nameTh: 'เรืองแสง', nameEn: 'Glow / Lift', previewText: 'Ag', textClass: 'text-3xl font-bold fx-lift' },
  { id: 'fx-reflection', nameTh: 'เงาสะท้อน', nameEn: 'Reflection', previewText: 'Ag', textClass: 'text-3xl font-bold fx-reflection' },
  { id: 'fx-outline', nameTh: 'เค้าร่าง', nameEn: 'Outline', previewText: 'Ag', textClass: 'text-3xl font-bold fx-outline' },
  { id: 'fx-background-box', nameTh: 'แบ็กกราวน์', nameEn: 'Background', previewText: 'Ag', textClass: 'text-3xl font-bold fx-background-box' },
  { id: 'fx-splice', nameTh: 'อักษรประกบ', nameEn: 'Splice', previewText: 'Ag', textClass: 'text-3xl font-bold fx-splice' },
  { id: 'fx-hollow', nameTh: 'กลวง', nameEn: 'Hollow', previewText: 'Ag', textClass: 'text-3xl font-bold fx-hollow' },
  { id: 'fx-neon', nameTh: 'นีออน', nameEn: 'Neon', previewText: 'Ag', textClass: 'text-3xl font-bold fx-neon', darkBg: true },
  { id: 'fx-glitch-instant', nameTh: 'ทันทีทันใด', nameEn: 'Glitch', previewText: 'Ag', textClass: 'text-3xl font-bold fx-glitch-instant' }
];

// 2. หมวดขั้นสูง (Advanced Styles - 11 effects)
export const ADVANCED_STYLES = [
  { id: 'fx-scifi', nameTh: 'Sci-fi', nameEn: 'Sci-fi', previewText: 'AG', textClass: 'text-3xl fx-scifi', darkBg: true },
  { id: 'fx-tv-glitch', nameTh: 'ทีวีเสีย', nameEn: 'TV Glitch', previewText: 'Ag', textClass: 'text-3xl fx-tv-glitch' },
  { id: 'fx-retro70s', nameTh: 'ยุค 70', nameEn: '70s Retro', previewText: 'Ag', textClass: 'text-3xl fx-retro70s', cardBg: 'bg-amber-50/50 hover:border-amber-300' },
  { id: 'fx-screen-print', nameTh: 'การพิมพ์สกรีน', nameEn: 'Screen Print', previewText: 'AG', textClass: 'text-3xl fx-screen-print', cardBg: 'bg-pink-50/30 hover:border-pink-300' },
  { id: 'fx-western', nameTh: 'หนังตะวันตก', nameEn: 'Western', previewText: 'Ag', textClass: 'text-3xl fx-western', cardBg: 'bg-stone-50 hover:border-amber-400' },
  { id: 'fx-graffiti', nameTh: 'กราฟิตี้', nameEn: 'Graffiti', previewText: 'AG', textClass: 'text-2xl fx-graffiti', cardBg: 'bg-emerald-50/40 hover:border-emerald-400' },
  { id: 'fx-bubble', nameTh: 'ฟอง', nameEn: 'Bubble', previewText: 'Ag', textClass: 'text-3xl fx-bubble', cardBg: 'bg-sky-50/40 hover:border-sky-300' },
  { id: 'fx-aerobic', nameTh: 'แอโรบิก', nameEn: 'Aerobic', previewText: 'Ag', textClass: 'text-3xl fx-aerobic', darkBg: true },
  { id: 'fx-arcade', nameTh: 'อาร์เคด', nameEn: 'Arcade', previewText: 'Ag', textClass: 'text-xl fx-arcade', darkBg: true },
  { id: 'fx-cosmic', nameTh: 'คอสซิก', nameEn: 'Cosmic', previewText: 'Ag', textClass: 'text-3xl fx-cosmic', darkBg: true },
  { id: 'fx-pixel', nameTh: 'พิกเซล', nameEn: 'Pixel', previewText: 'AG', textClass: 'text-2xl fx-pixel', darkBg: true }
];

// ฟังก์ชันแปลง HSV เป็น HEX
export function hsvToHex(h, s, v) {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// ฟังก์ชันแปลง HEX เป็น HSV
export function hexToHsv(hex) {
  if (!hex || typeof hex !== 'string') return { h: 0, s: 0.53, v: 0.85 };
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  if (clean.length !== 6) return { h: 0, s: 0.53, v: 0.85 };

  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  if (isNaN(r) || isNaN(g) || isNaN(b)) return { h: 0, s: 0.53, v: 0.85 };

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s, v };
}

// สร้าง CSS Rules ไดนามิกตามสีที่ผู้ใช้เลือก (100% ตามไฟล์ต้นฉบับของผู้ใช้)
export function generateEffectCss(cls, hex, isGradient = false) {
  const darker = adjustHex(hex, -25);
  const muchDarker = adjustHex(hex, -50);
  const lighter = adjustHex(hex, 35);
  const bgLight = adjustHex(hex, 75);

  if (isGradient) {
    return `background: linear-gradient(135deg, ${hex}, ${lighter});
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
font-weight: 700;
filter: drop-shadow(3px 3px 5px rgba(0,0,0,0.25));`;
  }

  switch (cls) {
    case 'fx-none':
      return `color: ${hex};
font-weight: 700;`;
    case 'fx-shadow':
      return `color: ${hex};
font-weight: 700;
text-shadow: 4px 4px 6px ${darker}80;`;
    case 'fx-lift':
      return `color: ${hex};
font-weight: 700;
text-shadow: 0 0 16px ${hex}a6, 0 0 30px ${hex}66;`;
    case 'fx-reflection':
      return `color: ${hex};
font-weight: 700;
text-shadow: 5px 6px 0px ${darker}70;`;
    case 'fx-outline':
      return `color: transparent;
-webkit-text-stroke: 2.5px ${hex};
font-weight: 700;`;
    case 'fx-background-box':
      return `color: ${hex};
font-weight: 700;
background: ${bgLight}55;
padding: 0.15em 0.35em;
border-radius: 0.3em;
display: inline-block;`;
    case 'fx-splice':
      return `color: transparent;
-webkit-text-stroke: 2px ${hex};
font-weight: 700;
filter: drop-shadow(4px 4px 0px ${darker});`;
    case 'fx-hollow':
      return `color: transparent;
-webkit-text-stroke: 2px ${hex};
font-weight: 700;`;
    case 'fx-neon':
      return `color: #ffffff;
font-weight: 700;
text-shadow: 
  0 0 4px #ffffff,
  0 0 10px ${lighter},
  0 0 20px ${hex},
  0 0 40px ${darker};`;
    case 'fx-glitch-instant':
      return `color: ${hex};
font-weight: 800;
text-shadow: -3px -2px 0px #06b6d4, 3px 2px 0px #ec4899;`;
    case 'fx-scifi':
      return `font-family: 'Orbitron', sans-serif;
color: ${hex};
font-weight: 900;
letter-spacing: 2px;
text-shadow: 
  0 0 5px ${lighter},
  0 0 12px ${hex},
  0 0 24px ${hex}99;`;
    case 'fx-tv-glitch':
      return `font-weight: 900;
color: ${hex};
text-shadow: 
  -3px 0 0 #ef4444,
  3px 0 0 ${darker},
  0 0 6px ${hex}b3;`;
    case 'fx-retro70s':
      return `font-weight: 900;
color: ${hex};
text-shadow: 
  1px 1px 0px ${adjustHex(hex, -15)},
  2px 2px 0px ${adjustHex(hex, -30)},
  3px 3px 0px ${adjustHex(hex, -45)},
  4px 4px 0px ${adjustHex(hex, -60)},
  5px 5px 0px #7f1d1d;`;
    case 'fx-screen-print':
      return `font-weight: 900;
color: transparent;
-webkit-text-stroke: 1.5px ${hex};
text-shadow: 
  3px 3px 0px ${lighter},
  6px 6px 0px ${lighter}66;`;
    case 'fx-western':
      return `font-family: 'Pacifico', cursive;
color: ${hex};
text-shadow: 
  2px 2px 0px #fff,
  3px 3px 0px ${darker},
  4px 4px 1px ${muchDarker};`;
    case 'fx-graffiti':
      return `font-family: 'Bungee', cursive;
color: ${hex};
-webkit-text-stroke: 2px ${muchDarker};
text-shadow: 
  4px 4px 0px ${muchDarker},
  6px 6px 0px rgba(0,0,0,0.3);`;
    case 'fx-bubble':
      return `font-weight: 900;
color: ${hex};
-webkit-text-stroke: 2px ${darker};
text-shadow: 
  inset 0 2px 4px rgba(255, 255, 255, 0.8),
  3px 3px 0px ${darker},
  5px 5px 0px ${muchDarker};
filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));`;
    case 'fx-aerobic':
      return `font-family: 'Pacifico', cursive;
color: ${hex};
font-style: italic;
text-shadow: 
  0 0 5px ${lighter},
  0 0 15px ${hex},
  0 0 25px ${darker};`;
    case 'fx-arcade':
      return `font-family: 'Press Start 2P', monospace;
color: ${hex};
text-shadow: 
  3px 3px 0px ${darker},
  5px 5px 0px ${muchDarker};
letter-spacing: 2px;`;
    case 'fx-cosmic':
      return `font-family: 'Pacifico', cursive;
color: #e0e7ff;
text-shadow: 
  0 0 8px ${lighter},
  0 0 18px ${hex},
  0 0 30px ${darker},
  0 0 45px ${muchDarker}99;`;
    case 'fx-pixel':
      return `font-family: 'Silkscreen', monospace;
font-weight: 700;
color: ${hex};
text-shadow: 
  3px 3px 0px #38bdf8,
  5px 5px 0px ${muchDarker};
letter-spacing: 3px;`;
    default:
      return `color: ${hex}; font-weight: 700;`;
  }
}

// แปลงเป็น Inline React Style สำหรับ Live Preview Canvas
export function getEffectReactStyle(cls, hex, isGradient = false, fontSize = 48) {
  const darker = adjustHex(hex, -25);
  const muchDarker = adjustHex(hex, -50);
  const lighter = adjustHex(hex, 35);
  const bgLight = adjustHex(hex, 75);

  const base = {
    fontSize: `${fontSize}px`,
    transition: 'all 0.15s ease'
  };

  if (isGradient) {
    return {
      ...base,
      backgroundImage: `linear-gradient(135deg, ${hex}, ${lighter})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 700,
      filter: 'drop-shadow(3px 3px 5px rgba(0,0,0,0.25))',
      display: 'inline-block'
    };
  }

  switch (cls) {
    case 'fx-none':
      return { ...base, color: hex, fontWeight: 700 };
    case 'fx-shadow':
      return { ...base, color: hex, fontWeight: 700, textShadow: `4px 4px 6px ${darker}80` };
    case 'fx-lift':
      return { ...base, color: hex, fontWeight: 700, textShadow: `0 0 16px ${hex}a6, 0 0 30px ${hex}66` };
    case 'fx-reflection':
      return { ...base, color: hex, fontWeight: 700, textShadow: `5px 6px 0px ${darker}70` };
    case 'fx-outline':
      return {
        ...base,
        color: 'transparent',
        WebkitTextStroke: `2.5px ${hex}`,
        WebkitTextFillColor: 'transparent',
        fontWeight: 700
      };
    case 'fx-background-box':
      return {
        ...base,
        color: hex,
        fontWeight: 700,
        backgroundColor: `${bgLight}55`,
        padding: '0.15em 0.35em',
        borderRadius: '0.3em',
        display: 'inline-block',
        lineHeight: 1.1
      };
    case 'fx-splice':
      return {
        ...base,
        color: 'transparent',
        WebkitTextStroke: `2px ${hex}`,
        WebkitTextFillColor: 'transparent',
        fontWeight: 700,
        filter: `drop-shadow(4px 4px 0px ${darker})`
      };
    case 'fx-hollow':
      return {
        ...base,
        color: 'transparent',
        WebkitTextStroke: `2px ${hex}`,
        WebkitTextFillColor: 'transparent',
        fontWeight: 700
      };
    case 'fx-neon':
      return {
        ...base,
        color: '#ffffff',
        WebkitTextFillColor: '#ffffff',
        fontWeight: 700,
        textShadow: `0 0 4px #ffffff, 0 0 10px ${lighter}, 0 0 20px ${hex}, 0 0 40px ${darker}`
      };
    case 'fx-glitch-instant':
      return {
        ...base,
        color: hex,
        fontWeight: 800,
        textShadow: '-3px -2px 0px #06b6d4, 3px 2px 0px #ec4899'
      };
    case 'fx-scifi':
      return {
        ...base,
        fontFamily: "'Orbitron', 'Kanit', sans-serif",
        color: hex,
        fontWeight: 900,
        letterSpacing: '2px',
        textShadow: `0 0 5px ${lighter}, 0 0 12px ${hex}, 0 0 24px ${hex}99`
      };
    case 'fx-tv-glitch':
      return {
        ...base,
        fontFamily: "'Kanit', sans-serif",
        fontWeight: 900,
        color: hex,
        position: 'relative',
        textShadow: `-3px 0 0 #ef4444, 3px 0 0 ${darker}, 0 0 6px ${hex}b3`
      };
    case 'fx-retro70s':
      return {
        ...base,
        fontFamily: "'Kanit', sans-serif",
        fontWeight: 900,
        color: hex,
        textShadow: `1px 1px 0px ${adjustHex(hex, -15)}, 2px 2px 0px ${adjustHex(hex, -30)}, 3px 3px 0px ${adjustHex(hex, -45)}, 4px 4px 0px ${adjustHex(hex, -60)}, 5px 5px 0px #7f1d1d`
      };
    case 'fx-screen-print':
      return {
        ...base,
        fontFamily: "'Kanit', sans-serif",
        fontWeight: 900,
        color: 'transparent',
        WebkitTextStroke: `1.5px ${hex}`,
        WebkitTextFillColor: 'transparent',
        textShadow: `3px 3px 0px ${lighter}, 6px 6px 0px ${lighter}66`
      };
    case 'fx-western':
      return {
        ...base,
        fontFamily: "'Pacifico', cursive",
        color: hex,
        textShadow: `2px 2px 0px #fff, 3px 3px 0px ${darker}, 4px 4px 1px ${muchDarker}`
      };
    case 'fx-graffiti':
      return {
        ...base,
        fontFamily: "'Bungee', cursive",
        color: hex,
        WebkitTextStroke: `2px ${muchDarker}`,
        textShadow: `4px 4px 0px ${muchDarker}, 6px 6px 0px rgba(0,0,0,0.3)`
      };
    case 'fx-bubble':
      return {
        ...base,
        fontFamily: "'Kanit', sans-serif",
        fontWeight: 900,
        color: hex,
        WebkitTextStroke: `2px ${darker}`,
        textShadow: `inset 0 2px 4px rgba(255, 255, 255, 0.8), 3px 3px 0px ${darker}, 5px 5px 0px ${muchDarker}`,
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))'
      };
    case 'fx-aerobic':
      return {
        ...base,
        fontFamily: "'Pacifico', cursive",
        color: hex,
        fontStyle: 'italic',
        textShadow: `0 0 5px ${lighter}, 0 0 15px ${hex}, 0 0 25px ${darker}`
      };
    case 'fx-arcade':
      return {
        ...base,
        fontFamily: "'Press Start 2P', monospace",
        color: hex,
        textShadow: `3px 3px 0px ${darker}, 5px 5px 0px ${muchDarker}`,
        letterSpacing: '2px'
      };
    case 'fx-cosmic':
      return {
        ...base,
        fontFamily: "'Pacifico', cursive",
        color: '#e0e7ff',
        textShadow: `0 0 8px ${lighter}, 0 0 18px ${hex}, 0 0 30px ${darker}, 0 0 45px ${muchDarker}99`
      };
    case 'fx-pixel':
      return {
        ...base,
        fontFamily: "'Silkscreen', monospace",
        fontWeight: 700,
        color: hex,
        textShadow: `3px 3px 0px #38bdf8, 5px 5px 0px ${muchDarker}`,
        letterSpacing: '3px'
      };
    default:
      return { ...base, color: hex, fontWeight: 700 };
  }
}

/**
 * CanvaTextEffectsModal Component
 * Implements Canva Text Effects Studio & Preview 100% matching user specification:
 * - 3 Groups: ลักษณะพิเศษ (10 effects), ขั้นสูง (11 effects), รูปทรง (Straight vs Curved)
 * - Live interactive preview canvas with dot grid & background switcher
 * - Test text input & font size slider (24 - 84px)
 * - Curvature slider (0 - 150)
 * - Canva Spectrum Card: Solid / Gradient tabs, 2D Sat/Val Box, Rainbow Hue Bar, Hex, Eyedropper, Theme Reset
 * - Live CSS Code box & Copy CSS button with toast
 * - Apply to canvas target button & Reset button
 */
export default function CanvaTextEffectsModal({
  isOpen,
  onClose,
  initialEffect = 'fx-background-box',
  initialColor = '#8B5CF6',
  activeTarget = 'all',
  activeTargetLabel = 'ทั้งหมด',
  sampleText = 'Ag',
  onApply,
  lang = 'th'
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState(initialEffect || 'fx-background-box');
  const [shape, setShape] = useState('straight'); // 'straight' | 'curved'
  const [colorMode, setColorMode] = useState('solid'); // 'solid' | 'gradient'
  const [textVal, setTextVal] = useState(sampleText || 'Ag');
  const [fontSize, setFontSize] = useState(48);
  const [curvature, setCurvature] = useState(80);
  const [previewBg, setPreviewBg] = useState('bg-slate-50');
  const [copiedToast, setCopiedToast] = useState('');

  // Color State
  const initialHsv = useMemo(() => {
    if (initialColor && initialColor.startsWith('#')) return hexToHsv(initialColor);
    return hexToHsv(DEFAULT_THEME_COLORS[initialEffect] || '#8b5cf6');
  }, [initialColor, initialEffect]);

  const [hue, setHue] = useState(initialHsv.h);
  const [sat, setSat] = useState(initialHsv.s);
  const [val, setVal] = useState(initialHsv.v);
  const [hexInput, setHexInput] = useState(
    initialColor && initialColor.startsWith('#') ? initialColor.toUpperCase() : '#8B5CF6'
  );

  const spectrumRef = useRef(null);
  const isDraggingSpectrum = useRef(false);
  const hueRef = useRef(null);
  const isDraggingHue = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update effect selection
  const handleSelectEffect = (id) => {
    setSelectedEffect(id);
    const themeHex = DEFAULT_THEME_COLORS[id] || '#8b5cf6';
    setHexInput(themeHex.toUpperCase());
    const hsv = hexToHsv(themeHex);
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);

    // Auto switch dark preview bg for glow/neon styles
    if (['fx-neon', 'fx-scifi', 'fx-arcade', 'fx-cosmic', 'fx-aerobic'].includes(id)) {
      setPreviewBg('bg-slate-900');
    }
  };

  // 2D Sat/Val drag handler
  const handleSpectrumMove = useCallback((e) => {
    if (!spectrumRef.current) return;
    const rect = spectrumRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const newSat = x / rect.width;
    const newVal = 1 - y / rect.height;

    setSat(newSat);
    setVal(newVal);

    const newHex = hsvToHex(hue, newSat, newVal);
    setHexInput(newHex);
  }, [hue]);

  // Hue slider drag handler
  const handleHueMove = useCallback((e) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = x / rect.width;

    const newHue = Math.min(360, Math.max(0, Math.round(percent * 360))) % 360;
    setHue(newHue);

    const newHex = hsvToHex(newHue, sat, val);
    setHexInput(newHex);
  }, [sat, val]);

  // Window pointer listeners for smooth dragging
  useEffect(() => {
    function handlePointerMove(e) {
      if (isDraggingSpectrum.current) handleSpectrumMove(e);
      else if (isDraggingHue.current) handleHueMove(e);
    }
    function handlePointerUp() {
      isDraggingSpectrum.current = false;
      isDraggingHue.current = false;
    }
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handleSpectrumMove, handleHueMove]);

  // Hex input handler
  const handleHexChange = (e) => {
    let raw = e.target.value.trim().toUpperCase();
    if (!raw.startsWith('#') && raw.length > 0) raw = '#' + raw;
    setHexInput(raw);
    if (/^#[0-9A-F]{6}$/i.test(raw)) {
      const hsv = hexToHsv(raw);
      setHue(hsv.h);
      setSat(hsv.s);
      setVal(hsv.v);
    }
  };

  // Toast notifier
  const showToast = (msg) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(''), 2400);
  };

  // Eyedropper API
  const handleEyedropper = async () => {
    if (typeof window !== 'undefined' && window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const picked = result.sRGBHex.toUpperCase();
          setHexInput(picked);
          const hsv = hexToHsv(picked);
          setHue(hsv.h);
          setSat(hsv.s);
          setVal(hsv.v);
          showToast(`ดูดสีสำเร็จ: ${picked}`);
        }
      } catch (err) {}
    }
  };

  // Reset to Theme default color
  const handleResetThemeColor = () => {
    const themeHex = DEFAULT_THEME_COLORS[selectedEffect] || '#8b5cf6';
    setHexInput(themeHex.toUpperCase());
    const hsv = hexToHsv(themeHex);
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);
    showToast(`รีเซ็ตสีตามธีมของ ${activeEffectName} แล้ว`);
  };

  // Copy CSS code handler
  const handleCopyCss = () => {
    const cssText = generateEffectCss(selectedEffect, hexInput, colorMode === 'gradient');
    const fullRule = `.${selectedEffect} {\n${cssText.split('\n').map((l) => '  ' + l).join('\n')}\n}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullRule).then(() => {
        showToast(`คัดลอก CSS ของเอฟเฟกต์ ${activeEffectName} แล้ว!`);
      }).catch(() => {
        showToast('ไม่สามารถคัดลอกได้');
      });
    }
  };

  // Apply to active canvas element
  const handleApplyToCanvas = () => {
    onApply?.(selectedEffect, hexInput, shape, curvature);
    onClose?.();
  };

  // Reset all
  const handleResetAll = () => {
    setTextVal('Ag');
    setFontSize(48);
    setCurvature(80);
    setShape('straight');
    setPreviewBg('bg-slate-50');
    setSelectedEffect('fx-background-box');
    setColorMode('solid');
    const themeHex = DEFAULT_THEME_COLORS['fx-background-box'];
    setHexInput(themeHex.toUpperCase());
    const hsv = hexToHsv(themeHex);
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);
    showToast('รีเซ็ตค่าเริ่มต้นเรียบร้อย');
  };

  if (!isOpen || !mounted) return null;

  // Active effect meta
  const allStyles = [...SPECIAL_STYLES, ...ADVANCED_STYLES];
  const activeMeta = allStyles.find((s) => s.id === selectedEffect) || SPECIAL_STYLES[5];
  const activeEffectName = lang === 'th' ? activeMeta.nameTh : activeMeta.nameEn;
  const currentComputedHex = hsvToHex(hue, sat, val);
  const pureHueHex = hsvToHex(hue, 1, 1);
  const generatedCss = generateEffectCss(selectedEffect, hexInput, colorMode === 'gradient');
  const liveReactStyle = getEffectReactStyle(selectedEffect, hexInput, colorMode === 'gradient', fontSize);

  // Curve Y coordinate for SVG textPath
  const yPoint = 170 - curvature;

  return createPortal(
    <div
      id="canva-effects-studio-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in-0 duration-150 select-none overflow-y-auto no-scrollbar font-['Kanit',sans-serif]"
    >
      <div
        id="canva-effects-studio-container"
        className="w-full max-w-6xl bg-white dark:bg-[#1a1715] border border-[#e7e5e4] dark:border-[#38332e] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-150 transition-all text-[#0c0a09] dark:text-white"
      >
        {/* ================================================================= */}
        {/* HEADER                                                            */}
        {/* ================================================================= */}
        <header className="px-5 py-3.5 border-b border-[#e7e5e4] dark:border-[#2e2a26] flex items-center justify-between gap-3 bg-white/95 dark:bg-[#1f1c19]/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-violet-200 text-lg flex-shrink-0">
              Ag
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Canva Text Effects Studio
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 font-semibold">
                  {lang === 'th' ? `ปรับสำหรับ: ${activeTargetLabel}` : `Target: ${activeTargetLabel}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                แสดงและปรับแต่งทุกเอฟเฟกต์ตัวอักษรแบบสมจริง 100%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Copy CSS Code Button */}
            <button
              type="button"
              id="copyCssBtn"
              onClick={handleCopyCss}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 border border-violet-200 dark:border-violet-800/40 rounded-xl text-xs sm:text-sm font-medium transition active:scale-95"
              title="คัดลอกโค้ด CSS"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>คัดลอกโค้ด CSS</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              id="resetBtn"
              onClick={handleResetAll}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs sm:text-sm font-medium transition"
              title="รีเซ็ต"
            >
              รีเซ็ต
            </button>

            {/* Apply Button */}
            <button
              type="button"
              id="btn-apply-effect"
              onClick={handleApplyToCanvas}
              className="px-3.5 py-1.5 bg-[#8c52ff] hover:bg-[#7839ee] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 flex items-center gap-1"
              title="นำไปใช้กับข้อความในการ์ด"
            >
              <i className="fa-solid fa-check text-xs" />
              <span>นำไปใช้</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
              title="ปิด"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </header>

        {/* ================================================================= */}
        {/* MAIN BODY: 2-COLUMN STUDIO LAYOUT                                 */}
        {/* ================================================================= */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-64px)] no-scrollbar flex-1 w-full bg-slate-50/50 dark:bg-[#141210]">
          {/* --------------------------------------------------------------- */}
          {/* LEFT COLUMN: 3 EFFECT CATEGORIES (lg:col-span-7)                */}
          {/* --------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-5 overflow-y-auto pr-1 no-scrollbar">
            {/* หมวด 1: ลักษณะพิเศษ (Special Styles - 10 เอฟเฟกต์) */}
            <section className="bg-white dark:bg-[#201d1a] p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-[#38332e] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-600" />
                  ลักษณะพิเศษ
                </h2>
                <span className="text-xs text-slate-400">10 เอฟเฟกต์</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SPECIAL_STYLES.map((eff) => {
                  const isActive = selectedEffect === eff.id;
                  return (
                    <button
                      key={eff.id}
                      type="button"
                      onClick={() => handleSelectEffect(eff.id)}
                      className={`card-effect group flex flex-col items-center justify-center p-4 h-28 border rounded-xl transition ${
                        eff.darkBg
                          ? 'bg-slate-900 border-slate-700 hover:border-violet-400'
                          : 'bg-white dark:bg-[#25211e] border-slate-200 dark:border-[#38332e] hover:border-violet-300'
                      } ${isActive ? 'active border-violet-500 bg-purple-50 dark:bg-[#2e233d]' : ''}`}
                    >
                      <span className={eff.textClass}>{eff.previewText}</span>
                      <span className={`text-xs mt-2 font-medium ${eff.darkBg ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                        {eff.nameTh}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* หมวด 2: ขั้นสูง (Advanced Styles - 11 เอฟเฟกต์) */}
            <section className="bg-white dark:bg-[#201d1a] p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-[#38332e] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  ขั้นสูง
                </h2>
                <span className="text-xs text-slate-400">11 สไตล์พรีเมียม</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ADVANCED_STYLES.map((eff) => {
                  const isActive = selectedEffect === eff.id;
                  return (
                    <button
                      key={eff.id}
                      type="button"
                      onClick={() => handleSelectEffect(eff.id)}
                      className={`card-effect group flex flex-col items-center justify-center p-4 h-28 border rounded-xl transition ${
                        eff.darkBg
                          ? 'bg-slate-950 border-slate-800'
                          : eff.cardBg || 'bg-white dark:bg-[#25211e] border-slate-200 dark:border-[#38332e]'
                      } ${isActive ? 'active border-violet-500 bg-purple-50 dark:bg-[#2e233d]' : ''}`}
                    >
                      <span className={eff.textClass}>{eff.previewText}</span>
                      <span className={`text-xs mt-2 font-medium ${eff.darkBg ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                        {eff.nameTh}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* หมวด 3: รูปทรง (Shape: Straight vs Curved) */}
            <section className="bg-white dark:bg-[#201d1a] p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-[#38332e] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  รูปทรง
                </h2>
                <span className="text-xs text-slate-400">การดัดรูปทรง</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Straight Button */}
                <button
                  type="button"
                  onClick={() => setShape('straight')}
                  id="shapeStraightBtn"
                  className={`shape-btn card-effect flex flex-col items-center justify-center p-4 h-28 border rounded-xl transition ${
                    shape === 'straight'
                      ? 'active border-violet-500 bg-purple-50 dark:bg-[#2e233d]'
                      : 'bg-white dark:bg-[#25211e] border-slate-200 dark:border-[#38332e] hover:border-violet-300'
                  }`}
                >
                  <span className="text-xl font-bold text-slate-600 dark:text-slate-300">None</span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">ไม่มี</span>
                </button>

                {/* Curved Button */}
                <button
                  type="button"
                  onClick={() => setShape('curved')}
                  id="shapeCurvedBtn"
                  className={`shape-btn card-effect flex flex-col items-center justify-center p-4 h-28 border rounded-xl transition ${
                    shape === 'curved'
                      ? 'active border-violet-500 bg-purple-50 dark:bg-[#2e233d]'
                      : 'bg-white dark:bg-[#25211e] border-slate-200 dark:border-[#38332e] hover:border-violet-300'
                  }`}
                >
                  <svg className="w-20 h-10 overflow-visible" viewBox="0 0 100 45">
                    <path id="curvePathMini" d="M 10,40 Q 50,5 90,40" fill="transparent" />
                    <text className="font-bold fill-violet-600 text-sm" textAnchor="middle">
                      <textPath href="#curvePathMini" startOffset="50%">
                        ABCD
                      </textPath>
                    </text>
                  </svg>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">เส้นโค้ง</span>
                </button>
              </div>
            </section>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* RIGHT COLUMN: PREVIEW & INTERACTIVE PLAYGROUND (lg:col-span-5)  */}
          {/* --------------------------------------------------------------- */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Preview Screen Card */}
            <div className="bg-white dark:bg-[#201d1a] rounded-2xl border border-slate-200/90 dark:border-[#38332e] shadow-sm overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-[#2e2a26] flex items-center justify-between bg-slate-50/60 dark:bg-[#1a1715]/60">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">
                    กระดานพรีวิวสด
                  </span>
                </div>
                <span id="currentEffectBadge" className="text-xs px-2.5 py-1 bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 font-semibold rounded-full">
                  {activeEffectName}
                </span>
              </div>

              {/* Canvas Area with Dot Grid */}
              <div
                id="previewCanvasArea"
                className={`relative min-h-[300px] flex items-center justify-center p-8 transition-colors duration-300 overflow-hidden ${previewBg}`}
              >
                {/* Subtle Radial Dot Guide */}
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-70 dark:opacity-20" />

                {shape === 'straight' ? (
                  <div id="straightContainer" className="relative z-10 text-center select-none max-w-full overflow-hidden p-2">
                    <span
                      id="previewTextElement"
                      className="transition-all duration-150 inline-block"
                      style={liveReactStyle}
                    >
                      {textVal || 'Ag'}
                    </span>
                  </div>
                ) : (
                  <div id="curvedContainer" className="relative z-10 w-full flex items-center justify-center">
                    <svg id="curvedSvg" className="w-full max-w-[420px] h-[220px] overflow-visible" viewBox="0 0 400 200">
                      <path
                        id="previewCurvePath"
                        d={`M 40,160 Q 200,${yPoint} 360,160`}
                        fill="transparent"
                        stroke="rgba(148,163,184,0.2)"
                        strokeDasharray="4,4"
                      />
                      <text className="select-none" textAnchor="middle">
                        <textPath
                          id="curvedTextPath"
                          href="#previewCurvePath"
                          startOffset="50%"
                          style={{
                            ...liveReactStyle,
                            fill: liveReactStyle.color || hexInput
                          }}
                        >
                          {textVal || 'Ag'}
                        </textPath>
                      </text>
                    </svg>
                  </div>
                )}
              </div>

              {/* Background Color Switcher */}
              <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-[#181615] border-t border-slate-200/70 dark:border-[#2e2a26] flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">พื้นหลังพรีวิว:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewBg('bg-slate-50')}
                    className="w-5 h-5 rounded-full bg-slate-50 border border-slate-300 shadow-sm"
                    title="Slate Light"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewBg('bg-white')}
                    className="w-5 h-5 rounded-full bg-white border border-slate-300 shadow-sm"
                    title="White"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewBg('bg-slate-900')}
                    className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 shadow-sm"
                    title="Deep Charcoal"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewBg('bg-purple-900')}
                    className="w-5 h-5 rounded-full bg-purple-900 border border-purple-700 shadow-sm"
                    title="Canva Purple"
                  />
                </div>
              </div>
            </div>

            {/* Settings & Controls Panel */}
            <div className="bg-white dark:bg-[#201d1a] p-5 rounded-2xl border border-slate-200/90 dark:border-[#38332e] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                ตั้งค่าข้อความ
              </h3>

              {/* Edit text input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  พิมพ์ข้อความทดสอบ
                </label>
                <input
                  type="text"
                  id="textInput"
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  placeholder="พิมพ์ข้อความที่ต้องการ..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#181615] border border-slate-300 dark:border-[#38332e] rounded-xl text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
                />
              </div>

              {/* Font Size Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  <span>ขนาดตัวอักษร</span>
                  <span id="fontSizeDisplay">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  id="fontSizeSlider"
                  min="24"
                  max="84"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-violet-600 cursor-pointer"
                />
              </div>

              {/* Curvature Slider (Visible when curved) */}
              {shape === 'curved' && (
                <div id="curveControlGroup" className="animate-in fade-in-50 duration-150">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span>ระดับความโค้ง (Curvature)</span>
                    <span id="curveDisplay">{curvature > 100 ? 'มาก' : curvature > 50 ? 'ปานกลาง' : 'น้อย'} ({curvature})</span>
                  </div>
                  <input
                    type="range"
                    id="curveSlider"
                    min="0"
                    max="150"
                    value={curvature}
                    onChange={(e) => setCurvature(parseInt(e.target.value, 10))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Color Controls: Spectrum Card (100% ตามข้อกำหนด) */}
              <div className="pt-2 border-t border-slate-100 dark:border-[#2e2a26]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <i className="fa-solid fa-palette text-violet-600" />
                    <span>ปรับสีเอฟเฟกต์</span>
                  </span>
                  <button
                    type="button"
                    id="resetThemeColorBtn"
                    onClick={handleResetThemeColor}
                    className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 font-semibold hover:underline flex items-center gap-1 transition"
                  >
                    <i className="fa-solid fa-rotate-left text-[10px]" />
                    <span>รีเซ็ตสีตามธีม</span>
                  </button>
                </div>

                {/* Canva Luxury Spectrum Color Laboratory */}
                <div className="mt-3">
                  <CanvaColorPicker
                    activeColor={currentComputedHex}
                    onColorChange={(newColor) => {
                      if (newColor) {
                        setHexInput(newColor);
                        const hsv = hexToHsv(newColor);
                        setHue(hsv.h);
                        setSat(hsv.s);
                        setVal(hsv.v);
                      }
                    }}
                    activeTargetLabel={activeTargetLabel}
                    lang={lang}
                  />
                </div>
              </div>

              {/* Live CSS Output Box */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  <span>โค้ด CSS ของเอฟเฟกต์นี้</span>
                </div>
                <pre
                  id="cssOutputBox"
                  className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono overflow-x-auto max-h-32 leading-relaxed selection:bg-emerald-800 selection:text-white no-scrollbar"
                >
{`.${selectedEffect} {
${generatedCss.split('\n').map((l) => '  ' + l).join('\n')}
}`}
                </pre>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Notification Toast */}
      {copiedToast && (
        <div
          id="toast"
          className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-150 z-[100000]"
        >
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span id="toastMessage">{copiedToast}</span>
        </div>
      )}
    </div>,
    document.body
  );
}
