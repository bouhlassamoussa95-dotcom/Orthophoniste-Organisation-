# SpeechCare AI — Gemini Interactions API

Private prototype of SpeechCare with a specialized speech-language-therapy AI assistant.

The AI uses Google's Gemini **Interactions API** with the configurable model `gemini-3.8-flash`.

Quick start:
1. Edit `www/gemini-config.js`.
2. Put your Gemini API key between the quotes.
3. Keep the repository private.
4. Run GitHub Actions → Build Android APK.

The build validates the key and verifies that it is copied into the Android assets before Gradle runs.

Firebase Blaze is not required for this prototype. Gemini free-tier availability and quotas are controlled by Google and can change.
