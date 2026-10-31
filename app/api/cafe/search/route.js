import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Comprehensive Idiomatic Quote Glossary to ensure natural native Thai translation (no literal machine translation)
const IDIOM_QUOTE_GLOSSARY = [
  {
    pattern: /\bgive it up for\b/i,
    replaceFn: (th) => th
      .replace(/ยอมแพ้เพื่อ/g, 'ขอเสียงปรบมือให้')
      .replace(/ยอมแพ้ให้กับ/g, 'ขอเสียงปรบมือให้กับ')
      .replace(/ยอมแพ้/g, 'ขอเสียงปรบมือให้')
      .replace(/มอบมันให้กับ/g, 'ขอเสียงปรบมือให้')
      .replace(/ขอมันให้กับ/g, 'ขอเสียงปรบมือให้')
      .replace(/มอบให้/g, 'ขอเสียงปรบมือให้')
  },
  {
    pattern: /\bcall it a day\b/i,
    replaceFn: (th) => th
      .replace(/เรียกได้ว่าเป็นวันเลย/g, 'วันนี้พอแค่นี้เถอะ')
      .replace(/เรียกมันว่าวันหนึ่ง/g, 'วันนี้เลิกงานกันเถอะ')
      .replace(/เรียกมันว่าสักวันหนึ่ง/g, 'วันนี้พอแค่นี้กันก่อน')
      .replace(/เรียกมันว่าเป็นวัน/g, 'เลิกงานกันเถอะ')
  },
  {
    pattern: /\bhit the sack\b/i,
    replaceFn: (th) => th
      .replace(/โดนกระสอบ/g, 'ไปนอนพักผ่อน')
      .replace(/ตีกระสอบ/g, 'เข้านอน')
      .replace(/กระสอบ/g, 'ที่นอน')
  },
  {
    pattern: /\bbite the bullet\b/i,
    replaceFn: (th) => th
      .replace(/กัดกระสุน/g, 'กัดฟันสู้')
      .replace(/กระสุน/g, 'ความจริงที่ยากจะยอมรับ')
  },
  {
    pattern: /\bbreak a leg\b/i,
    replaceFn: (th) => th
      .replace(/หักขา/g, 'ขอให้โชคดีนะ')
      .replace(/ขาหัก/g, 'ขอให้โชคดีกับการแสดง')
      .replace(/มันโชคดีกับการแสดง/g, 'มันแปลว่าขอให้โชคดี')
  },
  {
    pattern: /\bget over\b/i,
    replaceFn: (th) => th
      .replace(/ได้รับมากกว่า/g, 'ตัดใจ/ก้าวข้ามผ่าน')
      .replace(/เลิกกับม้า/g, 'ข้ามไปฝั่งม้า')
  },
  {
    pattern: /\bget along with\b/i,
    replaceFn: (th) => th
      .replace(/ได้รับพร้อมกับ/g, 'เข้ากันได้ดีกับ')
      .replace(/ได้มาพร้อมกับ/g, 'เข้ากันได้กับ')
  },
  {
    pattern: /\bpiece of cake\b/i,
    replaceFn: (th) => th
      .replace(/ชิ้นเค้ก/g, 'เรื่องกล้วยๆ ง่ายนิดเดียว')
      .replace(/เค้กชิ้นหนึ่ง/g, 'เรื่องง่ายๆ สบายมาก')
  },
  {
    pattern: /\bunder the weather\b/i,
    replaceFn: (th) => th
      .replace(/อยู่ใต้สภาพอากาศ/g, 'รู้สึกไม่ค่อยสบาย')
      .replace(/ใต้สภาพอากาศ/g, 'ป่วยนิดหน่อย')
  },
  {
    pattern: /\bonce in a blue moon\b/i,
    replaceFn: (th) => th
      .replace(/ดวงจันทร์สีน้ำเงิน/g, 'นานๆ ที นานทีปีหน')
      .replace(/พระจันทร์สีน้ำเงิน/g, 'แทบไม่เคยเกิดขึ้นเลย')
  },
  {
    pattern: /\bspill the tea\b/i,
    replaceFn: (th) => th
      .replace(/ทำชาหก/g, 'เม้าท์มอยเรื่องแซ่บๆ')
      .replace(/เทชา/g, 'เล่าความลับมาให้ฟังหน่อย')
  },
  {
    pattern: /\bburn the midnight oil\b/i,
    replaceFn: (th) => th
      .replace(/เผาน้ำมันเที่ยงคืน/g, 'โหมทำงานดึกดื่น')
      .replace(/จุดน้ำมันเที่ยงคืน/g, 'อ่านหนังสือหามรุ่งหามค่ำ')
  },
  {
    pattern: /\bon the fence\b/i,
    replaceFn: (th) => th
      .replace(/อยู่บนรั้ว/g, 'ยังลังเลสองจิตสองใจ')
      .replace(/บนรั้ว/g, 'ยังตัดสินใจไม่ได้')
  },
  {
    pattern: /\bcost an arm and a leg|costs an arm and a leg\b/i,
    replaceFn: (th) => th
      .replace(/เสียแขนและขา/g, 'แพงหูฉี่')
      .replace(/ราคาแขนและขา/g, 'แพงมหาศาล')
  },
  {
    pattern: /\bcut corners\b/i,
    replaceFn: (th) => th
      .replace(/ตัดมุม/g, 'ทำงานลวกๆ มักง่าย')
  },
  {
    pattern: /\bout of the blue\b/i,
    replaceFn: (th) => th
      .replace(/จากสีฟ้า/g, 'อยู่ดีๆ ก็โผล่มาแบบไม่ทันตั้งตัว')
      .replace(/จากสีน้ำเงิน/g, 'จู่ๆ ก็เกิดขึ้นอย่างไม่คาดฝัน')
  },
  {
    pattern: /\btake it with a grain of salt\b/i,
    replaceFn: (th) => th
      .replace(/เม็ดเกลือ/g, 'ฟังหูไว้หู ชั่งใจไว้ก่อน')
  },
  {
    pattern: /\bbeat around the bush\b/i,
    replaceFn: (th) => th
      .replace(/ตีรอบพุ่มไม้/g, 'พูดอ้อมค้อม ชักแม่น้ำทั้งห้า')
  },
  {
    pattern: /\bpull yourself together\b/i,
    replaceFn: (th) => th
      .replace(/ดึงตัวเองเข้าด้วยกัน/g, 'ตั้งสตินะ สงบสติอารมณ์หน่อย')
  },
  {
    pattern: /\bspeak of the devil\b/i,
    replaceFn: (th) => th
      .replace(/พูดถึงปีศาจ/g, 'ตายยากจริงๆ พูดถึงปุ๊บก็มาปั๊บ')
  },
  {
    pattern: /\blook forward to\b/i,
    replaceFn: (th) => th
      .replace(/มองไปข้างหน้า/g, 'ตั้งหน้าตั้งตารอคอย')
  },
  {
    pattern: /\bput up with\b/i,
    replaceFn: (th) => th
      .replace(/ทนกับ/g, 'อดทนยอมรับกับ')
  }
];

