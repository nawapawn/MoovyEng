/**
 * ============================================================================
 * moovying(En) / movyEng — Phone Live Canvas Preview & Card Formatter
 * ============================================================================
 */

function highlightKeyword(text, keyword) {
  if (!text || !keyword) return text || '';
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<span class="highlight-yellow">$1</span>');
}

function formatGrammarHtml(text, keyword) {
  if (!text) return '';
  let formatted = text.replace(/\[Subject\]|\bSubject\b/gi, 's');
  formatted = formatted.replace(/^(โครงสร้าง|structure|formula)\s*[:：\-]\s*/i, '');
  formatted = highlightKeyword(formatted, keyword);
  formatted = formatted.replace(/-&gt;|->/g, '→');
  formatted = formatted.replace(/(\bVerb to be\b|\bIdiom\b|\bPhrasal Verb\b|\bSlang\b|\bNoun\b|\bVerb\b|\bAdjective\b|\bAdverb\b|\bObject\b|\bV\.ing\b|\bV\.1\b|\bV\.2\b|\bV\.3\b|\bs\b|\[[^\]]+\])/gi, '<strong class="text-[#2563eb] font-bold">$1</strong>');
  formatted = formatted.replace(/(\+|→)/g, '<strong class="text-[#d97706] font-bold mx-0.5">$1</strong>');
  return formatted;
}

function normalizeThumbUrl(url, slug) {
  if (slug) return `http://127.0.0.1:3001/api/cafe/thumb?slug=${encodeURIComponent(slug)}`;
  if (!url) return '';
  const m = String(url).match(/clip\.cafe\/img800\/([^.?/]+)\.jpg/i);
  if (m && m[1]) {
    return `http://127.0.0.1:3001/api/cafe/thumb?slug=${encodeURIComponent(m[1])}`;
  }
  return url;
}

function handlePreviewImgError(img) {
  if (!img) return;
  const src = img.getAttribute('src') || '';
  const m = src.match(/clip\.cafe\/img800\/([^.?/]+)\.jpg/i);
  if (m && m[1] && !img.dataset.proxied) {
    img.dataset.proxied = '1';
    img.src = `http://127.0.0.1:3001/api/cafe/thumb?slug=${encodeURIComponent(m[1])}`;
    return;
  }
  img.classList.add('hidden');
  const emptyEl = document.getElementById('preview-movie-empty');
  if (emptyEl) emptyEl.classList.remove('hidden');
}

function formatDurationLabel(dur) {
  if (!dur) return '';
  const clean = String(dur).trim();
  if (!clean) return '';
  if (/^\d+$/.test(clean)) return `${clean}s`;
  return clean;
}

