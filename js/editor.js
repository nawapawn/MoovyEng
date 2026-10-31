/**
 * ============================================================================
 * MoovyEng — Form Editor Synchronization & LocalStorage Persistence
 * ============================================================================
 */

function handleUnifiedWordInput(val) {
  const clipQ = document.getElementById('clip-query');
  if (clipQ) clipQ.value = val;
  syncFromDesktopForm();
}

function handleAvatarUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    currentAvatarData = e.target.result;
    const urlInput = document.getElementById('social-avatar-url');
    if (urlInput) urlInput.value = '';
    syncFromDesktopForm();
    if (typeof updateAvatarPreviewUI === 'function') updateAvatarPreviewUI();
    showToast('อัปเดตรูปโปรไฟล์เรียบร้อย!');
  };
  reader.readAsDataURL(file);
}

function handleAvatarUrlInput(url) {
  currentAvatarData = url.trim();
  syncFromDesktopForm();
  if (typeof updateAvatarPreviewUI === 'function') updateAvatarPreviewUI();
}

function clearAvatar() {
  currentAvatarData = '';
  const urlInput = document.getElementById('social-avatar-url');
  if (urlInput) urlInput.value = '';
  syncFromDesktopForm();
  if (typeof updateAvatarPreviewUI === 'function') updateAvatarPreviewUI();
}

// Sync changes from Desktop Form to Preview & localStorage immediately
function syncFromDesktopForm() {
  let prevPool = [];
  try {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (Array.isArray(prev.cafeClipPool)) prevPool = prev.cafeClipPool;
  } catch (e) {}

  const primaryClip = activeClipSequence[0] || {};
  const payload = {
    word: document.getElementById('target-word')?.value.trim() || '',
    phonetic: document.getElementById('res-phonetic')?.value.trim() || '',
    thaiRead: document.getElementById('res-thai-read')?.value.trim() || '',
    meaning: document.getElementById('res-meaning')?.value.trim() || '',
    grammar: document.getElementById('res-grammar')?.value.trim() || '',
    ex1En: document.getElementById('res-ex1-en')?.value.trim() || '',
    ex1Th: document.getElementById('res-ex1-th')?.value.trim() || '',
    ex2En: document.getElementById('res-ex2-en')?.value.trim() || '',
    ex2Th: document.getElementById('res-ex2-th')?.value.trim() || '',
    ex3En: document.getElementById('res-ex3-en')?.value.trim() || '',
    ex3Th: document.getElementById('res-ex3-th')?.value.trim() || '',
    movieTitle: primaryClip.title || '',
    movieImg: primaryClip.thumb || '',
    movieVideo: primaryClip.localVideoUrl || primaryClip.videoUrl || '',
    channel: document.getElementById('social-handle')?.value.trim() || '',
    avatar: currentAvatarData || '',
    caption: document.getElementById('social-description')?.value.trim() || '',
    selectedClipsSequence: activeClipSequence,
    cafeClipPool: (cafeClipPool && cafeClipPool.length > 0) ? cafeClipPool : prevPool,
    clipAspectRatio: currentClipAspectRatio || '9:16',
    bgColor1: currentBgGradient.color1,
    bgColor2: currentBgGradient.color2,
    aiVendor: document.getElementById('ai-vendor')?.value || 'gemini',
    aiModel: document.getElementById('ai-provider')?.value || '',
    apiKey: document.getElementById('api-key')?.value || ''
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  if (typeof applyDataToPreview === 'function') {
    applyDataToPreview(payload);
  }
}

// Populate Desktop Editor Form from saved data
function populateDesktopForm(d) {
  if (!d) return;
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };
  setVal('target-word', d.word);
  setVal('clip-query', d.word);
  setVal('res-phonetic', d.phonetic);
  setVal('res-thai-read', d.thaiRead);
  setVal('res-meaning', d.meaning);
  setVal('res-grammar', d.grammar);
  setVal('res-movie-context', d.movieContextTh);
  setVal('res-ex1-en', d.ex1En);
  setVal('res-ex1-th', d.ex1Th);
  setVal('res-ex2-en', d.ex2En);
  setVal('res-ex2-th', d.ex2Th);
  setVal('res-ex3-en', d.ex3En);
  setVal('res-ex3-th', d.ex3Th);
  setVal('social-handle', d.channel);
  setVal('social-description', d.caption);

  if (d.clipAspectRatio && typeof applyAspectRatioUI === 'function') {
    applyAspectRatioUI(d.clipAspectRatio);
  }
  if (d.bgColor1 && d.bgColor2) {
    currentBgGradient = { color1: d.bgColor1, color2: d.bgColor2 };
    const el1 = document.getElementById('bg-color-1');
    const el2 = document.getElementById('bg-color-2');
    if (el1) el1.value = d.bgColor1;
    if (el2) el2.value = d.bgColor2;
    const hex1 = document.getElementById('bg-color-1-hex');
    const hex2 = document.getElementById('bg-color-2-hex');
    if (hex1) hex1.textContent = d.bgColor1;
    if (hex2) hex2.textContent = d.bgColor2;
  }
  if (d.aiVendor) setVal('ai-vendor', d.aiVendor);
  setVal('api-key', d.apiKey);
  if (d.avatar) {
    currentAvatarData = d.avatar;
    if (!d.avatar.startsWith('data:')) {
      setVal('social-avatar-url', d.avatar);
    }
  }
  if (d.apiKey && typeof detectProviderAndFetchModels === 'function') {
    detectProviderAndFetchModels(d.apiKey, d.aiModel);
  }
  if (d.selectedClipsSequence && Array.isArray(d.selectedClipsSequence)) {
    activeClipSequence = d.selectedClipsSequence;
    if (typeof renderSequenceList === 'function') renderSequenceList();
    if (typeof updateScrapedMovieContextUI === 'function') updateScrapedMovieContextUI();
    if (typeof prepareClipsWithPython === 'function') prepareClipsWithPython(activeClipSequence);
  }
  if (d.cafeClipPool && Array.isArray(d.cafeClipPool) && d.cafeClipPool.length > 0) {
    cafeClipPool = d.cafeClipPool;
    if (typeof renderClipGrid === 'function') renderClipGrid();
    const indicator = document.getElementById('clip-source-indicator');
    if (indicator) {
      const movieCount = cafeClipPool.filter(c => c.isMovie).length;
      indicator.textContent = `${movieCount || cafeClipPool.length} clips`;
      indicator.classList.remove('hidden');
    }
  }
}

// Mobile Editor (edit.html) Compatibility functions
function autoSaveDraft() {
  syncFromDesktopForm();
}

function loadSavedConfig() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const d = JSON.parse(saved);
    populateDesktopForm(d);
    if (typeof updateLiveCardPreview === 'function') updateLiveCardPreview();
    if (typeof updateAvatarPreviewUI === 'function') updateAvatarPreviewUI();
  } catch (e) {
    console.error('Error loading config:', e);
  }
}

function saveAllAndPreview() {
  syncFromDesktopForm();
  showToast('บันทึกข้อมูลเรียบร้อย! กำลังไปหน้า Preview...');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}
