/**
 * regenerateService.js
 * Dedicated AI service for single-field regeneration
 * (Meaning, Grammar Formula, Example 1, Example 2, Phonetic, Social Caption).
 */

import { DEFAULT_VENDOR_MODELS } from '../constants';
import { getChannelHashtag } from './aiGeneratorService';

function parseJsonSafely(raw) {
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
 * Call AI vendor API for a single JSON-producing task
 */
export async function callAiSingleField({ promptText, apiKey, aiVendor = 'gemini', aiModel = 'gemini-3.8-flash', timeoutMs = 15000 }) {
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (aiVendor === 'gemini') {
      const isObsolete = !aiModel || aiModel.includes('1.5') || aiModel.includes('2.0') || aiModel.includes('2.5');
      const preferredModel = isObsolete ? 'gemini-3.8-flash' : aiModel;
      const modelsToTry = [...new Set([preferredModel, 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-flash-latest'])];

      for (const mod of modelsToTry) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.9 }
            })
          });
          if (res.ok) {
            clearTimeout(timeoutId);
            const json = await res.json();
            const raw = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const parsed = parseJsonSafely(raw);
            if (parsed) return parsed;
          }
        } catch (err) {
          // try fallback
        }
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
}

/**
 * Regenerate Meaning (TH)
 */
export async function regenerateMeaningApi({ word, currentMeaning, apiKey, aiVendor, aiModel }) {
  const prompt = `You are an elite English tutor for Thai students.
Target English word/phrase: "${word}".
Current meaning: "${currentMeaning}".

TASK: Provide a FRESH, ALTERNATIVE, and ACCURATE idiomatic Thai translation/meaning for "${word}".
- Never translate idioms literally word-by-word (e.g., "be down with" means เห็นด้วย/เอาด้วย/ป่วยเป็นโรค, NOT ลงด้วย).
- Keep it short, natural, and punchy for flashcards.
- NO EMOJIS allowed.
Respond with ONLY valid JSON:
{
  "meaning": "คำแปลความหมายภาษาไทยสั้นกระชับ"
}`;
  return callAiSingleField({ promptText: prompt, apiKey, aiVendor, aiModel });
}

/**
 * Regenerate Grammar Formula (Extracted from Movie Clip Quote if available)
 */
export async function regenerateGrammarApi({ word, meaning, primaryClip, currentGrammar, apiKey, aiVendor, aiModel }) {
  const clipQuote = primaryClip?.rawTranscript || primaryClip?.quote || '';
  const prompt = `You are an elite English tutor creating educational flashcards for Thai students.
Target Vocabulary: "${word}"
Thai Meaning: "${meaning || ''}"
Selected Movie Quote: "${clipQuote}"
Current grammar formula (DO NOT REPEAT): "${currentGrammar}"

CRITICAL GOAL:
1. If a Movie Quote is provided ("${clipQuote}"), extract the exact sentence structure / pattern from that movie quote!
   - Example: If movie says "You need to break a leg tonight on stage." -> "Subject + need to + ${word} + (Time/Place) (โครงสร้างจากในหนัง)"
2. Otherwise, provide the real sentence construction structure with simple placeholders: Subject, Someone, Something, V.1, V.ing, be + ..., etc.
3. NEVER repeat words like "be + be ..."!
4. NEVER output just the word itself!
5. NO EMOJIS allowed.

Respond with ONLY valid JSON:
{
  "grammar": "Subject + ... + ${word} + ... (คำอธิบายโครงสร้างสั้นๆ)"
}`;
  return callAiSingleField({ promptText: prompt, apiKey, aiVendor, aiModel });
}

/**
 * Regenerate Example Sentence (1 = Movie Structure Pattern, 2 = Freestyle Context)
 */
export async function regenerateExampleApi({ word, meaning, grammar, index = 1, currentEn, currentTh, otherEn, primaryClip, apiKey, aiVendor, aiModel }) {
  const clipQuote = primaryClip?.rawTranscript || primaryClip?.quote || '';
  const isPatternSentence = index === 1;

  const prompt = `You are an elite bilingual English-Thai educator creating educational flashcards.
Target Vocabulary / Phrase: "${word}"
True Thai Meaning: "${meaning || ''}"
Grammar Pattern: "${grammar || ''}"
Movie Subtitle Quote: "${clipQuote}"
Current sentence #${index} (DO NOT REPEAT): "${currentEn}" (TH: "${currentTh}")
Other sentence (DO NOT REPEAT): "${otherEn}"

CRITICAL LINGUISTIC RULES:
1. SEMANTIC & LOGICAL ACCURACY:
   - Sentences must make 100% natural and logical sense in real life!
   - NEVER create nonsensical combinations or confusing prepositions (e.g., if target is 'get over' meaning 'ตัดใจ/ก้าวข้ามผ่าน', do NOT write 'get over with the horses' / 'เลิกกับม้า' which is completely nonsensical!).
2. NATURAL THAI TRANSLATION:
   - Provide fluent, natural Thai as spoken by educated native Thai speakers (e.g. 'ตัดใจจากเขาได้', 'ก้าวข้ามความเจ็บปวด', NOT robotic literal translation).
3. NO EMOJIS allowed.

TASK FOR SENTENCE #${index}:
${
  isPatternSentence
    ? `1. [ประโยคตามโครงสร้างหนัง / Movie Structure Sentence]:
   - Follow the grammatical structure of the movie quote ("${clipQuote}") or the Grammar Pattern ("${grammar}").
   - Substitute with a realistic, relatable subject, object, or situation.
   - Example for 'get over': If movie is "It took me a year to get over it", create "It took him a long time to get over the breakup." (เขาใช้เวลานานมากในการทำใจเรื่องการเลิกรา)`
    : `2. [ประโยคอิสระ / Freestyle Sentence]:
   - Create 1 brand-new English sentence using "${word}" according to the true meaning "${meaning || ''}" in a realistic everyday context!
   - Example for 'get over': "Don't worry, you'll get over this difficult situation soon." (ไม่ต้องกังวลไปนะ ไม่ช้าเธอจะก้าวผ่านช่วงเวลายากลำบากนี้ไปได้แน่นอน)`
}

Respond with ONLY valid JSON:
{
  "exEn": "Realistic, natural English sentence following the rule above",
  "exTh": "คำแปลภาษาไทยที่สละสลวย ตรงบริบทความหมายจริง"
}`;
  return callAiSingleField({ promptText: prompt, apiKey, aiVendor, aiModel });
}

