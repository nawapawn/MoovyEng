/**
 * ============================================================================
 * moovying(En) / movyEng — UI & Preview Utility Functions
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

export function highlightKeyword(text, keyword) {
  if (!text || !keyword) return text || '';
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<span class="highlight-yellow">$1</span>');
}

export function formatGrammarHtml(text, keyword) {
  if (!text) return '';
  let formatted = text.replace(/\[Subject\]|\bSubject\b/gi, 's');
  formatted = formatted.replace(/^(โครงสร้าง|structure|formula)\s*[:：\-]\s*/i, '');
  formatted = highlightKeyword(formatted, keyword);
  formatted = formatted.replace(/-&gt;|->/g, '→');
  formatted = formatted.replace(
    /(\bVerb to be\b|\bIdiom\b|\bPhrasal Verb\b|\bSlang\b|\bNoun\b|\bVerb\b|\bAdjective\b|\bAdverb\b|\bObject\b|\bV\.ing\b|\bV\.1\b|\bV\.2\b|\bV\.3\b|\bs\b|\[[^\]]+\])/gi,
    '<strong class="text-[#2563eb] font-bold">$1</strong>'
  );
  formatted = formatted.replace(/(\+|→)/g, '<strong class="text-[#d97706] font-bold mx-0.5">$1</strong>');
  return formatted;
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
