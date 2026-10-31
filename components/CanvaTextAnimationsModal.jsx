'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { adjustHex } from '../lib/utils';
import { useVocab } from '../context/VocabContext';
import CanvaColorPicker from './CanvaColorPicker';

// Animation Data & CSS specifications
const ANIM_DATA = {
  'anim-none': {
    name: 'ไม่มี',
    category: 'recommended',
    css: `/* ไม่มีแอนิเมชัน */\n.text-element {\n  display: inline-block;\n}`
  },
  'anim-typewriter': {
    name: 'เครื่องพิมพ์ดีด',
    category: 'recommended',
    css: `@keyframes typewriter {\n  0% { width: 0; border-right: 3px solid currentColor; }\n  80% { width: 100%; border-right: 3px solid currentColor; }\n  90%, 100% { width: 100%; border-right: 3px solid transparent; }\n}\n.canva-typewriter {\n  display: inline-block;\n  overflow: hidden;\n  white-space: nowrap;\n  animation: typewriter 2.2s steps(20, end) infinite;\n}`
  },
  'anim-ascend': {
    name: 'สไลด์ขึ้นมาจากฐาน',
    category: 'recommended',
    css: `@keyframes ascend {\n  0% { opacity: 0; transform: translateY(60px) scale(0.9); }\n  40% { opacity: 1; transform: translateY(-6px) scale(1.02); }\n  60%, 100% { opacity: 1; transform: translateY(0) scale(1); }\n}\n.canva-ascend {\n  display: inline-block;\n  animation: ascend 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;\n}`
  },
  'anim-shift': {
    name: 'ชิฟต์',
    category: 'recommended',
    css: `@keyframes shift {\n  0% { opacity: 0; transform: translateX(-35px) skewX(-15deg); }\n  40% { opacity: 1; transform: translateX(4px) skewX(4deg); }\n  60%, 100% { opacity: 1; transform: translateX(0) skewX(0); }\n}\n.canva-shift {\n  display: inline-block;\n  animation: shift 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;\n}`
  },
  'anim-merge': {
    name: 'รวม',
    category: 'recommended',
    css: `@keyframes merge {\n  0% { letter-spacing: 28px; opacity: 0; filter: blur(6px); }\n  50% { letter-spacing: 2px; opacity: 1; filter: blur(0); }\n  75%, 100% { letter-spacing: normal; opacity: 1; filter: blur(0); }\n}\n.canva-merge {\n  display: inline-block;\n  animation: merge 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;\n}`
  },
  'anim-block': {
    name: 'บล็อก',
    category: 'recommended',
    css: `@keyframes blockReveal {\n  0% { clip-path: inset(0 100% 0 0); transform: translateX(-10px); }\n  45%, 85% { clip-path: inset(0 0 0 0); transform: translateX(0); }\n  100% { clip-path: inset(0 0 0 100%); transform: translateX(10px); }\n}\n.canva-block {\n  display: inline-block;\n  animation: blockReveal 2.2s cubic-bezier(0.77, 0, 0.175, 1) infinite;\n}`
  },
  'anim-burst': {
    name: 'เบิร์สต์',
    category: 'recommended',
    css: `@keyframes burst {\n  0% { transform: scale(0.2); opacity: 0; filter: brightness(2); }\n  45% { transform: scale(1.18); opacity: 1; filter: brightness(1.2); }\n  65%, 100% { transform: scale(1); opacity: 1; filter: brightness(1); }\n}\n.canva-burst {\n  display: inline-block;\n  animation: burst 1.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;\n}`
  },
  'anim-bounce-in': {
    name: 'เด้งเข้ามา',
    category: 'recommended',
    css: `@keyframes bounceIn {\n  0% { opacity: 0; transform: translateY(-70px) scaleY(1.3); }\n  45% { opacity: 1; transform: translateY(0) scaleY(0.75) scaleX(1.2); }\n  60% { transform: translateY(-16px) scaleY(1.08); }\n  75% { transform: translateY(0) scaleY(0.95); }\n  90%, 100% { transform: translateY(0) scale(1); opacity: 1; }\n}\n.canva-bounce-in {\n  display: inline-block;\n  animation: bounceIn 2s cubic-bezier(0.28, 0.84, 0.42, 1) infinite;\n}`
  },
  'anim-roll': {
    name: 'ม้วน',
    category: 'recommended',
    css: `@keyframes roll {\n  0% { transform: rotate(-180deg) scale(0.3); opacity: 0; }\n  50% { transform: rotate(10deg) scale(1.05); opacity: 1; }\n  70%, 100% { transform: rotate(0deg) scale(1); opacity: 1; }\n}\n.canva-roll {\n  display: inline-block;\n  animation: roll 1.9s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;\n}`
  },
  'anim-skate': {
    name: 'สเก็ต',
    category: 'recommended',
    css: `@keyframes skate {\n  0% { transform: translateX(-80px) rotate(-8deg); opacity: 0; }\n  40% { transform: translateX(8px) rotate(2deg); opacity: 1; }\n  60%, 100% { transform: translateX(0) rotate(0); opacity: 1; }\n}\n.canva-skate {\n  display: inline-block;\n  animation: skate 1.8s cubic-bezier(0.25, 1, 0.5, 1) infinite;\n}`
  },
  'anim-spread': {
    name: 'กระจาย',
    category: 'recommended',
    css: `@keyframes spread {\n  0% { letter-spacing: -8px; opacity: 0; filter: blur(4px); }\n  45% { letter-spacing: 12px; opacity: 1; filter: blur(0); }\n  70%, 100% { letter-spacing: 4px; opacity: 1; filter: blur(0); }\n}\n.canva-spread {\n  display: inline-block;\n  animation: spread 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;\n}`
  },
  'anim-reveal': {
    name: 'เผยให้เห็น',
    category: 'recommended',
    css: `@keyframes reveal {\n  0% { clip-path: inset(0 0 100% 0); transform: translateY(20px); opacity: 0; }\n  50%, 100% { clip-path: inset(0 0 0 0); transform: translateY(0); opacity: 1; }\n}\n.canva-reveal {\n  display: inline-block;\n  animation: reveal 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;\n}`
  },
  // General Entrance Animations
  'anim-rise': {
    name: 'ลอยขึ้น',
    category: 'general',
    css: `@keyframes rise {\n  0% { transform: translateY(45px); opacity: 0; }\n  50%, 100% { transform: translateY(0); opacity: 1; }\n}\n.canva-rise {\n  display: inline-block;\n  animation: rise 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;\n}`
  },
  'anim-pan': {
    name: 'แพน',
    category: 'general',
    css: `@keyframes pan {\n  0% { transform: translateX(-60px); opacity: 0; }\n  50%, 100% { transform: translateX(0); opacity: 1; }\n}\n.canva-pan {\n  display: inline-block;\n  animation: pan 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;\n}`
  },
  'anim-fade': {
    name: 'จาง',
    category: 'general',
    css: `@keyframes fade {\n  0% { opacity: 0; }\n  50%, 100% { opacity: 1; }\n}\n.canva-fade {\n  display: inline-block;\n  animation: fade 1.8s ease-in-out infinite;\n}`
  },
  'anim-pop': {
    name: 'ป๊อป',
    category: 'general',
    css: `@keyframes pop {\n  0% { transform: scale(0.4); opacity: 0; }\n  55% { transform: scale(1.15); opacity: 1; }\n  70%, 100% { transform: scale(1); opacity: 1; }\n}\n.canva-pop {\n  display: inline-block;\n  animation: pop 1.7s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;\n}`
  },
  'anim-wipe': {
    name: 'ป้าย',
    category: 'general',
    css: `@keyframes wipe {\n  0% { clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%); }\n  50%, 85% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }\n  100% { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); }\n}\n.canva-wipe {\n  display: inline-block;\n  animation: wipe 2.2s cubic-bezier(0.65, 0, 0.35, 1) infinite;\n}`
  },
  'anim-blur': {
    name: 'เบลอ',
    category: 'general',
    css: `@keyframes blurIn {\n  0% { filter: blur(20px); opacity: 0; transform: scale(1.15); }\n  50%, 100% { filter: blur(0px); opacity: 1; transform: scale(1); }\n}\n.canva-blur {\n  display: inline-block;\n  animation: blurIn 1.8s ease-out infinite;\n}`
  },
  'anim-seep': {
    name: 'ซึมขึ้นมา',
    category: 'general',
    css: `@keyframes seep {\n  0% { opacity: 0; filter: blur(14px) contrast(180%); transform: scale(0.85); }\n  55% { opacity: 0.9; filter: blur(3px) contrast(120%); transform: scale(1.03); }\n  75%, 100% { opacity: 1; filter: blur(0) contrast(100%); transform: scale(1); }\n}\n.canva-seep {\n  display: inline-block;\n  animation: seep 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;\n}`
  },
  'anim-unfold': {
    name: 'เผยออกมา',
    category: 'general',
    css: `@keyframes unfold {\n  0% { transform: scaleY(0) scaleX(0.2); opacity: 0; filter: brightness(1.5); }\n  45% { transform: scaleY(1.15) scaleX(0.9); opacity: 1; }\n  65%, 100% { transform: scale(1); opacity: 1; filter: brightness(1); }\n}\n.canva-unfold {\n  display: inline-block;\n  animation: unfold 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;\n}`
  },
  'anim-drift': {
    name: 'ดริฟต์',
    category: 'general',
    css: `@keyframes drift {\n  0% { transform: translate(-30px, 15px) rotate(-4deg); opacity: 0; }\n  50%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; }\n}\n.canva-drift {\n  display: inline-block;\n  animation: drift 1.9s cubic-bezier(0.25, 1, 0.5, 1) infinite;\n}`
  },
  'anim-converge': {
    name: 'ลอยเข้าหากัน',
    category: 'general',
    css: `@keyframes converge {\n  0% { transform: scale(1.4) translateY(-20px); opacity: 0; letter-spacing: 12px; }\n  50%, 100% { transform: scale(1) translateY(0); opacity: 1; letter-spacing: normal; }\n}\n.canva-converge {\n  display: inline-block;\n  animation: converge 1.9s cubic-bezier(0.16, 1, 0.3, 1) infinite;\n}`
  },
  'anim-neon': {
    name: 'นีออน',
    category: 'general',
    css: `@keyframes neonFlicker {\n  0%, 100% { opacity: 1; filter: drop-shadow(0 0 12px currentColor); }\n  15% { opacity: 0.2; filter: none; }\n  20% { opacity: 0.9; filter: drop-shadow(0 0 8px currentColor); }\n  35% { opacity: 0.4; filter: none; }\n  40% { opacity: 1; filter: drop-shadow(0 0 16px currentColor); }\n  70% { opacity: 0.85; filter: drop-shadow(0 0 10px currentColor); }\n}\n.canva-neon {\n  display: inline-block;\n  animation: neonFlicker 1.8s infinite;\n}`
  },
  'anim-drop': {
    name: 'ตกลงมา',
    category: 'general',
    css: `@keyframes dropBounce {\n  0% { transform: translateY(-100px); opacity: 0; }\n  50% { transform: translateY(0); opacity: 1; }\n  65% { transform: translateY(-12px); }\n  80%, 100% { transform: translateY(0); opacity: 1; }\n}\n.canva-drop {\n  display: inline-block;\n  animation: dropBounce 1.8s cubic-bezier(0.25, 1, 0.5, 1) infinite;\n}`
  },
  // Continuous Motion Loops
  'anim-spin': {
    name: 'หมุน',
    category: 'loops',
    css: `@keyframes spinLoop {\n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}\n.canva-spin {\n  display: inline-block;\n  animation: spinLoop 3s linear infinite;\n}`
  },
  'anim-blink': {
    name: 'กะพริบ',
    category: 'loops',
    css: `@keyframes blinkLoop {\n  0%, 48%, 100% { opacity: 1; }\n  50%, 96% { opacity: 0.15; }\n}\n.canva-blink {\n  display: inline-block;\n  animation: blinkLoop 1.4s ease-in-out infinite;\n}`
  },
  'anim-pulse': {
    name: 'เด้ง',
    category: 'loops',
    css: `@keyframes pulseLoop {\n  0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.18); filter: drop-shadow(0 0 14px currentColor); }\n}\n.canva-pulse {\n  display: inline-block;\n  animation: pulseLoop 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;\n}`
  },
  'anim-swing': {
    name: 'แกว่ง',
    category: 'loops',
    css: `@keyframes swingLoop {\n  0%, 100% { transform: rotate(0deg); }\n  25% { transform: rotate(14deg); }\n  75% { transform: rotate(-14deg); }\n}\n.canva-swing {\n  display: inline-block;\n  transform-origin: top center;\n  animation: swingLoop 2s ease-in-out infinite;\n}`
  }
};