/**
 * Regenerate IPA & Thai Reading
 */
export async function regeneratePhoneticApi({ word, currentPhonetic, currentThaiRead, apiKey, aiVendor, aiModel }) {
  const prompt = `You are an elite English linguist for Thai students.
Target English word/phrase: "${word}".
Current IPA: "${currentPhonetic}"
Current Thai reading: "${currentThaiRead}"

TASK: Provide accurate IPA phonetic transcription and clean Thai pronunciation guide.
Rules:
- IPA in standard /.../ format.
- Thai pronunciation in natural Thai letters enclosed in parentheses, e.g. "(เบรค อะ เลก)".
- NO EMOJIS allowed.
Respond with ONLY valid JSON:
{
  "phonetic": "/.../",
  "thaiRead": "(คำอ่านไทย)"
}`;
  return callAiSingleField({ promptText: prompt, apiKey, aiVendor, aiModel });
}

/**
 * Regenerate Social Media Caption (Supports 'educational' & 'viral' styles, includes movie quote EN+TH and #channel, STRICTLY NO EMOJIS)
 */
export async function regenerateCaptionApi({
  word,
  meaning,
  grammar,
  primaryClip,
  clipsList = [],
  channel = '@move0nyoung',
  style = 'educational',
  apiKey,
  aiVendor,
  aiModel
}) {
  const chTag = getChannelHashtag(channel);
  const allClips = Array.isArray(clipsList) && clipsList.length > 0
    ? clipsList
    : (primaryClip ? [primaryClip] : []);

  const movieQuotesBlock = allClips
    .map((c, i) => `${i + 1}. หนัง: "${c.title || c.movieTitle || ''}" | บทพูดอังกฤษ: "${(c.rawTranscript || c.quote || '').replace(/^["'“”]+|["'“”]+$/g, '')}" | คำแปลไทย: "${(c.quoteTh || '').replace(/^["'“”()]+|["'“”()]+$/g, '')}"`)
    .join('\n');

  const prompt = `You are a high-converting SEO social media content creator teaching English for Thai audiences on TikTok, Reels, and Shorts.
Target Vocabulary: "${word}"
Thai Translation: "${meaning}"
Grammar Structure: "${grammar}"
User Channel Hashtag: "${chTag}"
Selected Style: "${style === 'viral' ? 'สายบันเทิง/คลิปไวรัล' : 'สายความรู้/การศึกษา'}"

ALL SELECTED MOVIES & QUOTES:
${movieQuotesBlock}

TASK:
Generate a high-search-intent Thai Social Media Caption formatted EXACTLY in this block structure:

แจกประโยคเด็ดจากหนัง! คำว่า '${word}' ไม่ได้แปลตรงตัวอย่างที่คิด
แต่มีความหมายว่า '${meaning}' เอาไว้ เอาไปใช้พูดตามนี้เลิศแน่นอน!

Followed by EVERY selected movie clip in this exact block format:
🎬 [Movie Title] ([Year])
-> "[English Subtitle Quote]" ([Thai Subtitle Translation])

Followed by high-converting hashtags ending with the user's channel hashtag "${chTag}"!
Example format:
แจกประโยคเด็ดจากหนัง! คำว่า '${word}' ไม่ได้แปลตรงตัวอย่างที่คิด
แต่มีความหมายว่า '${meaning}' เอาไว้ เอาไปใช้พูดตามนี้เลิศแน่นอน!

🎬 Prom Pact (2023)
-> "Hmm. Do you get along with your parents?" (อืม. คุณเข้ากับพ่อแม่ได้ไหม?)

#เรียนภาษาอังกฤษจากหนัง #ฝึกภาษาอังกฤษ #แคปชันอังกฤษ ${chTag}

CRITICAL RULES:
1. MUST follow this exact block formatting with blank line spacing.
2. MUST include EVERY selected movie title and its movie quote in BOTH English and Thai (เขียนทุกเรื่องที่เลือกเลย).
3. MUST include "${chTag}" in the hashtags every single time!

Respond with ONLY valid JSON:
{
  "caption": "แคปชันโซเชียลที่จัดรูปแบบตามโครงสร้างด้านบน มีชื่อหนังทุกเรื่องที่เลือก บทพูดอังกฤษ+ไทย และแฮชแท็ก ${chTag}"
}`;
  return callAiSingleField({ promptText: prompt, apiKey, aiVendor, aiModel });
}