function applyAspectRatioUI(ratio) {
  currentClipAspectRatio = ASPECT_RATIO_CONFIG[ratio] ? ratio : '9:16';
  const cfg = ASPECT_RATIO_CONFIG[currentClipAspectRatio];

  const phoneContainer = document.getElementById('phone-container');
  if (phoneContainer) phoneContainer.className = cfg.containerClass;

  const streamArea = document.getElementById('video-canvas-area');
  if (streamArea) streamArea.className = cfg.streamClass;

  const topBlock = document.getElementById('preview-top-vocab-block');
  const midBlock = document.getElementById('preview-middle-clip-block');
  const botBlock = document.getElementById('preview-bottom-grammar-block');
  if (currentClipAspectRatio === '16:9' || currentClipAspectRatio === '3:2') {
    if (topBlock) topBlock.className = 'col-span-5 flex flex-col items-center justify-center space-y-0.5 text-center';
    if (midBlock) midBlock.className = 'col-span-5 flex flex-col items-center justify-center';
    if (botBlock) botBlock.className = 'col-span-7 col-start-6 row-start-1 row-span-2 flex flex-col items-center justify-center space-y-1.5';
    if (streamArea) streamArea.className = 'w-full h-full relative z-10 grid grid-cols-12 grid-rows-2 items-center gap-x-3 gap-y-1 px-4 pt-9 pb-2.5 overflow-hidden';
  } else {
    if (topBlock) topBlock.className = 'w-full flex flex-col items-center justify-center space-y-0.5 text-center';
    if (midBlock) midBlock.className = 'w-full flex flex-col items-center justify-center py-0.5';
    if (botBlock) botBlock.className = 'w-full flex flex-col items-center justify-center space-y-1.5 pt-0.5';
  }

  const statusBar = document.getElementById('preview-ios-statusbar');
  if (statusBar) {
    statusBar.className = cfg.showStatusBar
      ? 'hidden sm:flex absolute top-0 left-0 w-full z-30 justify-between items-center px-7 pt-3.5 text-[#292524] text-xs font-medium'
      : 'hidden';
  }

  const topHeader = document.getElementById('preview-top-header');
  if (topHeader) topHeader.className = cfg.headerClass;

  const clipBox = document.getElementById('movie-clip-box');
  if (clipBox) {
    clipBox.className = `${cfg.clipBoxClass} bg-[#0c0a09] rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)] relative border border-[#e7e5e4] flex-shrink-0 cursor-pointer group transition-all duration-300`;
  }

  const grammarCard = document.getElementById('grammar-detail-card');
  if (grammarCard) grammarCard.className = cfg.grammarCardClass;

  const wordEl = document.getElementById('preview-word');
  if (wordEl) wordEl.className = cfg.wordClass;

  const meaningEl = document.getElementById('preview-meaning');
  if (meaningEl) meaningEl.className = cfg.meaningClass;

  const guideBadge = document.getElementById('aspect-ratio-guide-badge');
  if (guideBadge) guideBadge.textContent = cfg.badgeText;

  const modalRec = document.getElementById('modal-ratio-recommend');
  if (modalRec) modalRec.textContent = cfg.badgeText;

  document.querySelectorAll('.export-ratio-label').forEach(el => {
    el.textContent = currentClipAspectRatio;
  });

  const RATIO_META = {
    '9:16': { boxClass: 'w-6 h-9', text: '9:16 • Reels / TikTok / Shorts' },
    '2:3':  { boxClass: 'w-7 h-9', text: '2:3 • Portrait Post' },
    '4:5':  { boxClass: 'w-8 h-9', text: '4:5 • IG / FB Feed' },
    '1:1':  { boxClass: 'w-8 h-8', text: '1:1 • Square Post' },
    '3:2':  { boxClass: 'w-11 h-7', text: '3:2 • Landscape' },
    '16:9': { boxClass: 'w-12 h-7', text: '16:9 • YouTube / X' }
  };
  const meta = RATIO_META[currentClipAspectRatio] || RATIO_META['9:16'];

  const brownBox = document.getElementById('current-ratio-brown-box');
  if (brownBox) {
    brownBox.className = `${meta.boxClass} rounded-[5px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold tracking-tight shadow-2xs transition-all flex-shrink-0`;
    brownBox.textContent = currentClipAspectRatio;
  }
  const labelEl = document.getElementById('current-ratio-label-text');
  if (labelEl) labelEl.textContent = meta.text;

  const modalBrownBox = document.getElementById('modal-current-ratio-brown-box');
  if (modalBrownBox) {
    modalBrownBox.className = `${meta.boxClass} rounded-[5px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold tracking-tight shadow-2xs transition-all flex-shrink-0`;
    modalBrownBox.textContent = currentClipAspectRatio;
  }
  const modalLabelEl = document.getElementById('modal-current-ratio-label-text');
  if (modalLabelEl) modalLabelEl.textContent = meta.text;

  document.querySelectorAll('[data-ratio]').forEach(btn => {
    const r = btn.getAttribute('data-ratio');
    const isMatch = r === currentClipAspectRatio;
    const shape = btn.querySelector('.ratio-brown-shape');
    if (shape) {
      shape.classList.toggle('ring-2', isMatch);
      shape.classList.toggle('ring-[#0c0a09]', isMatch);
      shape.classList.toggle('ring-offset-2', isMatch);
    }
  });

  document.querySelectorAll('[data-modal-ratio]').forEach(btn => {
    const isMatch = btn.getAttribute('data-modal-ratio') === currentClipAspectRatio;
    const shape = btn.querySelector('.ratio-brown-shape');
    if (shape) {
      shape.classList.toggle('ring-2', isMatch);
      shape.classList.toggle('ring-[#0c0a09]', isMatch);
      shape.classList.toggle('ring-offset-2', isMatch);
    }
  });
}

function toggleAspectRatioDropdown(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('aspect-ratio-dropdown-menu');
  if (menu) menu.classList.toggle('hidden');
}

function closeAspectRatioDropdown() {
  const menu = document.getElementById('aspect-ratio-dropdown-menu');
  if (menu) menu.classList.add('hidden');
}

