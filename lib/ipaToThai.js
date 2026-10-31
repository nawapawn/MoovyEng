/**
 * ============================================================================
 * IPA → Thai Reading (คำอ่านภาษาไทย) Converter
 * ----------------------------------------------------------------------------
 * Converts an English IPA transcription (e.g. "/fʊl əv ziːl/") into an
 * approximate Thai-script reading (e.g. "(ฟุล อัฟ ซีล)") the way Thai learners
 * usually write English pronunciation. Works per word → per syllable.
 * ============================================================================
 */

// Multi-character vowels must be matched before single-character ones
const VOWELS = [
  'iː', 'uː', 'ɑː', 'ɔː', 'ɜː', 'eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'əʊ', 'oʊ', 'ɪə', 'eə', 'ɛə', 'ʊə',
  'ɝ', 'ɚ', 'i', 'ɪ', 'e', 'ɛ', 'æ', 'ʌ', 'ɑ', 'a', 'ɒ', 'ɔ', 'ʊ', 'u', 'ə', 'ɜ', 'o', 'ɐ', 'ᵻ', 'ɵ', 'ɘ', 'y'
];

const CONSONANTS = ['tʃ', 'dʒ', 'p', 'b', 't', 'd', 'k', 'ɡ', 'g', 'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h', 'm', 'n', 'ŋ', 'l', 'ɫ', 'r', 'ɹ', 'ɾ', 'j', 'w', 'ʍ', 'x', 'ç'];

const ONSET_TH = {
  p: 'พ', b: 'บ', t: 'ท', d: 'ด', k: 'ค', ɡ: 'ก', g: 'ก', f: 'ฟ', v: 'ว', θ: 'ธ', ð: 'ด',
  s: 'ซ', z: 'ซ', ʃ: 'ช', ʒ: 'ช', tʃ: 'ช', dʒ: 'จ', h: 'ฮ', m: 'ม', n: 'น', ŋ: 'ง',
  l: 'ล', ɫ: 'ล', r: 'ร', ɹ: 'ร', ɾ: 'ด', j: 'ย', w: 'ว', ʍ: 'ว', x: 'ค', ç: 'ฮ'
};

// First consonant of a cluster in onset position written with Thai high-class equivalents
const CLUSTER_FIRST_TH = { s: 'ส', ʃ: 'ช', k: 'ค', p: 'พ', t: 'ท' };

const CODA_TH = {
  p: 'พ', b: 'บ', t: 'ท', d: 'ด', k: 'ค', ɡ: 'ก', g: 'ก', f: 'ฟ', v: 'ฟ', θ: 'ธ', ð: 'ธ',
  s: 'ส', z: 'ส', ʃ: 'ช', ʒ: 'ช', tʃ: 'ช', dʒ: 'จ', h: '', m: 'ม', n: 'น', ŋ: 'ง',
  l: 'ล', ɫ: 'ล', r: 'ร์', ɹ: 'ร์', ɾ: 'ด', j: 'ย', w: 'ว', ʍ: 'ว', x: 'ค', ç: ''
};

// Vowel templates: C = onset cluster, F = coda
const VOWEL_TH = {
  'iː': { open: 'Cี', closed: 'CีF' },
  i: { open: 'Cี', closed: 'CิF' },
  'ɪ': { open: 'Cิ', closed: 'CิF' },
  'ᵻ': { open: 'Cิ', closed: 'CิF' },
  y: { open: 'Cิว', closed: 'CิวF' },
  e: { open: 'เC', closed: 'เCF' },
  'ɛ': { open: 'เC', closed: 'เCF' },
  'æ': { open: 'แC', closed: 'แCF' },
  'ʌ': { open: 'Cะ', closed: 'CัF' },
  'ɐ': { open: 'Cะ', closed: 'CัF' },
  'ɑː': { open: 'Cา', closed: 'CาF' },
  'ɑ': { open: 'Cา', closed: 'CาF' },
  a: { open: 'Cา', closed: 'CาF' },
  'ɒ': { open: 'Cอ', closed: 'CอF' },
  'ɔ': { open: 'Cอ', closed: 'CอF' },
  'ɔː': { open: 'Cอ', closed: 'CอF' },
  'ʊ': { open: 'Cุ', closed: 'CุF' },
  'ɵ': { open: 'Cุ', closed: 'CุF' },
  'uː': { open: 'Cู', closed: 'CูF' },
  u: { open: 'Cู', closed: 'CูF' },
  'ɜː': { open: 'เCอ', closed: 'เCิF' },
  'ɜ': { open: 'เCอ', closed: 'เCิF' },
  'ɘ': { open: 'เCอ', closed: 'เCิF' },
  'ə': { open: 'Cะ', closed: 'CัF' },
  o: { open: 'โC', closed: 'โCF' },
  'eɪ': { open: 'เC', closed: 'เCF' },
  'aɪ': { open: 'ไC', closed: 'ไCF' },
  'ɔɪ': { open: 'Cอย', closed: 'CอยF' },
  'aʊ': { open: 'เCา', closed: 'เCาF' },
  'əʊ': { open: 'โC', closed: 'โCF' },
  'oʊ': { open: 'โC', closed: 'โCF' },
  'ɪə': { open: 'เCีย', closed: 'เCียF' },
  'eə': { open: 'แC', closed: 'แCF' },
  'ɛə': { open: 'แC', closed: 'แCF' },
  'ʊə': { open: 'Cัว', closed: 'CัวF' }
};

