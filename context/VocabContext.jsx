'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  STORAGE_KEY,
  CURATED_RANDOM_WORDS,
  ASPECT_RATIO_CONFIG,
  VENDOR_LABELS,
  DEFAULT_VENDOR_MODELS,
  I18N,
  getNextSentenceVariety
} from '../lib/constants';

const VocabContext = createContext(null);

export function VocabProvider({ children }) {
  // Core Vocab State
  const [word, setWord] = useState('break a leg');
  const [phonetic, setPhonetic] = useState('/breɪk ə leɡ/');
  const [thaiRead, setThaiRead] = useState('(เบรค อะ เลก)');
  const [meaning, setMeaning] = useState('ขอให้โชคดี (นิยมใช้ก่อนขึ้นเวทีแสดง)');
  const [grammar, setGrammar] = useState('S + wish + [Someone] + to + break a leg → อวยพรให้โชคดี');
  const [movieContextTh, setMovieContextTh] = useState('');
  const [ex1En, setEx1En] = useState('Go out there and break a leg!');
  const [ex1Th, setEx1Th] = useState('ออกไปทำให้เต็มที่ ขอให้โชคดีนะ!');
  const [ex2En, setEx2En] = useState('Break a leg on your test today.');
  const [ex2Th, setEx2Th] = useState('ขอให้ทำข้อสอบได้คะแนนดีๆ โชคดีนะ');

  // Video Clips & Playback
  const [activeClipSequence, setActiveClipSequence] = useState([]);
  const [cafeClipPool, setCafeClipPool] = useState([]);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [clipPage, setClipPage] = useState(1);
  const [isLoadingMoreClips, setIsLoadingMoreClips] = useState(false);

  // Design & Canvas Settings
  const [clipAspectRatio, setClipAspectRatio] = useState('9:16');
  const [bgColor1, setBgColor1] = useState('#fafafa');
  const [bgColor2, setBgColor2] = useState('#fafafa');

  // Social Profile
  const [channel, setChannel] = useState('@MoovyEng');
  const [avatar, setAvatar] = useState('');
  const [caption, setCaption] = useState('สำนวน Break a leg แปลว่า ขอให้โชคดี นิยมใช้ให้กำลังใจก่อนขึ้นแสดงหรือทำภารกิจสำคัญ #ภาษาอังกฤษ #MoovyEng');

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
  const [collapsedSections, setCollapsedSections] = useState({});

  // Custom Dialog
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: 'ยืนยันการดำเนินการ',
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
  const showCustomDialog = ({ title = 'ยืนยันการดำเนินการ', message = '', showCancel = true, icon = 'fa-triangle-exclamation', onConfirm = null } = {}) => {
    setDialogState({
      isOpen: true,
      title,
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
        if (d.grammar) setGrammar(d.grammar);
        if (d.movieContextTh) setMovieContextTh(d.movieContextTh);
        if (d.ex1En) setEx1En(d.ex1En);
        if (d.ex1Th) setEx1Th(d.ex1Th);
        if (d.ex2En) setEx2En(d.ex2En);
        if (d.ex2Th) setEx2Th(d.ex2Th);
        if (d.clipAspectRatio) setClipAspectRatio(d.clipAspectRatio);
        if (d.bgColor1) setBgColor1(d.bgColor1);
        if (d.bgColor2) setBgColor2(d.bgColor2);
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
        channel,
        avatar,
        caption,
        aiVendor,
        aiModel,
        apiKey,
        selectedClipsSequence: activeClipSequence,
        cafeClipPool: cafeClipPool
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [
    word, phonetic, thaiRead, meaning, grammar, movieContextTh,
    ex1En, ex1Th, ex2En, ex2Th, clipAspectRatio, bgColor1, bgColor2,
    channel, avatar, caption, aiVendor, aiModel, apiKey,
    activeClipSequence, cafeClipPool
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
        setWord('break a leg');
        setPhonetic('/breɪk ə leɡ/');
        setThaiRead('(เบรค อะ เลก)');
        setMeaning('ขอให้โชคดี (นิยมใช้ก่อนขึ้นเวทีแสดง)');
        setGrammar('S + wish + [Someone] + to + break a leg → อวยพรให้โชคดี');
        setEx1En('Go out there and break a leg!');
        setEx1Th('ออกไปทำให้เต็มที่ ขอให้โชคดีนะ!');
        setEx2En('Break a leg on your test today.');
        setEx2Th('ขอให้ทำข้อสอบได้คะแนนดีๆ โชคดีนะ');
        setBgColor1('#fafafa');
        setBgColor2('#fafafa');
        setClipAspectRatio('9:16');
        setActiveClipSequence([]);
        setCafeClipPool([]);
        localStorage.removeItem(STORAGE_KEY);
        showToast(lang === 'th' ? 'รีเซ็ตข้อมูลเรียบร้อยแล้ว' : 'All data reset');
      }
    });
  };

  // Clip Selection & Reordering
  const toggleSelectClip = (clip) => {
    setActiveClipSequence((prev) => {
      const idx = prev.findIndex((c) => c.id === clip.id);
      if (idx !== -1) {
        if (prev.length > 1) {
          return prev.filter((_, i) => i !== idx);
        }
        showToast(lang === 'th' ? 'เลือกคลิปนี้อยู่แล้วในลำดับที่ 1' : 'Already selected as clip 1');
        return prev;
      }
      return [...prev, clip];
    });
  };

  const reorderClip = (index, direction) => {
    setActiveClipSequence((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const removeClip = (index) => {
    setActiveClipSequence((prev) => prev.filter((_, i) => i !== index));
  };

  // Search Clips from Backend / Clip.cafe
  const searchClips = async (targetWord = word, reset = true) => {
    const query = (targetWord || '').trim();
    if (!query) {
      showToast(lang === 'th' ? 'กรุณาพิมพ์คำศัพท์ที่ต้องการค้นหาคลิปก่อน' : 'Please enter a word to search');
      return;
    }

    setIsLoading(true);
    setLoadingText(lang === 'th' ? `กำลังดึงคลิปหนังภาษาอังกฤษสำหรับ "${query}"...` : `Searching English clips for "${query}"...`);

    try {
      const resp = await fetch(`/api/cafe/search?q=${encodeURIComponent(query)}&page=1`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && Array.isArray(data.clips) && data.clips.length > 0) {
          setCafeClipPool(data.clips);
          setClipPage(1);
          if (reset || activeClipSequence.length === 0) {
            setActiveClipSequence([data.clips[0]]);
          }
          showToast(lang === 'th' ? `พบคลิปหนังภาษาอังกฤษ ${data.clips.length} คลิป` : `Found ${data.clips.length} movie clips`);
          return data.clips;
        }
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

  // AI Content Generation
  const generateAiContent = async (customWord = word) => {
    const targetWord = (customWord || word).trim();
    if (!targetWord) {
      showToast(lang === 'th' ? 'กรุณาพิมพ์คำศัพท์ภาษาอังกฤษก่อน' : 'Please enter an English word');
      return;
    }

    if (!apiKey) {
      showToast(lang === 'th' ? 'กรุณาระบุ API Key ก่อนเรียกใช้งาน AI' : 'Please provide an API Key first');
      return;
    }

    setIsLoading(true);
    setLoadingText(lang === 'th' ? `AI กำลังวิเคราะห์และแต่งประโยคสำหรับ "${targetWord}"...` : `AI is generating sentences for "${targetWord}"...`);

    try {
      let currentClips = cafeClipPool;
      if (currentClips.length === 0) {
        currentClips = (await searchClips(targetWord, true)) || [];
      }

      const primaryClip = activeClipSequence[0] || currentClips[0] || null;

      const prompt = `You are an elite English tutor creating viral educational flashcards for Thai students.
Analyze this English word/phrase: "${targetWord}".
${primaryClip ? `Real movie context: "${primaryClip.title}" quote: "${primaryClip.quote || ''}"` : ''}

CRITICAL RULES:
1. Provide EXACTLY 2 example sentences ("ex1En" and "ex2En"). DO NOT provide a 3rd sentence!
2. Each English example sentence MUST be VERY SHORT (4 to 7 words maximum), super punchy, simple, and unforgettable (ขอประโยคที่ง่ายและสั้น 2 ประโยค เน้นจำฝังหัว)!
3. Grammar formula ("grammar"): Write a concise 1-line formula using "S" for Subject (e.g. S + Verb to be + ${targetWord} → แปลว่า...). NEVER use the words "Subject", "[Subject]", "โครงสร้าง", or "ตัวอย่าง". No emojis!
4. Thai translations ("ex1Th", "ex2Th") MUST be short, direct, and natural.
5. "socialCaption": Short Thai caption teaching ${targetWord} with relevant hashtags (#MoovyEng).

Respond with ONLY valid JSON with no markdown formatting:
{
  "phonetic": "/.../ (IPA format)",
  "thaiRead": "(คำอ่านออกเสียงภาษาไทย)",
  "meaning": "คำแปลความหมายภาษาไทยสั้นกระชับ",
  "grammar": "S + [verb/phrase] → คำอธิบายสั้นๆ 1 บรรทัด",
  "ex1En": "Very short sentence 1 (4-7 words)",
  "ex1Th": "คำแปลไทยสั้นกระชับ",
  "ex2En": "Very short sentence 2 (4-7 words)",
  "ex2Th": "คำแปลไทยสั้นกระชับ",
  "socialCaption": "แคปชั่นสอนคำศัพท์ ${targetWord} สั้นกระชับ พร้อมแฮชแท็ก"
}`;

      let rawText = '';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      if (aiVendor === 'gemini') {
        const geminiModel = (aiModel && !aiModel.includes('2.5')) ? aiModel : 'gemini-2.0-flash';
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.85 }
          })
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`Gemini API HTTP ${res.status}`);
        const json = await res.json();
        rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.85,
            response_format: { type: 'json_object' }
          })
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`${aiVendor} HTTP ${res.status}`);
        const json = await res.json();
        rawText = json.choices?.[0]?.message?.content || '';
      }

      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        rawText = rawText.substring(firstBrace, lastBrace + 1);
      }
      const parsed = JSON.parse(rawText);

      if (parsed.phonetic) setPhonetic(parsed.phonetic);
      if (parsed.thaiRead) setThaiRead(parsed.thaiRead);
      if (parsed.meaning) setMeaning(parsed.meaning);
      if (parsed.grammar) setGrammar(parsed.grammar);
      if (parsed.ex1En) setEx1En(parsed.ex1En);
      if (parsed.ex1Th) setEx1Th(parsed.ex1Th);
      if (parsed.ex2En) setEx2En(parsed.ex2En);
      if (parsed.ex2Th) setEx2Th(parsed.ex2Th);
      if (parsed.socialCaption) setCaption(parsed.socialCaption);

      showToast(lang === 'th' ? `AI สร้างเนื้อหาสำหรับ "${targetWord}" สำเร็จ!` : `AI generation complete for "${targetWord}"!`);
    } catch (err) {
      console.error('AI generation error:', err);
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

    setWord(picked);
    showToast(`${lang === 'th' ? 'สุ่มได้คำว่า' : 'Selected'}: "${picked}"`);
    await searchClips(picked, true);
    if (apiKey) {
      await generateAiContent(picked);
    }
  };

  // Re-craft 2 Punchy Example Sentences Specifically (Fast, Guaranteed to Change)
  const craftSentencesFromSelectedClip = async () => {
    const targetWord = (word || '').trim();
    if (!targetWord) {
      showToast(lang === 'th' ? 'กรุณาพิมพ์คำศัพท์ภาษาอังกฤษก่อน' : 'Please enter an English word');
      return;
    }

    setIsCraftingSentences(true);

    // If API Key is present, attempt fast targeted AI generation (3.5s timeout)
    if (apiKey) {
      try {
        const primaryClip = activeClipSequence[0] || cafeClipPool[0] || null;
        const prompt = `You are an elite English tutor for Thai learners.
Target phrase/word: "${targetWord}"
${primaryClip ? `Real movie context: "${primaryClip.title}" Quote: "${primaryClip.quote || ''}"` : ''}

TASK: Provide 2 FRESH, PUNCHY, VERY SHORT example sentences (4 to 7 words maximum each) using "${targetWord}".
CRITICAL: DO NOT repeat these previous sentences:
1. "${ex1En}"
2. "${ex2En}"
Give completely NEW, exciting, and memorable examples!

Respond with ONLY valid JSON:
{
  "ex1En": "Sentence 1 (4-7 words)",
  "ex1Th": "คำแปลไทยสั้นกระชับ",
  "ex2En": "Sentence 2 (4-7 words)",
  "ex2Th": "คำแปลไทยสั้นกระชับ"
}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        let raw = '';
        if (aiVendor === 'gemini') {
          const gemModel = (aiModel && !aiModel.includes('2.5')) ? aiModel : 'gemini-2.0-flash';
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${gemModel}:generateContent?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.95 }
            })
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.95,
              response_format: { type: 'json_object' }
            })
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            raw = data.choices?.[0]?.message?.content || '';
          }
        }

        if (raw) {
          raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
          const b1 = raw.indexOf('{');
          const b2 = raw.lastIndexOf('}');
          if (b1 !== -1 && b2 !== -1) raw = raw.substring(b1, b2 + 1);
          const parsed = JSON.parse(raw);
          if (parsed.ex1En && parsed.ex2En && parsed.ex1En !== ex1En) {
            setEx1En(parsed.ex1En);
            if (parsed.ex1Th) setEx1Th(parsed.ex1Th);
            setEx2En(parsed.ex2En);
            if (parsed.ex2Th) setEx2Th(parsed.ex2Th);
            showToast(lang === 'th' ? `AI แต่งประโยคใหม่สำหรับ "${targetWord}" สำเร็จ!` : `New examples generated for "${targetWord}"!`);
            setIsCraftingSentences(false);
            return;
          }
        }
      } catch (e) {
        console.warn('AI sentence craft fallback to curated variety:', e.message);
      }
    }

    // Instant Curated Variety (Guaranteed to change, instant response < 50ms)
    const variety = getNextSentenceVariety(targetWord, ex1En, activeClipSequence[0] || cafeClipPool[0]);
    setEx1En(variety.ex1En);
    setEx1Th(variety.ex1Th);
    setEx2En(variety.ex2En);
    setEx2Th(variety.ex2Th);
    showToast(lang === 'th' ? `แต่งประโยคตัวอย่างใหม่เรียบร้อย!` : `New punchy examples generated!`);
    setIsCraftingSentences(false);
  };

  const playAllClipsWithPython = async () => {
    if (!activeClipSequence.length) {
      showToast(lang === 'th' ? 'กรุณาเลือกคลิปหนังเข้าคิวก่อน' : 'Please select clips first');
      return;
    }
    showToast(lang === 'th' ? `กำลังสั่งเล่นคิวคลิป ${activeClipSequence.length} เรื่อง...` : `Playing ${activeClipSequence.length} clips...`);
    setIsPlayingVideo(true);
    setCurrentSequenceIndex(0);
  };

  const value = {
    // Vocab
    word, setWord,
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
    isLoadingMoreClips,
    toggleSelectClip, reorderClip, removeClip, searchClips, loadMoreCafeClips,
    playAllClipsWithPython,

    // Canvas
    clipAspectRatio, setClipAspectRatio,
    bgColor1, setBgColor1,
    bgColor2, setBgColor2,

    // Profile
    channel, setChannel,
    avatar, setAvatar,
    caption, setCaption,

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

    // UI Helpers
    isLoading, loadingText,
    toastMessage, isToastVisible, showToast,
    dialogState, showCustomDialog, closeCustomDialog,
    isExportModalOpen, setIsExportModalOpen,
    toolSearch, setToolSearch
  };

  return <VocabContext.Provider value={value}>{children}</VocabContext.Provider>;
}

export function useVocab() {
  const ctx = useContext(VocabContext);
  if (!ctx) throw new Error('useVocab must be used within a VocabProvider');
  return ctx;
}
