/**
 * ============================================================================
 * MoovyEng — UI & Preview Utility Functions
 * ============================================================================
 */

import { CURATED_VOCAB_DICTIONARY } from './curatedVocab';

export function isColorDark(hex) {
  if (!hex || typeof hex !== 'string') return false;
  const c = hex.replace('#', '');
  if (c.length < 6) return false;
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

export function highlightKeyword(text) {
  return text || '';
}

export function sanitizeGrammarFormula(text, keyword = '') {
  if (!text) return '';
  let raw = text.trim();
  // Fix accidental "be + be ..." or "S + S ..." duplication
  raw = raw.replace(/\bbe\s*\+\s*be\b/gi, 'be');
  raw = raw.replace(/\b(Subject|S)\s*\+\s*(Subject|S)\b/gi, 'Subject');
  const kw = (keyword || '').trim().toLowerCase();

  // If keyword matches curated dictionary, check if raw is a lazy duplicate
  if (kw && CURATED_VOCAB_DICTIONARY[kw]) {
    const curatedGrammar = CURATED_VOCAB_DICTIONARY[kw].grammar;
    const strippedRaw = raw.replace(/\(.*?\)/g, '').trim().toLowerCase();
    // If raw is just the keyword, or starts with keyword and has no structural operators
    if (strippedRaw === kw && !/[+Sbe]/.test(raw.replace(new RegExp(`\\b${kw}\\b`, 'i'), ''))) {
      return curatedGrammar;
    }
  }

  // If raw is literally just the keyword
  if (kw && raw.toLowerCase() === kw) {
    return `${keyword}, + S + V  (สำนวน: ใช้นำหน้าประโยคหรือพูดเดี่ยวๆ)`;
  }

  // Check if raw is "keyword (meaning)" with zero structural components
  if (kw) {
    const m = raw.match(/^([^(]+?)\s*\(([^)]+)\)$/);
    if (m) {
      const left = m[1].trim().toLowerCase();
      const right = m[2].trim();
      if (left === kw) {
        return `${keyword}, + S + V  (${right})`;
      }
    }
  }

  return raw;
}

export function formatGrammarHtml(text, keyword, isDark = false) {
  if (!text) return '';
  const sanitized = sanitizeGrammarFormula(text, keyword);
  let formatted = sanitized.replace(/\[Subject\]|\bSubject\b/gi, 'S');
  formatted = formatted.replace(/^(โครงสร้าง|structure|formula)\s*[:：\-]\s*/i, '');
  
  // Transform '→ [explanation]' or '-> [explanation]' or '-&gt; [explanation]' into '([explanation])'
  formatted = formatted.replace(/\s*(?:→|->|-&gt;)\s*([^()]+)$/, ' ($1)');
  
  const tokenClass = isDark ? 'text-[#38bdf8] font-bold' : 'text-[#2563eb] font-bold';
  const symbolClass = isDark ? 'text-[#f59e0b] font-bold mx-0.5' : 'text-[#d97706] font-bold mx-0.5';

  formatted = formatted.replace(
    /(\bVerb to be\b|\bbe\b|\bIdiom\b|\bPhrasal Verb\b|\bSlang\b|\bNoun\b|\bVerb\b|\bAdjective\b|\bAdverb\b|\bObject\b|\bSomeone\b|\bSomething\b|\bV\.ing\b|\bV\.1\b|\bV\.2\b|\bV\.3\b|\bS\b|\bV\b|\[[^\]]+\])/g,
    `<strong class="${tokenClass}">$1</strong>`
  );
  formatted = formatted.replace(/(\+)/g, `<strong class="${symbolClass}">$1</strong>`);
  
  // Clean description inside parentheses: break to a sleek subtitle line underneath the formula
  const matchParen = formatted.match(/\s*\(([^)]+)\)\s*$/);
  if (matchParen) {
    const noteContent = matchParen[1].trim();
    formatted = formatted.replace(/\s*\([^)]+\)\s*$/, '');
    formatted = `<div class="tracking-wide">${formatted}</div><div class="${isDark ? 'text-stone-400' : 'text-stone-500'} font-normal text-[11px] sm:text-[12px] mt-0.5 leading-normal">(${noteContent})</div>`;
  }
  
  return formatted;
}

