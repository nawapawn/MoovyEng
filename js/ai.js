/**
 * ============================================================================
 * MoovyEng — AI Provider Detect, Model Fetch & Context Prompt Engine
 * ============================================================================
 */

function handleVendorChange() {
  const key = document.getElementById('api-key')?.value.trim();
  const wrapper = document.getElementById('model-selector-wrapper');
  if (wrapper) wrapper.classList.add('hidden');
  if (typeof syncFromDesktopForm === 'function') syncFromDesktopForm();
  if (key) {
    detectProviderAndFetchModels(key);
  }
}

function handleApiKeyInput(val) {
  if (typeof syncFromDesktopForm === 'function') syncFromDesktopForm();
  if (typeof autoSaveDraft === 'function') autoSaveDraft();
  if (apiKeyDetectTimer) clearTimeout(apiKeyDetectTimer);
  apiKeyDetectTimer = setTimeout(() => {
    detectProviderAndFetchModels(val);
  }, 450);
}

function populateModelSelect(models, preferredModel = '') {
  const wrapper = document.getElementById('model-selector-wrapper');
  const selectEl = document.getElementById('ai-provider');
  const countBadge = document.getElementById('model-count-badge');
  if (!selectEl || !wrapper) return;

  selectEl.innerHTML = '';
  models.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.label || m.id;
    selectEl.appendChild(opt);
  });

  if (models.length > 0) {
    wrapper.classList.remove('hidden');
    if (preferredModel && models.some(m => m.id === preferredModel)) {
      selectEl.value = preferredModel;
    } else {
      selectEl.value = models[0].id;
    }
    if (countBadge) countBadge.textContent = `พบ ${models.length} โมเดล`;
    if (typeof syncFromDesktopForm === 'function') syncFromDesktopForm();
    if (typeof autoSaveDraft === 'function') autoSaveDraft();
  } else {
    wrapper.classList.add('hidden');
    if (countBadge) countBadge.textContent = '';
  }
}

