# SpeechCare Gemini setup

The app has an in-app Gemini key screen at **Profile -> Gemini AI**.

Do not add the API key to the source code or GitHub. Paste it into the app after installation.

Use **Test connection** first. A successful test means the key can authenticate to Gemini and at least one configured model returned text.

Authentication is sent with `X-goog-api-key` in the request header. The app uses the Gemini REST `generateContent` endpoint and parses `candidates[0].content.parts[].text`.
