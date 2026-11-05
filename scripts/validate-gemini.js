const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'www', 'gemini-config.js');
if (!fs.existsSync(p)) throw new Error('www/gemini-config.js was not found.');
const s = fs.readFileSync(p, 'utf8');
if (!s.includes('SPEECHCARE_GEMINI_MODEL')) throw new Error('Gemini model configuration is missing.');
if (!s.includes('SPEECHCARE_GEMINI_MODEL_FALLBACKS')) throw new Error('Gemini fallback configuration is missing.');
if (s.includes('SPEECHCARE_GEMINI_API_KEY')) throw new Error('Do not embed a Gemini API key in the build. Use Profile -> Gemini AI.');
console.log('Gemini configuration OK. API key will be entered at runtime in the SpeechCare app.');
