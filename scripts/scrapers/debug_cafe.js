const https = require('https');

https.get('https://clip.cafe/?s=impressed&usersearch=1', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Let's see the next 1500 chars after searchResultClipInfo
    const itemIdx = data.indexOf('searchResultClipInfo');
    if (itemIdx !== -1) {
      console.log(data.substring(itemIdx + 400, itemIdx + 1800));
    }
  });
});
