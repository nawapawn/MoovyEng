/**
 * selectionFormatService.js
 * Helpers for applying Gen-Z inline partial formatting to highlighted text ranges
 * (DOM Range on Phone Preview or substring selection in input fields).
 */

import { getFontFamilyCss } from '../utils.js';

/**
 * Strips all HTML tags and returns clean plain text
 */
export function stripHtml(str = '') {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, '');
}

/**
 * Builds CSS style string from patch properties
 */
export function buildStyleString(patch = {}) {
  const parts = [];

  if (patch.toggleBold || patch.bold) parts.push('font-weight: 700;');
  else if (patch.bold === false) parts.push('font-weight: 400;');

  if (patch.toggleItalic || patch.italic) parts.push('font-style: italic;');
  else if (patch.italic === false) parts.push('font-style: normal;');

  if (patch.toggleUnderline || patch.underline) parts.push('text-decoration: underline;');
  else if (patch.underline === false) parts.push('text-decoration: none;');

  if (patch.strikethrough) parts.push('text-decoration: line-through;');

  if (patch.color) parts.push(`color: ${patch.color};`);

  if (patch.backgroundColor) parts.push(`background-color: ${patch.backgroundColor}; padding: 0.1em 0.3em; border-radius: 4px;`);

  if (patch.fontSize) {
    const sz = typeof patch.fontSize === 'number' ? `${patch.fontSize}px` : patch.fontSize;
    parts.push(`font-size: ${sz};`);
  } else if (patch.sizeDelta) {
    parts.push(`font-size: ${patch.sizeDelta > 0 ? '1.25em' : '0.85em'};`);
  }

  if (patch.fontFamily) {
    parts.push(`font-family: ${getFontFamilyCss(patch.fontFamily)};`);
  }

  return parts.join(' ');
}

/**
 * Wraps text at [start, end] inside a raw string with an inline styled span element
 */
export function wrapStringRange(originalText = '', start = 0, end = 0, patch = {}) {
  if (!originalText) return '';
  if (start < 0 || end <= start) return originalText;

  const before = originalText.slice(0, start);
  const selected = originalText.slice(start, end);
  const after = originalText.slice(end);

  const styleString = buildStyleString(patch);
  const styleAttr = styleString ? ` style="${styleString}"` : '';

  const wrapped = `<span class="custom-styled-selection"${styleAttr}>${selected}</span>`;
  return `${before}${wrapped}${after}`;
}

/**
 * Wraps the current DOM range with an inline styled span element
 */
export function applySpanToRange(range, patch = {}) {
  if (!range) return null;

  // Check if range is already inside an existing custom-styled-selection span
  let existingSpan = null;
  let node = range.commonAncestorContainer;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
  if (node && node.closest) {
    existingSpan = node.closest('.custom-styled-selection');
  }

  const targetSpan = existingSpan || document.createElement('span');
  if (!existingSpan) {
    targetSpan.className = 'custom-styled-selection';
  }

  if (patch.toggleBold) {
    targetSpan.style.fontWeight = targetSpan.style.fontWeight === '700' ? '400' : '700';
  } else if (patch.bold !== undefined) {
    targetSpan.style.fontWeight = patch.bold ? '700' : '400';
  }

  if (patch.toggleItalic) {
    targetSpan.style.fontStyle = targetSpan.style.fontStyle === 'italic' ? 'normal' : 'italic';
  } else if (patch.italic !== undefined) {
    targetSpan.style.fontStyle = patch.italic ? 'italic' : 'normal';
  }

  if (patch.toggleUnderline) {
    targetSpan.style.textDecoration = (targetSpan.style.textDecoration || '').includes('underline') ? 'none' : 'underline';
  } else if (patch.underline !== undefined) {
    targetSpan.style.textDecoration = patch.underline ? 'underline' : 'none';
  }

  if (patch.strikethrough !== undefined) {
    targetSpan.style.textDecoration = patch.strikethrough ? 'line-through' : 'none';
  }

  if (patch.color) {
    targetSpan.style.color = patch.color;
  }

  if (patch.backgroundColor) {
    targetSpan.style.backgroundColor = patch.backgroundColor;
    targetSpan.style.padding = '0.1em 0.3em';
    targetSpan.style.borderRadius = '4px';
  }

  if (patch.fontSize) {
    targetSpan.style.fontSize = typeof patch.fontSize === 'number' ? `${patch.fontSize}px` : patch.fontSize;
  } else if (patch.sizeDelta) {
    targetSpan.style.fontSize = patch.sizeDelta > 0 ? '1.25em' : '0.85em';
  }

  if (patch.fontFamily) {
    targetSpan.style.fontFamily = getFontFamilyCss(patch.fontFamily);
  }

  if (!existingSpan) {
    const fragment = range.extractContents();
    targetSpan.appendChild(fragment);
    range.insertNode(targetSpan);
  }

  return targetSpan;
}

/**
 * Strips formatting on a range, replacing spans with plain text node
 */
export function stripSpanOnRange(range) {
  if (!range) return;

  let node = range.commonAncestorContainer;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
  const span = node && node.closest ? node.closest('.custom-styled-selection') : null;

  if (span && span.parentNode) {
    const parent = span.parentNode;
    while (span.firstChild) {
      parent.insertBefore(span.firstChild, span);
    }
    parent.removeChild(span);
    parent.normalize();
    return;
  }

  const text = range.toString();
  range.deleteContents();
  range.insertNode(document.createTextNode(text));
}
