# SpeechCare AI — private prototype

## Fastest setup
1. Open `www/gemini-config.js`.
2. Replace `PASTE_YOUR_NEW_GEMINI_API_KEY_HERE` with your NEW Gemini API key.
3. Keep the repository private.
4. Push the project to GitHub and run **Actions → Build Android APK**.

The workflow will use `GEMINI_API_KEY` from GitHub Secrets if that secret exists. If it does not exist, it uses the key in `www/gemini-config.js`. This avoids the previous failure where the APK was built with an empty key.

## AI UI
SpeechCare AI is opened from a static AI-agent button in the top-right header on the main screens. It is not a floating/rotating button. The AI receives the current screen context and, when applicable, the selected patient context.

## Security
This direct Gemini API prototype is intended for private testing. The key is delivered to the client APK and can be extracted by a sufficiently skilled person. Before public/commercial release or use with sensitive patient data, move Gemini calls to a secure backend and review privacy/compliance requirements.
