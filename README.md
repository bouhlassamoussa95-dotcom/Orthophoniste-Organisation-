# SpeechCare — Direct OpenRouter AI (personal Android app)

SpeechCare uses a direct connection from the Android app to the OpenRouter Chat Completions API. Capacitor native HTTP is enabled for Android to avoid WebView CORS restrictions. **AI does not use Firebase Cloud Functions**, so you do not need Firebase Blaze or a Cloud Functions deployment for AI.

Firebase Authentication and Firestore remain in the app for sign-in and cloud sync. They are separate from the AI request path.

## OpenRouter setup inside the installed app

1. Create an API key at https://openrouter.ai/settings/keys.
2. Install the APK built from this project and open SpeechCare.
3. Sign in (or use the app's preview mode, if enabled).
4. Open Settings → AI.
5. Paste the OpenRouter API key.
6. Leave the model as `openrouter/free`, then choose **Save and test**.

SpeechCare permits only `openrouter/free` or model IDs ending in `:free` to help prevent accidental paid-model usage. OpenRouter free models are rate-limited and their availability can change. Check https://openrouter.ai/collections/free-models for current options.

## API key and privacy warning

- The key is entered on the device and stored in the app's local WebView storage (`localStorage`). It is not included in the source files, GitHub repository, or APK at build time.
- Because the key is stored on-device and the app calls OpenRouter directly, someone who can inspect the device/app data or reverse-engineer the APK may be able to retrieve it. Keep the APK and device private. Revoke the key if you suspect exposure.
- AI prompts are sent directly to OpenRouter. Do not send patient names, phone numbers, addresses, or other identifying information. Review and anonymize clinical details before using AI, and follow your applicable privacy obligations.
- Do not paste the API key into GitHub, source files, build logs, or ChatGPT.

## Build the Android APK with GitHub Actions

1. Upload/commit the contents of this `speechcare/` folder to your SpeechCare GitHub repository (the repository root should contain `package.json`, `capacitor.config.json`, `www/`, and `.github/`).
2. Push to the `main` branch, or open **Actions → Build SpeechCare APK (Direct OpenRouter) → Run workflow**.
3. Open the completed workflow run and download the **SpeechCare** artifact. It contains `SpeechCare.apk`.
4. Transfer the APK to your Android phone and install it. You may need to allow installation from that file manager/browser.

The workflow uses Node.js 20 and Java 17, creates the Capacitor Android project, applies the supplied SpeechCare icon assets, and builds a debug APK.

## Firebase notes

- Firebase Authentication and Firestore are still used for account sign-in and optional cloud sync. This project does not deploy or call Firebase Cloud Functions for AI.
- The existing Firebase web app configuration in `www/index.html` identifies the Firebase project; it is not an OpenRouter secret.
- `firestore.rules` is included for reference. Do not change or deploy rules unless you understand the effect on your existing data.

## App icon

`android-res/` contains only valid Android resource folders and launcher image sizes derived from the original SpeechCare logo supplied for this project. The original logo is preserved separately in `assets/SpeechCare_original_logo.png`; it is not copied into Android’s `res/` root.
