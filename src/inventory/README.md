# SpeechCare Toy & Material Inventory

A React 18 + TypeScript + Tailwind module integrated into the Capacitor 6 SpeechCare app.

## Files

- `types.ts` — toy category, inventory record and window bridge contracts.
- `copy.ts` — English, French and Algerian Arabic/Darija labels.
- `photoSecurity.ts` — biometric/device-credential authorization, gallery and file selection, local private-file storage and photo URI resolution.
- `ToyInventory.tsx` — responsive material grid, search, inline activity linking, two-stage delete and add-to-session action.
- `main.tsx` — mounts the React screen into `#speechcare-inventory-root` when the app opens the inventory route.

## Data model

`ToyInventoryItem` is stored in the parent app's existing `S.toys` state through `window.SpeechCareInventoryBridge`. Since the app's normal `save()` function persists `S`, toy names, categories, linked activities, notes and timestamps are saved locally and included in the existing Firestore JSON sync.

Photo bytes are stored separately under Capacitor `Directory.Data`, for example `speechcare/toy-inventory/<toy-id>.jpg`. The app state contains only the relative `photoPath`. Photo files are app-private and are not uploaded to Firestore; another device will receive the toy metadata but not the local photo file unless a separate file-sync feature is added.

## Biometric/photo behavior

Both gallery and file picking call `BiometricAuth.checkBiometry()` and then `BiometricAuth.authenticate()` before the native picker is opened. Device PIN/pattern/password fallback is enabled. The operation fails closed in browser preview and if the device has no biometric enrollment or secure device credential.

The biometric prompt is an access gate; it does **not** cryptographically encrypt the resulting image. Files are stored in the app-private application directory. Do not describe this as biometric-encrypted storage.

## Integration points already applied

1. `www/index.html` has an `inventory` route and drawer entry, plus the global `SpeechCareInventoryBridge`.
2. The inventory bundle is mounted from the route render cycle.
3. Session creation/editing shows quick-add chips from all toys' `linkedActivities`.
4. Choosing a linked activity adds `<activity> — <toy name>` to the session's `materials` field; that value is stored on the session, propagated when group edits are applied to the whole group, and displayed on session cards.
5. The GitHub Actions build calls `npm run build:ui`, which type-checks and builds `www/inventory.js` and Tailwind utility styles.

## Required packages (Capacitor 6)

- `@aparajita/capacitor-biometric-auth` 8.x
- `@capacitor/camera` 6.x
- `@capacitor/filesystem` 6.x
- `@capawesome/capacitor-file-picker` 6.x

The Android workflow adds `android.permission.USE_BIOMETRIC`, runs `npx cap sync android`, then builds the APK. No broad shared-storage permission is added for the picker flow.