function normalizeIpa(raw) {
  return (raw || '')
    .replace(/\([^)]*\)/g, '') // optional sounds e.g. (ɹ)
    .replace(/[\/\[\]ˈˌ.ˑ‿ʔ̩̯͡ʰ]/g, '')
    .replace(/ɚ/g, 'əɹ')
    .replace(/ɝ/g, 'ɜɹ')
    .replace(/ɡ/g, 'g')
    .replace(/ː/g, 'ː')
    .trim();
}

function tokenize(word) {
  const tokens = [];
  let i = 0;
  while (i < word.length) {
    let matched = false;
    for (const v of VOWELS) {
      if (word.startsWith(v, i)) {
        tokens.push({ type: 'V', val: v });
        i += v.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    for (const c of CONSONANTS) {
      if (word.startsWith(c, i)) {
        tokens.push({ type: 'C', val: c === 'ɡ' ? 'g' : c });
        i += c.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    // Skip lone length marks or unknown symbols
    i += 1;
  }
  return tokens;
}

function syllabify(tokens) {
  const vowelIdx = tokens.map((t, i) => (t.type === 'V' ? i : -1)).filter((i) => i !== -1);
  if (vowelIdx.length === 0) return [];
  const syllables = vowelIdx.map((vi) => ({ onset: [], vowel: tokens[vi].val, coda: [] }));

  // Onset of the first syllable
  for (let i = 0; i < vowelIdx[0]; i++) syllables[0].onset.push(tokens[i].val);

  // Consonants between vowels
  for (let s = 0; s < vowelIdx.length - 1; s++) {
    const between = tokens.slice(vowelIdx[s] + 1, vowelIdx[s + 1]).map((t) => t.val);
    if (between.length === 1) {
      syllables[s + 1].onset.push(between[0]);
    } else if (between.length > 1) {
      syllables[s].coda.push(between[0]);
      syllables[s + 1].onset.push(...between.slice(1));
    }
  }

  // Coda of the last syllable
  const last = vowelIdx[vowelIdx.length - 1];
  for (let i = last + 1; i < tokens.length; i++) syllables[syllables.length - 1].coda.push(tokens[i].val);

  return syllables;
}

function renderOnset(onset) {
  if (!onset.length) return 'อ';
  if (onset.length === 1) return ONSET_TH[onset[0]] || 'อ';
  return onset
    .map((c, idx) => (idx === 0 && onset.length > 1 && CLUSTER_FIRST_TH[c] ? CLUSTER_FIRST_TH[c] : ONSET_TH[c] || ''))
    .join('');
}

// Unaspirated stops after /s/ (e.g. "speak" → สปีค, "stop" → สตอป, "school" → สกูล)
const AFTER_S_TH = { p: 'ป', t: 'ต', k: 'ก' };

// Diphthongs whose Thai spelling already ends in a consonant-like letter → coda gets การันต์
const GLIDE_END_VOWELS = new Set(['aɪ', 'aʊ', 'ɔɪ']);

function renderCoda(coda, forceSilentMark = false) {
  if (!coda.length) return '';
  // drop silent 'h' / glides that the vowel already implies
  const parts = coda.map((c) => CODA_TH[c] ?? '').filter(Boolean);
  if (!parts.length) return '';
  // Extra coda consonants beyond the first get a silent mark (การันต์)
  return parts
    .map((p, idx) => {
      if (p.endsWith('์')) return p;
      if (idx === 0 && !forceSilentMark) return p;
      return `${p}์`;
    })
    .join('');
}

function renderSyllable(syl, isMonosyllable) {
  let prefix = '';
  let onsetList = syl.onset;

  // s + consonant clusters are written as a separate "ส" before the syllable (สเตรงธ์, สปีค)
  if (onsetList.length > 1 && (onsetList[0] === 's' || onsetList[0] === 'ʃ')) {
    prefix = onsetList[0] === 's' ? 'ส' : 'ช';
    onsetList = onsetList.slice(1);
    if (AFTER_S_TH[onsetList[0]]) {
      onsetList = [...onsetList];
      const first = AFTER_S_TH[onsetList[0]];
      const rest = onsetList.slice(1).map((c) => ONSET_TH[c] || '').join('');
      return prefix + renderWithOnset(syl, first + rest, isMonosyllable);
    }
  }

  return prefix + renderWithOnset({ ...syl, onset: onsetList }, null, isMonosyllable);
}

function renderWithOnset(syl, onsetOverride, isMonosyllable) {
  const onset = onsetOverride ?? renderOnset(syl.onset);
  const codaIsOnlyR = syl.coda.length === 1 && (syl.coda[0] === 'r' || syl.coda[0] === 'ɹ');

  // Schwa special cases
  if (syl.vowel === 'ə') {
    if (codaIsOnlyR) return `เ${onset}อร์`; // -er / -or → เออร์
    if (!syl.coda.length && onset !== 'อ' && isMonosyllable) return `เ${onset}อะ`; // the → เดอะ
  }
  if ((syl.vowel === 'ɜː' || syl.vowel === 'ɜ') && codaIsOnlyR) return `เ${onset}อร์`;

  const tpl = VOWEL_TH[syl.vowel] || VOWEL_TH['ə'];
  const coda = renderCoda(syl.coda, GLIDE_END_VOWELS.has(syl.vowel));
  const template = coda ? tpl.closed : tpl.open;
  return template.replace('C', onset).replace('F', coda);
}

/**
 * Convert one IPA word into Thai script
 */
function ipaWordToThai(ipaWord) {
  const tokens = tokenize(ipaWord);
  const syllables = syllabify(tokens);
  if (!syllables.length) return '';
  const mono = syllables.length === 1;
  return syllables.map((s) => renderSyllable(s, mono)).join('');
}

/**
 * Common English function words have well-established Thai readings
 */
export const FUNCTION_WORD_TH = {
  the: 'เดอะ', a: 'อะ', an: 'แอน', of: 'ออฟ', and: 'แอนด์', to: 'ทู', for: 'ฟอร์', in: 'อิน',
  on: 'ออน', at: 'แอท', with: 'วิธ', by: 'บาย', from: 'ฟรอม', is: 'อิซ', are: 'อาร์', be: 'บี',
  it: 'อิท', you: 'ยู', your: 'ยัวร์', my: 'มาย', up: 'อัพ', out: 'เอาท์', off: 'ออฟ', or: 'ออร์'
};

/**
 * Convert a full IPA transcription (may contain multiple words) into a Thai reading.
 * Optionally pass the English text so well-known function words use standard Thai spellings.
 * Returns the reading wrapped in parentheses, e.g. "(ฟุล ออฟ ซีล)".
 */
export function ipaToThaiReading(ipa, englishText = '') {
  const normalized = normalizeIpa(ipa);
  if (!normalized) return '';
  const words = normalized.split(/\s+/).filter(Boolean);
  const enWords = (englishText || '').toLowerCase().replace(/[^a-z'\s-]/g, '').split(/\s+/).filter(Boolean);
  const aligned = enWords.length === words.length;
  const thai = words
    .map((w, idx) => (aligned && FUNCTION_WORD_TH[enWords[idx]]) || ipaWordToThai(w))
    .filter(Boolean)
    .join(' ');
  return thai ? `(${thai})` : '';
}

export default ipaToThaiReading;