export function getItemFormat(textFormat = {}, itemKey = 'global', isDark = false) {
  const global = textFormat?.global || textFormat || {};
  const specific = textFormat?.[itemKey] || {};

  const fontFamily = specific.fontFamily || global.fontFamily || 'Kanit';
  const rawColor = specific.textColor !== undefined && specific.textColor !== ''
    ? specific.textColor
    : (global.textColor !== undefined && global.textColor !== '' ? global.textColor : '');
  const textColor = rawColor || (isDark ? '#f8fafc' : '#0c0a09');
  
  const fontSize = specific.fontSize !== undefined ? specific.fontSize : (global.fontSize !== undefined ? global.fontSize : 26);
  const bold = specific.bold !== undefined ? specific.bold : (global.bold !== false);
  const italic = specific.italic !== undefined ? specific.italic : Boolean(global.italic);
  const underline = specific.underline !== undefined ? specific.underline : Boolean(global.underline);
  const strikethrough = specific.strikethrough !== undefined ? specific.strikethrough : Boolean(global.strikethrough);
  const textTransform = specific.textTransform || global.textTransform || 'none';
  const textAlign = specific.textAlign || global.textAlign || 'left';
  const isList = specific.isList !== undefined ? specific.isList : Boolean(global.isList);
  const letterSpacing = specific.letterSpacing !== undefined ? specific.letterSpacing : (global.letterSpacing || 0);
  const lineHeight = specific.lineHeight !== undefined ? specific.lineHeight : (global.lineHeight || 1.25);
  const opacity = specific.opacity !== undefined ? specific.opacity : (global.opacity !== undefined ? global.opacity : 100);
  const effect = specific.effect || global.effect || 'none';
  const animation = specific.animation || global.animation || 'none';
  const shape = specific.shape || global.shape || 'straight';
  const curvature = specific.curvature !== undefined ? specific.curvature : (global.curvature !== undefined ? global.curvature : 80);

  return {
    fontFamily,
    textColor,
    rawColor,
    fontSize,
    bold,
    italic,
    underline,
    strikethrough,
    textTransform,
    textAlign,
    isList,
    letterSpacing,
    lineHeight,
    opacity,
    effect,
    animation,
    shape,
    curvature
  };
}

export function getFontSizeScale(fontSize) {
  if (typeof fontSize === 'number' || (!isNaN(Number(fontSize)) && fontSize !== '')) {
    return `${fontSize}px`;
  }
  switch (fontSize) {
    case 'small':
      return '14px';
    case 'large':
      return '28px';
    case 'xl':
      return '36px';
    case 'normal':
    default:
      return '20px';
  }
}

export function getFontFamilyCss(fontFamily) {
  switch (fontFamily) {
    case 'Biscuit':
      return "'Biscuit', cursive, sans-serif";
    case 'Chonburi':
      return "'Chonburi', cursive";
    case 'EB Garamond':
      return "'EB Garamond', serif";
    case 'Fredoka':
      return "'Fredoka', cursive, sans-serif";
    case 'Garuda':
      return "'Garuda', 'Prompt', sans-serif";
    case 'Inter':
      return "'Inter', sans-serif";
    case 'Itim':
      return "'Itim', cursive, sans-serif";
    case 'Kanit':
      return "'Kanit', sans-serif";
    case 'Lemon':
      return "'Lemon', cursive, sans-serif";
    case 'MiPancake':
      return "'MiPancake', cursive, sans-serif";
    case 'Mitr':
      return "'Mitr', sans-serif";
    case 'MN PangPing':
      return "'MN PangPing', cursive, sans-serif";
    case 'Noto Serif Thai':
      return "'Noto Serif Thai', serif";
    case 'Prompt':
      return "'Prompt', sans-serif";
    case 'Sarabun':
      return "'Sarabun', sans-serif";
    default:
      return fontFamily ? `'${fontFamily}', sans-serif` : "inherit";
  }
}

export function adjustHex(hex, percent) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex || '#8b5cf6';
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

