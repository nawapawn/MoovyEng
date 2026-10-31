const fs = require('fs');
const https = require('https');

const coverUrl = "https://p16-common-sign.tiktokcdn.com/tos-alisg-p-0037/o8a9BgbxEBrYYmzIgyvAsQ7sViCAIiBB12XIq~tplv-tiktokx-origin.image?dr=14575&x-expires=1792843200&x-signature=dlQ%2FVh4LmchtE4YxhAiXx%2FwFB%2FA%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my3";

const file = fs.createWriteStream("tiktok_cover.jpg");
https.get(coverUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
}, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close(() => {
      console.log('Cover downloaded successfully!');
    });
  });
}).on('error', function(err) {
  console.log('Error downloading cover:', err.message);
});