// HSV to Hex helper
function hsvToHex(h, s, v) {
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

// Hex to HSV helper
function hexToHsv(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  if (isNaN(r) || isNaN(g) || isNaN(b)) return { h: 265, s: 0.68, v: 1.0 };

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
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

export default function CanvaTextAnimationsModal({ isOpen, onClose }) {
  const { currentWord, textFormat, updateTextFormat, activeFormatTarget } = useVocab();

  // Active target text
  const initialText = useMemo(() => {
    if (!currentWord) return 'Canva';
    if (activeFormatTarget === 'word') return currentWord.word || 'Canva';
    if (activeFormatTarget === 'phonetic') return currentWord.phonetic || '/kæn.və/';
    if (activeFormatTarget === 'meaning') return currentWord.meaning || 'แคนวา';
    return currentWord.word || 'Canva';
  }, [currentWord, activeFormatTarget]);

  // Read current animation from textFormat
  const targetAnim = useMemo(() => {
    if (!textFormat) return 'anim-typewriter';
    const specific = (activeFormatTarget && textFormat[activeFormatTarget]) || {};
    const current = specific.animation || textFormat.animation || 'typewriter';
    if (current === 'none') return 'anim-none';
    return current.startsWith('anim-') ? current : `anim-${current}`;
  }, [textFormat, activeFormatTarget]);

  // Component States
  const [selectedAnim, setSelectedAnim] = useState('anim-typewriter');
  const [testText, setTestText] = useState(initialText);
  const [fontSize, setFontSize] = useState(48);
  const [speed, setSpeed] = useState(1.0);
  const [previewBg, setPreviewBg] = useState('bg-slate-50');
  const [colorMode, setColorMode] = useState('solid'); // 'solid' | 'gradient'
  const [currentHex, setCurrentHex] = useState('#8C52FF');

  // HSV states for Spectrum Card
  const [currentHue, setCurrentHue] = useState(265);
  const [currentSat, setCurrentSat] = useState(0.68);
  const [currentVal, setCurrentVal] = useState(1.0);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Refs for Dragging
  const spectrumBoxRef = useRef(null);
  const hueBarRef = useRef(null);
  const previewTextRef = useRef(null);
  const isDraggingSpectrum = useRef(false);
  const isDraggingHue = useRef(false);

  // Synchronize initial text and anim when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedAnim(targetAnim || 'anim-typewriter');
      setTestText(initialText);
    }
  }, [isOpen, targetAnim, initialText]);

  // Update HSV when currentHex changes
  const applyHexColor = useCallback((hex, updateHsv = true) => {
    const validHex = hex.startsWith('#') ? hex : `#${hex}`;
    setCurrentHex(validHex.toUpperCase());

    if (updateHsv) {
      const hsv = hexToHsv(validHex);
      setCurrentHue(hsv.h);
      setCurrentSat(hsv.s);
      setCurrentVal(hsv.v);
    }
  }, []);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  }, []);

  // Replay animation by re-triggering DOM reflow
  const replayAnimation = useCallback(() => {
    if (previewTextRef.current) {
      previewTextRef.current.style.animation = 'none';
      void previewTextRef.current.offsetWidth; // trigger reflow
      previewTextRef.current.style.animation = '';
      applySpeed();
    }
    toast('เล่นแอนิเมชันใหม่แล้ว');
  }, [toast, speed, selectedAnim, testText]);

  // Calculate speed / duration
  const applySpeed = useCallback(() => {
    if (!previewTextRef.current || selectedAnim === 'anim-none') return;
    const duration = (1.8 / speed).toFixed(2);
    if (selectedAnim === 'anim-typewriter') {
      const len = Math.max(1, (testText || 'Canva').length);
      previewTextRef.current.style.animation = `anim-typewriter ${duration}s steps(${len}, end) infinite`;
    } else {
      previewTextRef.current.style.animationDuration = `${duration}s`;
    }
  }, [speed, selectedAnim, testText]);

  useEffect(() => {
    applySpeed();
  }, [speed, selectedAnim, testText, applySpeed]);

  // Handle Spectrum Move (Saturation & Value)
  const handleSpectrumMove = useCallback((e) => {
    if (!spectrumBoxRef.current) return;
    if (e.cancelable && e.type !== 'mousemove') e.preventDefault();
    const rect = spectrumBoxRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const s = x / rect.width;
    const v = 1 - (y / rect.height);
    setCurrentSat(s);
    setCurrentVal(v);

    const hex = hsvToHex(currentHue, s, v);
    applyHexColor(hex, false);
  }, [currentHue, applyHexColor]);

  // Handle Hue Bar Move
  const handleHueMove = useCallback((e) => {
    if (!hueBarRef.current) return;
    if (e.cancelable && e.type !== 'mousemove') e.preventDefault();
    const rect = hueBarRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = x / rect.width;
    const h = Math.round(percent * 360);
    setCurrentHue(h);

    const hex = hsvToHex(h, currentSat, currentVal);
    applyHexColor(hex, false);
  }, [currentSat, currentVal, applyHexColor]);

  // Global mouse/touch events for color picker
  useEffect(() => {
    const handleMove = (e) => {
      if (isDraggingSpectrum.current) handleSpectrumMove(e);
      if (isDraggingHue.current) handleHueMove(e);
    };
    const handleUp = () => {
      isDraggingSpectrum.current = false;
      isDraggingHue.current = false;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [handleSpectrumMove, handleHueMove]);

  // Eyedropper API
  const handleEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          applyHexColor(result.sRGBHex, true);
          toast(`ดูดสีสำเร็จ: ${result.sRGBHex}`);
        }
      } catch (err) {
        // user cancelled or error
      }
    } else {
      const picker = document.getElementById('nativeAnimColorPicker');
      if (picker) picker.click();
    }
  };

  // Reset to theme color
  const handleResetThemeColor = () => {
    applyHexColor('#8C52FF', true);
    toast('รีเซ็ตเป็นสีม่วงเอกลักษณ์ Canva แล้ว');
  };

  // Select Animation
  const handleSelectAnimation = (animClass, animName) => {
    setSelectedAnim(animClass);
    if (animClass === 'anim-neon') {
      setPreviewBg('bg-slate-900');
    }
  };

  // Generate CSS Output Code
  const generatedCss = useMemo(() => {
    const baseInfo = ANIM_DATA[selectedAnim] || ANIM_DATA['anim-typewriter'];
    const colorCss = colorMode === 'gradient'
      ? `  background: linear-gradient(135deg, ${currentHex}, ${adjustHex(currentHex, 35)});\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;`
      : `  color: ${currentHex};`;

    return `/* ${baseInfo.name} (${speed.toFixed(1)}x Speed) */\n${baseInfo.css}\n\n.my-animated-text {\n${colorCss}\n  font-size: ${fontSize}px;\n  animation-duration: calc(${1 / speed} * 1.8s);\n}`;
  }, [selectedAnim, colorMode, currentHex, fontSize, speed]);

  // Copy CSS to Clipboard
  const handleCopyCss = async () => {
    try {
      await navigator.clipboard.writeText(generatedCss);
      const name = ANIM_DATA[selectedAnim]?.name || 'แอนิเมชัน';
      toast(`คัดลอก CSS แอนิเมชัน ${name} สำเร็จ!`);
    } catch {
      toast('ไม่สามารถคัดลอกได้');
    }
  };

  // Apply Animation to Context & Phone Canvas
  const handleApplyToCanvas = () => {
    const animClean = selectedAnim === 'anim-none' ? 'none' : selectedAnim;
    updateTextFormat('animation', animClean);
    if (currentHex) {
      updateTextFormat('textColor', currentHex);
    }
    toast(`นำแอนิเมชัน "${ANIM_DATA[selectedAnim]?.name}" ไปใช้แล้ว!`);
    onClose();
  };

  if (!isOpen) return null;

  // Pure Hue for Hue handle & Spectrum background
  const pureHueHex = hsvToHex(currentHue, 1, 1);
  const huePercent = (currentHue / 360) * 100;
  const satPercent = currentSat * 100;
  const valPercent = (1 - currentVal) * 100;

  // Inline style for animated text preview
  const textPreviewStyle = {
    fontSize: `${fontSize}px`,
    ...(colorMode === 'gradient'
      ? {
          backgroundImage: `linear-gradient(135deg, ${currentHex}, ${adjustHex(currentHex, 35)})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent'
        }
      : {
          backgroundImage: 'none',
          WebkitBackgroundClip: 'initial',
          WebkitTextFillColor: 'initial',
          color: currentHex
        })
  };

  return createPortal(
    <div
      id="canva-animations-studio-backdrop"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="canva-animations-studio-container"
        className="w-full max-w-6xl max-h-[92vh] bg-white dark:bg-[#181615] border border-slate-200 dark:border-[#38332e] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Top Studio Header */}
        <header className="px-5 py-3.5 border-b border-slate-200 dark:border-[#2e2a26] flex items-center justify-between flex-shrink-0 bg-white dark:bg-[#1a1715]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8c52ff] to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-purple-200 dark:shadow-none text-lg flex-shrink-0">
              <i className="fa-solid fa-wand-magic-sparkles text-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Canva Text Animations Studio
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-[#8c52ff] dark:bg-purple-950/80 dark:text-purple-300">
                  ปรับสำหรับ: {activeFormatTarget === 'word' ? 'คำศัพท์' : activeFormatTarget === 'phonetic' ? 'สัทอักษร' : activeFormatTarget === 'meaning' ? 'คำแปล' : 'ทั้งหมด'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                สตูดิโอจำลองภาพเคลื่อนไหวตัวอักษรและแอนิเมชันทุกรูปแบบ (28 แอนิเมชัน)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="replayBtn"
              type="button"
              onClick={replayAnimation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#2a2622] dark:hover:bg-[#34302b] text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition active:scale-95"
              title="เล่นซ้ำทันที"
            >
              <i className="fa-solid fa-rotate-right text-[11px]" />
              <span className="hidden sm:inline">เล่นซ้ำทันที</span>
            </button>

            <button
              id="copyCssBtn"
              type="button"
              onClick={handleCopyCss}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 text-[#8c52ff] hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-semibold transition active:scale-95"
              title="คัดลอก CSS"
            >
              <i className="fa-regular fa-copy text-xs" />
              <span className="hidden sm:inline">คัดลอก CSS แอนิเมชัน</span>
            </button>

            {/* Apply Button */}
            <button
              id="btn-apply-animation"
              type="button"
              onClick={handleApplyToCanvas}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#8c52ff] hover:bg-[#7a3eff] text-white rounded-lg text-xs font-bold shadow-md shadow-purple-300/40 dark:shadow-none transition active:scale-95"
              title="นำไปใช้กับหน้าออกแบบ"
            >
              <i className="fa-solid fa-check text-xs" />
              <span>นำไปใช้</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2a2622] transition ml-1"
              title="ปิด"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </header>

        {/* Studio Body: Two Columns */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden flex-1">
          
          {/* LEFT COLUMN: Animation Selector Panel (Scrollable, Hidden Scrollbar) */}
          <div className="lg:col-span-7 space-y-5 overflow-y-auto max-h-[calc(92vh-90px)] pr-1 no-scrollbar">

            {/* 1. หมวดแนะนำ (Text-Specific Animations - 12 รูปแบบ) */}
            <section className="bg-white dark:bg-[#1e1b18] p-5 rounded-2xl border border-slate-200/90 dark:border-[#38332e] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8c52ff]" />
                  แนะนำ
                </h2>
                <span className="text-xs text-slate-400 font-medium">12 แอนิเมชันข้อความ</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* None */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-none', 'ไม่มี')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-none'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <span className="text-base font-bold text-slate-400 group-hover:text-slate-600 transition">None</span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">ไม่มี</span>
                </button>

                {/* เครื่องพิมพ์ดีด */}
                <button
                  type="button"
                  id="defaultSelectedAnim"
                  onClick={() => handleSelectAnimation('anim-typewriter', 'เครื่องพิมพ์ดีด')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-typewriter'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center text-sm font-bold text-[#8c52ff] tracking-widest overflow-hidden">
                    <span className="anim-typewriter border-r border-[#8c52ff] pr-0.5">AB|C</span>
                  </div>
                  <span className="text-xs text-slate-700 dark:text-slate-200 mt-2 font-medium">เครื่องพิมพ์ดีด</span>
                </button>

                {/* สไลด์ขึ้นมาจากฐาน */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-ascend', 'สไลด์ขึ้นมาจากฐาน')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-ascend'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center text-sm font-bold text-[#8c52ff]">
                    <span className="anim-ascend">ABC</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">สไลด์ขึ้นมาจากฐาน</span>
                </button>

                {/* ชิฟต์ */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-shift', 'ชิฟต์')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-shift'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center text-sm font-bold text-[#8c52ff]">
                    <span className="anim-shift">A<sup>B</sup>C</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">ชิฟต์</span>
                </button>

                {/* รวม */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-merge', 'รวม')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-merge'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center text-xs font-bold text-[#8c52ff] leading-none text-center">
                    <div>ABC &rarr;</div>
                    <div className="text-[10px] opacity-75">&larr; ABC</div>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">รวม</span>
                </button>

                {/* บล็อก */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-block', 'บล็อก')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-block'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="px-1.5 py-0.5 bg-purple-100 text-[#8c52ff] font-bold text-xs rounded anim-block">ABC</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">บล็อก</span>
                </button>

                {/* เบิร์สต์ */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-burst', 'เบิร์สต์')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-burst'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center relative">
                    <span className="text-sm font-bold text-[#8c52ff] anim-burst">A<span className="text-[10px]">B</span>C</span>
                    <span className="absolute -top-1 right-3 text-[10px] text-purple-400">&bull;</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">เบิร์สต์</span>
                </button>

                {/* เด้งเข้ามา */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-bounce-in', 'เด้งเข้ามา')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-bounce-in'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center text-sm font-bold text-[#8c52ff]">
                    <span className="anim-bounce-in">A<sup className="text-purple-400">^</sup>B<sub>v</sub>C</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">เด้งเข้ามา</span>
                </button>

                {/* ม้วน */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-roll', 'ม้วน')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-roll'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center text-sm font-bold text-[#8c52ff]">
                    <span className="anim-roll">A<span className="inline-block transform rotate-45 text-purple-400">B</span>C</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">ม้วน</span>
                </button>

                {/* สเก็ต */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-skate', 'สเก็ต')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-skate'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center text-sm font-bold text-[#8c52ff]">
                    <span className="anim-skate italic">ABC</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">สเก็ต</span>
                </button>

                {/* กระจาย */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-spread', 'กระจาย')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-spread'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center text-xs font-bold text-[#8c52ff]">
                    <span className="anim-spread">A B C</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">กระจาย</span>
                </button>

                {/* เผยให้เห็น */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-reveal', 'เผยให้เห็น')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-reveal'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center text-sm font-bold text-[#8c52ff]">
                    <span className="anim-reveal">A<span className="opacity-60">B</span>C</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">เผยให้เห็น</span>
                </button>
              </div>
            </section>

            {/* 2. หมวดทั่วไป (General Entrance Animations - 12 รูปแบบ) */}
            <section className="bg-white dark:bg-[#1e1b18] p-5 rounded-2xl border border-slate-200/90 dark:border-[#38332e] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  ทั่วไป
                </h2>
                <span className="text-xs text-slate-400 font-medium">12 แอนิเมชันเปิดตัว</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* ลอยขึ้น */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-rise', 'ลอยขึ้น')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-rise'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center gap-1">
                    <span className="w-4 h-5 rounded bg-purple-400/30 anim-rise border border-purple-500" />
                    <i className="fa-solid fa-arrow-up text-[10px] text-purple-600" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">ลอยขึ้น</span>
                </button>

                {/* แพน */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-pan', 'แพน')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-pan'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center gap-1">
                    <span className="w-6 h-4 rounded bg-purple-400/30 anim-pan border border-purple-500" />
                    <i className="fa-solid fa-arrow-right text-[10px] text-purple-600" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">แพน</span>
                </button>

                {/* จาง */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-fade', 'จาง')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-fade'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="w-5 h-5 rounded bg-purple-500 anim-fade" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">จาง</span>
                </button>

                {/* ป๊อป */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-pop', 'ป๊อป')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-pop'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="w-5 h-5 rounded-md border-2 border-purple-500 bg-purple-200/50 anim-pop" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">ป๊อป</span>
                </button>

                {/* ป้าย */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-wipe', 'ป้าย')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-wipe'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="w-6 h-5 rounded bg-purple-500 anim-wipe" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">ป้าย</span>
                </button>

                {/* เบลอ */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-blur', 'เบลอ')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-blur'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full bg-purple-500 anim-blur" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">เบลอ</span>
                </button>

                {/* ซึมขึ้นมา */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-seep', 'ซึมขึ้นมา')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-seep'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center relative">
                    <span className="w-5 h-5 rounded-lg bg-purple-600 anim-seep" />
                    <i className="fa-solid fa-expand text-[9px] text-purple-400 absolute" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">ซึมขึ้นมา</span>
                </button>

                {/* เผยออกมา */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-unfold', 'เผยออกมา')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-unfold'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="w-5 h-5 rounded-md bg-purple-500 shadow-md anim-unfold" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">เผยออกมา</span>
                </button>

                {/* ดริฟต์ */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-drift', 'ดริฟต์')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-drift'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center gap-1">
                    <span className="w-5 h-5 rounded bg-purple-500 shadow-xs anim-drift" />
                    <i className="fa-solid fa-arrow-right text-[10px] text-purple-500" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">ดริฟต์</span>
                </button>

                {/* ลอยเข้าหากัน */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-converge', 'ลอยเข้าหากัน')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-converge'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="w-7 h-4 rounded bg-purple-500 anim-converge" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">ลอยเข้าหากัน</span>
                </button>

                {/* นีออน */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-neon', 'นีออน')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-slate-900 transition ${
                    selectedAnim === 'anim-neon'
                      ? 'active border-[#8c52ff] bg-purple-950/70'
                      : 'border-slate-700 hover:border-purple-400'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="w-5 h-5 rounded border border-purple-300 bg-purple-500 shadow-[0_0_10px_#a855f7] anim-neon" />
                  </div>
                  <span className="text-xs text-slate-200 mt-2 font-medium">นีออน</span>
                </button>

                {/* ตกลงมา */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-drop', 'ตกลงมา')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-drop'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="w-5 h-5 rounded bg-purple-500 anim-drop" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">ตกลงมา</span>
                </button>
              </div>
            </section>

            {/* 3. หมวดเอฟเฟกต์เสริม (Continuous Motion Loops - 4 รูปแบบ) */}
            <section className="bg-white dark:bg-[#1e1b18] p-5 rounded-2xl border border-slate-200/90 dark:border-[#38332e] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  เอฟเฟกต์เสริม
                </h2>
                <span className="text-xs text-slate-400 font-medium">4 รูปแบบการเคลื่อนไหววนซ้ำ</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* หมุน */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-spin', 'หมุน')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-spin'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full border-2 border-dashed border-[#8c52ff] anim-spin flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-[#8c52ff]" />
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">หมุน</span>
                </button>

                {/* กะพริบ */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-blink', 'กะพริบ')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-blink'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full bg-[#8c52ff] anim-blink" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">กะพริบ</span>
                </button>

                {/* เด้ง */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-pulse', 'เด้ง')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-pulse'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full bg-[#8c52ff] anim-pulse" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">เด้ง</span>
                </button>

                {/* แกว่ง */}
                <button
                  type="button"
                  onClick={() => handleSelectAnimation('anim-swing', 'แกว่ง')}
                  className={`anim-card group flex flex-col items-center justify-center p-3.5 h-28 border rounded-xl bg-white dark:bg-[#23201d] transition ${
                    selectedAnim === 'anim-swing'
                      ? 'active border-[#8c52ff] bg-purple-50/60 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-[#332f2a] hover:border-purple-300'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full bg-[#8c52ff] anim-swing" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">แกว่ง</span>
                </button>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Live Canvas Playground & Controls */}
          <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(92vh-90px)] pr-1 no-scrollbar">
            
            {/* Preview Screen Card */}
            <div className="bg-white dark:bg-[#1e1b18] rounded-2xl border border-slate-200/90 dark:border-[#38332e] shadow-xs overflow-hidden flex flex-col flex-shrink-0">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-[#2e2a26] flex items-center justify-between bg-slate-50/60 dark:bg-[#25221e]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1.5">
                    จอแสดงภาพเคลื่อนไหวสด
                  </span>
                </div>
                <span id="currentAnimBadge" className="text-xs px-2.5 py-0.5 bg-purple-100 text-[#8c52ff] dark:bg-purple-950 dark:text-purple-300 font-semibold rounded-full">
                  {ANIM_DATA[selectedAnim]?.name || 'เครื่องพิมพ์ดีด'}
                </span>
              </div>

              {/* Live Canvas Area */}
              <div
                id="previewCanvasArea"
                className={`relative min-h-[220px] sm:min-h-[250px] flex items-center justify-center p-6 transition-colors duration-300 overflow-hidden ${previewBg}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#332f2a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-70" />
                
                <div className="relative z-10 text-center select-none w-full flex items-center justify-center">
                  <span
                    id="previewTextElement"
                    ref={previewTextRef}
                    className={`${selectedAnim !== 'anim-none' ? selectedAnim : ''} font-extrabold tracking-tight transition-all duration-150 inline-block`}
                    style={textPreviewStyle}
                  >
                    {testText || 'Canva'}
                  </span>
                </div>
              </div>

              {/* Background Color Switchers */}
              <div className="px-4 py-2 bg-slate-100/70 dark:bg-[#25221e] border-t border-slate-200/70 dark:border-[#2e2a26] flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">พื้นหลังฉาก:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewBg('bg-slate-50')}
                    className={`w-5 h-5 rounded-full bg-slate-50 border shadow-xs transition ${
                      previewBg === 'bg-slate-50' ? 'border-[#8c52ff] ring-2 ring-purple-300' : 'border-slate-300'
                    }`}
                    title="Light Gray"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewBg('bg-white')}
                    className={`w-5 h-5 rounded-full bg-white border shadow-xs transition ${
                      previewBg === 'bg-white' ? 'border-[#8c52ff] ring-2 ring-purple-300' : 'border-slate-300'
                    }`}
                    title="Pure White"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewBg('bg-slate-900')}
                    className={`w-5 h-5 rounded-full bg-slate-900 border shadow-xs transition ${
                      previewBg === 'bg-slate-900' ? 'border-[#8c52ff] ring-2 ring-purple-300' : 'border-slate-700'
                    }`}
                    title="Dark Slate"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewBg('bg-purple-950')}
                    className={`w-5 h-5 rounded-full bg-purple-950 border shadow-xs transition ${
                      previewBg === 'bg-purple-950' ? 'border-[#8c52ff] ring-2 ring-purple-300' : 'border-purple-800'
                    }`}
                    title="Deep Purple"
                  />
                </div>
              </div>
            </div>

            {/* Settings & Controls Panel */}
            <div className="bg-white dark:bg-[#1e1b18] p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-[#38332e] shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                ตั้งค่าข้อความและจังหวะ
              </h3>
              
              {/* Text Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  พิมพ์ข้อความทดสอบ
                </label>
                <input
                  type="text"
                  id="textInput"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="พิมพ์ข้อความที่ต้องการทดสอบ..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151312] border border-slate-300 dark:border-[#38332e] rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#8c52ff] focus:outline-none transition"
                />
              </div>

              {/* Font Size & Speed Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    <span>ขนาดฟอนต์</span>
                    <span id="fontSizeDisplay" className="font-mono">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    id="fontSizeSlider"
                    min="24"
                    max="76"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    className="w-full accent-[#8c52ff] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    <span>ความเร็ว (Speed)</span>
                    <span id="speedDisplay" className="font-mono">{speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    id="speedSlider"
                    min="0.4"
                    max="2.5"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-[#8c52ff] cursor-pointer"
                  />
                </div>
              </div>

              {/* Canva Spectrum Card Color Controls */}
              <div className="pt-2 border-t border-slate-100 dark:border-[#2e2a26]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <i className="fa-solid fa-palette text-[#8c52ff]" /> ปรับสีตัวอักษร
                  </span>
                  <button
                    type="button"
                    id="resetThemeColorBtn"
                    onClick={handleResetThemeColor}
                    className="text-xs text-[#8c52ff] hover:text-purple-700 font-semibold hover:underline flex items-center gap-1 transition"
                  >
                    <i className="fa-solid fa-rotate-left text-[10px]" /> รีเซ็ตสีตามธีม
                  </button>
                </div>

                {/* Structure: Luxury Spectrum Card */}
                <div className="mt-3">
                  <CanvaColorPicker
                    activeColor={currentHex}
                    onColorChange={(newColor) => {
                      if (newColor) {
                        applyHexColor(newColor, true);
                      }
                    }}
                    activeTargetLabel={lang === 'th' ? 'สีแอนิเมชัน' : 'Animation Color'}
                    lang={lang}
                  />
                </div>
              </div>

              {/* CSS Output Box */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  <span>โค้ด CSS แอนิเมชันสำหรับนำไปใช้</span>
                </div>
                <pre
                  id="cssOutputBox"
                  className="bg-slate-900 text-purple-300 p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-32 leading-relaxed selection:bg-purple-800 selection:text-white"
                >
                  {generatedCss}
                </pre>
              </div>
            </div>

          </div>

        </div>

        {/* Toast Notification */}
        {showToast && (
          <div
            id="toast"
            className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm flex items-center gap-2 z-[100000] animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            <i className="fa-solid fa-circle-check text-emerald-400" />
            <span id="toastMessage">{toastMsg}</span>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
