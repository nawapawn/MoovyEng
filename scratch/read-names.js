const fs = require('fs');

function readTtfName(filePath) {
  const buf = fs.readFileSync(filePath);
  // Read offset table
  const numTables = buf.readUInt16BE(4);
  let nameTableOffset = 0;
  for (let i = 0; i < numTables; i++) {
    const tag = buf.toString('ascii', 12 + i * 16, 12 + i * 16 + 4);
    if (tag === 'name') {
      nameTableOffset = buf.readUInt32BE(12 + i * 16 + 8);
      break;
    }
  }
  if (!nameTableOffset) return null;
  const count = buf.readUInt16BE(nameTableOffset + 2);
  const stringOffset = nameTableOffset + buf.readUInt16BE(nameTableOffset + 4);
  const names = {};
  for (let i = 0; i < count; i++) {
    const rec = nameTableOffset + 6 + i * 12;
    const platformId = buf.readUInt16BE(rec);
    const nameId = buf.readUInt16BE(rec + 6);
    const length = buf.readUInt16BE(rec + 8);
    const offset = buf.readUInt16BE(rec + 10);
    const strBuf = buf.slice(stringOffset + offset, stringOffset + offset + length);
    let str = '';
    if (platformId === 0 || platformId === 3) {
      str = strBuf.swap16().toString('utf16le').replace(/\0/g, '');
    } else {
      str = strBuf.toString('utf8');
    }
    if (!names[nameId]) names[nameId] = str;
  }
  return {
    copyright: names[0],
    family: names[1],
    subfamily: names[2],
    uniqueId: names[3],
    fullName: names[4],
    postscriptName: names[6]
  };
}

console.log('MN PANGPING:', readTtfName('scratch/mn-pangping/MN ѧ/MN PANGPING.ttf'));
console.log('MiPancake:', readTtfName('scratch/mipancake/MiPancake/MiPancake.ttf'));
console.log('Biscuit:', readTtfName('scratch/biscuit/Biscuit.ttf'));
console.log('MN LEMON:', readTtfName('scratch/mn-lemon/͹/MN LEMON.ttf'));
