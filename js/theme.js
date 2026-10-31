/**
 * ============================================================================
 * MoovyEng — Theme & Language Manager (Dark/Light & TH/EN)
 * ============================================================================
 */

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('movy_theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  const icon = document.getElementById('theme-toggle-icon');
  if (icon) {
    icon.className = isDark ? 'fa-solid fa-sun text-xs text-amber-400' : 'fa-solid fa-moon text-xs text-[#777169]';
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('movy_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeIcon(isDark);
}

function toggleLanguage() {
  currentLang = currentLang === 'th' ? 'en' : 'th';
  localStorage.setItem('movy_lang', currentLang);
  applyLanguage(currentLang);
}

function applyLanguage(lang) {
  const dict = I18N[lang] || I18N.th;
  const badge = document.getElementById('lang-badge-text');
  if (badge) badge.textContent = dict.langBtn;

  const setTxt = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  const setPlh = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = text;
  };

  setPlh('desktop-tool-search', dict.searchToolsPlaceholder);
  setPlh('target-word', dict.wordPlaceholder);
  setTxt('export-btn-text', dict.exportBtnText);
  setTxt('step1-title-text', dict.step1Title);
  setTxt('step1-subtitle-text', dict.step1Subtitle);
  setTxt('step2-title-text', dict.step2Title);
  setTxt('step2-subtitle-text', dict.step2Subtitle);
  setTxt('step3-title-text', dict.step3Title);
  setTxt('step3-subtitle-text', dict.step3Subtitle);
  setTxt('btn-generate-text', dict.generateBtn);
  setTxt('bg-color-heading', dict.bgColorHeading);
}

function initLanguage() {
  const savedLang = localStorage.getItem('movy_lang');
  currentLang = savedLang === 'en' ? 'en' : 'th';
  applyLanguage(currentLang);
}