async function detectProviderAndFetchModels(rawKey, preferredModel = '') {
  const key = (rawKey || '').trim();
  const vendorSelect = document.getElementById('ai-vendor');
  const badge = document.getElementById('detected-provider-badge');
  const statusEl = document.getElementById('openrouter-status');
  const wrapper = document.getElementById('model-selector-wrapper');

  if (!key) {
    detectedProviderType = '';
    if (wrapper) wrapper.classList.add('hidden');
    if (badge) {
      badge.textContent = 'Ready';
      badge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-[#f0efed] text-[#777169] font-semibold uppercase tracking-wider';
    }
    if (statusEl) statusEl.textContent = '';
    return;
  }

  if (vendorSelect) {
    if (key.startsWith('AIza') || key.startsWith('AQ.')) vendorSelect.value = 'gemini';
    else if (key.startsWith('gsk_')) vendorSelect.value = 'groq';
    else if (key.startsWith('sk-ant-')) vendorSelect.value = 'anthropic';
    else if (key.startsWith('xai-')) vendorSelect.value = 'xai';
  }

  const vendor = vendorSelect ? vendorSelect.value : 'gemini';
  const vendorName = VENDOR_LABELS[vendor] || vendor.toUpperCase();

  if (badge) {
    badge.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-1"></i>กำลังตรวจคีย์ ${vendorName}...`;
    badge.className = 'text-[10px] px-2.5 py-0.5 rounded-full bg-[#f0efed] text-[#0c0a09] font-semibold uppercase tracking-wider';
  }
  if (statusEl) {
    statusEl.textContent = `กำลังตรวจสอบ API Key และดึงโมเดลจาก ${vendorName}...`;
  }

  try {
    let models = [];

    if (vendor === 'gemini') {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${resp.status}`);
      }
      const json = await resp.json();
      const priorityIds = [
        'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview',
        'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest', 'gemma-4-31b-it', 'gemini-flash-latest',
        'gemini-2.5-flash', 'gemini-2.5-pro'
      ];
      models = (json.models || [])
        .filter(m => {
          const methods = m.supportedGenerationMethods || [];
          const id = (m.name || '').replace(/^models\//, '');
          if (!methods.includes('generateContent')) return false;
          if (id.includes('tts') || id.includes('image') || id.includes('banana') || id.includes('lyria') || id.includes('transcribe') || id.includes('robotics') || id.includes('computer-use')) return false;
          return true;
        })
        .map(m => {
          const cleanId = m.name.replace(/^models\//, '');
          return { id: cleanId, label: `${cleanId} — ${m.displayName || cleanId}` };
        })
        .sort((a, b) => {
          const idxA = priorityIds.indexOf(a.id);
          const idxB = priorityIds.indexOf(b.id);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.id.localeCompare(b.id);
        });
    } else if (vendor === 'openai') {
      const resp = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${resp.status}`);
      }
      const json = await resp.json();
      const all = json.data || [];
      const filtered = all.filter(m => m.id.startsWith('gpt-') || m.id.startsWith('o1') || m.id.startsWith('o3') || m.id.startsWith('o4') || m.id.startsWith('chatgpt-'));
      models = (filtered.length > 0 ? filtered : all)
        .sort((a, b) => (b.created || 0) - (a.created || 0))
        .map(m => ({ id: m.id, label: m.id }));
    } else if (vendor === 'deepseek') {
      const resp = await fetch('https://api.deepseek.com/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${resp.status}`);
      }
      const json = await resp.json();
      models = (json.data || []).map(m => ({ id: m.id, label: m.id }));
    } else if (vendor === 'groq') {
      const resp = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${resp.status}`);
      }
      const json = await resp.json();
      models = (json.data || []).map(m => ({ id: m.id, label: m.id }));
    } else if (vendor === 'anthropic') {
      const resp = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        }
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${resp.status}`);
      }
      const json = await resp.json();
      models = (json.data || []).map(m => ({ id: m.id, label: `${m.id} — ${m.display_name || m.id}` }));
    } else if (vendor === 'xai') {
      const resp = await fetch('https://api.x.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${resp.status}`);
      }
      const json = await resp.json();
      models = (json.data || []).map(m => ({ id: m.id, label: m.id }));
    } else if (vendor === 'mistral') {
      const resp = await fetch('https://api.mistral.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${resp.status}`);
      }
      const json = await resp.json();
      models = (json.data || []).map(m => ({ id: m.id, label: m.id }));
    }

    if (models.length === 0) {
      throw new Error('ไม่พบโมเดลที่รองรับจาก API Key นี้');
    }

    detectedProviderType = vendor;
    if (badge) {
      badge.textContent = `${vendorName}`;
      badge.className = 'text-[10px] px-2.5 py-0.5 rounded-full bg-[#0c0a09] text-white font-semibold uppercase tracking-wider';
    }
    if (statusEl) {
      statusEl.textContent = `เชื่อมต่อ ${vendorName} สำเร็จ (พบ ${models.length} โมเดล)`;
    }
    populateModelSelect(models, preferredModel);
  } catch (err) {
    console.error('Fetch models error:', err);
    detectedProviderType = '';
    if (badge) {
      badge.textContent = 'Key Error';
      badge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold uppercase tracking-wider';
    }
    if (statusEl) {
      statusEl.textContent = `ตรวจสอบคีย์ ${vendorName} ไม่สำเร็จ: ${err.message}`;
    }
    if (wrapper) wrapper.classList.add('hidden');
  }
}

