(async () => {
  const tests = [
    ['tatoeba-unstable', 'https://api.tatoeba.org/unstable/sentences?lang=eng&q=' + encodeURIComponent('"full of zeal"') + '&sort=words&limit=5'],
    ['tatoeba-unstable2', 'https://api.tatoeba.org/unstable/sentences?lang=eng&q=' + encodeURIComponent('zeal') + '&limit=5'],
    ['tatoeba-v0', 'https://tatoeba.org/en/api_v0/search?from=eng&query=' + encodeURIComponent('zeal')],
    ['local-clips', 'http://localhost:3000/api/cafe/search?q=' + encodeURIComponent('full of zeal') + '&page=1'],
  ];
  for (const [name, url] of tests) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const t = await r.text();
      console.log(name, r.status, t.slice(0, 900));
    } catch (e) {
      console.log(name, 'ERR', e.message);
    }
    console.log('-----');
  }
})();
