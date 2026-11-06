# SpeechCare (APK)

Web app in `www/` wrapped with Capacitor. Firebase = accounts + cloud save. Gemini = AI assistant.

## 1. Gemini (the AI assistant) - easiest way
Open the app, tap the floating assistant, follow the 4 steps on screen, paste your key, press **Save and test**. Nothing to edit in GitHub. The key stays on that phone.
Advanced (optional): a GitHub secret named `GEMINI_API_KEY` is written into `www/config.js` during the build. Never type a real key into a file in a public repository.

## 2. Get SpeechCare.apk from GitHub
1. Upload everything in this folder to a GitHub repository (keep `.github/workflows/android.yml`).
2. Actions tab → **Build SpeechCare APK** → Run workflow (it also runs on every push to `main`).
3. When it finishes, open the **Releases** page of the repository and download **SpeechCare.apk**.

## 3. Firebase console (once)
- Authentication → Sign-in method → enable **Email/Password**.
- Firestore Database → Rules → paste `firestore.rules` → Publish.

## Icon and name
`android-res/` holds every Android icon size made from the emblem and `branding/splash.png` is the opening screen. The workflow copies them into the Android project. App name = `SpeechCare` (capacitor.config.json).