export function getTextEffectStyle(effect = 'none', textColor = '#8b5cf6', isDark = false) {
  const hex = textColor && textColor.startsWith('#') ? textColor : (isDark ? '#f5f5f4' : '#8b5cf6');
  const darker = adjustHex(hex, -25);
  const muchDarker = adjustHex(hex, -50);
  const lighter = adjustHex(hex, 35);
  const bgLight = adjustHex(hex, 75);

  switch (effect) {
    case 'fx-shadow':
    case 'shadow':
      return {
        color: hex,
        textShadow: `4px 4px 6px ${darker}80`
      };
    case 'fx-lift':
    case 'lift':
    case 'glow':
      return {
        color: hex,
        textShadow: `0 0 16px ${hex}a6, 0 0 30px ${hex}66`
      };
    case 'fx-reflection':
    case 'reflection':
    case 'echo':
      return {
        color: hex,
        textShadow: `5px 6px 0px ${darker}70`
      };
    case 'fx-outline':
    case 'outline':
      return {
        color: 'transparent',
        WebkitTextStroke: `2.5px ${hex}`,
        WebkitTextFillColor: 'transparent'
      };
    case 'fx-background-box':
    case 'background-box':
    case 'background':
      return {
        color: hex,
        backgroundColor: `${bgLight}55`,
        padding: '0.15em 0.35em',
        borderRadius: '0.3em',
        display: 'inline-block',
        lineHeight: 1.1
      };
    case 'fx-splice':
    case 'splice':
      return {
        color: 'transparent',
        WebkitTextStroke: `2px ${hex}`,
        WebkitTextFillColor: 'transparent',
        filter: `drop-shadow(4px 4px 0px ${darker})`
      };
    case 'fx-hollow':
    case 'hollow':
      return {
        color: 'transparent',
        WebkitTextStroke: `2px ${hex}`,
        WebkitTextFillColor: 'transparent'
      };
    case 'fx-neon':
    case 'neon':
      return {
        color: '#ffffff',
        WebkitTextFillColor: '#ffffff',
        textShadow: `0 0 4px #ffffff, 0 0 10px ${lighter}, 0 0 20px ${hex}, 0 0 40px ${darker}`
      };
    case 'fx-glitch-instant':
    case 'glitch-instant':
    case 'glitch':
      return {
        color: hex,
        textShadow: '-3px -2px 0px #06b6d4, 3px 2px 0px #ec4899'
      };
    case 'fx-scifi':
    case 'scifi':
      return {
        fontFamily: "'Orbitron', sans-serif",
        color: hex,
        letterSpacing: '2px',
        textShadow: `0 0 5px ${lighter}, 0 0 12px ${hex}, 0 0 24px ${hex}99`
      };
    case 'fx-tv-glitch':
    case 'tv-glitch':
    case 'tv':
      return {
        color: hex,
        textShadow: `-3px 0 0 #ef4444, 3px 0 0 ${darker}, 0 0 6px ${hex}b3`
      };
    case 'fx-retro70s':
    case 'retro70s':
    case 'vintage':
      return {
        color: hex,
        textShadow: `1px 1px 0px ${adjustHex(hex, -15)}, 2px 2px 0px ${adjustHex(hex, -30)}, 3px 3px 0px ${adjustHex(hex, -45)}, 4px 4px 0px ${adjustHex(hex, -60)}, 5px 5px 0px #7f1d1d`
      };
    case 'fx-screen-print':
    case 'screen-print':
    case 'screenprint':
      return {
        color: 'transparent',
        WebkitTextStroke: `1.5px ${hex}`,
        WebkitTextFillColor: 'transparent',
        textShadow: `3px 3px 0px ${lighter}, 6px 6px 0px ${lighter}66`
      };
    case 'fx-western':
    case 'western':
      return {
        fontFamily: "'Pacifico', cursive",
        color: hex,
        textShadow: `2px 2px 0px #fff, 3px 3px 0px ${darker}, 4px 4px 1px ${muchDarker}`
      };
    case 'fx-graffiti':
    case 'graffiti':
      return {
        fontFamily: "'Bungee', cursive",
        color: hex,
        WebkitTextStroke: `2px ${muchDarker}`,
        textShadow: `4px 4px 0px ${muchDarker}, 6px 6px 0px rgba(0,0,0,0.3)`
      };
    case 'fx-bubble':
    case 'bubble':
      return {
        color: hex,
        WebkitTextStroke: `2px ${darker}`,
        textShadow: `inset 0 2px 4px rgba(255, 255, 255, 0.8), 3px 3px 0px ${darker}, 5px 5px 0px ${muchDarker}`,
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))'
      };
    case 'fx-aerobic':
    case 'aerobic':
      return {
        fontFamily: "'Pacifico', cursive",
        color: hex,
        fontStyle: 'italic',
        textShadow: `0 0 5px ${lighter}, 0 0 15px ${hex}, 0 0 25px ${darker}`
      };
    case 'fx-arcade':
    case 'arcade':
      return {
        fontFamily: "'Press Start 2P', monospace",
        color: hex,
        textShadow: `3px 3px 0px ${darker}, 5px 5px 0px ${muchDarker}`,
        letterSpacing: '2px'
      };
    case 'fx-cosmic':
    case 'cosmic':
      return {
        fontFamily: "'Pacifico', cursive",
        color: '#e0e7ff',
        textShadow: `0 0 8px ${lighter}, 0 0 18px ${hex}, 0 0 30px ${darker}, 0 0 45px ${muchDarker}99`
      };
    case 'fx-pixel':
    case 'pixel':
      return {
        fontFamily: "'Silkscreen', monospace",
        color: hex,
        textShadow: `3px 3px 0px #38bdf8, 5px 5px 0px ${muchDarker}`,
        letterSpacing: '3px'
      };
    case 'fx-none':
    case 'none':
    default:
      return {};
  }
}

