# SpeechCare AI — OpenRouter setup

1. Create a NEW OpenRouter key at https://openrouter.ai/settings/keys.
2. Open `www/openrouter-config.js`.
3. Replace `PASTE_YOUR_NEW_OPENROUTER_API_KEY_HERE` with your key. Do not send the key in chat.
4. Keep the repository private.
5. Build/sync the Android app as usual.

The default model is `openrouter/free`. You can change it later in `openrouter-config.js`.

## Privacy shield
Before an AI request, SpeechCare removes direct patient identifiers: real name, parents' names, phone, email, address, center/daycare name, internal patient ID, and exact appointment dates. The AI receives an anonymous label such as `PATIENT_A` plus only the clinical/session information needed for the request.

The real patient identity remains in SpeechCare's local/app data and is used locally for therapist-facing reports/documents.

## Security warning
This prototype puts the API key in the client app. A determined user can extract a client-side key from an APK. Do not use this architecture for public distribution or real sensitive patient data. Before production use, move the OpenRouter request to a secure backend with authentication, rate limiting, access controls, and appropriate healthcare/privacy safeguards.
