/**
 * ============================================================================
 * GET /api/vocab/lookup?q=<word or phrase>[&exclude=<sentence>][&shuffle=1]
 * ----------------------------------------------------------------------------
 * Real-data vocabulary lookup used when AI is unavailable (no key / quota / timeout).
 * - IPA phonetic        → dictionaryapi.dev (whole phrase, or word-by-word fallback)
 * - Thai reading        → IPA → Thai converter (lib/ipaToThai.js)
 * - Thai meaning        → Google Translate (dict-chrome-ex) → MyMemory fallback
 * - Example sentences   → dictionary examples → Tatoeba corpus → real movie clip quotes
 * - Thai translations   → same translator
 * - Grammar pattern     → word-focused pattern (no "S +") from part of speech + collocations
 * ============================================================================
 */
import { NextResponse } from 'next/server';
import { ipaToThaiReading } from '../../../../lib/ipaToThai';
import { getCuratedVocabDetails } from '../../../../lib/curatedVocab';

export const dynamic = 'force-dynamic';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60;

const POS_TH = {
  noun: 'คำนาม',
  verb: 'คำกริยา',
  adjective: 'คำคุณศัพท์',
  adverb: 'คำวิเศษณ์',
  phrasal: 'กริยาวลี',
  idiom: 'สำนวน',
  interjection: 'คำอุทาน',
  preposition: 'คำบุพบท'
};

const PREPOSITIONS = ['for', 'of', 'in', 'on', 'with', 'to', 'about', 'at', 'from', 'into', 'over', 'up', 'out', 'off', 'by'];
const PREP_START = ['on', 'under', 'in', 'out', 'at', 'over', 'through', 'by', 'once', 'off', 'up', 'down', 'behind', 'beyond'];

async function fetchWithTimeout(url, ms = 6000, init = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal, headers: { 'User-Agent': UA, ...(init.headers || {}) } });
  } finally {
    clearTimeout(id);
  }
}

/* ------------------------------- Translation ------------------------------ */
async function translateToThai(text) {
  const clean = (text || '').trim();
  if (!clean) return '';
  try {
    const r = await fetchWithTimeout(
      `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=th&q=${encodeURIComponent(clean)}`,
      5000
    );
    if (r.ok) {
      const data = await r.json();
      const out = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0][0] : data[0]) : '';
      if (typeof out === 'string' && out.trim()) return out.trim();
    }
  } catch {
    // fall through to MyMemory
  }
  try {
    const r = await fetchWithTimeout(
      `https://api.mymemory.translated.net/get?langpair=en|th&q=${encodeURIComponent(clean)}`,
      6000
    );
    if (r.ok) {
      const data = await r.json();
      const out = data?.responseData?.translatedText;
      if (out && !/MYMEMORY WARNING/i.test(out)) return out.trim();
    }
  } catch {
    // ignore
  }
  return '';
}

