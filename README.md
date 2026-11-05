# SpeechCare — Gemini runtime-key build

SpeechCare is a speech-language therapy management app with an in-app Gemini assistant.

## Gemini setup
The APK no longer depends on a GitHub Secret or a build-time API-key injection.

After installing the APK: **Profile → Gemini AI → paste API key → Save key → Test connection**.

If the connection test succeeds, SpeechCare AI uses the same saved key.

The app uses the official Gemini Interactions API first and automatically cycles through configured Flash/Lite models.
