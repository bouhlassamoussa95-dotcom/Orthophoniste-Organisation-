# SpeechCare — OpenRouter + Firebase (Capacitor Android)

This project keeps the existing SpeechCare web app and moves AI calls from Gemini to OpenRouter through a Firebase Cloud Function.

## Security model
- The OpenRouter API key is stored as a Firebase Functions secret (`OPENROUTER_API_KEY`).
- It is **not** stored in `www/`, `localStorage`, Android files, or GitHub Actions.
- The function requires a valid Firebase Authentication ID token.
- Never add your OpenRouter API key to this repository.

## One-time backend setup (beginner steps)
1. Install Node.js 20 LTS: https://nodejs.org/
2. Install Firebase CLI in a terminal:
   `npm install -g firebase-tools`
3. Sign in:
   `firebase login`
4. Open a terminal in this project's `speechcare/` folder (the folder containing `firebase.json`).
5. Select/check the Firebase project:
   `firebase use oprthophoniste-organisation`
6. Set the OpenRouter secret (Firebase prompts for the value):
   `firebase functions:secrets:set OPENROUTER_API_KEY`
7. Install backend dependencies:
   `cd functions`
   `npm install`
   `cd ..`
8. Deploy the function:
   `firebase deploy --only functions:speechcareAI`

Firebase may ask you to enable billing / Cloud Functions APIs. Follow the Firebase Console prompts. Cloud Functions deployment generally requires a Blaze billing plan; review costs and set budget alerts before enabling billing.

## OpenRouter
1. Create a key at https://openrouter.ai/keys
2. Add credits or select a model/plan appropriate to your needs.
3. **Paste the key only into the Firebase secret prompt**, never into code or GitHub.
4. Default model is `openai/gpt-4o-mini`. You can change the model ID in the app's Settings → AI field, using a valid OpenRouter model slug.

## Update the Android app
1. Commit/push the modified project to the same GitHub repository.
2. GitHub Actions builds the APK.
3. Install the APK and sign in with a Firebase account.
4. Open Settings → AI. The endpoint is pre-filled:
   `https://us-central1-oprthophoniste-organisation.cloudfunctions.net/speechcareAI`
5. Keep the endpoint as-is unless you deploy to a different Firebase project/region. Tap **Save and test**.

## Firebase prerequisites
- Firebase Authentication → Sign-in method → enable Email/Password.
- Firestore rules are in `firestore.rules`. Review them in Firebase Console before publishing.
- The Cloud Function authenticates requests via Firebase Authentication ID tokens.

## App icon
`android-res/` now contains launcher image sizes derived from the exact original SpeechCare logo you supplied. It was not redesigned; it was resized only to fit Android launcher asset dimensions.