/* ------------------------------- Dictionary ------------------------------- */
async function dictionaryLookup(term) {
  try {
    const r = await fetchWithTimeout(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`, 5000);
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data) && data.length) return data;
    }
  } catch {
    // fall through
  }
  return null;
}

async function wiktionaryIpa(term) {
  try {
    const r = await fetchWithTimeout(
      `https://en.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(term)}&prop=revisions&rvprop=content&rvslots=main&format=json`,
      5000
    );
    if (!r.ok) return '';
    const d = await r.json();
    const page = Object.values(d?.query?.pages || {})[0];
    const content = page?.revisions?.[0]?.slots?.main?.['*'] || '';
    const m = content.match(/\{\{IPA\|en\|([^}|]+)/);
    if (m && m[1]) {
      const clean = m[1].replace(/[\/\[\]]/g, '').trim();
      if (clean) return `/${clean}/`;
    }
  } catch {
    // ignore
  }
  return '';
}

async function wiktionaryDefinition(phrase) {
  const norm = phrase.toLowerCase().replace(/\s+/g, '_');
  try {
    const r = await fetchWithTimeout(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(norm)}`, 4000);
    if (r.ok) {
      const data = await r.json();
      const defs = data.en?.[0]?.definitions || [];
      if (defs.length > 0) {
        for (const item of defs) {
          const raw = (item.definition || '').replace(/<[^>]+>/g, '').trim();
          const clean = raw
            .replace(/^\([^\)]+\)\s*/, '')
            .replace(/^To\s+/i, '')
            .replace(/\.mw-parser-output[\s\S]*$/, '')
            .replace(/[.;\n]+$/, '')
            .trim();
          if (clean && clean.length > 2 && !clean.includes('Alternative form') && !clean.includes('Misspelling')) {
            // Keep the first distinct meaning clause if multiple
            const firstClause = clean.split(/[;]/)[0].trim();
            return firstClause || clean;
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return '';
}

function pickPhonetic(entries) {
  if (!entries) return '';
  for (const e of entries) {
    const withText = (e.phonetics || []).map((p) => p.text).filter(Boolean);
    // Prefer British-style transcriptions with length marks for better Thai readings
    const best = withText.find((t) => t.includes('ː')) || e.phonetic || withText[0];
    if (best) return best;
  }
  return '';
}

function collectDictExamples(entries) {
  const out = [];
  (entries || []).forEach((e) =>
    (e.meanings || []).forEach((m) =>
      (m.definitions || []).forEach((d) => {
        if (d.example) out.push(d.example);
      })
    )
  );
  return out;
}

function primaryPos(entries) {
  const m = entries?.[0]?.meanings?.[0];
  return m?.partOfSpeech || '';
}

/* -------------------------------- Tatoeba --------------------------------- */
async function tatoebaSentences(phrase) {
  try {
    const query = phrase.includes(' ') ? `"${phrase}"` : phrase;
    const r = await fetchWithTimeout(
      `https://tatoeba.org/en/api_v0/search?from=eng&orphans=no&unapproved=no&query=${encodeURIComponent(query)}`,
      6000
    );
    if (!r.ok) return [];
    const data = await r.json();
    return (data?.results || []).map((s) => s.text).filter(Boolean);
  } catch {
    return [];
  }
}