async function invokeSelectedAiModel(prompt, statusEl) {
  const vendorSelect = document.getElementById('ai-vendor');
  const vendor = vendorSelect ? vendorSelect.value : (detectedProviderType || 'gemini');
  const apiKey = document.getElementById('api-key')?.value.trim();
  const modelSelect = document.getElementById('ai-provider');
  const model = modelSelect ? modelSelect.value : '';

  if (!apiKey) throw new Error('กรุณาระบุ API Key');
  if (!model && vendor !== 'gemini') throw new Error('กรุณาเลือกโมเดล AI ก่อนใช้งาน');

  let rawContent = '';

  if (vendor === 'gemini') {
    const targetModel = model || 'gemini-3.8-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini API HTTP ${resp.status}`);
    }
    const resJson = await resp.json();
    rawContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else if (vendor === 'anthropic') {
    const endpoint = 'https://api.anthropic.com/v1/messages';
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-haiku-latest',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic HTTP ${resp.status}`);
    }
    const resJson = await resp.json();
    rawContent = resJson.content?.[0]?.text || '';
  } else {
    let baseUrl = 'https://api.openai.com/v1/chat/completions';
    if (vendor === 'deepseek') baseUrl = 'https://api.deepseek.com/chat/completions';
    else if (vendor === 'groq') baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    else if (vendor === 'xai') baseUrl = 'https://api.x.ai/v1/chat/completions';
    else if (vendor === 'mistral') baseUrl = 'https://api.mistral.ai/v1/chat/completions';

    const resp = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error?.message || `${vendor.toUpperCase()} API HTTP ${resp.status}`);
    }
    const resJson = await resp.json();
    rawContent = resJson.choices?.[0]?.message?.content || '';
  }

  rawContent = rawContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const firstBrace = rawContent.indexOf('{');
  const lastBrace = rawContent.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    rawContent = rawContent.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(rawContent);
}

function buildMovieContextualPrompt(word, primaryClip, otherClips = []) {
  const hasClip = primaryClip && primaryClip.title;
  const clipSection = hasClip
    ? `Real movie context: "${primaryClip.title}" quote: "${primaryClip.quote || primaryClip.fullTranscript || word}"`
    : '';

  return `You are an elite English tutor creating viral educational flashcards for Thai students.
Analyze this English word/phrase: "${word}".
${clipSection}

CRITICAL RULES:
1. Provide EXACTLY 2 example sentences ("ex1En" and "ex2En"). DO NOT provide a 3rd sentence!
2. Each English example sentence MUST be VERY SHORT (4 to 7 words maximum), super punchy, simple, and unforgettable (ขอประโยคที่ง่ายและสั้น 2 ประโยค เน้นจำฝังหัว)!
3. Grammar formula / Usage rule ("grammar"):
CRITICAL GOAL: Teach the grammatical structure, part of speech, or sentence syntax for "${word}".
[FORBIDDEN] STRICTLY PROHIBITED:
- NEVER output just the word itself (e.g. "${word}")!
- NEVER output just the word with its Thai translation in parentheses (e.g. "${word} (คำแปลไทย)")! That is 100% duplicate and forbidden!

[REQUIRED] MUST PROVIDE REAL GRAMMATICAL VALUE:
A) If it is used in a sentence (Verb, Phrasal Verb, Adjective, Noun, Idiom Clause):
- Provide the real sentence construction structure with simple standard placeholders: S, Someone, Something, V.1, V.ing, be + ..., etc.
- If it's an idiom used as a clause or exclamation (e.g. "speak of the devil"): show where it goes in a sentence!
  • Example: Speak of the devil, + S + V  (สำนวนอุทาน: ใช้วางหน้าประโยคเมื่อคนที่เพิ่งพูดถึงเดินเข้ามาพอดี)
  • Example: S + tell Someone to + break a leg  (ใช้อวยพรขอให้โชคดีก่อนขึ้นแสดง/สอบแข่งขัน)
  • Example: Something + is a piece of cake  (ใช้บอกว่าเรื่องนั้นง่ายมากเหมือนปอกกล้วย)
  • Example: S + call off + Something  (Phrasal Verb: ยกเลิกนัดหมายหรือกิจกรรม)
  • Example: be + proud of + Someone/Something  (Adj: ต้องใช้คู่กับ preposition 'of' เสมอ)
  • Example: S + look forward to + V.ing / Something  (กริยาสำนวน: หลัง to ต้องเป็น V.ing เสมอ)

B) If it is a Standalone Expression, Conversational Response, or Slang (where no S+V formula fits):
- Provide the exact usage context in Thai explaining WHEN and HOW to say it:
  • Example for "My bad": [คำอุทานกันเอง] ใช้พูดขอโทษทันทีเมื่อทำผิดพลาดเล็กน้อย (แทน My mistake)
  • Example for "No way": [คำอุทาน] ใช้แสดงความตกใจ ประหลาดใจ หรือปฏิเสธอย่างสิ้นเชิง (ไม่มีทาง/เป็นไปไม่ได้)
  • Example for "Tell me about it": [สำนวนตอบรับ] ใช้เห็นพ้องอย่างแรงกล้าเพราะเคยเจอเรื่องเดียวกัน (นั่นน่ะสิ)
  • Example for "Touché": [คำอุทาน] ใช้ยอมรับเมื่ออีกฝ่ายพูดจี้ใจดำหรือโต้กลับได้อย่างเจ็บแสบ

- ALWAYS keep it to 1 concise line.
- NEVER use emojis.
4. Thai translations ("ex1Th", "ex2Th") MUST be short, direct, and natural.
5. "socialCaption": Short Thai caption teaching ${word} with relevant hashtags (#MoovyEng).

Respond with ONLY valid JSON with no markdown formatting:
{
  "phonetic": "/.../ (IPA format)",
  "thaiRead": "คำอ่านออกเสียงภาษาไทย (ไม่มีวงเล็บ)",
  "meaning": "คำแปลความหมายภาษาไทยสั้นกระชับ",
  "grammar": "โครงสร้างไวยากรณ์ หรือ บริบทการใช้งาน (ตามกฎข้อ 3)",
  "ex1En": "Very short sentence 1 (4-7 words)",
  "ex1Th": "คำแปลไทยสั้นกระชับ",
  "ex2En": "Very short sentence 2 (4-7 words)",
  "ex2Th": "คำแปลไทยสั้นกระชับ",
  "socialCaption": "แคปชั่นสอนคำศัพท์ ${word} สั้นกระชับ พร้อมแฮชแท็ก"
}`;
}

