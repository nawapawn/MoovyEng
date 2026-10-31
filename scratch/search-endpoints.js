const fs = require('fs');

const l = fs.readFileSync('scratch/lemon.html', 'utf8');
const forms = l.match(/<form[^>]+>/gi) || [];
console.log('Forms:', forms);

// Check links with action or checkout
const links = l.match(/href="([^"]*(?:checkout|buy|cart)[^"]*)"/gi) || [];
console.log('Checkout links:', links);

// Also search for /purchases or api endpoints in js
const endpoints = l.match(/\/(\w+\/)*(?:purchases|orders|checkout|cart)/gi) || [];
console.log('Endpoints:', [...new Set(endpoints)]);