/* --------------------------- Movie clip quotes ---------------------------- */
async function clipQuoteSentences(origin, phrase) {
  try {
    const r = await fetchWithTimeout(`${origin}/api/cafe/search?q=${encodeURIComponent(phrase)}&page=1`, 9000);
    if (!r.ok) return [];
    const data = await r.json();
    const texts = (data?.clips || []).flatMap((c) => [c.rawTranscript || '', c.quote || '']);
    const sentences = [];
    texts.forEach((t) => {
      const cleaned = t
        .replace(/^[^:]{1,40}:\s*/g, '')
        .replace(/[A-Z][a-zA-Z .'-]{1,30}:\s*/g, ' ')
        .replace(/["“”]/g, '')
        .replace(/\.\.\./g, '. ')
        .replace(/\s+/g, ' ');
      cleaned.split(/(?<=[.!?])\s+/).forEach((s) => sentences.push(s.trim()));
    });
    return sentences;
  } catch {
    return [];
  }
}

/* ------------------------------ Helpers ----------------------------------- */
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Matches the phrase, allowing the first word to be conjugated (break → breaks/broke/breaking) */
function phraseRegex(phrase) {
  const words = phrase.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const [first, ...rest] = words;
  const firstPattern = `${escapeRe(first)}(?:s|es|ed|d|ing)?`;
  const restPattern = rest.map(escapeRe).join('\\s+');
  return new RegExp(`\\b${firstPattern}${rest.length ? `\\s+${restPattern}` : ''}\\b`, 'i');
}

function wordCount(s) {
  return s.split(/\s+/).filter(Boolean).length;
}

function normalizeSentence(s) {
  let t = (s || '').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  t = t.charAt(0).toUpperCase() + t.slice(1);
  if (!/[.!?]$/.test(t)) t += '.';
  return t;
}

function rankExamples(candidates, phrase, excludeSet) {
  const re = phraseRegex(phrase);
  const seen = new Set();
  return candidates
    .map(normalizeSentence)
    .filter((s) => {
      const key = s.toLowerCase();
      if (!s || seen.has(key) || excludeSet.has(key)) return false;
      seen.add(key);
      const wc = wordCount(s);
      return re && re.test(s) && wc >= 3 && wc <= 14 && !/[<>{}\[\]]/.test(s);
    })
    .sort((a, b) => {
      // Prefer 5–9 word sentences (short & punchy)
      const score = (s) => Math.abs(wordCount(s) - 7);
      return score(a) - score(b);
    });
}

function detectCollocation(phrase, sentences) {
  const re = new RegExp(`\\b${escapeRe(phrase.toLowerCase())}\\s+(\\w+)`, 'i');
  const counts = {};
  sentences.forEach((s) => {
    const m = s.toLowerCase().match(re);
    if (m && PREPOSITIONS.includes(m[1])) counts[m[1]] = (counts[m[1]] || 0) + 1;
  });
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : '';
}

function inferPos(phrase, phraseEntries, firstWordEntries) {
  const lower = phrase.toLowerCase();
  const words = lower.split(/\s+/);
  if (phraseEntries) return primaryPos(phraseEntries) || 'noun';
  if (words.length === 1) return primaryPos(firstWordEntries) || 'noun';
  if (/^(full of|fond of|afraid of|aware of|keen on|good at|bad at|interested in|full)\b/.test(lower)) return 'adjective';
  if (lower.startsWith('be ')) return 'idiom';
  if (PREP_START.includes(words[0])) return 'idiom';
  const firstPos = (firstWordEntries?.[0]?.meanings || []).map((m) => m.partOfSpeech);
  if (firstPos[0] === 'verb' || (firstPos.includes('verb') && words.length <= 4)) {
    return PREPOSITIONS.includes(words[words.length - 1]) ? 'phrasal' : 'idiom';
  }
  if (firstPos[0] === 'adjective') return 'adjective';
  return 'idiom';
}

function buildGrammar(phrase, pos, collocation, sampleSentence = '') {
  const p = (phrase || '').trim();
  const lower = p.toLowerCase();

  // If we have a real movie/corpus sentence, try extracting its pattern around the phrase
  if (sampleSentence) {
    const idx = sampleSentence.toLowerCase().indexOf(lower);
    if (idx > 0) {
      const prefix = sampleSentence.slice(0, idx).trim();
      const prefixWords = prefix.split(/\s+/);
      if (prefixWords.length >= 2 && prefixWords.length <= 5) {
        const verbPart = prefixWords.slice(1).join(' ');
        return `Subject + ${verbPart} + ${p}  (โครงสร้างจากบทพูดในหนัง)`;
      }
    }
  }

  if (pos === 'adjective') {
    const cleanAdj = lower.startsWith('be ') ? p.slice(3).trim() : p;
    return collocation
      ? `Subject + be + ${cleanAdj} + ${collocation} + Someone/Something  (คุณศัพท์: ใช้คู่กับ ${collocation})`
      : `Subject + be + ${cleanAdj}  (คำคุณศัพท์: ต้องใช้คู่กับ Verb to be เสมอ)`;
  }
  if (pos === 'verb') {
    return collocation
      ? `Subject + ${p} + ${collocation} + Something  (คำกริยา: ผันรูปตามประธานและ Tense)`
      : `Subject + ${p} + Something  (คำกริยา: ผันรูปตาม Tense)`;
  }
  if (pos === 'phrasal') {
    return `Subject + ${p} + Someone/Something  (กริยาวลี: มีความหมายเฉพาะตัว)`;
  }
  if (pos === 'noun') {
    return collocation
      ? `Something + is a ${p} + ${collocation} + Something  (คำนาม)`
      : `a / the + ${p}  (คำนาม: ทำหน้าที่เป็นประธานหรือกรรมของประโยค)`;
  }
  if (pos === 'adverb') {
    return `Subject + V + ${p}  (คำวิเศษณ์: ใช้วางท้ายประโยคเพื่อขยายการกระทำ)`;
  }

  // Idioms & Conversational Expressions
  if (lower.startsWith('be ') || lower.startsWith('feel ') || lower.startsWith('get ')) {
    return `Subject + ${p} + Someone/Something  (สำนวนแสดงสภาวะหรือความรู้สึก)`;
  }
  if (/^(take|make|have|give|get|bite|hit|call|burn|spill|cut|beat|pull|see|break)\b/.test(lower)) {
    return `Subject + ${p}  (สำนวนกริยา: ผันตามประธานและ Tense)`;
  }

  // Conversational clauses or exclamations like "speak of the devil"
  return `${p}, + Subject + V  (สำนวนอุทาน: ใช้วางนำหน้าประโยคหรือพูดเดี่ยวๆ)`;
}

/** Last-resort grammatical sentences per part of speech (never "Let us <adjective> together") */
function templateExamples(phrase, pos) {
  const p = phrase.toLowerCase();
  switch (pos) {
    case 'adjective':
      return [`She is always ${p}.`, `They seem so ${p} today.`];
    case 'noun':
      return [`I really admire your ${p}.`, `We need more ${p} here.`];
    case 'verb':
    case 'phrasal':
      return [`I need to ${p} right now.`, `Don't be afraid to ${p}.`];
    case 'adverb':
      return [`She answered ${p}.`, `He worked ${p} all day.`];
    default:
      return [`That was totally ${p}.`, `People say "${p}" a lot.`];
  }
}

function joinPhonetics(parts) {
  const cleaned = parts.map((p) => (p || '').replace(/^\/|\/$/g, '').replace(/^\[|\]$/g, '').trim()).filter(Boolean);
  return cleaned.length ? `/${cleaned.join(' ')}/` : '';
}

/* -------------------------------- Handler --------------------------------- */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().replace(/\s+/g, ' ');
  const userMeaning = (searchParams.get('meaning') || '').trim();
  const exclude = (searchParams.getAll('exclude') || []).map((s) => normalizeSentence(s).toLowerCase());
  const shuffle = searchParams.get('shuffle') === '1';

  if (!q) {
    return NextResponse.json({ success: false, error: 'Missing q' }, { status: 400 });
  }

  // 0. Check Curated Idioms & Vocabulary Dictionary FIRST
  const curated = getCuratedVocabDetails(q);
  if (curated) {
    const finalMeaning = userMeaning || curated.meaning;
    return NextResponse.json({
      success: true,
      source: 'curated',
      details: {
        ...curated,
        meaning: finalMeaning,
        ex1Th: curated.ex1Th,
        ex2Th: curated.ex2Th
      }
    });
  }

  const key = q.toLowerCase();
  const words = key.split(' ');
  let base = cache.get(key);
  if (!base || Date.now() - base.at > CACHE_TTL_MS) {
    const [phraseEntries, firstWordEntries, rawMeaningTh, tatoeba, wiktDef] = await Promise.all([
      dictionaryLookup(key),
      words.length > 1 ? dictionaryLookup(words[0]) : Promise.resolve(null),
      translateToThai(q),
      tatoebaSentences(key),
      words.length > 1 ? wiktionaryDefinition(key) : Promise.resolve('')
    ]);

    // If Wiktionary has an idiomatic English definition for multi-word phrase, translate that definition to Thai
    let meaningTh = rawMeaningTh;
    if (wiktDef && words.length > 1) {
      const defTh = await translateToThai(wiktDef);
      if (defTh && defTh.length > 2 && defTh !== rawMeaningTh) {
        meaningTh = defTh;
      }
    }

    // Phonetic: whole phrase, otherwise word by word
    let phonetic = pickPhonetic(phraseEntries);
    if (!phonetic && words.length > 1) {
      const perWord = await Promise.all(
        words.slice(0, 6).map(async (w, idx) => {
          const entries = idx === 0 && firstWordEntries ? firstWordEntries : await dictionaryLookup(w);
          const found = pickPhonetic(entries);
          if (found) return found;
          // Fallback to Wiktionary for everyday words not in free dictionary
          return await wiktionaryIpa(w);
        })
      );
      if (perWord.every(Boolean)) phonetic = joinPhonetics(perWord);
    } else if (!phonetic && words.length === 1) {
      phonetic = await wiktionaryIpa(words[0]);
    } else if (phonetic) {
      phonetic = joinPhonetics([phonetic]);
    }

    let candidates = [...collectDictExamples(phraseEntries), ...tatoeba];
    let ranked = rankExamples(candidates, key, new Set());
    if (ranked.length < 2) {
      const clipSentences = await clipQuoteSentences(origin, key);
      candidates = [...candidates, ...clipSentences];
      ranked = rankExamples(candidates, key, new Set());
    }

    const pos = inferPos(key, phraseEntries, firstWordEntries || phraseEntries);
    const collocation = detectCollocation(key, ranked);

    base = {
      at: Date.now(),
      phonetic,
      thaiRead: phonetic ? ipaToThaiReading(phonetic, key) : '',
      meaning: meaningTh,
      pos,
      grammar: buildGrammar(key, pos, collocation, ranked[0] || ''),
      pool: ranked
    };
    cache.set(key, base);
  }

  // Choose 2 examples (avoid excluded ones, optionally random for "regenerate")
  const excludeSet = new Set(exclude);
  let pool = base.pool.filter((s) => !excludeSet.has(s.toLowerCase()));
  if (shuffle) pool = [...pool].sort(() => Math.random() - 0.5);
  let examples = pool.slice(0, 2);
  if (examples.length < 2) {
    const tpl = templateExamples(key, base.pos).filter((s) => !excludeSet.has(s.toLowerCase()) && !examples.includes(s));
    examples = [...examples, ...tpl].slice(0, 2);
  }

  // Smart translation for examples: If phrase is multi-word, avoid literal word-by-word translation
  const effectiveMeaning = userMeaning || (base.meaning || '').replace(/[.。]$/, '').trim();
  const [ex1Th, ex2Th] = await Promise.all(
    examples.map(async (sentence) => {
      const cleanSentence = (sentence || '').trim();
      if (!cleanSentence) return '';

      // If sentence has target multi-word phrase and we have an effective meaning
      if (words.length > 1 && effectiveMeaning) {
        try {
          const escaped = key.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
          const regex = new RegExp(`\\b${escaped}\\b`, 'i');
          if (regex.test(cleanSentence) || cleanSentence.toLowerCase().includes(key)) {
            const marker = '___IDIOM_MARKER___';
            const replaced = regex.test(cleanSentence)
              ? cleanSentence.replace(regex, marker)
              : cleanSentence.replace(new RegExp(escaped, 'i'), marker);
            const rawTh = await translateToThai(replaced);
            if (rawTh && (rawTh.includes('___IDIOM_MARKER___') || /___\s*idiom_marker\s*___/i.test(rawTh))) {
              return rawTh.replace(/___IDIOM_MARKER___|___\s*idiom_marker\s*___/gi, effectiveMeaning).trim();
            }
          }
        } catch {}
      }

      return await translateToThai(cleanSentence);
    })
  );

  let ex1ThFinal = ex1Th || '';
  let ex2ThFinal = ex2Th || '';
  const ex1En = examples[0] || '';
  const ex2En = examples[1] || '';
  if (userMeaning) {
    const cleanWord = q.toLowerCase();
    if (ex1En.toLowerCase().includes(cleanWord)) {
      ex1ThFinal = ex1ThFinal.replace(/ยอมแพ้เพื่อ|ยอมแพ้ให้กับ|ยอมแพ้|ได้รับมากกว่า|ได้รับพร้อมกับ/g, userMeaning);
    }
    if (ex2En.toLowerCase().includes(cleanWord)) {
      ex2ThFinal = ex2ThFinal.replace(/ยอมแพ้เพื่อ|ยอมแพ้ให้กับ|ยอมแพ้|ได้รับมากกว่า|ได้รับพร้อมกับ/g, userMeaning);
    }
  }

  const display = q.charAt(0).toUpperCase() + q.slice(1);
  const meaning = userMeaning || (base.meaning || '').replace(/[.。]$/, '');

  return NextResponse.json({
    success: true,
    source: 'dictionary',
    details: {
      word: q,
      phonetic: base.phonetic,
      thaiRead: base.thaiRead,
      meaning,
      grammar: base.grammar,
      pos: base.pos,
      ex1En: examples[0] || '',
      ex1Th: ex1ThFinal,
      ex2En: examples[1] || '',
      ex2Th: ex2ThFinal,
      socialCaption: meaning
        ? `แจกประโยคเด็ดจากหนัง! คำว่า '${display}' ไม่ได้แปลตรงตัวอย่างที่คิด แต่อมความหมายว่า '${meaning}' เอาไว้ เอาไปใช้พูดตามนี้เลิศแน่นอน! #เรียนภาษาอังกฤษจากหนัง #ฝึกภาษาอังกฤษ #แคปชันอังกฤษ`
        : `มาเรียนคำว่า '${display}' จากหนังกัน #เรียนภาษาอังกฤษจากหนัง #ฝึกภาษาอังกฤษ #แคปชันอังกฤษ`
    }
  });
}