async function runAiAgentGeneration() {
  const word = document.getElementById('target-word')?.value.trim();
  if (!word) {
    showToast('กรุณาพิมพ์คำศัพท์ภาษาอังกฤษก่อน');
    return;
  }

  const apiKey = document.getElementById('api-key')?.value.trim();
  if (!apiKey) {
    showToast('กรุณาใส่ API Key ก่อนเรียกใช้งาน AI');
    document.getElementById('api-key')?.focus();
    return;
  }

  const loadingBox = document.getElementById('ai-loading');
  const loadingText = document.getElementById('ai-loading-text');
  if (loadingBox) loadingBox.classList.remove('hidden');

  try {
    const currentClipQuery = document.getElementById('clip-query')?.value.trim() || '';
    const queryChanged = !currentClipQuery || currentClipQuery.toLowerCase() !== word.toLowerCase();
    if (document.getElementById('clip-query')) {
      document.getElementById('clip-query').value = word;
    }
    if (cafeClipPool.length === 0 || queryChanged) {
      if (loadingText) loadingText.textContent = `กำลังดึงคลิปหนังภาษาอังกฤษ & คำอธิบายเนื้อเรื่องจาก clip.cafe สำหรับ "${word}"...`;
      await searchCafeClips(true);
    }

    const primaryClip = activeClipSequence[0] || cafeClipPool[0] || null;
    const otherClips = cafeClipPool.slice(1, 3);
    const vendor = document.getElementById('ai-vendor')?.value || detectedProviderType || 'gemini';
    const model = document.getElementById('ai-provider')?.value || '';

    if (loadingText) {
      loadingText.textContent = primaryClip
        ? `กำลังแต่งประโยคจากเนื้อเรื่องหนัง "${primaryClip.movieTitle || primaryClip.title}" ด้วย ${VENDOR_LABELS[vendor] || vendor} (${model})...`
        : `กำลังสร้างเนื้อหาด้วย ${VENDOR_LABELS[vendor] || vendor} (${model})...`;
    }

    const prompt = buildMovieContextualPrompt(word, primaryClip, otherClips);
    const aiResult = await invokeSelectedAiModel(prompt, loadingText);

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };
    setVal('res-phonetic', aiResult.phonetic);
    setVal('res-thai-read', aiResult.thaiRead);
    setVal('res-meaning', aiResult.meaning);
    setVal('res-grammar', aiResult.grammar);
    setVal('res-movie-context', aiResult.movieContextTh);
    setVal('res-ex1-en', aiResult.ex1En);
    setVal('res-ex1-th', aiResult.ex1Th);
    setVal('res-ex2-en', aiResult.ex2En);
    setVal('res-ex2-th', aiResult.ex2Th);
    setVal('res-ex3-en', aiResult.ex3En);
    setVal('res-ex3-th', aiResult.ex3Th);
    if (aiResult.socialCaption) {
      setVal('social-description', aiResult.socialCaption);
    }

    updateScrapedMovieContextUI();
    if (typeof syncFromDesktopForm === 'function') syncFromDesktopForm();
    if (typeof updateLiveCardPreview === 'function') updateLiveCardPreview();
    if (typeof autoSaveDraft === 'function') autoSaveDraft();

    showToast(primaryClip
      ? `AI แต่งประโยคสอดคล้องกับหนัง "${primaryClip.movieTitle}" สำเร็จ!`
      : 'AI สร้างเนื้อหาสำเร็จ!');
  } catch (err) {
    console.error('AI API error:', err);
    showToast(`เรียก AI ไม่สำเร็จ: ${err.message}`);
  } finally {
    if (loadingBox) loadingBox.classList.add('hidden');
  }
}

