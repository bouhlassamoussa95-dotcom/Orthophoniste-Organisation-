# SpeechCare AI setup

This build uses the official Gemini Interactions API at runtime. The Gemini API key is NOT embedded in the APK and is NOT required as a GitHub Secret.

## First-time setup
1. Build/install the APK.
2. Open SpeechCare.
3. Go to **Profile**.
4. Open **Gemini AI**.
5. Paste your Gemini API key.
6. Tap **Save key**.
7. Tap **Test connection**.
8. When it says `✓ Gemini connected`, open SpeechCare AI and ask a question.

The key is stored in the app's local device storage. It is not uploaded to Firestore by this code.

## Authentication behavior
SpeechCare sends the key using the official `x-goog-api-key` header to `/v1beta/interactions`. It tries configured Flash/Lite models automatically.

## Important
This is suitable for a private prototype only. A client-side app can ultimately be inspected and its runtime secrets can be extracted. Before public release or use with real patient data, move Gemini calls behind a secure backend and apply proper access controls.
