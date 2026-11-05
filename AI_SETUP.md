# SpeechCare AI — private prototype

This version uses the Gemini API directly from the SpeechCare Capacitor app so you can test the AI without upgrading Firebase to Blaze/Cloud Functions.

## Important security note
The Gemini API key is embedded in `www/index.html` for this private prototype. Do not distribute this APK publicly or use this architecture for a production app containing sensitive patient data. Before public/commercial release, move the Gemini call behind a secure server/backend and rotate the exposed API key.

## Current setup
- AI screen: `www/index.html`
- Gemini model: `gemini-2.5-flash`
- Patient context: only the selected patient's relevant profile data, recent sessions, and relevant activities are sent with the request.
- Authentication remains through the existing Firebase Authentication.

## Test
Build/sync the Android app as usual, sign in with a verified account, open **SpeechCare AI**, optionally select a patient, and send a question.

If Gemini returns an API error, check the Gemini API key/project and API access in Google AI Studio.

## Production
For a public/commercial version, rotate the current API key and move the Gemini request to a secure backend.
