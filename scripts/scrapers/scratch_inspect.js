const fs = require('fs');
const content = fs.readFileSync('C:/Users/os/.gemini/antigravity-ide/brain/0f543f76-c523-4503-88ce-42ce53555cf2/.system_generated/steps/591/content.md', 'utf8');

// Find playAddr or downloadAddr
const videoMatch = content.match(/"playAddr":"([^"]+)"/) || content.match(/"downloadAddr":"([^"]+)"/);
if (videoMatch) {
  console.log('Video Play Addr:', videoMatch[1].replace(/\\u002F/g, '/'));
} else {
  console.log('No direct playAddr');
}

// Find nicknames or text content in subtitles
const subtitlesMatch = content.match(/"subtitles":(\[.*?\])/);
if (subtitlesMatch) {
  console.log('Subtitles:', subtitlesMatch[1]);
}
