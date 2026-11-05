# SpeechCare — Gemini in-app key + generateContent

This build uses the official Gemini REST `generateContent` endpoint.

## Setup
1. Install the APK.
2. Open **Profile -> Gemini AI**.
3. Paste your Gemini API key.
4. Tap **Save key**.
5. Tap **Test connection**.
6. Use SpeechCare AI from the top header.

The app sends the saved key in the `X-goog-api-key` HTTP header. It does **not** put the key in the URL and does not require a GitHub Secret.

## API request
`POST https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`

Headers:
- `Content-Type: application/json`
- `X-goog-api-key: <saved key>`

Body:
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "..."
        }
      ]
    }
  ]
}
```

The app parses the normal response at `candidates[0].content.parts[].text`.

If the primary model is unavailable, the app tries the configured Flash/Lite fallbacks.

**Security:** this is a private prototype. A client-side API key can be extracted from a device. Do not use this architecture for a public production app with sensitive patient data.
