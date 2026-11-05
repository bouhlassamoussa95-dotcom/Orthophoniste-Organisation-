# SpeechCare AI — private prototype setup

## 1. Put your NEW Gemini API key in the app
Open `www/gemini-config.js` and replace only:

`PASTE_YOUR_NEW_GEMINI_API_KEY_HERE`

with your new Gemini API key. Do not paste the key into chat.

## 2. Build
Keep the GitHub repository PRIVATE. Push to `main` or run the Android workflow manually. The workflow validates the key before building.

## 3. How the AI request works
SpeechCare first uses the official Gemini Interactions API at:
`https://generativelanguage.googleapis.com/v1beta/interactions`

It automatically tries these model candidates:
- `gemini-flash-latest`
- `gemini-3.6-flash`
- `gemini-2.5-flash-lite`
- `gemini-2.5-flash`
- `gemini-2.0-flash-lite`
- `gemini-2.0-flash`

If Interactions is unavailable for the project/key, SpeechCare also tries the standard `generateContent` endpoint. The app parses both normal Interactions responses and the `steps -> model_output -> content -> text` response shape.

Model availability and quotas are controlled by Google and can vary by account/project/region/time. The fallback list increases the chance of a successful response; it does not guarantee every listed model is free or available to every key.

## Important security note
This private prototype calls Gemini directly from the Android app, so the API key can be extracted from the APK. Do NOT use this architecture for a public production app containing real patient data. Before production, move the Gemini call behind a secure server/backend and apply appropriate healthcare privacy/security controls.
