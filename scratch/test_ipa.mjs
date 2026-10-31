import { ipaToThaiReading } from '../lib/ipaToThai.js';

const samples = [
  '/breɪk ə leɡ/', '/fʊl əv ziːl/', '/ziːl/', '/siː aɪ tuː aɪ/', '/hɪt ðə sæk/',
  '/bɜːn ðə ˈmɪd.naɪt ɔɪl/', '/ˈʌn.dər ðə ˈweð.ər/', '/kɒsts ən ɑːm ənd ə leɡ/',
  '/ɪnˈθjuː.zi.æz.əm/', '/ˈprɒk.rə.stɪ.neɪt/', '/ˈstreŋθ/', '/aʊt əv ðə bluː/'
];
for (const s of samples) console.log(s, '=>', ipaToThaiReading(s));
