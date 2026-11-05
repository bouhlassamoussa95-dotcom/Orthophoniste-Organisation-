# SpeechCare AI — Gemini Interactions API setup

This build uses Google Gemini's newer **Interactions API** from the browser/Android app for a private prototype.

## 1. Put the key in one place
Open `www/gemini-config.js` and replace only the placeholder:

```js
window.SPEECHCARE_GEMINI_API_KEY="YOUR_REAL_GEMINI_API_KEY";
window.SPEECHCARE_GEMINI_MODEL="gemini-3.8-flash";
```

Do not paste the key into chat. Keep this repository private.

## 2. Build
Push the project root to a private GitHub repository and run **Actions → Build Android APK**. The workflow validates the key before building and also verifies that the key reached the Android web assets.

## 3. API behavior
The app sends a POST request to the Gemini Interactions API and uses the configured model. If Google rejects the request, SpeechCare displays the exact API error returned by Google.

## Billing
This setup does **not** require Firebase Blaze or Firebase Functions. Gemini API access can have a free tier, but Google controls model-specific quotas and availability; free-tier limits can change. If Google requires billing for the selected model/project, that is a Gemini API account/project requirement, not a Firebase requirement.

## Security
This is suitable only for a private prototype. An API key embedded in an APK can be extracted. Before public/commercial distribution or use with real patient health information, move the Gemini request behind a secure backend and apply appropriate privacy/security controls.
