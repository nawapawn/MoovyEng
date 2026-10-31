const fs = require('fs');

const buf = fs.readFileSync('scratch/biscuit_dl');
console.log('Magic bytes (hex):', buf.slice(0, 8).toString('hex'));
console.log('Magic ASCII:', buf.slice(0, 16).toString('ascii'));
