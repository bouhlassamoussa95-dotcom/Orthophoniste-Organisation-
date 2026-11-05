# SpeechCare — Gemini AI prototype

SpeechCare is a speech-language therapy management app with a specialized in-app Gemini assistant.

### Fast setup
1. Open `www/gemini-config.js`.
2. Paste your NEW Gemini API key in the placeholder.
3. Keep the GitHub repository private.
4. Push to `main` or run the Android GitHub Actions workflow.

The AI uses the official Gemini Interactions API first, automatically cycles through configured Flash/Lite model candidates, and falls back to the standard `generateContent` API if needed.

See `AI_SETUP.md` for details.