export function getTextElementStyle(fmt, isDark = false) {
  if (!fmt) return {};
  const isGradient = fmt.textColor && fmt.textColor.startsWith('linear-gradient');
  const style = {
    fontFamily: getFontFamilyCss(fmt.fontFamily),
    color: isGradient ? undefined : fmt.textColor,
    backgroundImage: isGradient ? fmt.textColor : undefined,
    WebkitBackgroundClip: isGradient ? 'text' : undefined,
    WebkitTextFillColor: isGradient ? 'transparent' : undefined,
    display: isGradient ? 'inline-block' : undefined,
    textAlign: fmt.textAlign,
    letterSpacing: fmt.letterSpacing ? `${fmt.letterSpacing}px` : undefined,
    lineHeight: fmt.lineHeight || undefined,
    opacity: fmt.opacity !== undefined ? fmt.opacity / 100 : undefined,
    textTransform: fmt.textTransform || 'none'
  };

  if (typeof fmt.fontSize === 'number' || (!isNaN(Number(fmt.fontSize)) && fmt.fontSize !== '')) {
    style.fontSize = `${fmt.fontSize}px`;
  } else {
    style.fontSize = getFontSizeScale(fmt.fontSize);
  }

  const decs = [];
  if (fmt.underline) decs.push('underline');
  if (fmt.strikethrough) decs.push('line-through');
  if (decs.length > 0) {
    style.textDecoration = decs.join(' ');
  }

  const effectStyle = getTextEffectStyle(fmt.effect, fmt.textColor, isDark);
  Object.assign(style, effectStyle);

  return style;
}

export function getTextElementClass(fmt) {
  if (!fmt) return '';
  const classes = [];
  if (fmt.bold) classes.push('font-bold');
  else classes.push('font-normal');
  if (fmt.italic) classes.push('italic');
  if (fmt.animation && fmt.animation !== 'none') {
    const anim = fmt.animation.startsWith('anim-') ? fmt.animation : `anim-${fmt.animation}`;
    classes.push(anim);
  }
  return classes.join(' ');
}

export function normalizeThumbUrl(url, slug) {
  if (slug) return `/api/cafe/thumb?slug=${encodeURIComponent(slug)}`;
  if (!url) return '';
  const m = String(url).match(/clip\.cafe\/img800\/([^.?/]+)\.jpg/i);
  if (m && m[1]) {
    return `/api/cafe/thumb?slug=${encodeURIComponent(m[1])}`;
  }
  return url;
}

export const RATIO_META = {
  '9:16': { boxClass: 'w-6 h-9', text: '9:16 • TikTok / Reels / Shorts' },
  '16:9': { boxClass: 'w-12 h-7', text: '16:9 • YouTube / Landscape' }
};
