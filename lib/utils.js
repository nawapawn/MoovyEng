/**
 * ============================================================================
 * MoovyEng — UI & Preview Utility Functions
 * ============================================================================
 */

export function isColorDark(hex) {
  if (!hex || typeof hex !== 'string') return false;
  const c = hex.replace('#', '');
  if (c.length < 6) return false;
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

export function highlightKeyword(text, keyword, enableHighlight = true) {
  if (!text || !keyword) return text || '';
  if (!enableHighlight) return text;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<span class="highlight-yellow">$1</span>');
}

export function formatGrammarHtml(text, keyword, enableHighlight = true, isDark = false) {
  if (!text) return '';
  let formatted = text.replace(/\[Subject\]|\bSubject\b/gi, 'S');
  formatted = formatted.replace(/^(โครงสร้าง|structure|formula)\s*[:：\-]\s*/i, '');
  formatted = formatted.replace(/(^|[\s+])s([\s+]|$)/g, '$1S$2');
  
  // Transform '→ [explanation]' or '-> [explanation]' or '-&gt; [explanation]' into '([explanation])'
  formatted = formatted.replace(/\s*(?:→|->|-&gt;)\s*([^()]+)$/, ' ($1)');
  
  formatted = highlightKeyword(formatted, keyword, enableHighlight);
  
  const tokenClass = isDark ? 'text-[#38bdf8] font-bold' : 'text-[#2563eb] font-bold';
  const symbolClass = isDark ? 'text-[#f59e0b] font-bold mx-0.5' : 'text-[#d97706] font-bold mx-0.5';

  formatted = formatted.replace(
    /(\bVerb to be\b|\bIdiom\b|\bPhrasal Verb\b|\bSlang\b|\bNoun\b|\bVerb\b|\bAdjective\b|\bAdverb\b|\bObject\b|\bV\.ing\b|\bV\.1\b|\bV\.2\b|\bV\.3\b|\bS\b|\[[^\]]+\])/g,
    `<strong class="${tokenClass}">$1</strong>`
  );
  formatted = formatted.replace(/(\+)/g, `<strong class="${symbolClass}">$1</strong>`);
  
  // Clean description inside parentheses
  formatted = formatted.replace(/(\([^)]+\))$/, `<span class="${isDark ? 'text-slate-300' : 'text-stone-600'} font-normal text-[12px] sm:text-[13px]">$1</span>`);
  
  return formatted;
}

export function getItemFormat(textFormat = {}, itemKey = 'global', isDark = false) {
  const global = textFormat?.global || textFormat || {};
  const specific = textFormat?.[itemKey] || {};

  const fontFamily = specific.fontFamily || global.fontFamily || 'Inter';
  const rawColor = specific.textColor !== undefined && specific.textColor !== ''
    ? specific.textColor
    : (global.textColor !== undefined && global.textColor !== '' ? global.textColor : '');
  const textColor = rawColor || (isDark ? '#f8fafc' : '#0c0a09');
  
  const fontSize = specific.fontSize || global.fontSize || 'normal';
  const bold = specific.bold !== undefined ? specific.bold : (global.bold !== false);
  const italic = specific.italic !== undefined ? specific.italic : Boolean(global.italic);
  const underline = specific.underline !== undefined ? specific.underline : Boolean(global.underline);
  const textAlign = specific.textAlign || global.textAlign || 'left';

  return {
    fontFamily,
    textColor,
    rawColor,
    fontSize,
    bold,
    italic,
    underline,
    textAlign
  };
}

export function getFontSizeScale(fontSize) {
  switch (fontSize) {
    case 'small':
      return '0.86em';
    case 'large':
      return '1.18em';
    case 'xl':
      return '1.38em';
    case 'normal':
    default:
      return '1em';
  }
}

export function getFontFamilyCss(fontFamily) {
  switch (fontFamily) {
    case 'Inter':
      return "'Inter', sans-serif";
    case 'Prompt':
      return "'Prompt', sans-serif";
    case 'Kanit':
      return "'Kanit', sans-serif";
    case 'Sarabun':
      return "'Sarabun', sans-serif";
    case 'Mitr':
      return "'Mitr', sans-serif";
    case 'Chonburi':
      return "'Chonburi', cursive";
    default:
      return "inherit";
  }
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
  '9:16': { boxClass: 'w-6 h-9', text: '9:16 • Reels / TikTok / Shorts' },
  '2:3':  { boxClass: 'w-7 h-9', text: '2:3 • Portrait Post' },
  '4:5':  { boxClass: 'w-8 h-9', text: '4:5 • IG / FB Feed' },
  '1:1':  { boxClass: 'w-8 h-8', text: '1:1 • Square Post' },
  '3:2':  { boxClass: 'w-11 h-7', text: '3:2 • Landscape' },
  '16:9': { boxClass: 'w-12 h-7', text: '16:9 • YouTube / X' }
};