function refineIdiomaticTranslation(en, th) {
  if (!th || !en) return th;
  let refined = th;
  for (const item of IDIOM_QUOTE_GLOSSARY) {
    if (item.pattern.test(en)) {
      refined = item.replaceFn(refined);
    }
  }
  return refined;
}

async function fetchWiktionaryDefinition(word) {
  if (!word || !word.includes(' ')) return null;
  try {
    const res = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word.toLowerCase().trim())}`,
      { headers: HEADERS, signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const defs = data?.en?.[0]?.definitions;
    if (Array.isArray(defs) && defs.length > 0) {
      for (const d of defs) {
        const raw = (d.definition || '').replace(/<[^>]+>/g, '').trim();
        const clean = raw.replace(/^\([^\)]+\)\s*/, '').replace(/^To\s+/i, '').trim();
        if (clean && !clean.includes('Alternative form') && !clean.includes('Misspelling')) {
          // Keep concise single phrase/clause
          const shortDef = clean.split(/[.;\n]/)[0].trim();
          if (shortDef && shortDef.length <= 60) return shortDef;
        }
      }
    }
  } catch {}
  return null;
}

async function translateQuoteToThai(text, targetWord = '', targetMeaning = '') {
  const clean = (text || '').replace(/^["'“”]+|["'“”]+$/g, '').trim();
  if (!clean) return '';

  const cleanWord = (targetWord || '').trim();
  const cleanMeaning = (targetMeaning || '').split(/[\/(]/)[0].trim();

  // STRATEGY 1: Contextual Slot Substitution (Zero literal translation for unseen idioms)
  // If the quote contains the target idiom/phrase and user provided an intended meaning:
  if (cleanWord && cleanMeaning && cleanWord.includes(' ')) {
    try {
      const escaped = cleanWord.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
      const wordRegex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (wordRegex.test(clean) || clean.toLowerCase().includes(cleanWord.toLowerCase())) {
        const marker = '___IDIOM_SLOT___';
        const replacedEn = wordRegex.test(clean)
          ? clean.replace(wordRegex, marker)
          : clean.replace(new RegExp(escaped, 'i'), marker);

        const r = await fetch(
          `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=th&q=${encodeURIComponent(replacedEn)}`,
          { headers: HEADERS, signal: AbortSignal.timeout(3500) }
        );
        if (r.ok) {
          const data = await r.json();
          const out = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0][0] : data[0]) : '';
          if (typeof out === 'string' && (out.includes('___IDIOM_SLOT___') || /___\s*idiom_slot\s*___/i.test(out))) {
            const finalTh = out.replace(/___IDIOM_SLOT___|___\s*idiom_slot\s*___/gi, cleanMeaning).trim();
            return refineIdiomaticTranslation(clean, finalTh);
          }
        }
      }
    } catch {
      // fallback to semantic or direct translation
    }
  }

  // STRATEGY 2: Semantic English Definition Substitution via Wiktionary
  // If no user meaning or slot failed, resolve the idiom's true English definition (e.g. 'hit the sack' -> 'go to bed')
  if (cleanWord && cleanWord.includes(' ')) {
    try {
      const plainEnglishDef = await fetchWiktionaryDefinition(cleanWord);
      if (plainEnglishDef) {
        const escaped = cleanWord.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
        const wordRegex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (wordRegex.test(clean)) {
          const semanticEn = clean.replace(wordRegex, plainEnglishDef);
          const r = await fetch(
            `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=th&q=${encodeURIComponent(semanticEn)}`,
            { headers: HEADERS, signal: AbortSignal.timeout(3500) }
          );
          if (r.ok) {
            const data = await r.json();
            const out = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0][0] : data[0]) : '';
            if (typeof out === 'string' && out.trim()) {
              return refineIdiomaticTranslation(clean, out.trim());
            }
          }
        }
      }
    } catch {
      // fallback
    }
  }

  // STRATEGY 3: Standard Machine Translation with Built-in Glossary Refinement
  try {
    const r = await fetch(
      `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=th&q=${encodeURIComponent(clean)}`,
      {
        headers: HEADERS,
        signal: AbortSignal.timeout(4000)
      }
    );
    if (r.ok) {
      const data = await r.json();
      const out = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0][0] : data[0]) : '';
      if (typeof out === 'string' && out.trim()) {
        let th = refineIdiomaticTranslation(clean, out.trim());

        // Alignment check: If literal translation still leaked through, replace with cleanMeaning
        if (cleanWord && cleanMeaning && cleanWord.includes(' ')) {
          try {
            const rawWordRes = await fetch(
              `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=th&q=${encodeURIComponent(cleanWord)}`,
              { headers: HEADERS, signal: AbortSignal.timeout(2500) }
            );
            if (rawWordRes.ok) {
              const wdData = await rawWordRes.json();
              const literalWdTh = Array.isArray(wdData) ? (Array.isArray(wdData[0]) ? wdData[0][0] : wdData[0]) : '';
              if (literalWdTh && literalWdTh.length >= 2 && th.includes(literalWdTh)) {
                th = th.replace(literalWdTh, cleanMeaning);
              }
            }
          } catch {}
        }
        return th;
      }
    }
  } catch {
    // ignore translation timeout
  }
  return '';
}

async function attachThaiQuotesToClips(clips = [], targetWord = '', targetMeaning = '') {
  if (!Array.isArray(clips) || clips.length === 0) return clips;
  await Promise.all(
    clips.map(async (clip) => {
      if (clip.quoteTh) return;
      const rawEn = clip.rawTranscript || (clip.quote || '').replace(/^["'“”]+|["'“”]+$/g, '');
      if (rawEn && !/^Scene from /i.test(rawEn)) {
        clip.quoteTh = await translateQuoteToThai(rawEn, targetWord, targetMeaning);
      } else {
        clip.quoteTh = '';
      }
    })
  );
  return clips;
}

async function scrapeClipCafe(query, page = 1) {
  const cleanQuery = encodeURIComponent(query.trim());
  const pagesToFetch = page === 1 ? [1, 2] : [page];
  const seenSlugs = new Set();
  const rawCandidates = [];

  const htmlList = await Promise.all(
    pagesToFetch.map(async (p) => {
      const targetUrl = p > 1
        ? `https://clip.cafe/page/${p}/?s=${cleanQuery}&usersearch=1`
        : `https://clip.cafe/?s=${cleanQuery}&usersearch=1`;
      try {
        const resp = await fetch(targetUrl, {
          headers: HEADERS,
          signal: AbortSignal.timeout(6000)
        });
        if (!resp.ok) return '';
        return await resp.text();
      } catch {
        return '';
      }
    })
  );

  for (const html of htmlList) {
    if (!html) continue;
    const blocks = html.split('<div class="searchResultClip">').slice(1);
    for (const b of blocks) {
      const slug = (b.match(/data-slug=["']([^"']+)["']/) || [])[1];
      const link = (b.match(/data-link=["']([^"']+)["']/) || [])[1];
      if (!slug || !link || seenSlugs.has(slug)) continue;

      const dur = (b.match(/<span class=["']videoDuration["']>([^<]+)<\/span>/) || [])[1] || '';
      const movieTitleRaw = (b.match(/<div class=["']clipMovie["']>\s*<a[^>]*>([^<]+)<\/a>/) || [])[1] || 'Movie Scene';
      const movieTitle = cleanText(movieTitleRaw);

      const movieDivMatch = b.match(/<div class=["']clipMovie["']>([\s\S]*?)<\/div>/);
      const movieMetaText = movieDivMatch ? cleanText(movieDivMatch[1]) : '';
      const yearMatch = movieMetaText.match(/\b(19\d{2}|20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

      const transMatch = b.match(/<div class=["']clipTrans["']>\s*<p>(?:<b>Transcript:<\/b><br>)?([\s\S]*?)<\/p>/i);
      const transcript = transMatch ? cleanText(transMatch[1]) : '';

      const isSeries = /Season\s+\d+|Episode\s+\d+|clipEpisodeBadge/i.test(b);
      const isMovie = !isSeries;

      seenSlugs.add(slug);
      rawCandidates.push({
        id: `cafe_${slug}`,
        slug,
        link,
        title: `${movieTitle} (${year})`,
        movieTitle,
        year,
        duration: dur.trim(),
        isMovie,
        audioLang: 'EN',
        quote: transcript ? `"${transcript}"` : `Scene from ${movieTitle}`,
        rawTranscript: transcript,
        thumb: `https://clip.cafe/img800/${slug}.jpg`,
        remoteThumb: `https://clip.cafe/img800/${slug}.jpg`,
        videoUrl: `https://clip.cafe/videos/${slug}.mp4`,
        pageUrl: `https://clip.cafe/${link.replace(/^\/+/, '')}`,
        isRealCafeClip: true
      });
    }
  }

  return rawCandidates.slice(0, 16);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const meaning = searchParams.get('meaning') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  if (!q.trim()) {
    return NextResponse.json({ success: false, error: 'Missing query parameter q' }, { status: 400 });
  }

  // 1. First attempt proxy to backend server on 3001 if available
  try {
    const backendRes = await fetch(`http://127.0.0.1:3001/api/cafe/search?q=${encodeURIComponent(q)}&page=${page}`, {
      signal: AbortSignal.timeout(3000)
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && Array.isArray(data.clips)) {
        await attachThaiQuotesToClips(data.clips, q, meaning);
      }
      return NextResponse.json(data);
    }
  } catch {
    // Backend 3001 not running, proceed to direct scrape
  }

  // 2. Direct scrape fallback
  try {
    const clips = await scrapeClipCafe(q, page);
    await attachThaiQuotesToClips(clips, q, meaning);
    return NextResponse.json({
      success: true,
      query: q,
      page,
      count: clips.length,
      clips
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
