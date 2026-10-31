const https = require('https');

https.get('https://clip.cafe/?s=impressed&usersearch=1', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find all picture class="clipThumb"
    const regex = /<picture\s+class=["']clipThumb["']\s+data-slug=["']([^"']+)["']\s+data-link=["']([^"']+)["'][\s\S]*?<span\s+class=["']videoDuration["']>([^<]+)<\/span>[\s\S]*?<div\s+class=["']clipMovie["']>\s*<a[^>]*>([^<]+)<\/a>\s*(?:•\s*(\d{4}))?[\s\S]*?<div\s+class=["']clipTrans["']>\s*<p>(?:<b>Transcript:<\/b><br>)?([\s\S]*?)<\/p>/gi;

    let match;
    let count = 0;
    while ((match = regex.exec(data)) !== null && count < 5) {
      count++;
      console.log(`\n=== Clip #${count} ===`);
      console.log('Slug:', match[1]);
      console.log('Link:', match[2]);
      console.log('Duration:', match[3]);
      console.log('Movie:', match[4]);
      console.log('Year:', match[5]);
      console.log('Transcript:', match[6].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100) + '...');
    }
    console.log(`\nTotal matched: ${count}`);
  });
});
