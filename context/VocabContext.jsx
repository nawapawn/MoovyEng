'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  STORAGE_KEY,
  CURATED_RANDOM_WORDS,
  ASPECT_RATIO_CONFIG,
  VENDOR_LABELS,
  DEFAULT_VENDOR_MODELS,
  I18N,
  getNextSentenceVariety
} from '../lib/constants';
import { getCuratedVocabDetails, CURATED_VOCAB_DICTIONARY } from '../lib/curatedVocab';
import {
  regenerateMeaningApi,
  regenerateGrammarApi,
  regenerateExampleApi,
  regeneratePhoneticApi,
  regenerateCaptionApi
} from '../lib/services/regenerateService';
import {
  buildMasterFlashcardPrompt,
  buildClipSentencesPrompt,
  executeAiCompletion,
  stripEmojis,
  formatCompleteSocialCaption
} from '../lib/services/aiGeneratorService';
import {
  applySpanToRange,
  stripSpanOnRange,
  wrapStringRange,
  stripHtml
} from '../lib/services/selectionFormatService';
import { sanitizeGrammarFormula } from '../lib/utils';

import defaultClips from '../lib/defaultUnderTheWeatherClips.json';

const VocabContext = createContext(null);

export function VocabProvider({ children }) {
  // Core Vocab State - Default to "under the weather" to match the user's showcase
  const [word, setWord] = useState('under the weather');
  const [phonetic, setPhonetic] = useState("/'ʌn.dər ðə 'weð.ər/");
  const [thaiRead, setThaiRead] = useState('(อันเดอะ เดอะ เวธเธอะ)');
  const [meaning, setMeaning] = useState('รู้สึกไม่สบาย, ป่วยเล็กน้อย');
  const [grammar, setGrammar] = useState('feel / be + under the weather (ใช้บอกว่ารู้สึกครั่นเนื้อครั่นตัวหรือไม่ค่อยสบาย)');
  const [movieContextTh, setMovieContextTh] = useState('ฉันป่วยหรือรู้สึกไม่สบายเล็กน้อย');
  const [ex1En, setEx1En] = useState('i feel a bit under the weather today.');
  const [ex1Th, setEx1Th] = useState('วันนี้ฉันรู้สึกไม่ค่อยสบายตัวนิดหน่อย');
  const [ex2En, setEx2En] = useState('Stay home if you are under the weather.');
  const [ex2Th, setEx2Th] = useState('อยู่บ้านพักผ่อนนะถ้ารู้สึกไม่สบาย');

  // Video Clips & Playback
  const [activeClipSequence, setActiveClipSequence] = useState(defaultClips.slice(0, 6));
  const [cafeClipPool, setCafeClipPool] = useState(defaultClips);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [playTrigger, setPlayTrigger] = useState(0);
  const [clipPage, setClipPage] = useState(1);
  const [isLoadingMoreClips, setIsLoadingMoreClips] = useState(false);

  // Design & Canvas Settings (Single Solid Color only, no gradients, no movie backdrop blur)
  const [clipAspectRatio, setClipAspectRatioState] = useState('9:16');
  const [bgColor, setBgColorState] = useState('#ffffff');
  const [useMovieBackdrop, setUseMovieBackdrop] = useState(false);
  const [bgBlur, setBgBlur] = useState(0);
  const [bgOverlayOpacity, setBgOverlayOpacity] = useState(0);

  // Fallback aspect ratio to only 9:16 or 16:9
  const setClipAspectRatio = (val) => {
    const valid = val === '16:9' ? '16:9' : '9:16';
    setClipAspectRatioState(valid);
  };

  const setBgColor = (color) => {
    setBgColorState(color || '#ffffff');
  };

  const setBgColor1 = setBgColor;
  const setBgColor2 = setBgColor;
  const bgColor1 = bgColor;
  const bgColor2 = bgColor;

  // Draggable element positions for interactive free layout with guides & measurements
  const DEFAULT_ELEMENT_POSITIONS = {
    header: { x: 0, y: 0 },
    word: { x: 0, y: 0 },
    phonetic: { x: 0, y: 0 },
    thaiRead: { x: 0, y: 0 },
    movieBox: { x: 0, y: 0 },
    meaning: { x: 0, y: 0 },
    grammar: { x: 0, y: 0 },
    ex1: { x: 0, y: 0 },
    ex2: { x: 0, y: 0 }
  };
  const [elementPositions, setElementPositions] = useState(DEFAULT_ELEMENT_POSITIONS);

  const updateElementPosition = (key, posOrFn) => {
    setElementPositions((prev) => {
      const cur = prev[key] || { x: 0, y: 0 };
      const next = typeof posOrFn === 'function' ? posOrFn(cur) : posOrFn;
      const updated = { ...prev, [key]: next };
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('movy_element_positions', JSON.stringify(updated));
        }
      } catch (e) {}
      return updated;
    });
  };

  const resetElementPositions = () => {
    setElementPositions(DEFAULT_ELEMENT_POSITIONS);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('movy_element_positions', JSON.stringify(DEFAULT_ELEMENT_POSITIONS));
      }
    } catch (e) {}
  };

  // Itemized Text Formatting for All Vocabulary Components
  const DEFAULT_TEXT_FORMAT = {
    global: {
      fontFamily: 'Biscuit',
      textColor: '#0c0a09',
      fontSize: 'normal',
      bold: true,
      italic: false,
      underline: false,
      textAlign: 'left'
    },
    word: {
      fontFamily: 'Biscuit',
      textColor: '#0c0a09',
      fontSize: 44,
      bold: true,
      italic: false,
      underline: false,
      textAlign: 'center'
    },
    phonetic: {
      fontFamily: 'Inter',
      textColor: '#78716c',
      fontSize: 16,
      bold: false,
      italic: true,
      underline: false,
      textAlign: 'center'
    },
    thaiRead: {
      fontFamily: 'Kanit',
      textColor: '#ef4444', // Red as shown in the user's uploaded screenshot
      fontSize: 18,
      bold: true,
      italic: false,
      underline: false,
      textAlign: 'center'
    },
    meaning: {
      fontFamily: 'Biscuit',
      textColor: '#0c0a09',
      fontSize: 34,
      bold: true,
      italic: false,
      underline: false,
      textAlign: 'center'
    },
    grammar: {
      fontFamily: 'Biscuit',
      textColor: '#0c0a09',
      fontSize: 22,
      bold: false,
      italic: false,
      underline: false,
      textAlign: 'center'
    },
    ex1: {
      fontFamily: 'Inter',
      textColor: '#1c1917',
      fontSize: 15,
      bold: false,
      italic: false,
      underline: false,
      textAlign: 'left'
    },
    ex2: {
      fontFamily: 'Inter',
      textColor: '#1c1917',
      fontSize: 15,
      bold: false,
      italic: false,
      underline: false,
      textAlign: 'left'
    },
    channel: {
      fontFamily: 'Inter',
      textColor: '#0c0a09',
      fontSize: 20,
      bold: true,
      italic: false,
      underline: false,
      textAlign: 'left'
    }
  };
  const [activeFormatTarget, setActiveFormatTarget] = useState('all');
  const [textFormat, setTextFormat] = useState(DEFAULT_TEXT_FORMAT);

  // Social Profile - Default to @move0nyoung and default anime avatar
  const [channel, setChannelState] = useState('@move0nyoung');
  const [avatar, setAvatar] = useState('/avatar_default.png');
  const [captionStyle, setCaptionStyle] = useState('educational');
  const [caption, setCaption] = useState(
    "แจกประโยคเด็ดจากหนัง! คำว่า 'under the weather' ไม่ได้แปลว่าอยู่ใต้สภาพอากาศ แต่แปลว่า 'รู้สึกไม่สบาย, ครั่นเนื้อครั่นตัว' #เรียนภาษาอังกฤษจากหนัง #ฝึกภาษาอังกฤษ #แคปชันอังกฤษ #move0nyoung"
  );

  // Sync channel hashtag inside social caption whenever user edits channel handle
  const setChannel = (newChannel) => {
    setChannelState((prevChannel) => {
      const oldClean = stripEmojis(String(prevChannel || ''))
        .replace(/<[^>]+>/g, '')
        .replace(/^[@#]+/, '')
        .replace(/\s+/g, '')
        .trim();
      const newClean = stripEmojis(String(newChannel || ''))
        .replace(/<[^>]+>/g, '')
        .replace(/^[@#]+/, '')
        .replace(/\s+/g, '')
        .trim();

      if (newClean) {
        const newTag = `#${newClean}`;
        setCaption((curCap) => {
          if (!curCap) return curCap;
          if (oldClean && curCap.toLowerCase().includes(`#${oldClean.toLowerCase()}`)) {
            return curCap.replace(new RegExp(`#${oldClean}\\b`, 'gi'), newTag);
          }
          if (!curCap.toLowerCase().includes(newTag.toLowerCase())) {
            return `${curCap.trim()} ${newTag}`;
          }
          return curCap;
        });
      }
      return newChannel;
    });
  };

  // AI Configuration
  const [aiVendor, setAiVendor] = useState('gemini');
  const [aiModel, setAiModel] = useState('gemini-2.0-flash');
  const [apiKey, setApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState(DEFAULT_VENDOR_MODELS['gemini'] || []);

  // UI States
  const [theme, setThemeState] = useState('light');
  const [lang, setLangState] = useState('th');
  const [isLoading, setIsLoading] = useState(false);
  const [isCraftingSentences, setIsCraftingSentences] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toolSearch, setToolSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({});

  // Active text selection for Canva Selection Toolbar
  const [activeSelection, setActiveSelection] = useState(null);

  // Per-field regenerating loading states
  const [isRegenerating, setIsRegenerating] = useState({
    phonetic: false,
    meaning: false,
    grammar: false,
    ex1: false,
    ex2: false,
    caption: false
  });

  // History & Version Control (Undo / Redo)
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const isApplyingHistoryRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const historyTimerRef = useRef(null);

  // Debounced search filtering across studio tool cards
  useEffect(() => {
    const handler = setTimeout(() => {
      const q = (toolSearch || '').trim().toLowerCase();
      setDebouncedSearch(q);

      if (typeof document !== 'undefined') {
        const cards = document.querySelectorAll('.tool-section-card');
        cards.forEach((card) => {
          if (!q) {
            card.classList.remove('search-dimmed', 'search-matched');
            return;
          }
          const kw = (card.getAttribute('data-tool-keywords') || '') + ' ' + (card.textContent || '');
          if (kw.toLowerCase().includes(q)) {
            card.classList.remove('search-dimmed');
            card.classList.add('search-matched');
            const id = card.id;
            if (id) {
              setCollapsedSections((prev) => ({ ...prev, [id]: false }));
            }
          } else {
            card.classList.add('search-dimmed');
            card.classList.remove('search-matched');
          }
        });
      }
    }, 180);

    return () => clearTimeout(handler);
  }, [toolSearch]);

  // Custom Dialog
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    showCancel: true,
    icon: 'fa-triangle-exclamation',
    onConfirm: null
  });

  const toastTimerRef = useRef(null);
  const isLoadedFromStorage = useRef(false);

  // Toast Helper
  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    setIsToastVisible(true);
    toastTimerRef.current = setTimeout(() => {
      setIsToastVisible(false);
    }, 2400);
  };

  // Custom Dialog Helper
  const showCustomDialog = ({ title, message = '', showCancel = true, icon = 'fa-triangle-exclamation', onConfirm = null } = {}) => {
    setDialogState({
      isOpen: true,
      title: title || (lang === 'th' ? 'ยืนยันการดำเนินการ' : 'Confirm Action'),
      message,
      showCancel,
      icon,
      onConfirm
    });
  };

  const closeCustomDialog = (confirmed = false) => {
    if (confirmed && typeof dialogState.onConfirm === 'function') {
      dialogState.onConfirm();
    }
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('movy_theme') || 'light';
      setThemeState(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      document.documentElement.classList.toggle('light', savedTheme !== 'dark');

      const savedLang = localStorage.getItem('movy_lang') || 'th';
      setLangState(savedLang);

      const savedDataStr = localStorage.getItem(STORAGE_KEY);
      if (savedDataStr) {
        const d = JSON.parse(savedDataStr);
        if (d.word) setWord(d.word);
        if (d.phonetic) setPhonetic(d.phonetic);
        if (d.thaiRead) setThaiRead(d.thaiRead);
        if (d.meaning) setMeaning(d.meaning);
        if (d.grammar) setGrammar(sanitizeGrammarFormula(d.grammar, d.word || 'break a leg'));
        if (d.movieContextTh) setMovieContextTh(d.movieContextTh);
        if (d.ex1En) setEx1En(d.ex1En);
        if (d.ex1Th) setEx1Th(d.ex1Th);
        if (d.ex2En) setEx2En(d.ex2En);
        if (d.ex2Th) setEx2Th(d.ex2Th);
        if (d.clipAspectRatio) setClipAspectRatio(d.clipAspectRatio);
        if (d.bgColor1) setBgColor1(d.bgColor1);
        if (d.bgColor2) setBgColor2(d.bgColor2);
        if (typeof d.useMovieBackdrop === 'boolean') setUseMovieBackdrop(d.useMovieBackdrop);
        if (typeof d.bgBlur === 'number') setBgBlur(d.bgBlur);
        if (typeof d.bgOverlayOpacity === 'number') setBgOverlayOpacity(d.bgOverlayOpacity);
        if (d.textFormat && typeof d.textFormat === 'object') {
          if (d.textFormat.global || d.textFormat.word) {
            setTextFormat((prev) => ({ ...prev, ...d.textFormat }));
          } else {
            setTextFormat((prev) => ({ ...prev, global: { ...(prev.global || {}), ...d.textFormat } }));
          }
        }
        if (d.channel) setChannel(d.channel);
        if (d.avatar) setAvatar(d.avatar);
        if (d.caption) setCaption(d.caption);
        const vendor = d.aiVendor || 'gemini';
        if (d.aiVendor) setAiVendor(d.aiVendor);
        const vendorDefaults = DEFAULT_VENDOR_MODELS[vendor] || DEFAULT_VENDOR_MODELS['gemini'] || [];
        setAvailableModels(vendorDefaults);
        if (d.aiModel) setAiModel(d.aiModel);
        else if (vendorDefaults.length > 0) setAiModel(vendorDefaults[0].id);
        if (d.apiKey) setApiKey(d.apiKey);

        if (Array.isArray(d.selectedClipsSequence) && d.selectedClipsSequence.length > 0) {
          setActiveClipSequence(d.selectedClipsSequence);
        }
        if (Array.isArray(d.cafeClipPool) && d.cafeClipPool.length > 0) {
          setCafeClipPool(d.cafeClipPool);
        }
        if (d.elementPositions && typeof d.elementPositions === 'object') {
          setElementPositions((prev) => ({ ...prev, ...d.elementPositions }));
        }
      }

      // Dedicated persistent check for element positions lock across refreshes and API key updates
      const savedPositions = localStorage.getItem('movy_element_positions');
      if (savedPositions) {
        const parsedPos = JSON.parse(savedPositions);
        if (parsedPos && typeof parsedPos === 'object') {
          setElementPositions((prev) => ({ ...prev, ...parsedPos }));
        }
      }

      // Dedicated persistent check for text format styling across refreshes
      const savedTextFormat = localStorage.getItem('movy_text_format');
      if (savedTextFormat) {
        const parsedFmt = JSON.parse(savedTextFormat);
        if (parsedFmt && typeof parsedFmt === 'object') {
          setTextFormat((prev) => ({ ...prev, ...parsedFmt }));
        }
      }
    } catch (e) {
      console.error('Error restoring localStorage data:', e);
    } finally {
      isLoadedFromStorage.current = true;
    }
  }, []);

  // Save to LocalStorage whenever critical fields change
  useEffect(() => {
    if (!isLoadedFromStorage.current) return;
    try {
      const payload = {
        word,
        phonetic,
        thaiRead,
        meaning,
        grammar,
        movieContextTh,
        ex1En,
        ex1Th,
        ex2En,
        ex2Th,
        clipAspectRatio,
        bgColor1,
        bgColor2,
        useMovieBackdrop,
        bgBlur,
        bgOverlayOpacity,
        textFormat,
        channel,
        avatar,
        caption,
        aiVendor,
        aiModel,
        apiKey,
        elementPositions,
        selectedClipsSequence: activeClipSequence,
        cafeClipPool: cafeClipPool
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem('movy_element_positions', JSON.stringify(elementPositions));
      localStorage.setItem('movy_text_format', JSON.stringify(textFormat));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [
    word, phonetic, thaiRead, meaning, grammar, movieContextTh,
    ex1En, ex1Th, ex2En, ex2Th, clipAspectRatio, bgColor1, bgColor2,
    useMovieBackdrop, bgBlur, bgOverlayOpacity, textFormat,
    channel, avatar, caption, aiVendor, aiModel, apiKey,
    elementPositions, activeClipSequence, cafeClipPool
  ]);

  // Theme Toggler
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    localStorage.setItem('movy_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.classList.toggle('light', nextTheme !== 'dark');
  };

  // Language Toggler
  const toggleLanguage = () => {
    const nextLang = lang === 'th' ? 'en' : 'th';
    setLangState(nextLang);
    localStorage.setItem('movy_lang', nextLang);
  };

  // Card Expand / Collapse
  const toggleToolCard = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleAllToolSections = () => {
    const ids = ['tool-sec-ai', 'tool-sec-vocab', 'tool-sec-ratio', 'tool-sec-social'];
    const anyOpen = ids.some((id) => !collapsedSections[id]);
    const next = {};
    ids.forEach((id) => {
      next[id] = anyOpen;
    });
    setCollapsedSections(next);
  };

  const jumpToToolSection = (sectionId) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: false }));
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Reset All
  const resetToInitialState = () => {
    showCustomDialog({
      title: lang === 'th' ? 'รีเซ็ตข้อมูลทั้งหมด' : 'Reset All Data',
      message: lang === 'th' ? 'คุณต้องการล้างข้อมูลคำศัพท์และคลิปที่ดึงมาทั้งหมดเพื่อเริ่มใหม่ใช่หรือไม่?' : 'Do you want to reset all vocabulary and scraped clips to defaults?',
      onConfirm: () => {
        if (historyTimerRef.current) {
          clearTimeout(historyTimerRef.current);
          historyTimerRef.current = null;
        }
        setWord('under the weather');
        setPhonetic("/'ʌn.dər ðə 'weð.ər/");
        setThaiRead('(อันเดอะ เดอะ เวธเธอะ)');
        setMeaning('รู้สึกไม่สบาย, ป่วยเล็กน้อย');
        setGrammar('feel / be + under the weather (ใช้บอกว่ารู้สึกครั่นเนื้อครั่นตัวหรือไม่ค่อยสบาย)');
        setEx1En('i feel a bit under the weather today.');
        setEx1Th('วันนี้ฉันรู้สึกไม่ค่อยสบายตัวนิดหน่อย');
        setEx2En('Stay home if you are under the weather.');
        setEx2Th('อยู่บ้านพักผ่อนนะถ้ารู้สึกไม่สบาย');
        setChannel('@move0nyoung');
        setAvatar('/avatar_default.png');
        setCaption(
          "แจกประโยคเด็ดจากหนัง! คำว่า 'under the weather' ไม่ได้แปลว่าอยู่ใต้สภาพอากาศ แต่แปลว่า 'รู้สึกไม่สบาย, ครั่นเนื้อครั่นตัว' #เรียนภาษาอังกฤษจากหนัง #ฝึกภาษาอังกฤษ #แคปชันอังกฤษ #move0nyoung"
        );
        setBgColor1('#ffffff');
        setBgColor2('#ffffff');
        setUseMovieBackdrop(false);
        setBgBlur(0);
        setBgOverlayOpacity(0);
        setTextFormat(JSON.parse(JSON.stringify(DEFAULT_TEXT_FORMAT)));
        setElementPositions(DEFAULT_ELEMENT_POSITIONS);
        setClipAspectRatio('9:16');
        setActiveClipSequence(defaultClips.slice(0, 6));
        setCafeClipPool(defaultClips);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('movy_element_positions');
        localStorage.removeItem('movy_text_format');
        showToast(lang === 'th' ? 'รีเซ็ตข้อมูลเรียบร้อยแล้ว' : 'All data reset');
      }
    });
  };

  // =========================================================================
  // HISTORY & VERSION CONTROL (UNDO / REDO)
  // =========================================================================
  const createCurrentSnapshot = useCallback(() => ({
    word,
    phonetic,
    thaiRead,
    meaning,
    grammar,
    movieContextTh,
    ex1En,
    ex1Th,
    ex2En,
    ex2Th,
    clipAspectRatio,
    bgColor1,
    bgColor2,
    useMovieBackdrop,
    bgBlur,
    bgOverlayOpacity,
    textFormat: JSON.parse(JSON.stringify(textFormat)),
    elementPositions: JSON.parse(JSON.stringify(elementPositions)),
    channel,
    avatar,
    caption
  }), [
    word, phonetic, thaiRead, meaning, grammar, movieContextTh,
    ex1En, ex1Th, ex2En, ex2Th, clipAspectRatio, bgColor1, bgColor2,
    useMovieBackdrop, bgBlur, bgOverlayOpacity, textFormat, elementPositions,
    channel, avatar, caption
  ]);

  const pushHistorySnapshot = useCallback((overrideSnapshot = null) => {
    if (isApplyingHistoryRef.current) return;
    const snap = overrideSnapshot || createCurrentSnapshot();
    const serialized = JSON.stringify(snap);

    const history = historyRef.current;
    const curIdx = historyIndexRef.current;

    // Skip identical snapshot
    if (curIdx >= 0 && JSON.stringify(history[curIdx]) === serialized) {
      return;
    }

    const nextHistory = history.slice(0, curIdx + 1);
    nextHistory.push(snap);

    // Limit stack depth to 50
    if (nextHistory.length > 50) {
      nextHistory.shift();
    }

    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, [createCurrentSnapshot]);

  // Undo Function
  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const targetIdx = historyIndexRef.current - 1;
    const snap = historyRef.current[targetIdx];
    if (!snap) return;

    isApplyingHistoryRef.current = true;
    historyIndexRef.current = targetIdx;

    if (snap.word !== undefined) setWord(snap.word);
    if (snap.phonetic !== undefined) setPhonetic(snap.phonetic);
    if (snap.thaiRead !== undefined) setThaiRead(snap.thaiRead);
    if (snap.meaning !== undefined) setMeaning(snap.meaning);
    if (snap.grammar !== undefined) setGrammar(snap.grammar);
    if (snap.movieContextTh !== undefined) setMovieContextTh(snap.movieContextTh);
    if (snap.ex1En !== undefined) setEx1En(snap.ex1En);
    if (snap.ex1Th !== undefined) setEx1Th(snap.ex1Th);
    if (snap.ex2En !== undefined) setEx2En(snap.ex2En);
    if (snap.ex2Th !== undefined) setEx2Th(snap.ex2Th);
    if (snap.clipAspectRatio !== undefined) setClipAspectRatio(snap.clipAspectRatio);
    if (snap.bgColor1 !== undefined) setBgColor1(snap.bgColor1);
    if (snap.bgColor2 !== undefined) setBgColor2(snap.bgColor2);
    if (snap.useMovieBackdrop !== undefined) setUseMovieBackdrop(snap.useMovieBackdrop);
    if (snap.bgBlur !== undefined) setBgBlur(snap.bgBlur);
    if (snap.bgOverlayOpacity !== undefined) setBgOverlayOpacity(snap.bgOverlayOpacity);
    if (snap.textFormat !== undefined) setTextFormat(JSON.parse(JSON.stringify(snap.textFormat)));
    if (snap.elementPositions !== undefined) setElementPositions(JSON.parse(JSON.stringify(snap.elementPositions)));
    if (snap.channel !== undefined) setChannel(snap.channel);
    if (snap.avatar !== undefined) setAvatar(snap.avatar);
    if (snap.caption !== undefined) setCaption(snap.caption);

    setCanUndo(targetIdx > 0);
    setCanRedo(targetIdx < historyRef.current.length - 1);
    showToast(lang === 'th' ? 'ย้อนกลับ (Undo)' : 'Undo applied');

    setTimeout(() => {
      isApplyingHistoryRef.current = false;
    }, 60);
  }, [lang]);

  // Redo Function
  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const targetIdx = historyIndexRef.current + 1;
    const snap = historyRef.current[targetIdx];
    if (!snap) return;

    isApplyingHistoryRef.current = true;
    historyIndexRef.current = targetIdx;

    if (snap.word !== undefined) setWord(snap.word);
    if (snap.phonetic !== undefined) setPhonetic(snap.phonetic);
    if (snap.thaiRead !== undefined) setThaiRead(snap.thaiRead);
    if (snap.meaning !== undefined) setMeaning(snap.meaning);
    if (snap.grammar !== undefined) setGrammar(snap.grammar);
    if (snap.movieContextTh !== undefined) setMovieContextTh(snap.movieContextTh);
    if (snap.ex1En !== undefined) setEx1En(snap.ex1En);
    if (snap.ex1Th !== undefined) setEx1Th(snap.ex1Th);
    if (snap.ex2En !== undefined) setEx2En(snap.ex2En);
    if (snap.ex2Th !== undefined) setEx2Th(snap.ex2Th);
    if (snap.clipAspectRatio !== undefined) setClipAspectRatio(snap.clipAspectRatio);
    if (snap.bgColor1 !== undefined) setBgColor1(snap.bgColor1);
    if (snap.bgColor2 !== undefined) setBgColor2(snap.bgColor2);
    if (snap.useMovieBackdrop !== undefined) setUseMovieBackdrop(snap.useMovieBackdrop);
    if (snap.bgBlur !== undefined) setBgBlur(snap.bgBlur);
    if (snap.bgOverlayOpacity !== undefined) setBgOverlayOpacity(snap.bgOverlayOpacity);
    if (snap.textFormat !== undefined) setTextFormat(JSON.parse(JSON.stringify(snap.textFormat)));
    if (snap.elementPositions !== undefined) setElementPositions(JSON.parse(JSON.stringify(snap.elementPositions)));
    if (snap.channel !== undefined) setChannel(snap.channel);
    if (snap.avatar !== undefined) setAvatar(snap.avatar);
    if (snap.caption !== undefined) setCaption(snap.caption);

    setCanUndo(targetIdx > 0);
    setCanRedo(targetIdx < historyRef.current.length - 1);
    showToast(lang === 'th' ? 'ทำซ้ำ (Redo)' : 'Redo applied');

    setTimeout(() => {
      isApplyingHistoryRef.current = false;
    }, 60);
  }, [lang]);

  // Initial Snapshot once loaded
  useEffect(() => {
    if (isLoadedFromStorage.current && historyRef.current.length === 0) {
      const initSnap = createCurrentSnapshot();
      historyRef.current = [initSnap];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [createCurrentSnapshot]);

  // Debounced Auto-Snapshot tracking canvas changes
  useEffect(() => {
    if (!isLoadedFromStorage.current || isApplyingHistoryRef.current) return;

    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    historyTimerRef.current = setTimeout(() => {
      pushHistorySnapshot();
    }, 450);

    return () => {
      if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    };
  }, [
    word, phonetic, thaiRead, meaning, grammar, movieContextTh,
    ex1En, ex1Th, ex2En, ex2Th, clipAspectRatio, bgColor1, bgColor2,
    useMovieBackdrop, bgBlur, bgOverlayOpacity, textFormat,
    channel, avatar, caption, pushHistorySnapshot
  ]);

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Cmd+Z, Cmd+Shift+Z)
  useEffect(() => {
    function handleKeyDown(e) {
      const isZ = e.key === 'z' || e.key === 'Z';
      const isY = e.key === 'y' || e.key === 'Y';
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (!isCtrlOrCmd) return;

      if (isZ && !e.shiftKey) {
        if (historyIndexRef.current > 0) {
          e.preventDefault();
          undo();
        }
      } else if ((isZ && e.shiftKey) || isY) {
        if (historyIndexRef.current < historyRef.current.length - 1) {
          e.preventDefault();
          redo();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Trash Can Action: Clear Vocab Fields
  const clearVocabData = () => {
    showCustomDialog({
      title: lang === 'th' ? 'ล้างข้อมูลคำศัพท์' : 'Clear Vocabulary Data',
      message: lang === 'th' ? 'คุณต้องการล้างข้อมูลคำศัพท์ คำอ่าน ความหมาย ไวยากรณ์ และประโยคทั้งหมดใช่หรือไม่?' : 'Do you want to clear all vocabulary, grammar, and example sentence fields?',
      icon: 'fa-trash-can',
      onConfirm: () => {
        setWord('');
        setPhonetic('');
        setThaiRead('');
        setMeaning('');
        setGrammar('');
        setEx1En('');
        setEx1Th('');
        setEx2En('');
        setEx2Th('');
        setActiveClipSequence([]);
        setCafeClipPool([]);
        showToast(lang === 'th' ? 'ล้างข้อมูลคำศัพท์เรียบร้อยแล้ว' : 'Vocabulary fields cleared');
      }
    });
  };

  // Update itemized text format
  const updateTextFormat = (field, value, target = activeFormatTarget) => {
    setTextFormat((prev) => {
      const copy = { ...prev };
      const currentGlobal = copy.global || {};

      if (target === 'all' || target === 'global') {
        const patch = typeof field === 'object' ? field : { [field]: value };
        copy.global = { ...currentGlobal, ...patch };
      } else {
        const currentItem = copy[target] || { ...currentGlobal };
        const patch = typeof field === 'object' ? field : { [field]: value };
        copy[target] = { ...currentItem, ...patch };
      }
      return copy;
    });
  };

  // Reset text format for specific target or all
  const resetItemTextFormat = (target = activeFormatTarget) => {
    if (target === 'all' || target === 'global') {
      setTextFormat(JSON.parse(JSON.stringify(DEFAULT_TEXT_FORMAT)));
      showToast(lang === 'th' ? 'รีเซ็ตสไตล์ข้อความทั้งหมดเรียบร้อย' : 'All text formatting reset');
    } else {
      setTextFormat((prev) => {
        const copy = { ...prev };
        if (DEFAULT_TEXT_FORMAT[target]) {
          copy[target] = { ...DEFAULT_TEXT_FORMAT[target] };
        } else {
          delete copy[target];
        }
        return copy;
      });
      showToast(lang === 'th' ? `รีเซ็ตสไตล์สำหรับ ${target} เรียบร้อย` : `Reset style for ${target}`);
    }
  };

  // Helper to apply vocab details object cleanly (optionally preserving user's pre-filled Thai meaning)
  const applyVocabDetails = useCallback((details, preserveMeaning = '') => {
    if (!details) return;
    if (details.phonetic !== undefined) setPhonetic(stripEmojis(details.phonetic || ''));
    if (details.thaiRead !== undefined) setThaiRead(stripEmojis(details.thaiRead || ''));
    if (preserveMeaning && preserveMeaning.trim()) {
      setMeaning(stripEmojis(preserveMeaning.trim()));
    } else if (details.meaning !== undefined) {
      setMeaning(stripEmojis(details.meaning || ''));
    }
    if (details.grammar !== undefined) setGrammar(stripEmojis(sanitizeGrammarFormula(details.grammar, details.word || word)));
    if (details.ex1En !== undefined) setEx1En(stripEmojis(details.ex1En || ''));
    if (details.ex1Th !== undefined) setEx1Th(stripEmojis(details.ex1Th || ''));
    if (details.ex2En !== undefined) setEx2En(stripEmojis(details.ex2En || ''));
    if (details.ex2Th !== undefined) setEx2Th(stripEmojis(details.ex2Th || ''));
    if (details.socialCaption || details.caption) {
      setCaption(
        formatCompleteSocialCaption({
          baseCaption: details.socialCaption || details.caption,
          word: details.word || word,
          meaning: (preserveMeaning && preserveMeaning.trim()) || details.meaning || meaning,
          primaryClip: activeClipSequence[0] || cafeClipPool[0] || null,
          channel,
          captionStyle
        })
      );
    }
  }, [word, meaning, activeClipSequence, cafeClipPool, channel, captionStyle]);

  // Fetch real dictionary / translation / corpus data for words not in the curated list
  const fetchDictionaryDetails = useCallback(async (targetWord, options = {}) => {
    const q = (targetWord || '').trim();
    if (!q) return null;
    try {
      const params = new URLSearchParams({ q });
      if (options.meaning) params.set('meaning', options.meaning);
      if (options.exclude) {
        if (Array.isArray(options.exclude)) {
          options.exclude.forEach((s) => s && params.append('exclude', s));
        } else {
          params.append('exclude', options.exclude);
        }
      }
      if (options.shuffle) params.append('shuffle', '1');
      const r = await fetch(`/api/vocab/lookup?${params.toString()}`);
      if (r.ok) {
        const data = await r.json();
        if (data && data.success && data.details) return data.details;
      }
    } catch (e) {
      console.warn('Dictionary lookup failed:', e.message);
    }
    return null;
  }, []);

  // Instant Full Word & Detail Sync (Supports 4-Step Workflow: Word + Thai Meaning -> Match Clips -> Pattern + Freestyle -> SEO Caption)
  const updateWord = useCallback(async (newWord, syncDetails = true, customMeaning = '') => {
    const trimmed = (newWord || '').trim();
    if (!trimmed) {
      setWord('');
      return;
    }

    const userProvidedMeaning = (customMeaning || '').trim();
    setWord(trimmed);

    if (syncDetails) {
      // 1. Check curated list first (instant zero-latency for curated idioms)
      const curated = getCuratedVocabDetails(trimmed);
      if (curated) {
        applyVocabDetails(curated, userProvidedMeaning);
      } else {
        // 2. Fetch real data from dictionary / translation / corpus API
        try {
          const details = await fetchDictionaryDetails(trimmed, { meaning: userProvidedMeaning });
          if (details) applyVocabDetails(details, userProvidedMeaning);
        } catch (e) {
          console.warn('updateWord fetchDictionaryDetails error:', e);
        }
      }
    }

    // If API Key is present, run full 4-step AI pipeline (which also fetches and semantically ranks clips)
    if (apiKey) {
      await generateAiContent(trimmed, userProvidedMeaning || meaning);
    } else {
      // Trigger clips search in background when no API Key
      await searchClips(trimmed, true);
    }
  }, [apiKey, meaning, applyVocabDetails, fetchDictionaryDetails]);
  // Legacy reset alias
  const resetTextFormat = () => resetItemTextFormat('all');

  // Clean Cache (Removes all cached videos, intermediate files & exports so 0MB remains on disk)
  const cleanCache = async (aggressive = true) => {
    try {
      const resp = await fetch(`/api/cafe/clean-cache${aggressive ? '?all=1' : ''}`, { method: 'POST' });
      if (resp.ok) {
        const data = await resp.json();
        const freedMb = ((data.bytesFreed || 0) / (1024 * 1024)).toFixed(1);
        showToast(
          `${lang === 'th' ? 'ล้างแคชและวิดีโอในเครื่องหมดเกลี้ยง! คืนพื้นที่' : 'Completely cleaned cache & videos! Freed'} ${freedMb} MB (${data.filesDeleted || 0} ${lang === 'th' ? 'ไฟล์' : 'files'})`
        );
      } else {
        showToast(lang === 'th' ? 'ล้างแคชไม่สำเร็จ' : 'Failed to clean cache');
      }
    } catch (err) {
      console.error('Clean cache error:', err);
      showToast('Error cleaning cache');
    }
  };

  // Clip Selection & Reordering (Automatically updates Social Caption with ALL selected movies + quotes EN/TH + #channel, and crafts sentences if primary)
  const toggleSelectClip = (clip) => {
    let becamePrimary = false;
    let nextClips = [];

    setActiveClipSequence((prev) => {
      const idx = prev.findIndex((c) => c.id === clip.id);
      if (idx !== -1) {
        if (prev.length > 1) {
          nextClips = prev.filter((_, i) => i !== idx);
          return nextClips;
        }
        showToast(lang === 'th' ? 'เลือกคลิปนี้อยู่แล้วในลำดับที่ 1' : 'Already selected as clip 1');
        nextClips = prev;
        return prev;
      }
      if (prev.length === 0) {
        becamePrimary = true;
      }
      nextClips = [...prev, clip];
      return nextClips;
    });

    // Update Social Caption to contain ALL selected movies in the queue (EN + TH)
    setTimeout(() => {
      setCaption((cur) =>
        formatCompleteSocialCaption({
          baseCaption: '',
          word,
          meaning,
          primaryClip: nextClips[0] || clip,
          clipsList: nextClips,
          channel,
          captionStyle
        })
      );
    }, 40);

    if (becamePrimary && clip && apiKey && word) {
      craftSentencesFromSelectedClip(clip);
    }
  };

  const reorderClip = (index, direction) => {
    setActiveClipSequence((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      setTimeout(() => {
        setCaption(
          formatCompleteSocialCaption({
            baseCaption: '',
            word,
            meaning,
            primaryClip: copy[0],
            clipsList: copy,
            channel,
            captionStyle
          })
        );
      }, 40);
      return copy;
    });
  };

  const removeClip = (index) => {
    setActiveClipSequence((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setTimeout(() => {
        setCaption(
          formatCompleteSocialCaption({
            baseCaption: '',
            word,
            meaning,
            primaryClip: next[0] || null,
            clipsList: next,
            channel,
            captionStyle
          })
        );
      }, 40);
      return next;
    });
  };

  // Search Clips from Backend / Clip.cafe
  const searchClips = async (targetWord = word, reset = true, targetMeaning = meaning) => {
    const query = (targetWord || '').trim();
    if (!query) {
      showToast(lang === 'th' ? 'กรุณาพิมพ์คำศัพท์ที่ต้องการค้นหาคลิปก่อน' : 'Please enter a word to search');
      return;
    }

    setIsLoading(true);
    setLoadingText(lang === 'th' ? `กำลังดึงคลิปหนังภาษาอังกฤษสำหรับ "${query}"...` : `Searching English clips for "${query}"...`);

    try {
      // 1. Search exact query with meaning passed for smart idiomatic translation
      let data = null;
      const meaningParam = targetMeaning ? `&meaning=${encodeURIComponent(targetMeaning)}` : '';
      let resp = await fetch(`/api/cafe/search?q=${encodeURIComponent(query)}${meaningParam}&page=1`);
      if (resp.ok) {
        data = await resp.json();
      }

      // 2. If no clips found and query contains multiple words (like idioms), try fallback sub-phrase
      if ((!data || !data.success || !Array.isArray(data.clips) || data.clips.length === 0) && query.includes(' ')) {
        const words = query.split(/\s+/).filter(Boolean);
        const subQuery = words.length > 2 ? words.slice(-3).join(' ') : words.slice(-2).join(' ');
        if (subQuery && subQuery !== query) {
          try {
            const subResp = await fetch(`/api/cafe/search?q=${encodeURIComponent(subQuery)}${meaningParam}&page=1`);
            if (subResp.ok) {
              const subData = await subResp.json();
              if (subData.success && Array.isArray(subData.clips) && subData.clips.length > 0) {
                data = subData;
              }
            }
          } catch {
            // sub-phrase search ignored
          }
        }
      }

      if (data && data.success && Array.isArray(data.clips) && data.clips.length > 0) {
        setCafeClipPool(data.clips);
        setClipPage(1);
        if (reset || activeClipSequence.length === 0) {
          setActiveClipSequence([data.clips[0]]);
          setCaption(
            formatCompleteSocialCaption({
              baseCaption: '',
              word: query,
              meaning,
              primaryClip: data.clips[0],
              channel,
              captionStyle
            })
          );
        }
        showToast(lang === 'th' ? `พบคลิปหนังภาษาอังกฤษ ${data.clips.length} คลิปสำหรับ "${query}"` : `Found ${data.clips.length} movie clips for "${query}"`);
        return data.clips;
      }

      showToast(lang === 'th' ? `ไม่พบคลิปสำหรับ "${query}" (ยังคงแสดงคลิปเดิม)` : `No new clips found for "${query}"`);
    } catch (err) {
      console.error('Search clips error:', err);
      showToast(lang === 'th' ? 'ค้นหาคลิปขัดข้อง กรุณาลองใหม่อีกครั้ง' : 'Failed to search clips');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreCafeClips = async () => {
    if (!word) return;
    setIsLoadingMoreClips(true);
    const nextPage = clipPage + 1;
    try {
      const resp = await fetch(`/api/cafe/search?q=${encodeURIComponent(word)}&page=${nextPage}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && Array.isArray(data.clips) && data.clips.length > 0) {
          setCafeClipPool((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const fresh = data.clips.filter((c) => !existingIds.has(c.id));
            return [...prev, ...fresh];
          });
          setClipPage(nextPage);
          showToast(lang === 'th' ? `โหลดคลิปเพิ่ม ${data.clips.length} คลิป` : `Loaded ${data.clips.length} more clips`);
        } else {
          showToast(lang === 'th' ? 'ไม่มีคลิปเพิ่มเติมแล้ว' : 'No more clips');
        }
      }
    } catch (e) {
      console.warn('Load more clips error:', e);
    } finally {
      setIsLoadingMoreClips(false);
    }
  };

  // AI Content Generation (4-Step Pipeline: 1. Word+Meaning -> 2. Match Clips -> 3. Movie Pattern + Freestyle -> 4. SEO Caption)
  const generateAiContent = async (customWord = word, customMeaning = meaning) => {
    const targetWord = (customWord || word).trim();
    const userMeaning = (customMeaning !== undefined ? customMeaning : meaning || '').trim();
    if (!targetWord) {
      showToast(lang === 'th' ? 'กรุณาพิมพ์คำศัพท์ภาษาอังกฤษก่อน' : 'Please enter an English word');
      return;
    }

    if (!apiKey) {
      showToast(lang === 'th' ? 'กรุณาระบุ API Key ก่อนเรียกใช้งาน AI' : 'Please provide an API Key first');
      return;
    }

    setIsLoading(true);
    setLoadingText(
      lang === 'th'
        ? `AI กำลังวิเคราะห์คำแปล "${userMeaning || targetWord}" และคัดเลือกคลิปที่ตรงบริบท...`
        : `AI is matching clips & generating pattern sentences for "${targetWord}"...`
    );

    try {
      // Always fetch fresh clips for the target word if pool doesn't match
      const currentClips = (await searchClips(targetWord, true)) || cafeClipPool || [];
      const primaryClip = activeClipSequence[0] || currentClips[0] || null;

      const prompt = buildMasterFlashcardPrompt({
        targetWord,
        userMeaning,
        primaryClip,
        candidateClips: currentClips,
        captionStyle,
        channel,
        activeClipSequence
      });
      const parsed = await executeAiCompletion({ promptText: prompt, apiKey, aiVendor, aiModel });

      if (parsed) {
        let selectedPrimaryClip = primaryClip;
        let resultingSequence = activeClipSequence;
        // Step 2: Reorder clips so the clip matching BOTH targetWord & Thai meaning is selected first!
        // Also attach AI's high-quality idiomatic Thai translations to candidate clips
        if (parsed.clipQuotesThMap && typeof parsed.clipQuotesThMap === 'object') {
          Object.entries(parsed.clipQuotesThMap).forEach(([idxStr, thTrans]) => {
            const num = parseInt(idxStr, 10);
            if (!isNaN(num) && currentClips[num] && thTrans) {
              currentClips[num].quoteTh = stripEmojis(thTrans);
            }
          });
        }

        if (
          typeof parsed.bestClipIndex === 'number' &&
          parsed.bestClipIndex >= 0 &&
          parsed.bestClipIndex < currentClips.length
        ) {
          const bestClip = currentClips[parsed.bestClipIndex];
          if (bestClip) {
            if (parsed.selectedClipQuoteTh) {
              bestClip.quoteTh = stripEmojis(parsed.selectedClipQuoteTh);
            }
            selectedPrimaryClip = bestClip;
            const reordered = [bestClip, ...currentClips.filter((c) => c.id !== bestClip.id)];
            setCafeClipPool(reordered);
            resultingSequence = [bestClip];
            setActiveClipSequence(resultingSequence);
          }
        }

        if (parsed.phonetic) setPhonetic(stripEmojis(parsed.phonetic));
        if (parsed.thaiRead) setThaiRead(stripEmojis(parsed.thaiRead));

        // Preserve user's explicit Thai meaning if they typed one; otherwise use AI's contextual meaning
        const finalMeaning = userMeaning || stripEmojis(parsed.meaning || '');
        if (finalMeaning) setMeaning(finalMeaning);

        if (parsed.grammar) setGrammar(stripEmojis(sanitizeGrammarFormula(parsed.grammar, targetWord)));
        if (parsed.ex1En) setEx1En(stripEmojis(parsed.ex1En));
        if (parsed.ex1Th) setEx1Th(stripEmojis(parsed.ex1Th));
        if (parsed.ex2En) setEx2En(stripEmojis(parsed.ex2En));
        if (parsed.ex2Th) setEx2Th(stripEmojis(parsed.ex2Th));

        // Step 4: Ensure Social Caption ALWAYS contains ALL selected Movie Titles + Quotes (EN & TH) + #channel hashtag
        setCaption(
          formatCompleteSocialCaption({
            baseCaption: parsed.socialCaption || '',
            word: targetWord,
            meaning: finalMeaning || parsed.meaning || '',
            primaryClip: selectedPrimaryClip,
            clipsList: resultingSequence.length > 0 ? resultingSequence : (selectedPrimaryClip ? [selectedPrimaryClip] : []),
            channel,
            captionStyle,
            movieQuoteThOverride: parsed.selectedClipQuoteTh || ''
          })
        );

        showToast(
          lang === 'th'
            ? `AI วิเคราะห์คลิป แกะโครงสร้างประโยค และสร้างแคปชันสำหรับ "${targetWord}" สำเร็จ!`
            : `AI generation complete for "${targetWord}"!`
        );
      }
    } catch (err) {
      console.error('AI generation error:', err);
      const primaryClip = activeClipSequence[0] || cafeClipPool[0] || null;
      const is429 = err.message && err.message.includes('429');
      const curated = getNextSentenceVariety(targetWord, ex1En, primaryClip);
      if (curated) {
        if (curated.ex1En) setEx1En(stripEmojis(curated.ex1En));
        if (curated.ex1Th) setEx1Th(stripEmojis(curated.ex1Th));
        if (curated.ex2En) setEx2En(stripEmojis(curated.ex2En));
        if (curated.ex2Th) setEx2Th(stripEmojis(curated.ex2Th));
        if (curated.grammar) setGrammar(stripEmojis(curated.grammar));
        const mText = userMeaning || meaning || targetWord;
        setCaption(
          `แจกประโยคเด็ดจากหนัง! คำว่า '${targetWord}' ไม่ได้แปลตรงตัวอย่างที่คิด แต่อมความหมายว่า '${mText}' เอาไว้ เอาไปใช้พูดตามนี้เลิศแน่นอน! #เรียนภาษาอังกฤษจากหนัง #ฝึกภาษาอังกฤษ #แคปชันอังกฤษ`
        );
        if (is429) {
          showToast(
            lang === 'th'
              ? `Gemini API โควต้าเต็มชั่วคราว (HTTP 429) ระบบสลับไปใช้คลังประโยคและไวยากรณ์คุณภาพสูงให้แล้ว!`
              : `Gemini API rate limit (HTTP 429). Loaded high-quality curated sentences!`
          );
          return;
        }
      } else {
        try {
          const dictDetails = await fetchDictionaryDetails(targetWord, { meaning: userMeaning });
          if (dictDetails) {
            applyVocabDetails(dictDetails, userMeaning);
            showToast(
              lang === 'th'
                ? `โหลดข้อมูลพจนานุกรมและประโยคจริงสำหรับ "${targetWord}" สำเร็จ!`
                : `Loaded dictionary data for "${targetWord}"!`
            );
            return;
          }
        } catch (fetchErr) {
          console.warn('Fallback dictionary lookup failed:', fetchErr);
        }
      }
      showToast(`${lang === 'th' ? 'เรียกใช้งาน AI ไม่สำเร็จ' : 'AI Generation Failed'}: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // AI Random Word
  const randomWordWithAi = async () => {
    let picked = '';
    if (apiKey) {
      try {
        setIsLoading(true);
        setLoadingText(lang === 'th' ? 'กำลังสุ่มคำศัพท์/สำนวนด้วย AI...' : 'Picking viral English idiom...');
        const prompt = 'Give me exactly ONE popular, practical, or viral English idiom, phrasal verb, or slang that Thai learners love. Reply with ONLY the English phrase itself, no punctuation, no quotes, no extra words. Example: bite the bullet';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        if (aiVendor === 'gemini') {
          const gemModel = aiModel || 'gemini-2.0-flash';
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${gemModel}:generateContent?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            const json = await res.json();
            const raw = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (raw) picked = raw.replace(/["'\n\r.]/g, '').trim();
          }
        } else {
          let endpoint = 'https://api.openai.com/v1/chat/completions';
          if (aiVendor === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
          else if (aiVendor === 'deepseek') endpoint = 'https://api.deepseek.com/chat/completions';
          else if (aiVendor === 'xai') endpoint = 'https://api.x.ai/v1/chat/completions';

          const effectiveModel = aiModel || (DEFAULT_VENDOR_MODELS[aiVendor]?.[0]?.id || 'gpt-4o-mini');
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: effectiveModel,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.9
            })
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            const json = await res.json();
            const raw = json.choices?.[0]?.message?.content?.trim();
            if (raw) picked = raw.replace(/["'\n\r.]/g, '').trim();
          }
        }
      } catch (e) {
        // Silently fall back to curated list if timeout or API error occurs
      } finally {
        setIsLoading(false);
      }
    }

    if (!picked) {
      picked = CURATED_RANDOM_WORDS[Math.floor(Math.random() * CURATED_RANDOM_WORDS.length)];
    }

    showToast(`${lang === 'th' ? 'สุ่มได้คำว่า' : 'Selected'}: "${picked}"`);
    await updateWord(picked, true);
  };

  // Re-craft Movie Pattern Sentence (1) + Freestyle Sentence (2) from Selected Clip
  const craftSentencesFromSelectedClip = async (overrideClip = null) => {
    const targetWord = (word || '').trim();
    if (!targetWord) {
      showToast(lang === 'th' ? 'กรุณาพิมพ์คำศัพท์ภาษาอังกฤษก่อน' : 'Please enter an English word');
      return;
    }

    setIsCraftingSentences(true);

    // If API Key is present, attempt fast targeted AI generation from selected movie clip
    if (apiKey) {
      try {
        const primaryClip =
          (overrideClip && overrideClip.id ? overrideClip : null) ||
          activeClipSequence[0] ||
          cafeClipPool[0] ||
          null;
        const prompt = buildClipSentencesPrompt({
          word: targetWord,
          meaning,
          grammar,
          primaryClip
        });

        const parsed = await executeAiCompletion({
          promptText: prompt,
          apiKey,
          aiVendor,
          aiModel,
          timeoutMs: 8000
        });

        if (parsed && parsed.ex1En && parsed.ex2En) {
          if (parsed.grammar) {
            setGrammar(stripEmojis(sanitizeGrammarFormula(parsed.grammar, targetWord)));
          }
          setEx1En(stripEmojis(parsed.ex1En));
          if (parsed.ex1Th) setEx1Th(stripEmojis(parsed.ex1Th));
          setEx2En(stripEmojis(parsed.ex2En));
          if (parsed.ex2Th) setEx2Th(stripEmojis(parsed.ex2Th));
          showToast(
            lang === 'th'
              ? `แกะโครงสร้างจากคลิปหนังและแต่งประโยคใหม่สำหรับ "${targetWord}" สำเร็จ!`
              : `Extracted movie structure & generated examples for "${targetWord}"!`
          );
          setIsCraftingSentences(false);
          return;
        }
      } catch (e) {
        console.warn('AI sentence craft fallback to curated variety:', e.message);
      }
    }

    // 1. Check curated sentence varieties
    const variety = getNextSentenceVariety(targetWord, ex1En, activeClipSequence[0] || cafeClipPool[0]);
    if (variety) {
      setEx1En(variety.ex1En);
      setEx1Th(variety.ex1Th);
      setEx2En(variety.ex2En);
      setEx2Th(variety.ex2Th);
      showToast(lang === 'th' ? `แต่งประโยคตัวอย่างใหม่เรียบร้อย!` : `New punchy examples generated!`);
      setIsCraftingSentences(false);
      return;
    }

    // 2. Fetch real sentences from corpus/dictionary API (exclude current sentences to get fresh ones)
    try {
      const fresh = await fetchDictionaryDetails(targetWord, {
        exclude: [ex1En, ex2En].filter(Boolean),
        shuffle: true
      });
      if (fresh && fresh.ex1En && fresh.ex1En !== ex1En) {
        setEx1En(fresh.ex1En);
        if (fresh.ex1Th) setEx1Th(fresh.ex1Th);
        if (fresh.ex2En) setEx2En(fresh.ex2En);
        if (fresh.ex2Th) setEx2Th(fresh.ex2Th);
        showToast(lang === 'th' ? `ดึงประโยคตัวอย่างจริงใหม่เรียบร้อย!` : `New real example sentences loaded!`);
        setIsCraftingSentences(false);
        return;
      }
    } catch (fetchErr) {
      console.warn('Craft sentences fallback fetch error:', fetchErr);
    }

    showToast(lang === 'th' ? `แต่งประโยคตัวอย่างเรียบร้อย` : `Examples ready`);
    setIsCraftingSentences(false);
  };

  // Selection Formatting: Apply custom styles specifically to highlighted / selected text
  const applySelectionFormat = (patch = {}) => {
    if (!activeSelection) return;
    const { fieldName, range, isInputField, start, end } = activeSelection;

    try {
      // Case 1: Input Field Selection (direct string range wrapping)
      if (isInputField && start !== undefined && end !== undefined && start !== end) {
        const currentVal = getFieldValueByName(fieldName);
        const updatedHtml = wrapStringRange(currentVal, start, end, patch);
        updateFieldByFieldName(fieldName, updatedHtml);
        showToast(lang === 'th' ? `ปรับสไตล์เฉพาะ "${activeSelection.text}" แล้ว` : `Formatted "${activeSelection.text}"`);
        return;
      }

      // Case 2: DOM Range Selection on Phone Preview
      if (range) {
        applySpanToRange(range, patch);

        // Read updated HTML from container and update state
        const container = document.querySelector(`[data-preview-field="${fieldName}"]`);
        if (container) {
          const updatedHtml = container.innerHTML;
          updateFieldByFieldName(fieldName, updatedHtml);
        }

        showToast(lang === 'th' ? `ปรับสไตล์เฉพาะ "${activeSelection.text}" แล้ว` : `Formatted "${activeSelection.text}"`);
      }
    } catch (err) {
      console.warn('applySelectionFormat error:', err);
    }
  };

  const clearSelectionFormat = (targetFieldName) => {
    const fName = targetFieldName || activeSelection?.fieldName;
    if (!fName) return;

    try {
      if (activeSelection?.range) {
        stripSpanOnRange(activeSelection.range);
        const container = document.querySelector(`[data-preview-field="${fName}"]`);
        if (container) {
          const updatedHtml = container.innerHTML;
          updateFieldByFieldName(fName, updatedHtml);
        }
      } else {
        const currentVal = getFieldValueByName(fName);
        const cleanVal = stripHtml(currentVal);
        updateFieldByFieldName(fName, cleanVal);
      }

      showToast(lang === 'th' ? 'ล้างสไตล์เรียบร้อย' : 'Cleared formatting');
      setActiveSelection(null);
    } catch (err) {
      console.warn('clearSelectionFormat error:', err);
    }
  };

  const getFieldValueByName = (fieldName) => {
    switch (fieldName) {
      case 'word': return word;
      case 'phonetic': return phonetic;
      case 'thaiRead': return thaiRead;
      case 'meaning': return meaning;
      case 'grammar': return grammar;
      case 'ex1En': return ex1En;
      case 'ex1Th': return ex1Th;
      case 'ex2En': return ex2En;
      case 'ex2Th': return ex2Th;
      case 'channel': return channel;
      default: return '';
    }
  };

  const updateFieldByFieldName = (fieldName, val) => {
    switch (fieldName) {
      case 'word': setWord(val); break;
      case 'phonetic': setPhonetic(val); break;
      case 'thaiRead': setThaiRead(val); break;
      case 'meaning': setMeaning(val); break;
      case 'grammar': setGrammar(val); break;
      case 'ex1En': setEx1En(val); break;
      case 'ex1Th': setEx1Th(val); break;
      case 'ex2En': setEx2En(val); break;
      case 'ex2Th': setEx2Th(val); break;
      case 'channel': setChannel(val); break;
      default: break;
    }
  };

  // Helper for single field AI completions
  const callAiSingleField = async (promptText, timeoutMs = 6000) => {
    if (!apiKey) return null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (aiVendor === 'gemini') {
        const preferredModel = (aiModel && !aiModel.includes('2.5')) ? aiModel : 'gemini-2.0-flash';
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${preferredModel}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.9 }
          })
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const json = await res.json();
          const raw = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          return parseJsonSafely(raw);
        }
      } else {
        let endpoint = 'https://api.openai.com/v1/chat/completions';
        if (aiVendor === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        else if (aiVendor === 'deepseek') endpoint = 'https://api.deepseek.com/chat/completions';
        else if (aiVendor === 'xai') endpoint = 'https://api.x.ai/v1/chat/completions';

        const effectiveModel = aiModel || (DEFAULT_VENDOR_MODELS[aiVendor]?.[0]?.id || 'llama-3.3-70b-versatile');
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: effectiveModel,
            messages: [{ role: 'user', content: promptText }],
            temperature: 0.9,
            response_format: { type: 'json_object' }
          })
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const json = await res.json();
          const raw = json.choices?.[0]?.message?.content || '';
          return parseJsonSafely(raw);
        }
      }
    } catch (e) {
      console.warn('callAiSingleField error:', e.message);
    } finally {
      clearTimeout(timeoutId);
    }
    return null;
  };

  const parseJsonSafely = (raw) => {
    if (!raw) return null;
    try {
      let clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const b1 = clean.indexOf('{');
      const b2 = clean.lastIndexOf('}');
      if (b1 !== -1 && b2 !== -1) clean = clean.substring(b1, b2 + 1);
      return JSON.parse(clean);
    } catch (e) {
      return null;
    }
  };

  // 1. Regenerate Meaning (TH)
  const regenerateMeaning = async () => {
    const target = (word || '').trim();
    if (!target) {
      showToast(lang === 'th' ? 'กรุณาระบุคำศัพท์ก่อน' : 'Please specify a word');
      return;
    }
    setIsRegenerating((prev) => ({ ...prev, meaning: true }));
    try {
      const res = await regenerateMeaningApi({
        word: target,
        currentMeaning: meaning,
        apiKey,
        aiVendor,
        aiModel
      });
      if (res && res.meaning && res.meaning !== meaning) {
        setMeaning(res.meaning);
        showToast(lang === 'th' ? `สร้างคำแปลใหม่: "${res.meaning}"` : `New meaning generated`);
        return;
      }

      // Fallback from dictionary / curated
      const fresh = await fetchDictionaryDetails(target, { shuffle: true });
      if (fresh && fresh.meaning && fresh.meaning !== meaning) {
        setMeaning(fresh.meaning);
        showToast(lang === 'th' ? `อัปเดตคำแปลใหม่: "${fresh.meaning}"` : `Meaning updated`);
      } else {
        showToast(lang === 'th' ? 'คำแปลปัจจุบันเหมาะสมแล้ว' : 'Current meaning is optimal');
      }
    } catch (e) {
      showToast(lang === 'th' ? 'เกิดข้อผิดพลาดในการสร้างคำแปล' : 'Error regenerating meaning');
    } finally {
      setIsRegenerating((prev) => ({ ...prev, meaning: false }));
    }
  };

  // 2. Regenerate Grammar Formula (from Selected Movie Clip)
  const regenerateGrammar = async () => {
    const target = (word || '').trim();
    if (!target) {
      showToast(lang === 'th' ? 'กรุณาระบุคำศัพท์ก่อน' : 'Please specify a word');
      return;
    }
    setIsRegenerating((prev) => ({ ...prev, grammar: true }));
    try {
      const res = await regenerateGrammarApi({
        word: target,
        meaning,
        primaryClip: activeClipSequence[0] || cafeClipPool[0],
        currentGrammar: grammar,
        apiKey,
        aiVendor,
        aiModel
      });
      if (res && res.grammar) {
        setGrammar(stripEmojis(sanitizeGrammarFormula(res.grammar, target)));
        showToast(lang === 'th' ? `แกะโครงสร้างประโยคจากหนังเรียบร้อย!` : `Grammar pattern updated`);
      } else {
        showToast(lang === 'th' ? 'ไวยากรณ์ปัจจุบันพร้อมใช้งานแล้ว' : 'Grammar ready');
      }
    } catch (e) {
      showToast(lang === 'th' ? 'เกิดข้อผิดพลาดในการสร้างไวยากรณ์' : 'Error regenerating grammar');
    } finally {
      setIsRegenerating((prev) => ({ ...prev, grammar: false }));
    }
  };

  // 3. Regenerate Example 1 (Movie Pattern Sentence)
  const regenerateEx1 = async () => {
    const target = (word || '').trim();
    if (!target) {
      showToast(lang === 'th' ? 'กรุณาระบุคำศัพท์ก่อน' : 'Please specify a word');
      return;
    }
    setIsRegenerating((prev) => ({ ...prev, ex1: true }));
    try {
      const res = await regenerateExampleApi({
        word: target,
        meaning,
        grammar,
        index: 1,
        currentEn: ex1En,
        currentTh: ex1Th,
        otherEn: ex2En,
        primaryClip: activeClipSequence[0] || cafeClipPool[0],
        apiKey,
        aiVendor,
        aiModel
      });
      if (res && (res.exEn || res.ex1En)) {
        const newEn = stripEmojis(res.exEn || res.ex1En);
        const newTh = stripEmojis(res.exTh || res.ex1Th);
        setEx1En(newEn);
        if (newTh) setEx1Th(newTh);
        showToast(lang === 'th' ? `แต่งประโยคตามโครงสร้างหนังใหม่เรียบร้อย!` : `Movie pattern sentence regenerated!`);
      } else {
        const variety = getNextSentenceVariety(target, ex1En, activeClipSequence[0] || cafeClipPool[0]);
        if (variety && variety.ex1En) {
          setEx1En(stripEmojis(variety.ex1En));
          if (variety.ex1Th) setEx1Th(stripEmojis(variety.ex1Th));
          showToast(lang === 'th' ? `อัปเดตประโยคตามโครงสร้างหนังเรียบร้อย!` : `Example 1 updated!`);
        }
      }
    } catch (e) {
      showToast(lang === 'th' ? 'เกิดข้อผิดพลาดในการสร้างประโยคที่ 1' : 'Error regenerating ex 1');
    } finally {
      setIsRegenerating((prev) => ({ ...prev, ex1: false }));
    }
  };

  // 4. Regenerate Example 2 (Freestyle Sentence)
  const regenerateEx2 = async () => {
    const target = (word || '').trim();
    if (!target) {
      showToast(lang === 'th' ? 'กรุณาระบุคำศัพท์ก่อน' : 'Please specify a word');
      return;
    }
    setIsRegenerating((prev) => ({ ...prev, ex2: true }));
    try {
      const res = await regenerateExampleApi({
        word: target,
        meaning,
        grammar,
        index: 2,
        currentEn: ex2En,
        currentTh: ex2Th,
        otherEn: ex1En,
        primaryClip: activeClipSequence[0] || cafeClipPool[0],
        apiKey,
        aiVendor,
        aiModel
      });
      if (res && (res.exEn || res.ex2En)) {
        const newEn = stripEmojis(res.exEn || res.ex2En);
        const newTh = stripEmojis(res.exTh || res.ex2Th);
        setEx2En(newEn);
        if (newTh) setEx2Th(newTh);
        showToast(lang === 'th' ? `แต่งประโยคอิสระใหม่เรียบร้อย!` : `Freestyle sentence regenerated!`);
      } else {
        const variety = getNextSentenceVariety(target, ex2En, activeClipSequence[0] || cafeClipPool[0]);
        if (variety && variety.ex2En) {
          setEx2En(stripEmojis(variety.ex2En));
          if (variety.ex2Th) setEx2Th(stripEmojis(variety.ex2Th));
          showToast(lang === 'th' ? `อัปเดตประโยคอิสระเรียบร้อย!` : `Example 2 updated!`);
        }
      }
    } catch (e) {
      showToast(lang === 'th' ? 'เกิดข้อผิดพลาดในการสร้างประโยคที่ 2' : 'Error regenerating ex 2');
    } finally {
      setIsRegenerating((prev) => ({ ...prev, ex2: false }));
    }
  };

  // 5. Regenerate Phonetic & Thai Reading
  const regeneratePhonetic = async () => {
    const target = (word || '').trim();
    if (!target) {
      showToast(lang === 'th' ? 'กรุณาระบุคำศัพท์ก่อน' : 'Please specify a word');
      return;
    }
    setIsRegenerating((prev) => ({ ...prev, phonetic: true }));
    try {
      const res = await regeneratePhoneticApi({
        word: target,
        currentPhonetic: phonetic,
        currentThaiRead: thaiRead,
        apiKey,
        aiVendor,
        aiModel
      });
      if (res && (res.phonetic || res.thaiRead)) {
        if (res.phonetic) setPhonetic(stripEmojis(res.phonetic));
        if (res.thaiRead) setThaiRead(stripEmojis(res.thaiRead));
        showToast(lang === 'th' ? `อัปเดตคำอ่านและสัทอักษรเรียบร้อย!` : `Phonetic & Thai reading updated!`);
      }
    } catch (e) {
      showToast(lang === 'th' ? 'เกิดข้อผิดพลาดในการสร้างคำอ่าน' : 'Error regenerating phonetic');
    } finally {
      setIsRegenerating((prev) => ({ ...prev, phonetic: false }));
    }
  };

  // 6. Regenerate Social Caption (Supports 'educational' & 'viral' styles, includes ALL selected movie quotes EN+TH and #channel, STRICTLY NO EMOJIS)
  const regenerateCaption = async (overrideStyle = null) => {
    const target = (word || '').trim();
    const activeStyle = typeof overrideStyle === 'string' ? overrideStyle : captionStyle;
    if (!target) {
      showToast(lang === 'th' ? 'กรุณาระบุคำศัพท์ก่อน' : 'Please specify a word');
      return;
    }
    setIsRegenerating((prev) => ({ ...prev, caption: true }));
    const currentPrimaryClip = activeClipSequence[0] || cafeClipPool[0] || null;
    try {
      const res = await regenerateCaptionApi({
        word: target,
        meaning,
        grammar,
        primaryClip: currentPrimaryClip,
        clipsList: activeClipSequence.length > 0 ? activeClipSequence : (currentPrimaryClip ? [currentPrimaryClip] : []),
        channel,
        style: activeStyle,
        apiKey,
        aiVendor,
        aiModel
      });
      if (res && (res.caption || res.socialCaption)) {
        setCaption(
          formatCompleteSocialCaption({
            baseCaption: res.caption || res.socialCaption,
            word: target,
            meaning,
            primaryClip: currentPrimaryClip,
            clipsList: activeClipSequence.length > 0 ? activeClipSequence : (currentPrimaryClip ? [currentPrimaryClip] : []),
            channel,
            captionStyle: activeStyle
          })
        );
        showToast(lang === 'th' ? `สร้างแคปชันใหม่เรียบร้อย!` : `Caption regenerated!`);
      } else {
        setCaption(
          formatCompleteSocialCaption({
            baseCaption: '',
            word: target,
            meaning,
            primaryClip: currentPrimaryClip,
            clipsList: activeClipSequence.length > 0 ? activeClipSequence : (currentPrimaryClip ? [currentPrimaryClip] : []),
            channel,
            captionStyle: activeStyle
          })
        );
        showToast(lang === 'th' ? `อัปเดตแคปชันตามสไตล์ที่เลือกเรียบร้อย!` : `Caption updated!`);
      }
    } catch (e) {
      showToast(lang === 'th' ? 'เกิดข้อผิดพลาดในการสร้างแคปชัน' : 'Error regenerating caption');
    } finally {
      setIsRegenerating((prev) => ({ ...prev, caption: false }));
    }
  };

  const playAllClipsWithPython = async () => {
    if (!activeClipSequence.length) {
      showToast(lang === 'th' ? 'กรุณาเลือกคลิปหนังเข้าคิวก่อน' : 'Please select clips first');
      return;
    }
    showToast(lang === 'th' ? `กำลังเล่นคิวคลิป ${activeClipSequence.length} เรื่องต่อเนื่อง...` : `Playing ${activeClipSequence.length} clips...`);
    setCurrentSequenceIndex(0);
    setIsPlayingVideo(true);
    setPlayTrigger((prev) => prev + 1);
  };

  const value = {
    // Vocab
    word, setWord, updateWord,
    phonetic, setPhonetic,
    thaiRead, setThaiRead,
    meaning, setMeaning,
    grammar, setGrammar,
    movieContextTh, setMovieContextTh,
    ex1En, setEx1En,
    ex1Th, setEx1Th,
    ex2En, setEx2En,
    ex2Th, setEx2Th,

    // Clips
    activeClipSequence, setActiveClipSequence,
    cafeClipPool, setCafeClipPool,
    isPlayingVideo, setIsPlayingVideo,
    currentSequenceIndex, setCurrentSequenceIndex,
    playTrigger,
    isLoadingMoreClips,
    toggleSelectClip, reorderClip, removeClip, searchClips, loadMoreCafeClips,
    playAllClipsWithPython,

    // Canvas (Solid color, no gradient, no backdrop blur)
    clipAspectRatio, setClipAspectRatio,
    bgColor, setBgColor,
    bgColor1, setBgColor1,
    bgColor2, setBgColor2,
    useMovieBackdrop, setUseMovieBackdrop,
    bgBlur, setBgBlur,
    bgOverlayOpacity, setBgOverlayOpacity,
    elementPositions, setElementPositions,
    updateElementPosition, resetElementPositions,
    textFormat, setTextFormat, resetTextFormat,
    activeFormatTarget, setActiveFormatTarget,
    updateTextFormat, resetItemTextFormat,
    clearVocabData,
    cleanCache,

    // Profile
    channel, setChannel,
    avatar, setAvatar,
    caption, setCaption,
    captionStyle, setCaptionStyle,

    // AI
    aiVendor, setAiVendor,
    aiModel, setAiModel,
    apiKey, setApiKey,
    availableModels, setAvailableModels,
    generateAiContent,
    randomWordWithAi,
    craftSentencesFromSelectedClip,
    isCraftingSentences,

    // Theme & I18N
    theme, toggleTheme,
    lang, toggleLanguage,
    t: I18N[lang] || I18N.th,

    // Collapsible & Section Jumps
    collapsedSections, toggleToolCard, toggleAllToolSections, jumpToToolSection,
    resetToInitialState,

    // History & Version Control (Undo / Redo)
    undo,
    redo,
    canUndo,
    canRedo,
    pushHistorySnapshot,

    // UI Helpers
    isLoading, loadingText,
    toastMessage, isToastVisible, showToast,
    dialogState, showCustomDialog, closeCustomDialog,
    isExportModalOpen, setIsExportModalOpen,
    toolSearch, setToolSearch,

    // Selection Formatting
    activeSelection, setActiveSelection,
    applySelectionFormat, clearSelectionFormat,

    // Per-item Regeneration
    isRegenerating,
    regeneratePhonetic,
    regenerateMeaning,
    regenerateGrammar,
    regenerateEx1,
    regenerateEx2,
    regenerateCaption
  };

  return <VocabContext.Provider value={value}>{children}</VocabContext.Provider>;
}

export function useVocab() {
  const ctx = useContext(VocabContext);
  if (!ctx) throw new Error('useVocab must be used within a VocabProvider');
  return ctx;
}
