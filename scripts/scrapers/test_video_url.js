const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function test() {
  const res = await fetchUrl('https://clip.cafe/the-current-war-directors-cut-2017/i-make-something-impossible/');
  console.log('Status:', res.status);
  const body = res.body;

  // Search for video tag or iframe or mp4
  const videoTagMatch = body.match(/<video[^>]*>([\s\S]*?)<\/video>/i);
  console.log('Video tag match:', videoTagMatch ? videoTagMatch[0] : 'None');

  const mp4Matches = body.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi);
  console.log('MP4 matches:', mp4Matches);

  const m3u8Matches = body.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/gi);
  console.log('m3u8 matches:', m3u8Matches);

  // Let's also check og:video or script contents
  const ogVideo = body.match(/property="og:video"[^>]+content="([^"]+)"/i) || body.match(/content="([^"]+)"[^>]+property="og:video"/i);
  console.log('og:video:', ogVideo ? ogVideo[1] : 'None');
}

test();
