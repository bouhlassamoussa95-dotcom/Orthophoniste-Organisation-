const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();
const OPENROUTER_API_KEY = defineSecret("OPENROUTER_API_KEY");

exports.speechcareAI = onRequest(
  { region: "us-central1", cors: true, secrets: [OPENROUTER_API_KEY], timeoutSeconds: 120, memory: "256MiB" },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

    try {
      const authHeader = req.headers.authorization || "";
      const match = authHeader.match(/^Bearer (.+)$/i);
      if (!match) return res.status(401).json({ error: "Sign-in required" });

      // Validate Firebase Authentication token before allowing use of the AI service.
      await admin.auth().verifyIdToken(match[1]);

      const body = req.body || {};
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const system = typeof body.system === "string" ? body.system : "";
      const model = typeof body.model === "string" && body.model.trim()
        ? body.model.trim()
        : "openai/gpt-4o-mini";

      if (!messages.length || messages.length > 20) {
        return res.status(400).json({ error: "Provide 1–20 chat messages." });
      }
      const safeMessages = messages
        .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
        .map(m => ({ role: m.role, content: m.content.slice(0, 12000) }));
      if (!safeMessages.length) return res.status(400).json({ error: "No valid messages." });

      const payload = {
        model,
        messages: [
          ...(system ? [{ role: "system", content: system.slice(0, 12000) }] : []),
          ...safeMessages
        ],
        temperature: 0.6,
        max_tokens: 1800
      };
      if (body.json === true) payload.response_format = { type: "json_object" };

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY.value()}`,
          "Content-Type": "application/json",
          "X-OpenRouter-Title": "SpeechCare"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("OpenRouter error status:", response.status);
        return res.status(response.status >= 500 ? 502 : response.status)
          .json({ error: data.error?.message || "OpenRouter request failed" });
      }

      const text = data.choices?.[0]?.message?.content;
      if (typeof text !== "string" || !text.trim()) {
        return res.status(502).json({ error: "OpenRouter returned an empty response." });
      }
      return res.status(200).json({ text });
    } catch (err) {
      if (err && (err.code === "auth/argument-error" || err.code === "auth/id-token-expired" || err.code === "auth/invalid-id-token")) {
        return res.status(401).json({ error: "Please sign in again." });
      }
      console.error("SpeechCare AI function error:", err?.message || err);
      return res.status(500).json({ error: "SpeechCare AI backend error." });
    }
  }
);
