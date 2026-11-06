# Inject the OpenRouter key at APK build time (personal-use option)

1. Open the SpeechCare repository on GitHub and make sure its visibility is **Private** (Settings → General → Danger Zone → Change repository visibility). The workflow intentionally refuses to embed the key when the repository is public.
2. Go to **Settings → Secrets and variables → Actions**.
3. Click **New repository secret**.
4. Name it exactly `OPENROUTER_API_KEY`.
5. Paste your OpenRouter key as the value and save.
6. Run **Actions → Build SpeechCare APK (Direct OpenRouter) → Run workflow**.

The workflow checks that the repository is private, then creates `www/build-config.js` on the temporary GitHub runner, without committing the key or printing it in the workflow log. The Settings → AI screen then shows that the key is configured by the build, and the app tests the connection without asking you to paste it again.

## Security limitation (important)

A GitHub Actions secret protects the key from being committed to the repository and from being printed in ordinary Actions logs. **It does not make a key embedded in an APK secret.** Because the Android app calls OpenRouter directly, someone with the APK can unzip/reverse-engineer it and recover the key from its bundled JavaScript. This build-time injection is only a convenience for a private, personal-use APK that you do not share. Keep the APK private, set usage limits in OpenRouter, and revoke/rotate the key immediately if the APK or device is lost.

For a key that cannot be extracted from the APK, the app must call a server-side proxy; that requires hosting/backend service and would reintroduce a backend dependency.

If you do not add the GitHub secret, the ordinary Settings → AI key field remains available and stores a key locally on this device.


The workflow no longer publishes a GitHub Release automatically. It keeps the APK as a 14-day Actions artifact, so you download it from the private repository’s Actions run.
