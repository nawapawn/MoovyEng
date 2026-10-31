const fs = require('fs');

const b = fs.readFileSync('scratch/biscuit.html', 'utf8');
const l = fs.readFileSync('scratch/lemon.html', 'utf8');

function findLinks(html, name) {
  console.log('===', name, '===');
  const matches = html.match(/https?:\/\/[^"'\s\\]+/g) || [];
  const files = matches.filter(m => /\.(ttf|otf|zip|woff2?)/i.test(m) || /download|asset/i.test(m));
  console.log('Matches:', files.slice(0, 20));
}

findLinks(b, 'biscuit');
findLinks(l, 'lemon');
