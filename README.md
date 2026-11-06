# SpeechCare — Personal Android speech-therapy app

SpeechCare is a Capacitor Android app for a speech-language therapist managing patients, sessions, consultations, reports and multi-center practice. The existing HTML/JavaScript screens, Firebase sign-in/sync, theme variables, five-tab navigation, side drawer and floating AI assistant are preserved.

## Main navigation

The five bottom tabs are **Home · Sessions · Patients · Consultations · Reports**. The side drawer keeps secondary destinations such as Profile, Dashboard, Activities, Today's Sessions, Calendar, Finance and Settings. The global floating **AI** button opens the assistant.

## OpenRouter AI

SpeechCare calls the OpenRouter Chat Completions API directly from Android using Capacitor native HTTP. AI does not require Firebase Cloud Functions or Firebase Blaze. The model defaults to `openrouter/free`; the app accepts only `openrouter/free` or model IDs ending in `:free` to reduce accidental paid-model selection.

You can enter a key once in **Settings → AI**, or preconfigure a personal APK using the GitHub Actions secret described in `README_GITHUB_API_KEY.md`. Build-time injection avoids manually entering the key into Settings, but **the key is still extractable from the resulting APK**. The workflow refuses to embed a key when the GitHub repository is public. Keep the repository and APK private, set a small usage limit on the OpenRouter key, and revoke it if the phone/APK is lost. A server-side proxy is required for a key that cannot be recovered from an APK.

AI requests send their prompt content to OpenRouter. Avoid sending patient names, phone numbers, addresses or other identifying details; anonymize clinical context before requesting assistance.

## Offline therapeutic activities

The existing, original SpeechCare activities library remains inside the app. Two new React 18 + TypeScript + Tailwind games are bundled locally and require neither AI nor a network connection:

- **Syllable Train (قطار المقاطع):** build Arabic words by selecting syllables in sequence; includes prompts, immediate feedback, speech synthesis when an on-device voice is available, attempts, accuracy and therapist notes.
- **Sound Detective (البحث عن الصوت):** listen to a spoken word and select its matching visual card; includes auditory prompts, feedback, attempts, accuracy and therapist notes.

All game text supports Arabic/Algerian Darija, French and English. Game results emit a typed completion event and are saved to the app's activity log; when started from a scheduled session, metrics are also attached to that session's `gameMetrics` and `sessionSummary`. These activities are practice tools, not standardized assessments or standalone diagnostic measures.

### Source architecture

- `src/games/` — typed game models, original offline task data, localization, reusable game components and the React mount entry point.
- `src/inventory/` — typed toy/material inventory, English/French/Algerian Arabic labels, persistent activity associations, photo selection and React mount entry point.
- `src/inventory/photoSecurity.ts` — biometric/device-credential gate, native gallery and file picker, and app-private photo storage.
- `src/ui/MobileBottomSheet.tsx` — reusable, accessible modal bottom sheet for longer/searchable choices.
- `src/ui/AnchoredDropdown.tsx` — reusable anchored options menu for short choices.
- `src/native/haptics.ts` — Capacitor LIGHT impact haptics with a best-effort browser fallback.
- `src/games/tailwind.css` and `tailwind.config.cjs` — locally compiled Tailwind styles, prefixed with `sc-`, with preflight disabled so existing app CSS/theme variables are not reset. The same generated stylesheet serves the game and inventory React modules.

## Tactile layout and overlays

The non-destructive interaction layer keeps the app's current visual theme and screens while adding 48px minimum interactive targets, 52px primary actions, fast press feedback, light haptics on taps, a 220ms drawer transition, a horizontally scrollable two-week date strip with snap, momentum-scrolling filters, custom anchored dropdowns for short options, and modal sheets for searchable patient choices. The bottom bar remains five tabs. No native HTML `<select>` controls remain in the app's screen markup.

The Android build uses `android:windowSoftInputMode="adjustResize"` so the app can resize around the keyboard. The app no longer forces a fixed HTML language onto generic text fields. Android/Gboard still controls keyboard-language switching; SpeechCare cannot force the keyboard's selected language.

## Exact launcher icon

`www/logo.png`, `assets/SpeechCare_original_logo.png`, and the Android launcher density resources are generated from the exact SpeechCare logo image supplied by the app owner. The artwork has only been resized for Android density variants; it has not been redesigned. Adaptive launcher XML points at the matching foreground and background resources. The GitHub workflow applies these resources to the generated Android project before Gradle builds the APK.


## Toy & Material Inventory

The secondary drawer includes **Toy & Material Inventory**. It provides a responsive grid of clinic materials with a thumbnail, name, category and linked therapy activities. The therapist can add a toy, select a gallery image or image file, add/remove linked activity names inline, search the inventory, and remove a toy using a two-tap confirmation. Labels are available in English, French and Arabic/Darija.

### Inventory data and session planning

- `ToyInventoryItem` in `src/inventory/types.ts` is the shared TypeScript record.
- Toy names, categories, activity links, notes and timestamps are stored in the existing SpeechCare app state (`S.toys`), saved locally and included in the existing Firestore JSON sync.
- Session creation/editing displays the activities linked to inventory toys as quick-add chips. Selecting one adds the activity and toy name to the session's **Materials and linked activities** field. This text is saved with the session and shown on its session card. Group-session edits propagate the materials field when the group-wide option is selected.
- Photo files are kept separately in Capacitor `Directory.Data` (the app-private data folder). Only the relative local photo path is included in app state. Photo bytes are not uploaded to Firestore, so a photo will not automatically appear on a second device after cloud restore.

### Photo authorization and privacy boundary

Before opening either the gallery or document picker, SpeechCare calls the native biometric authentication prompt. Device PIN/pattern/password fallback is enabled. The flow fails closed if the app is not running natively or Android reports no secure device credential/biometry. The photo is then copied into app-private storage. This is an **authentication gate**, not file encryption: the image is not cryptographically encrypted with a biometric-bound key. Use the phone's secure screen lock and do not treat the app-private file as a substitute for encrypted clinical storage.

The native inventory flow adds these Capacitor 6-compatible packages to the app: `@aparajita/capacitor-biometric-auth` 8.x, `@capacitor/camera` 6.x, `@capacitor/filesystem` 6.x, and `@capawesome/capacitor-file-picker` 6.x. GitHub Actions runs `npm install` and builds `www/inventory.js` from `src/inventory/main.tsx`; `www/index.html` mounts it when the Inventory screen is opened.

## Build the APK with GitHub Actions

1. Put the contents of this `speechcare/` folder at the root of your private GitHub repository.
2. Commit/push to `main`, or open **Actions → Build SpeechCare APK (Direct OpenRouter) → Run workflow**.
3. The workflow installs Node dependencies, compiles the React/Tailwind game bundle, creates/syncs the Capacitor Android project, applies the exact launcher artwork and keyboard resize setting, then builds a debug APK.
4. Download the **SpeechCare** artifact from the completed Actions run. The ZIP artifact contains `SpeechCare.apk`.

For automatic key setup, add `OPENROUTER_API_KEY` under **GitHub repository Settings → Secrets and variables → Actions** before running the workflow. Read `README_GITHUB_API_KEY.md` first: the repository must be private and embedding the key is a personal-use convenience, not secure key storage.

## Firebase

Firebase Authentication and Firestore remain available for sign-in and optional cloud synchronization. Firebase is separate from the direct OpenRouter AI request path. No Cloud Functions deployment or Blaze upgrade is needed for this AI architecture.