async function craftSentencesFromSelectedClip() {
  const primaryClip = activeClipSequence[0] || cafeClipPool[0];
  if (!primaryClip) {
    showToast('กรุณาค้นหาและเลือกคลิปหนังภาษาอังกฤษก่อน');
    return;
  }
  const word = document.getElementById('target-word')?.value.trim() || document.getElementById('clip-query')?.value.trim();
  if (!word) {
    showToast('กรุณาพิมพ์คำศัพท์ภาษาอังกฤษก่อน');
    return;
  }
  if (document.getElementById('target-word') && !document.getElementById('target-word').value.trim()) {
    document.getElementById('target-word').value = word;
  }
  await runAiAgentGeneration();
}

async function randomWordWithAi() {
  const diceBtn = document.getElementById('btn-random-word');
  const diceIcon = diceBtn ? diceBtn.querySelector('i') : null;
  if (diceIcon) diceIcon.classList.add('spin-active');

  const apiKey = document.getElementById('api-key')?.value.trim();
  let pickedWord = '';

  if (apiKey) {
    try {
      showToast('AI กำลังสุ่มคำศัพท์/สำนวนภาษาอังกฤษ...');
      const prompt = `Give me exactly ONE popular, practical, or viral English idiom, phrasal verb, or slang that Thai learners love to learn. Reply with ONLY the English phrase itself, no punctuation, no quotes, no extra words. Example: bite the bullet`;
      const statusEl = document.getElementById('openrouter-status');

      const aiRaw = await invokeSelectedAiModel(prompt, statusEl).catch(() => null);
      if (aiRaw && typeof aiRaw === 'string') {
        pickedWord = aiRaw.replace(/["']/g, '').trim();
      } else if (aiRaw && aiRaw.word) {
        pickedWord = aiRaw.word;
      }
    } catch (e) {
      console.warn('AI random word error, falling back to curated list:', e);
    }
  }

  if (!pickedWord) {
    pickedWord = CURATED_RANDOM_WORDS[Math.floor(Math.random() * CURATED_RANDOM_WORDS.length)];
  }

  const wordInput = document.getElementById('target-word');
  if (wordInput) wordInput.value = pickedWord;

  showToast(`สุ่มได้คำว่า "${pickedWord}" กำลังสร้างสไลด์ + ดึงคลิปหนัง...`);
  if (diceIcon) diceIcon.classList.remove('spin-active');

  runAiAgentGeneration();
}
