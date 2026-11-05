# SpeechCare AI — private prototype

## GitHub setup
1. In GitHub open **Settings → Secrets and variables → Actions**.
2. Create a repository secret named **GEMINI_API_KEY**.
3. Paste your NEW Gemini API key into the secret value. Do not put it in the repository files.
4. Run the existing **Build Android APK** workflow.

The workflow creates `www/gemini-config.js` only during the build. That file is ignored by Git.

## AI agent UI
SpeechCare AI is available from a floating animated AI button on every main screen. It opens with the current screen and relevant patient context.