function toggleModalRatioDropdown(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('modal-ratio-dropdown-menu');
  if (menu) menu.classList.toggle('hidden');
}

function closeModalRatioDropdown() {
  const menu = document.getElementById('modal-ratio-dropdown-menu');
  if (menu) menu.classList.add('hidden');
}

document.addEventListener('click', (e) => {
  const wrap1 = document.getElementById('aspect-ratio-dropdown-wrap');
  if (wrap1 && !wrap1.contains(e.target)) closeAspectRatioDropdown();
  const btnModal = document.getElementById('btn-modal-ratio-dropdown');
  const menuModal = document.getElementById('modal-ratio-dropdown-menu');
  if (menuModal && !menuModal.contains(e.target) && (!btnModal || !btnModal.contains(e.target))) {
    closeModalRatioDropdown();
  }
});

function selectClipAspectRatio(ratio, saveDraft = true) {
  applyAspectRatioUI(ratio);
  if (saveDraft) {
    if (typeof syncFromDesktopForm === 'function') syncFromDesktopForm();
    if (typeof autoSaveDraft === 'function') autoSaveDraft();
  }
}

// Render data onto the Phone Preview
function applyDataToPreview(data) {
  const d = data || {};
  const word = d.word || '';
  const wordKeyword = word ? word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim() : '';

  if (d.clipAspectRatio) {
    applyAspectRatioUI(d.clipAspectRatio);
  } else {
    applyAspectRatioUI(currentClipAspectRatio || '9:16');
  }

  const pWord = document.getElementById('preview-word');
  const pPhonetic = document.getElementById('preview-phonetic');
  const pThaiRead = document.getElementById('preview-thai-read');
  const pMeaning = document.getElementById('preview-meaning');
  const pGrammar = document.getElementById('preview-grammar');

  if (pWord) pWord.textContent = word;
  if (pPhonetic) pPhonetic.textContent = d.phonetic || '';
  if (pThaiRead) pThaiRead.textContent = d.thaiRead || '';
  if (pMeaning) pMeaning.textContent = (d.meaning || '').replace(/["']/g, '');
  if (pGrammar) pGrammar.innerHTML = formatGrammarHtml(d.grammar || '', wordKeyword);

  const ex1El = document.getElementById('preview-ex1');
  const ex2El = document.getElementById('preview-ex2');
  const cleanTh = (str) => (str || '').replace(/^\s*\((.*)\)\s*$/, '$1').trim();

  if (ex1El) {
    ex1El.innerHTML = (d.ex1En || d.ex1Th)
      ? `<div class="font-bold text-[#0c0a09] preview-example-en text-[12px] leading-snug">${highlightKeyword(d.ex1En || '', wordKeyword)}</div>${d.ex1Th ? `<div class="text-[#57534e] preview-example-th text-[11px] preview-thai-font pt-0.5">→ ${cleanTh(d.ex1Th)}</div>` : ''}`
      : '';
  }
  if (ex2El) {
    ex2El.innerHTML = (d.ex2En || d.ex2Th)
      ? `<div class="font-bold text-[#0c0a09] preview-example-en text-[12px] leading-snug">${highlightKeyword(d.ex2En || '', wordKeyword)}</div>${d.ex2Th ? `<div class="text-[#57534e] preview-example-th text-[11px] preview-thai-font pt-0.5">→ ${cleanTh(d.ex2Th)}</div>` : ''}`
      : '';
  }

  // Background Color / Gradient sync & contrast adjustment
  const c1 = d.bgColor1 || currentBgGradient.color1;
  const c2 = d.bgColor2 || currentBgGradient.color2;
  if (c1 && c2) {
    const phone = document.getElementById('phone-container');
    if (phone) {
      phone.style.background = c1 === c2
        ? c1
        : `linear-gradient(135deg, ${c1}, ${c2})`;
    }
    updatePhoneContrast(c1, c2);
  }

  const pChannel = document.getElementById('preview-top-channel');
  if (pChannel) pChannel.textContent = d.channel || '';

  // Profile Avatar rendering
  const avatarSrc = d.avatar || '';
  const topAvatar = document.getElementById('preview-top-avatar');
  const topIcon = document.getElementById('preview-top-avatar-icon');
  const editorAvatar = document.getElementById('editor-avatar-preview');
  const editorIcon = document.getElementById('editor-avatar-icon');

  if (avatarSrc) {
    if (topAvatar) {
      topAvatar.src = avatarSrc;
      topAvatar.classList.remove('hidden');
    }
    if (topIcon) topIcon.classList.add('hidden');
    if (editorAvatar) {
      editorAvatar.src = avatarSrc;
      editorAvatar.classList.remove('hidden');
    }
    if (editorIcon) editorIcon.classList.add('hidden');
  } else {
    if (topAvatar) {
      topAvatar.src = '';
      topAvatar.classList.add('hidden');
    }
    if (topIcon) topIcon.classList.remove('hidden');
    if (editorAvatar) {
      editorAvatar.src = '';
      editorAvatar.classList.add('hidden');
    }
    if (editorIcon) editorIcon.classList.remove('hidden');
  }

  // Movie clip rendering
  const movieImg = document.getElementById('preview-movie-img');
  const movieEmpty = document.getElementById('preview-movie-empty');
  const movieTitle = document.getElementById('preview-movie-title');

  if (d.selectedClipsSequence && Array.isArray(d.selectedClipsSequence) && d.selectedClipsSequence.length > 0) {
    activeClipSequence = d.selectedClipsSequence;
    const first = activeClipSequence[0];
    if (movieTitle) movieTitle.textContent = first.title || '';
    const thumbSrc = normalizeThumbUrl(first.thumb, first.slug);
    if (thumbSrc && movieImg) {
      delete movieImg.dataset.proxied;
      movieImg.src = thumbSrc;
      movieImg.classList.remove('hidden');
      if (movieEmpty) movieEmpty.classList.add('hidden');
    }
  } else if (d.movieImg && movieImg) {
    delete movieImg.dataset.proxied;
    movieImg.src = normalizeThumbUrl(d.movieImg);
    movieImg.classList.remove('hidden');
    if (movieEmpty) movieEmpty.classList.add('hidden');
    if (movieTitle) movieTitle.textContent = d.movieTitle || '';
  } else if (movieImg) {
    movieImg.src = '';
    movieImg.classList.add('hidden');
    if (movieEmpty) movieEmpty.classList.remove('hidden');
    if (movieTitle) movieTitle.textContent = '';
  }
}

// Mobile editor card preview
function updateLiveCardPreview() {
  const grammarVal = document.getElementById('res-grammar')?.value || '';
  const ex1En = document.getElementById('res-ex1-en')?.value || '';
  const ex1Th = document.getElementById('res-ex1-th')?.value || '';
  const ex2En = document.getElementById('res-ex2-en')?.value || '';
  const ex2Th = document.getElementById('res-ex2-th')?.value || '';
  const targetWord = document.getElementById('target-word')?.value?.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim() || '';

  const previewGrammar = document.getElementById('card-preview-grammar');
  const previewEx1 = document.getElementById('card-preview-ex1');
  const previewEx2 = document.getElementById('card-preview-ex2');

  const cleanTh = (str) => (str || '').replace(/^\s*\((.*)\)\s*$/, '$1').trim();

  if (previewGrammar) previewGrammar.innerHTML = formatGrammarHtml(grammarVal, targetWord);
  if (previewEx1) {
    previewEx1.innerHTML = (ex1En || ex1Th)
      ? `<div class="font-bold text-[#0c0a09] dark:text-zinc-100 text-[12px] leading-snug">${highlightKeyword(ex1En, targetWord)}</div>${ex1Th ? `<div class="text-[#57534e] dark:text-zinc-400 text-[11px] preview-thai-font pt-0.5">→ ${cleanTh(ex1Th)}</div>` : ''}`
      : '';
  }
  if (previewEx2) {
    previewEx2.innerHTML = (ex2En || ex2Th)
      ? `<div class="font-bold text-[#0c0a09] dark:text-zinc-100 text-[12px] leading-snug">${highlightKeyword(ex2En, targetWord)}</div>${ex2Th ? `<div class="text-[#57534e] dark:text-zinc-400 text-[11px] preview-thai-font pt-0.5">→ ${cleanTh(ex2Th)}</div>` : ''}`
      : '';
  }
}

function updateAvatarPreviewUI() {
  const img = document.getElementById('editor-avatar-preview');
  const icon = document.getElementById('editor-avatar-icon');
  if (currentAvatarData) {
    if (img) {
      img.src = currentAvatarData;
      img.classList.remove('hidden');
    }
    if (icon) icon.classList.add('hidden');
  } else {
    if (img) {
      img.src = '';
      img.classList.add('hidden');
    }
    if (icon) icon.classList.remove('hidden');
  }
}
