const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

const SYSTEM = `You are SpeechCare AI, a focused assistant inside a speech-language therapy management app.\n\nYour job is to help a speech-language therapist with therapy planning, activity ideas, patient-session organization, progress review, and educational explanations about speech, language, communication, and related conditions. Stay focused on speech-language therapy. Politely decline unrelated requests.\n\nDo not diagnose a patient, prescribe treatment, or claim certainty where clinical judgment is required. When patient information is provided, use only that information and do not invent facts. Prefer practical, age-appropriate, structured suggestions. The therapist remains responsible for clinical decisions.\n\nAnswer clearly and concisely unless the therapist asks for detail.`;

exports.speechcareAI = onCall({
  region: 'europe-west1',
  secrets: [GEMINI_API_KEY],
  timeoutSeconds: 60,
  memory: '256MiB'
}, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
  if (request.auth.token.email_verified !== true) throw new HttpsError('permission-denied', 'Verify your email first.');

  const message = String(request.data?.message || '').trim();
  if (!message) throw new HttpsError('invalid-argument', 'Message is required.');
  if (message.length > 4000) throw new HttpsError('invalid-argument', 'Message is too long.');

  const context = request.data?.patient || {patient:null,activities:[],sessions:[]};
  const prompt = `${SYSTEM}\n\nRELEVANT SPEECHCARE DATA (use only if relevant):\n${JSON.stringify(context)}\n\nTHERAPIST MESSAGE:\n${message}`;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY.value())}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0.35,maxOutputTokens:1200}})
  });
  const data = await r.json();
  if (!r.ok) {
    console.error('Gemini error', r.status, data);
    throw new HttpsError('internal', 'Gemini request failed.');
  }
  const text = data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')?.trim();
  if (!text) throw new HttpsError('internal', 'Gemini returned no text.');
  return {text};
});
