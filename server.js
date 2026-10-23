const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { spawn } = require('child_process');

const PORT = 3001;

function runPythonClipEngine(args) {
  return new Promise((resolve, reject) => {
    const pyScript = path.join(__dirname, 'clip_engine.py');
    const proc = spawn('py', [pyScript, ...args], {
      cwd: __dirname,
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    proc.on('error', (err) => reject(err));
    proc.on('close', (code) => {
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        reject(new Error(stderr || stdout || `Python exited with code ${code}`));
      }
    });
  });
}

function pruneIntermediateCache(aggressive = false) {
  const cacheDir = path.join(__dirname, 'clips_cache');
  if (!fs.existsSync(cacheDir)) return { filesDeleted: 0, bytesFreed: 0 };
  let filesDeleted = 0;
  let bytesFreed = 0;
  try {
    const files = fs.readdirSync(cacheDir);
    for (const f of files) {
      const full = path.join(cacheDir, f);
      const isIntermediate = f.endsWith('_raw.mp4') ||
                            f.startsWith('export_payload_') ||
                            f.startsWith('slide_bg_') ||
                            f.startsWith('clip_mask_') ||
                            (aggressive && (f.endsWith('.tmp') || f.startsWith('thumb_raw_')));
      if (isIntermediate) {
        try {
          const sz = fs.statSync(full).size;
          fs.unlinkSync(full);
          filesDeleted++;
          bytesFreed += sz;
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn('Error during cache prune:', err.message);
  }
  return { filesDeleted, bytesFreed };
}

// Prune on startup
pruneIntermediateCache(false);

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

function cleanText(raw) {
  if (!raw) return '';
  return decodeHtmlEntities(
    raw
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

// Check if a movie title / text is predominantly English (ASCII/Latin without foreign-only words)
function isLikelyEnglishMovie(movieTitle, transcript, production, summary, inLang) {
  if (!movieTitle) return false;
  // Must have ASCII letters
  if (!/[a-zA-Z]/.test(movieTitle)) return false;
  // Reject non-Latin characters in title
  if (/[^\x00-\x7F\u00C0-\u017F]/.test(movieTitle)) return false;
  // Reject obvious German/French/Spanish/Italian/Indian non-English titles if production is N/A
  const nonEnglishTitlePatterns = /(geschwader|krimi|tatort|liebe|mord|nacht|stadt|leben|monde|amour|mujer|casa|vita|notte|bahu|pyaar|dil|ishq)/i;
  if (nonEnglishTitlePatterns.test(movieTitle)) return false;
  if (Array.isArray(inLang) && inLang.length > 0 && !inLang.includes('en')) return false;
  if (transcript && !/[a-zA-Z]{2,}/.test(transcript)) return false;
  return true;
}

async function fetchClipDetail(link) {
  const detailUrl = link.startsWith('http') ? link : `https://clip.cafe/${link.replace(/^\/+/, '')}`;
  try {
    const resp = await fetch(detailUrl, {
      headers: HEADERS,
      signal: AbortSignal.timeout(6500)
    });
    if (!resp.ok) return null;
    const html = await resp.text();

    // Extract Movie Summary from #clip-about-section
    const summaryMatch = html.match(/<h3>\s*Movie Summary\s*<\/h3>\s*<div class=["']clip-transcript-text["']>([\s\S]*?)<\/div>/i);
    const movieSummary = summaryMatch ? cleanText(summaryMatch[1]) : '';

    // Extract Full Transcript lines
    const subLines = [...html.matchAll(/<div class=["']subtitleLine["']>([\s\S]*?)<\/div>/gi)]
      .map(m => cleanText(m[1]))
      .filter(Boolean);
    const fullTranscript = subLines.join(' ');

    // Extract window.movieData
    const movieDataMatch = html.match(/window\.movieData\s*=\s*(\{[\s\S]*?\});/);
    let genres = '';
    let production = '';
    let imdb = '';
    if (movieDataMatch) {
      const rawObj = movieDataMatch[1];
      const gMatch = rawObj.match(/genres:\s*["']([^"']*)["']/i);
      const pMatch = rawObj.match(/production:\s*["']([^"']*)["']/i);
      const iMatch = rawObj.match(/imdb:\s*["']([^"']*)["']/i);
      genres = gMatch ? gMatch[1].replace(/,+$/, '').split(',').filter(Boolean).join(', ') : '';
      production = pMatch ? pMatch[1].replace(/,+$/, '').split(',').filter(Boolean).join(', ') : '';
      imdb = iMatch ? iMatch[1] : '';
    }

    // Extract Timestamp in Movie
    const tsMatch = html.match(/<div class=["']clip-meta-label["']>\s*Timestamp in Movie\s*<\/div>\s*<div class=["']clip-meta-value["']>([^<]+)<\/div>/i);
    const timestampInMovie = tsMatch ? cleanText(tsMatch[1]) : '';

    // Extract JSON-LD language, awards & duration
    let inLanguage = ['en'];
    let award = '';
    let detailDuration = '';
    const jsonLdMatch = html.match(/<script type=["']application\/ld\+json["']>\s*(\{[\s\S]*?\})\s*<\/script>/i);
    if (jsonLdMatch) {
      try {
        const parsed = JSON.parse(jsonLdMatch[1]);
        if (parsed.inLanguage) inLanguage = parsed.inLanguage;
        if (parsed.award && parsed.award !== 'N/A') award = parsed.award;
        if (parsed.duration) {
          const secMatch = String(parsed.duration).match(/(\d+)\s*S/i);
          if (secMatch) detailDuration = `${secMatch[1]}s`;
        }
      } catch (e) {}
    }

    return {
      movieSummary,
      fullTranscript,
      genres,
      production,
      imdb,
      timestampInMovie,
      inLanguage,
      award,
      detailDuration
    };
  } catch (err) {
    return null;
  }
}

const searchCache = new Map();

async function scrapeClipCafeSearch(query, page = 1, onlyMovies = true) {
  const cacheKey = `${query.trim().toLowerCase()}_p${page}_m${onlyMovies ? 1 : 0}`;
  if (searchCache.has(cacheKey)) {
    const cached = searchCache.get(cacheKey);
    if (Date.now() - cached.ts < 10 * 60 * 1000) {
      return cached.data;
    }
  }

  const cleanQuery = encodeURIComponent(query.trim());
  const pagesToFetch = page === 1 ? [1, 2] : [page];
  const rawCandidates = [];
  const seenSlugs = new Set();

  const pageHtmlList = await Promise.all(
    pagesToFetch.map(async (p) => {
      const targetUrl = p > 1
        ? `https://clip.cafe/page/${p}/?s=${cleanQuery}&usersearch=1`
        : `https://clip.cafe/?s=${cleanQuery}&usersearch=1`;
      try {
        const resp = await fetch(targetUrl, {
          headers: HEADERS,
          signal: AbortSignal.timeout(7000)
        });
        if (!resp.ok) return '';
        return await resp.text();
      } catch (e) {
        return '';
      }
    })
  );

  for (const html of pageHtmlList) {
    if (!html) continue;
    const blocks = html.split('<div class="searchResultClip">').slice(1);

    for (const b of blocks) {
      const slug = (b.match(/data-slug=["']([^"']+)["']/) || [])[1];
      const link = (b.match(/data-link=["']([^"']+)["']/) || [])[1];
      if (!slug || !link || seenSlugs.has(slug)) continue;

      // 1. Must have English Audio tag on clip.cafe
      const isEnglishAudio = /title=["']Audio:\s*English["']/i.test(b) || /<span class=["']pill-code["']>EN<\/span>/i.test(b);
      if (!isEnglishAudio) continue;

      // 2. Check if it's a Movie (no Season/Episode badge) vs TV Series
      const isSeries = /Season\s+\d+|Episode\s+\d+|clipEpisodeBadge/i.test(b);
      const isMovie = !isSeries;

      const dur = (b.match(/<span class=["']videoDuration["']>([^<]+)<\/span>/) || [])[1] || '';
      const movieTitleRaw = (b.match(/<div class=["']clipMovie["']>\s*<a[^>]*>([^<]+)<\/a>/) || [])[1] || 'Movie Scene';
      const movieTitle = cleanText(movieTitleRaw);

      const movieDivMatch = b.match(/<div class=["']clipMovie["']>([\s\S]*?)<\/div>/);
      const movieMetaText = movieDivMatch ? cleanText(movieDivMatch[1]) : '';
      const yearMatch = movieMetaText.match(/\b(19\d{2}|20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

      const transMatch = b.match(/<div class=["']clipTrans["']>\s*<p>(?:<b>Transcript:<\/b><br>)?([\s\S]*?)<\/p>/i);
      const transcript = transMatch ? cleanText(transMatch[1]) : '';

      if (!isLikelyEnglishMovie(movieTitle, transcript, '', '', ['en'])) continue;

    const detailUrl = `https://clip.cafe/${link.replace(/^\/+/, '')}`;
    const thumbProxyUrl = `http://127.0.0.1:${PORT}/api/cafe/thumb?slug=${encodeURIComponent(slug)}`;

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
        thumb: thumbProxyUrl,
        remoteThumb: `https://clip.cafe/img800/${slug}.jpg`,
        videoUrl: `https://clip.cafe/videos/${slug}.mp4`,
        pageUrl: detailUrl,
        isRealCafeClip: true
      });
    }
  }

  // Prioritize pure Movies (isMovie === true) first, then English series if needed
  const pureMovies = rawCandidates.filter(c => c.isMovie);
  const englishSeries = rawCandidates.filter(c => !c.isMovie);
  const ordered = onlyMovies && pureMovies.length >= 3
    ? [...pureMovies, ...englishSeries]
    : [...pureMovies, ...englishSeries];

  const topBatch = ordered.slice(0, 14);

  // Fetch detail pages in parallel to get Movie Summary, Full Transcript, Genres & Production Studio
  const enriched = await Promise.all(
    topBatch.map(async (clip) => {
      const detail = await fetchClipDetail(clip.link);
      if (detail) {
        clip.movieSummary = detail.movieSummary || '';
        clip.fullTranscript = detail.fullTranscript || clip.rawTranscript || '';
        clip.genres = detail.genres || '';
        clip.production = detail.production || '';
        clip.imdb = detail.imdb || '';
        clip.timestampInMovie = detail.timestampInMovie || '';
        clip.award = detail.award || '';
        if (!clip.duration && detail.detailDuration) {
          clip.duration = detail.detailDuration;
        }
        if (detail.fullTranscript) {
          clip.quote = `"${detail.fullTranscript}"`;
        }
      } else {
        clip.movieSummary = '';
        clip.fullTranscript = clip.rawTranscript || '';
        clip.genres = '';
        clip.production = '';
      }
      return clip;
    })
  );

  // Filter out any clip whose detail page revealed non-English or empty summary if we have better ones,
  // and sort clips that have a rich Movie Summary + Production Studio to the very top!
  const validEnriched = enriched.filter(c =>
    isLikelyEnglishMovie(c.movieTitle, c.fullTranscript, c.production, c.movieSummary, ['en'])
  );

  validEnriched.sort((a, b) => {
    // 1. Pure Movie over Series
    if (a.isMovie !== b.isMovie) return a.isMovie ? -1 : 1;
    // 2. Has Movie Summary over no summary
    const hasSumA = Boolean(a.movieSummary && a.movieSummary.length > 20);
    const hasSumB = Boolean(b.movieSummary && b.movieSummary.length > 20);
    if (hasSumA !== hasSumB) return hasSumA ? -1 : 1;
    // 3. Known English production company over N/A
    const hasProdA = Boolean(a.production && a.production !== 'N/A');
    const hasProdB = Boolean(b.production && b.production !== 'N/A');
    if (hasProdA !== hasProdB) return hasProdA ? -1 : 1;
    return 0;
  });

  searchCache.set(cacheKey, { ts: Date.now(), data: validEnriched });
  return validEnriched;
}

const server = http.createServer(async (req, res) => {
  // Enable permissive CORS for 127.0.0.1:5500, localhost:5500, file://, etc.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (parsedUrl.pathname === '/api/cafe/search') {
    const q = parsedUrl.searchParams.get('q') || '';
    const page = parseInt(parsedUrl.searchParams.get('page') || '1', 10);
    const onlyMovies = parsedUrl.searchParams.get('onlyMovies') !== '0';

    if (!q.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'Missing query parameter q' }));
      return;
    }

    try {
      const clips = await scrapeClipCafeSearch(q, page, onlyMovies);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        query: q,
        page,
        count: clips.length,
        clips
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  if (parsedUrl.pathname === '/api/cafe/thumb' && req.method === 'GET') {
    const slug = (parsedUrl.searchParams.get('slug') || '').replace(/[^a-zA-Z0-9_\-]/g, '');
    if (!slug) {
      res.writeHead(400);
      res.end();
      return;
    }
    const cacheDir = path.join(__dirname, 'clips_cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const cachedImg = path.join(cacheDir, `thumb_crop16x9_${slug}.jpg`);
    const rawImg = path.join(cacheDir, `thumb_raw_${slug}.jpg`);
    if (fs.existsSync(cachedImg) && fs.statSync(cachedImg).size > 500) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' });
      fs.createReadStream(cachedImg).pipe(res);
      return;
    }
    try {
      const imgResp = await fetch(`https://clip.cafe/img800/${slug}.jpg`, {
        headers: { ...HEADERS, 'Referer': 'https://clip.cafe/' },
        signal: AbortSignal.timeout(7000)
      });
      if (!imgResp.ok) throw new Error(`HTTP ${imgResp.status}`);
      const buf = Buffer.from(await imgResp.arrayBuffer());
      if (buf.length > 500) {
        fs.writeFileSync(rawImg, buf);
        // Auto-crop any letterbox/pillarbox black bars and normalize to uniform 16:9 (800x450)
        await new Promise((resolve) => {
          const proc = spawn('ffmpeg', [
            '-y', '-loop', '1', '-i', rawImg,
            '-frames:v', '3',
            '-vf', 'cropdetect=24:2:0',
            '-f', 'null', '-'
          ], { windowsHide: true });
          let errOut = '';
          proc.stderr.on('data', d => { errOut += d.toString(); });
          proc.on('close', () => {
            const m = errOut.match(/crop=(\d+:\d+:\d+:\d+)/g);
            const lastCrop = m && m.length ? m[m.length - 1].replace('crop=', '') : '';
            let debar = '';
            if (lastCrop) {
              const parts = lastCrop.split(':').map(Number);
              if (parts[0] >= 120 && parts[1] >= 80) debar = `crop=${lastCrop},`;
            }
            const ff2 = spawn('ffmpeg', [
              '-y', '-i', rawImg,
              '-vf', `${debar}scale=800:450:force_original_aspect_ratio=increase,crop=800:450`,
              '-q:v', '2',
              cachedImg
            ], { windowsHide: true });
            ff2.on('close', () => resolve());
            ff2.on('error', () => resolve());
          });
          proc.on('error', () => resolve());
        });
      }
      const finalFile = (fs.existsSync(cachedImg) && fs.statSync(cachedImg).size > 500) ? cachedImg : rawImg;
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' });
      fs.createReadStream(finalFile).pipe(res);
    } catch (e) {
      res.writeHead(404);
      res.end();
    }
    return;
  }

  // Direct Video Stream Proxy with CORS & Range support for instant preview
  if (parsedUrl.pathname === '/api/cafe/stream' && req.method === 'GET') {
    const rawSlug = parsedUrl.searchParams.get('slug') || '';
    const rawUrl = parsedUrl.searchParams.get('url') || '';
    const cleanSlug = (rawSlug || path.basename(rawUrl, '.mp4')).replace(/[^a-zA-Z0-9_\-]/g, '_');
    
    // Check if we have a locally cached file first
    const localCandidates = [
      path.join(__dirname, 'clips_cache', `${cleanSlug}_crop16x9.mp4`),
      path.join(__dirname, 'clips_cache', `${cleanSlug}_raw.mp4`),
      path.join(__dirname, 'clips_cache', `${cleanSlug}.mp4`),
    ];
    for (const cand of localCandidates) {
      if (fs.existsSync(cand) && fs.statSync(cand).size > 5000) {
        const stat = fs.statSync(cand);
        if (req.headers.range) {
          const parts = req.headers.range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': (end - start) + 1,
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': '*'
          });
          fs.createReadStream(cand, { start, end }).pipe(res);
          return;
        } else {
          res.writeHead(200, {
            'Content-Length': stat.size,
            'Accept-Ranges': 'bytes',
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': '*'
          });
          fs.createReadStream(cand).pipe(res);
          return;
        }
      }
    }

    // Proxy directly from clip.cafe
    const targetUrl = (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
      ? rawUrl
      : `https://clip.cafe/videos/${cleanSlug}.mp4`;

    const parsedTarget = new URL(targetUrl);
    const proxyReq = https.request({
      hostname: parsedTarget.hostname,
      port: 443,
      path: parsedTarget.pathname + parsedTarget.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0 Safari/537.36',
        'Referer': 'https://clip.cafe/',
        'Accept': 'video/webm,video/ogg,video/*;q=0.9,*/*;q=0.5',
        ...(req.headers.range ? { 'Range': req.headers.range } : {})
      }
    }, (proxyRes) => {
      const responseHeaders = {
        'Content-Type': proxyRes.headers['content-type'] || 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*'
      };
      if (proxyRes.headers['content-length']) {
        responseHeaders['Content-Length'] = proxyRes.headers['content-length'];
      }
      if (proxyRes.headers['content-range']) {
        responseHeaders['Content-Range'] = proxyRes.headers['content-range'];
      }
      res.writeHead(proxyRes.statusCode, responseHeaders);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    proxyReq.end();
    return;
  }

  // Python Video Engine Endpoints: Download single clip, Prepare sequence, or Merge & Export with Aspect Ratio
  if (parsedUrl.pathname === '/api/cafe/python-video' && req.method === 'GET') {
    const slug = parsedUrl.searchParams.get('slug') || '';
    if (!slug.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'Missing slug' }));
      return;
    }
    try {
      const result = await runPythonClipEngine(['--action', 'download', '--slug', slug]);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  if (parsedUrl.pathname === '/api/cafe/python-sequence' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const result = await runPythonClipEngine(['--action', 'sequence', '--payload', JSON.stringify(body)]);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  if (parsedUrl.pathname === '/api/cafe/python-export' && req.method === 'POST') {
    let tempPayloadPath = '';
    try {
      const body = await readJsonBody(req);
      const cacheDir = path.join(__dirname, 'clips_cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      tempPayloadPath = path.join(cacheDir, `export_payload_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.json`);
      fs.writeFileSync(tempPayloadPath, JSON.stringify(body), 'utf8');
      const result = await runPythonClipEngine(['--action', 'export', '--payload-file', tempPayloadPath]);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    } finally {
      if (tempPayloadPath && fs.existsSync(tempPayloadPath)) {
        try { fs.unlinkSync(tempPayloadPath); } catch (e) {}
      }
    }
    return;
  }

  // Clean intermediate storage cache endpoint
  if (parsedUrl.pathname === '/api/cafe/clean-cache' && (req.method === 'POST' || req.method === 'GET')) {
    try {
      const all = parsedUrl.searchParams.get('all') === '1';
      const result = pruneIntermediateCache(all);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, ...result }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Also serve static files & cached MP4 videos with HTTP Range support
  let filePath = parsedUrl.pathname === '/' ? '/index.html' : decodeURIComponent(parsedUrl.pathname);
  const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(__dirname, safePath);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath).toLowerCase();
    const stat = fs.statSync(fullPath);
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    if (parsedUrl.searchParams.get('download') === '1') {
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fullPath)}"`);
    }

    if (ext === '.mp4' && req.headers.range) {
      const parts = req.headers.range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunkSize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });
      fs.createReadStream(fullPath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType
      });
      fs.createReadStream(fullPath).pipe(res);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Clip.Cafe English Movie Scraper Server running on http://127.0.0.1:${PORT} and http://localhost:${PORT}`);
});
