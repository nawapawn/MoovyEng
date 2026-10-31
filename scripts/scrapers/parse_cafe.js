const fs = require('fs');
const content = fs.readFileSync('C:/Users/os/.gemini/antigravity-ide/brain/0f543f76-c523-4503-88ce-42ce53555cf2/.system_generated/steps/706/content.md', 'utf8');

console.log('Content length:', content.length);
// Find movie quote links
const matches = content.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi) || [];
console.log('Total links:', matches.length);

const clipLinks = [];
matches.forEach(m => {
  const hrefMatch = m.match(/href="([^"]+)"/);
  if (hrefMatch && hrefMatch[1].includes('/') && !hrefMatch[1].startsWith('#')) {
    const text = m.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 5 && !hrefMatch[1].includes('walkstreet') && !hrefMatch[1].includes('privacy')) {
      clipLinks.push({ href: hrefMatch[1], text });
    }
  }
});

console.log('Clip links found:', clipLinks.length);
clipLinks.slice(0, 15).forEach((c, i) => console.log(`[${i+1}] ${c.href} -> ${c.text}`));
