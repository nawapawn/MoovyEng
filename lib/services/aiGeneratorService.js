/**
 * aiGeneratorService.js
 * Master generator for:
 * - Step 2: Semantic Movie Clip Ranking (matching Target Word + Thai Meaning)
 * - Step 3: Sentence Structure Extraction & 2-Sentence Generation (1 Movie Pattern + 1 Freestyle)
 * - Step 4: High-Search SEO Social Media Caption (Educational & Viral Movie styles, ZERO emojis)
 */

import { DEFAULT_VENDOR_MODELS } from '../constants';

export function parseJsonSafely(raw) {
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
}

/**
 * Strip all emojis from any text string to strictly enforce the NO-EMOJI rule.
 */
export function stripEmojis(str = '') {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Formats user's channel handle into a clean hashtag (e.g. "@move0nyoung" -> "#move0nyoung")
 */
export function getChannelHashtag(channel = '@move0nyoung') {
  const clean = stripEmojis(String(channel || 'move0nyoung'))
    .replace(/<[^>]+>/g, '')
    .replace(/^[@#]+/, '')
    .replace(/\s+/g, '')
    .trim();
  return `#${clean || 'move0nyoung'}`;
}

/**
 * Builds deterministic SEO Social Media Caption that ALWAYS includes:
 * 1. EVERY Selected Movie's Title + English Quote + Thai Quote Translation
 * 2. Target Vocabulary + Thai Meaning
 * 3. High-Search Hashtags + User's Channel Hashtag (#channel)
 * 4. ZERO Emojis
 */
export function formatCompleteSocialCaption({
  baseCaption = '',
  word = '',
  meaning = '',
  primaryClip = null,
  clipsList = [],
  channel = '@move0nyoung',
  captionStyle = 'educational',
  movieQuoteThOverride = ''
}) {
  const chTag = getChannelHashtag(channel);
  const cleanWord = stripEmojis(word || '').trim();
  const cleanMeaning = stripEmojis(meaning || '').trim();

  // Combine clipsList or primaryClip to cover ALL selected movies
  const allClips = Array.isArray(clipsList) && clipsList.length > 0
    ? clipsList
    : (primaryClip ? [primaryClip] : []);

  // Format quotes for all selected movie clips (EN + TH)
  // Match requested structure:
  // [movieIcon] [Movie Title] ([Year])
  // -> "[English Quote]" ([Thai Quote Translation])
  const movieBlocks = [];
  for (const c of allClips) {
    if (!c) continue;
    let title = stripEmojis(c.title || c.movieTitle || '').trim();
    const qEn = stripEmojis((c.rawTranscript || c.quote || '').replace(/^["'“”]+|["'“”]+$/g, '')).trim();
    const qTh = stripEmojis(
      (movieQuoteThOverride && c.id === primaryClip?.id
        ? movieQuoteThOverride
        : (c.quoteTh || '')
      ).replace(/^["'“”()]+|["'“”()]+$/g, '')
    ).trim();

    if (title && qEn && !/^Scene from /i.test(qEn)) {
      movieBlocks.push(`🎬 ${title}\n-> "${qEn}"${qTh ? ` (${qTh})` : ''}`);
    } else if (title) {
      movieBlocks.push(`🎬 ${title}`);
    }
  }

  const moviesFormattedBlock = movieBlocks.join('\n\n');

  let body = stripEmojis(baseCaption || '');
  if (!body) {
    body =
      captionStyle === 'viral'
        ? `ฉากนี้ในหนังพูดคำนี้หมายความว่าไง? มาแกะคำศัพท์คำว่า '${cleanWord}' ที่แปลว่า '${cleanMeaning}' พร้อมประโยคตัวอย่างเอาไว้ไปปรับใช้จริง โพสต์เดียวเซฟเก็บไว้ดูซ้ำได้เลย!\n\n#ภาษาอังกฤษในชีวิตประจำวัน #เก่งภาษากับคลิปหนัง`
        : `แจกประโยคเด็ดจากหนัง! คำว่า '${cleanWord}' ไม่ได้แปลตรงตัวอย่างที่คิด\nแต่มีความหมายว่า '${cleanMeaning}' เอาไว้ เอาไปใช้พูดตามนี้เลิศแน่นอน!\n\n#เรียนภาษาอังกฤษจากหนัง #ฝึกภาษาอังกฤษ #แคปชันอังกฤษ`;
  }

  // Inject formatted movie blocks before hashtags with clean spacing
  let finalCaption = body;
  if (moviesFormattedBlock) {
    const hashIdx = finalCaption.indexOf('#');
    if (hashIdx !== -1) {
      const beforeHash = finalCaption.slice(0, hashIdx).trim();
      const hashes = finalCaption.slice(hashIdx).trim();
      finalCaption = `${beforeHash}\n\n${moviesFormattedBlock}\n\n${hashes}`;
    } else {
      finalCaption = `${finalCaption.trim()}\n\n${moviesFormattedBlock}`;
    }
  }

  // Ensure user's channel hashtag (#channel) is ALWAYS present at the end
  const lowerCaption = finalCaption.toLowerCase();
  if (!lowerCaption.includes(chTag.toLowerCase())) {
    finalCaption = `${finalCaption.trim()} ${chTag}`;
  }

  return finalCaption.trim();
}

/**
 * Builds Prompt 1: Master Contextual Flashcard + Clip Matcher + Movie Pattern & Freestyle Generator
 */
export function buildMasterFlashcardPrompt({
  targetWord,
  userMeaning = '',
  primaryClip = null,
  candidateClips = [],
  captionStyle = 'educational',
  channel = '@move0nyoung',
  activeClipSequence = []
}) {
  const chTag = getChannelHashtag(channel);
  const clipTitle = primaryClip?.title || 'Everyday English';
  const clipQuote = primaryClip?.rawTranscript || primaryClip?.quote || '';
  const clipQuoteTh = primaryClip?.quoteTh || '';

  const allSelectedClips = Array.isArray(activeClipSequence) && activeClipSequence.length > 0
    ? activeClipSequence
    : (primaryClip ? [primaryClip] : []);

  const selectedClipsSummary = allSelectedClips
    .map((c, i) => `${i + 1}. จากหนังเรื่อง ${c.title || ''} ประโยคในหนัง: "${c.rawTranscript || c.quote || ''}" (${c.quoteTh || ''})`)
    .join(' | ');

  const candidatesListText = Array.isArray(candidateClips) && candidateClips.length > 0
    ? candidateClips
        .slice(0, 12)
        .map((c, idx) => `[Index ${idx}] Movie: "${c.title || ''}" | Subtitle (EN): "${c.rawTranscript || c.quote || ''}" | Subtitle (TH): "${c.quoteTh || ''}"`)
        .join('\n')
    : `[Index 0] Movie: "${clipTitle}" | Subtitle (EN): "${clipQuote}" | Subtitle (TH): "${clipQuoteTh}"`;

  return `You are an elite English linguist and viral educational content creator for Thai students.

STEP 1 — USER INPUTS:
- Target Vocabulary: "${targetWord}"
- User's Thai Translation / Intended Meaning: "${userMeaning || '(Analyze the most natural, accurate Thai meaning for this vocabulary/idiom)'}"
- User's Channel Handle: "${channel}" (Hashtag: "${chTag}")

STEP 2 — SEMANTIC MOVIE CLIP SELECTION & CONTEXTUAL TRANSLATION:
Below are candidate movie clips containing "${targetWord}":
${candidatesListText}

Task for Step 2:
- Analyze the User's Thai Translation ("${userMeaning}") and the true idiomatic/contextual meaning of "${targetWord}".
- Pick the single best clip index ("bestClipIndex", integer from 0 to ${Math.max(0, candidateClips.length - 1)}) whose subtitle uses "${targetWord}" in the EXACT SAME sense/context as the Thai translation.
- TRANSLATE EVERY CLIP TO FLUENT, NATURAL THAI IN "clipQuotesThMap":
  * You MUST provide polished, contextual Thai translations for all candidate clip indices: {"0": "...", "1": "...", "2": "...", ...}
  * NEVER translate idioms word-by-word! (e.g. 'cold feet' MUST translate to 'เกิดปอดแหก/ไม่กล้า', NEVER 'เท้าเย็น'; 'bite the dust' MUST translate to 'ต้องตาย/พังไม่เป็นท่า', NEVER 'กัดฝุ่น'; 'hit the sack' MUST translate to 'ไปนอน', NEVER 'ตีกระสอบ').
  * Make the Thai subtitles read naturally like dialogues from professional Thai movie subbers!
- In "selectedClipQuoteTh", provide the natural Thai translation of the primary selected clip's subtitle.

STEP 3 — EXTRACT MOVIE SENTENCE STRUCTURE & GENERATE 2 HIGH-QUALITY SENTENCES:
Based on the selected movie clip's subtitle:
1. "grammar": Extract the core grammatical pattern from the movie subtitle using clear structure tokens (e.g., Subject + get over + (Someone/Something) (ใช้อธิบายการตัดใจ/ก้าวข้ามผ่านเรื่องราวหรือคนรักเก่า)).
   - Must be the real, idiomatic grammar formula matching the intended Thai meaning "${userMeaning}".
   - NEVER output absurd word-by-word repetitions or meaningless fragments!
2. "ex1En" & "ex1Th" (ประโยคที่ 1 — ประโยคตามโครงสร้างหนัง / Movie Pattern Sentence):
   - Create 1 new English sentence that STRICTLY follows the grammatical structure of the movie quote, but changes the Subject, Object, or Time/Place.
   - SEMANTIC & LOGICAL ACCURACY IS MANDATORY: The sentence must make complete, natural sense in real life!
     * NEVER confuse phrasal verbs or create nonsensical sentences (e.g., if the idiom is 'get over' meaning 'ตัดใจ/ทำใจได้', do NOT write 'Cotton, you get over with the horses' / 'เลิกกับม้า' which is absurd and grammatically wrong!).
     * Example: If the quote is "It took me months to get over him", create "It took her years to get over her ex-boyfriend." (เธอใช้เวลาหลายปีกว่าจะตัดใจจากแฟนเก่าได้).
   - The Thai translation ("ex1Th") must be fluent, natural, grammatically correct Thai — NOT robotic machine translation.
3. "ex2En" & "ex2Th" (ประโยคที่ 2 — ประโยคอิสระ / Freestyle Sentence):
   - Create 1 new Freestyle English sentence using "${targetWord}" in a completely fresh, natural everyday conversation context.
   - Must use the phrase naturally and logically according to its true meaning "${userMeaning}".
   - Example for 'get over': "You really need to get over your fear of public speaking." (คุณต้องก้าวข้ามความกลัวการพูดในที่สาธารณะให้ได้จริงๆ นะ).
   - The Thai translation ("ex2Th") must be polished, natural conversational Thai.

STEP 4 — HIGH-SEARCH-INTENT SOCIAL CAPTION:
Create a high-converting Social Media Caption ("socialCaption") optimized for search keywords on TikTok / Reels / Shorts.
Layout & Structure EXACT FORMAT to follow:
Header introducing the vocabulary and its meaning:
แจกประโยคเด็ดจากหนัง! คำว่า '${targetWord}' ไม่ได้แปลตรงตัวอย่างที่คิด
แต่มีความหมายว่า '[คำแปลไทย]' เอาไว้ เอาไปใช้พูดตามนี้เลิศแน่นอน!

Followed by EVERY selected movie clip in this exact block format:
🎬 [Movie Title] ([Year])
-> "[English Subtitle Quote]" ([Thai Subtitle Translation])

Followed by high-converting hashtags ending with the user's channel hashtag "${chTag}"!
Example format:
แจกประโยคเด็ดจากหนัง! คำว่า '${targetWord}' ไม่ได้แปลตรงตัวอย่างที่คิด
แต่มีความหมายว่า '[คำแปลไทย]' เอาไว้ เอาไปใช้พูดตามนี้เลิศแน่นอน!

🎬 Prom Pact (2023)
-> "Hmm. Do you get along with your parents?" (อืม. คุณเข้ากับพ่อแม่ได้ไหม?)

#เรียนภาษาอังกฤษจากหนัง #ฝึกภาษาอังกฤษ #แคปชันอังกฤษ ${chTag}

STRICT RULES:
- ALWAYS include "${chTag}" in the hashtags!
- Include ALL selected movies with English quotes and Thai translations in the block format above!
- Follow this exact newline spacing!

Respond with ONLY valid JSON (no markdown code blocks):
{
  "bestClipIndex": 0,
  "selectedClipQuoteTh": "คำแปลภาษาไทยของบทพูดในคลิปหนังที่สละสลวย แปลตรงตามบริบทความหมายของสำนวน ไม่แปลตรงตัวคำต่อคำเด็ดขาด",
  "clipQuotesThMap": {
    "0": "คำแปลไทยที่เป็นธรรมชาติของคลิป Index 0",
    "1": "คำแปลไทยที่เป็นธรรมชาติของคลิป Index 1",
    "2": "คำแปลไทยที่เป็นธรรมชาติของคลิป Index 2"
  },
  "phonetic": "/.../ (IPA format)",
  "thaiRead": "(คำอ่านภาษาไทย)",
  "meaning": "คำแปลความหมายภาษาไทยที่ถูกต้องตามบริบท",
  "grammar": "Subject + ... + ${targetWord} + ... (คำอธิบายโครงสร้างจากบทหนัง)",
  "ex1En": "Sentence 1 following the movie clip structure",
  "ex1Th": "คำแปลประโยคที่ 1 (ตามโครงสร้างหนัง)",
  "ex2En": "Sentence 2 freestyle in a new context",
  "ex2Th": "คำแปลประโยคที่ 2 (ประโยคอิสระ)",
  "socialCaption": "แคปชันโซเชียลที่มีชื่อหนังทุกเรื่องที่เลือก บทพูดอังกฤษ+ไทย และแฮชแท็ก ${chTag} ห้ามมีอิโมจิเด็ดขาด"
}`;
}

/**
 * Builds Prompt 2: Analyze Selected Movie Clip Quote -> Extract Pattern + 1 Movie Pattern Sentence + 1 Freestyle Sentence
 */
export function buildClipSentencesPrompt({ word, meaning, grammar, primaryClip }) {
  const clipTitle = primaryClip?.title || '';
  const clipQuote = primaryClip?.rawTranscript || primaryClip?.quote || '';

  return `You are an elite native English linguist and bilingual English-Thai educator creating educational flashcards.
Target Vocabulary / Phrase: "${word}"
True Thai Meaning: "${meaning}"
Selected Movie: "${clipTitle}"
Movie Subtitle / Quote: "${clipQuote}"

CRITICAL LINGUISTIC & CONTEXTUAL RULES:
1. Understand the true idiomatic meaning of "${word}" (meaning: "${meaning}").
   - NEVER create nonsensical, absurd, or grammatically distorted sentences (e.g. NEVER treat 'get over' as 'เลิกกับม้า' or confused with other prepositions like 'get over with' when it makes no sense).
   - Both sentences MUST make 100% logical sense in real life and sound like native English!
   - Both Thai translations MUST be natural, fluent Thai as spoken by educated native Thai speakers, NOT clunky machine translation.

TASK (STEP 3 WORKFLOW):
1. "grammar": Analyze the movie quote "${clipQuote}" and extract its genuine grammatical formula using standard tokens (e.g. Subject + get over + (Someone/Something) (คำอธิบายสั้นๆ ภาษาไทย)).
2. "ex1En" & "ex1Th" (1. ประโยคตามโครงสร้างหนัง / Movie Pattern Sentence):
   - Keep the structural syntax of the movie quote, but substitute with a realistic, relatable subject/object/time.
   - Example: If movie quote is "It took me months to get over him", write "She found it hard to get over her past mistakes."
   - Provide natural Thai translation in "ex1Th".
3. "ex2En" & "ex2Th" (2. ประโยคอิสระ / Freestyle Sentence):
   - Create a realistic, high-frequency everyday conversation sentence using "${word}" according to the meaning "${meaning}".
   - Provide fluent, colloquial Thai translation in "ex2Th".
4. NO EMOJIS allowed anywhere.

Respond with ONLY valid JSON:
{
  "grammar": "โครงสร้างประโยค เช่น Subject + ... + ${word} + ... (คำอธิบาย)",
  "ex1En": "Sentence 1 following the movie quote structure realistically",
  "ex1Th": "คำแปลภาษาไทยที่สละสลวยตามบริบท",
  "ex2En": "Sentence 2 freestyle in everyday native context",
  "ex2Th": "คำแปลภาษาไทยที่สละสลวยตามบริบท"
}`;
}

/**
 * Calls AI API to generate content with multiple fallback models
 */
export async function executeAiCompletion({ promptText, apiKey, aiVendor = 'gemini', aiModel = 'gemini-2.0-flash', timeoutMs = 12000 }) {
  if (!apiKey) return null;

  if (aiVendor === 'gemini') {
    const preferredModel = (aiModel && !aiModel.includes('2.5')) ? aiModel : 'gemini-2.0-flash';
    const modelsToTry = [
      preferredModel,
      'gemini-1.5-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash-8b',
      'gemini-1.5-pro'
    ];
    const uniqueModels = [...new Set(modelsToTry)];

    let lastErr = null;
    for (const mod of uniqueModels) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
          })
        });
        clearTimeout(timeoutId);

        if (res.status === 429) {
          console.warn(`Gemini model ${mod} hit 429 rate limit. Trying fallback model...`);
          lastErr = new Error('Gemini API HTTP 429');
          continue;
        }

        if (!res.ok) {
          throw new Error(`Gemini API HTTP ${res.status}`);
        }

        const json = await res.json();
        const raw = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = parseJsonSafely(raw);
        if (parsed) return parsed;
      } catch (e) {
        clearTimeout(timeoutId);
        lastErr = e;
      }
    }
    throw lastErr || new Error('All Gemini models failed');
  } else {
    // OpenAI, Groq, DeepSeek, xAI
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    if (aiVendor === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    else if (aiVendor === 'deepseek') endpoint = 'https://api.deepseek.com/chat/completions';
    else if (aiVendor === 'xai') endpoint = 'https://api.x.ai/v1/chat/completions';

    const effectiveModel = aiModel || (DEFAULT_VENDOR_MODELS[aiVendor]?.[0]?.id || 'llama-3.3-70b-versatile');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
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
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`${aiVendor} API HTTP ${res.status}`);
      }

      const json = await res.json();
      const raw = json.choices?.[0]?.message?.content || '';
      return parseJsonSafely(raw);
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  }
}
