const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'www', 'gemini-config.js');
if (!fs.existsSync(p)) throw new Error('www/gemini-config.js was not found.');
const s = fs.readFileSync(p, 'utf8');
const m = s.match(/SPEECHCARE_GEMINI_API_KEY\s*=\s*["']([^"']*)["']/);
const key = (m ? m[1] : '').trim();
if (!key || key.length < 20 || key.includes('PASTE_YOUR_NEW_GEMINI_API_KEY_HERE')) {
  throw new Error('Gemini API key is NOT configured in www/gemini-config.js.');
}
if (/\s/.test(key)) throw new Error('Gemini API key contains whitespace. Paste the key exactly, with no spaces or line breaks.');
console.log('Gemini model:', (s.match(/SPEECHCARE_GEMINI_MODEL\s*=\s*["\']([^"\']+)["\']/)||[])[1] || 'gemini-3.8-flash');
console.log(`Gemini configuration OK. Key length: ${key.length} characters. Value is not printed.`);
