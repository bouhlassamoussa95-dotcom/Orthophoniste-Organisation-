# SpeechCare (APK)

Web app in `www/` wrapped with Capacitor. Firebase = accounts + cloud save. Gemini = AI assistant.

## 1. Where to put the Gemini API key
Pick ONE of these:
- **GitHub secret (recommended):** repository → Settings → Secrets and variables → Actions → *New repository secret* → name `GEMINI_API_KEY`, value = your key. The workflow writes it into `www/config.js` only during the build. (Optional: Variables tab → `GEMINI_MODEL`.)
- **Inside the app:** Settings (gear in the side menu) → AI (Gemini) → paste the key. It stays on that phone only.
- **Local testing:** edit `www/config.js` (do not commit a real key).

A key inside an APK can be extracted by someone who unpacks the file. Keep the APK private and, in Google AI Studio / Google Cloud, restrict the key to the Generative Language API and set a quota.

## 2. Get SpeechCare.apk from GitHub
1. Upload everything in this folder to a GitHub repository (keep `.github/workflows/android.yml`).
2. Actions tab → **Build SpeechCare APK** → Run workflow (it also runs on every push to `main`).
3. When it finishes, open the **Releases** page of the repository and download **SpeechCare.apk**.

## 3. Firebase console (once)
- Authentication → Sign-in method → enable **Email/Password**.
- Firestore Database → Rules → paste `firestore.rules` → Publish.

## Icon and name
`assets/` holds the icon and splash made from the emblem. The workflow generates every Android size from it. App name = `SpeechCare` (capacitor.config.json).
