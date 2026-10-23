const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(targetUrl);
    const client = parsed.protocol === 'http:' ? http : https;
    client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      // follow redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirect = res.headers.location;
        if (!redirect.startsWith('http')) {
          redirect = `https://clip.cafe${redirect.startsWith('/') ? '' : '/'}${redirect}`;
        }
        return resolve(fetchUrl(redirect));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function parseClipCafeHtml(html) {
  const clips = [];
  const regex = /<picture\s+class=["']clipThumb["']\s+data-slug=["']([^"']+)["']\s+data-link=["']([^"']+)["'][\s\S]*?<span\s+class=["']videoDuration["']>([^<]+)<\/span>[\s\S]*?<div\s+class=["']clipMovie["']>\s*<a[^>]*>([^<]+)<\/a>\s*(?:•\s*(\d{4}))?[\s\S]*?<div\s+class=["']clipTrans["']>\s*<p>(?:<b>Transcript:<\/b><br>)?([\s\S]*?)<\/p>/gi;

  let match;
  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const link = match[2];
    const duration = match[3] ? match[3].trim() : '';
    const movieTitle = match[4] ? match[4].trim() : 'Clip Scene';
    const year = match[5] ? parseInt(match[5]) : new Date().getFullYear();
    let transcript = match[6] ? match[6].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

    clips.push({
      id: `cafe_${slug}`,
      slug: slug,
      title: `${movieTitle} (${year})`,
      movieTitle: movieTitle,
      year: year,
      duration: duration,
      quote: transcript ? `"${transcript}"` : `Scene from ${movieTitle}`,
      thumb: `https://clip.cafe/img800/${slug}.jpg`,
      videoUrl: `https://clip.cafe/videos/${slug}.mp4`,
      pageUrl: `https://clip.cafe/${link}`
    });
  }

  return clips;
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/api/cafe/search') {
    const query = parsedUrl.query.q || 'impressed';
    const page = parsedUrl.query.page || 1;
    console.log(`[Scraper API] Scraping clip.cafe for "${query}" (page ${page})...`);

    try {
      const target = page > 1 
        ? `https://clip.cafe/page/${page}/?s=${encodeURIComponent(query)}&usersearch=1`
        : `https://clip.cafe/?s=${encodeURIComponent(query)}&usersearch=1`;
        
      const response = await fetchUrl(target);
      const clips = parseClipCafeHtml(response.body);

      console.log(`[Scraper API] Extracted ${clips.length} real clips for "${query}"`);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        source: 'clip.cafe',
        query: query,
        page: parseInt(page),
        total: clips.length,
        clips: clips
      }));
    } catch (err) {
      console.error('[Scraper API] Error scraping:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Real Cafe Clip Scraper Service running at http://localhost:${PORT}`);
});
