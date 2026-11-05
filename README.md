# Ortho Assistant (APK)

Web app (`www/index.html`) wrapped with Capacitor, Firebase Auth + Firestore for accounts and cloud save.

## Get the APK from GitHub
1. Create a GitHub repository and upload everything in this folder (keep the `.github/workflows/android.yml` path exactly).
2. Open the **Actions** tab, run **Build Android APK** (it also runs on every push to `main`).
3. When it finishes, open the run and download the **ortho-assistant-apk** artifact. Unzip it and install `app-debug.apk` on the phone (allow "install unknown apps").

## Firebase console (do once)
- Authentication → Sign-in method → enable **Email/Password**.
- Authentication → Settings → Authorized domains: `localhost` must be listed (it is by default).
- Firestore Database → create the database, then Rules → paste `firestore.rules` → Publish.
- Optional: Authentication → Templates → customise the verification email.

## Files
- `www/index.html` the whole app and Firebase config
- `.github/workflows/android.yml` the build workflow
- `scripts/copy-vendor.js` copies the Firebase bundles into `www/vendor`
- `capacitor.config.json`, `package.json`, `firestore.rules`
