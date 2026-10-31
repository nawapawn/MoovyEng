/**
 * ============================================================================
 * MoovyEng — UI Helpers, Animations, Modals & Toast
 * ============================================================================
 */

function isColorDark(hex) {
  if (!hex || typeof hex !== 'string') return false;
  const c = hex.replace('#', '');
  if (c.length < 6) return false;
  const r = parseInt(c.substr(0, 2), 16) || 0;
  const g = parseInt(c.substr(2, 2), 16) || 0;
  const b = parseInt(c.substr(4, 2), 16) || 0;
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

function updatePhoneContrast(c1, c2) {
  const phone = document.getElementById('phone-container');
  if (!phone) return;
  const dark = isColorDark(c1) || isColorDark(c2);
  phone.classList.toggle('phone-dark-contrast', dark);
}

function applyCustomBgGradient() {
  const c1 = document.getElementById('bg-color-1')?.value || '#fafafa';
  const c2 = document.getElementById('bg-color-2')?.value || '#fafafa';
  const c1Hex = document.getElementById('bg-color-1-hex');
  const c2Hex = document.getElementById('bg-color-2-hex');
  if (c1Hex) c1Hex.textContent = c1;
  if (c2Hex) c2Hex.textContent = c2;
  currentBgGradient = { color1: c1, color2: c2 };

  const phone = document.getElementById('phone-container');
  if (phone) {
    if (c1 === c2) {
      phone.style.background = c1;
    } else {
      phone.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
    }
  }
  updatePhoneContrast(c1, c2);
  if (typeof syncFromDesktopForm === 'function') syncFromDesktopForm();
  if (typeof autoSaveDraft === 'function') autoSaveDraft();
}

function setGradientPreset(c1, c2) {
  const el1 = document.getElementById('bg-color-1');
  const el2 = document.getElementById('bg-color-2');
  if (el1) el1.value = c1;
  if (el2) el2.value = c2;
  applyCustomBgGradient();
}

function resetBgGradient() {
  setGradientPreset('#fafafa', '#fafafa');
}

function toggleToolCard(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.classList.toggle('is-collapsed');
  updateToggleAllCardsIcon();
}

function toggleAllToolSections() {
  const cards = Array.from(document.querySelectorAll('.tool-section-card'));
  const anyExpanded = cards.some(c => !c.classList.contains('is-collapsed'));
  cards.forEach(c => {
    if (anyExpanded) c.classList.add('is-collapsed');
    else c.classList.remove('is-collapsed');
  });
  updateToggleAllCardsIcon();
}

function updateToggleAllCardsIcon() {
  const icon = document.getElementById('toggle-all-cards-icon');
  if (!icon) return;
  const cards = Array.from(document.querySelectorAll('.tool-section-card'));
  const allCollapsed = cards.length > 0 && cards.every(c => c.classList.contains('is-collapsed'));
  icon.className = allCollapsed ? 'fa-solid fa-expand text-xs' : 'fa-solid fa-compress text-xs';
}

function initScrollRevealAnimations() {
  const cards = document.querySelectorAll('.tool-section-card');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('scroll-reveal-hidden');
        entry.target.classList.add('scroll-reveal-visible');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  cards.forEach((card, idx) => {
    card.style.transitionDelay = `${idx * 45}ms`;
    observer.observe(card);
    setTimeout(() => { card.style.transitionDelay = '0ms'; }, 600);
  });
}

function filterStudioTools(query) {
  const q = (query || '').trim().toLowerCase();
  const sections = document.querySelectorAll('.tool-section-card');
  sections.forEach(sec => {
    if (!q) {
      sec.classList.remove('hidden');
      return;
    }
    const kw = (sec.getAttribute('data-tool-keywords') || '').toLowerCase();
    const text = (sec.textContent || '').toLowerCase();
    if (kw.includes(q) || text.includes(q)) {
      sec.classList.remove('hidden');
    } else {
      sec.classList.add('hidden');
    }
  });
}

function jumpToToolSection(sectionId) {
  const searchInput = document.getElementById('desktop-tool-search') || document.getElementById('mobile-tool-search');
  if (searchInput && searchInput.value) {
    searchInput.value = '';
    filterStudioTools('');
  }
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.classList.add('ring-2', 'ring-[#0c0a09]');
  setTimeout(() => el.classList.remove('ring-2', 'ring-[#0c0a09]'), 1200);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  if (!toast || !msgEl) return;
  msgEl.textContent = msg;
  toast.classList.remove('opacity-0', 'pointer-events-none');
  toast.classList.add('opacity-100');
  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0', 'pointer-events-none');
  }, 2200);
}

let customDialogResolver = null;

function showCustomDialog({ title = 'ยืนยันการดำเนินการ', message = '', showCancel = true, icon = 'fa-triangle-exclamation' } = {}) {
  return new Promise((resolve) => {
    customDialogResolver = resolve;
    const modal = document.getElementById('custom-browser-dialog');
    const titleEl = document.getElementById('custom-dialog-title');
    const msgEl = document.getElementById('custom-dialog-message');
    const cancelBtn = document.getElementById('custom-dialog-cancel');
    const iconEl = document.getElementById('custom-dialog-icon');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (iconEl) iconEl.className = `fa-solid ${icon} text-sm`;
    if (cancelBtn) cancelBtn.classList.toggle('hidden', !showCancel);
    if (modal) modal.classList.remove('hidden');
  });
}

function closeCustomDialog(confirmed) {
  const modal = document.getElementById('custom-browser-dialog');
  if (modal) modal.classList.add('hidden');
  if (customDialogResolver) {
    const r = customDialogResolver;
    customDialogResolver = null;
    r(Boolean(confirmed));
  }
}

async function resetToInitialState() {
  const confirmed = await showCustomDialog({
    title: 'ล้างข้อมูลทั้งหมด',
    message: 'ต้องการล้างข้อมูลคำศัพท์ คลิปหนัง และการตั้งค่าทั้งหมดใช่หรือไม่?',
    showCancel: true,
    icon: 'fa-trash-can'
  });
  if (confirmed) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('api-key');
  const icon = document.getElementById('eye-icon');
  if (!input || !icon) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}
