# Drop-in guide — SpeechCare Toy & Material Inventory

This guide accompanies `src/inventory/` and documents the small host-app contract needed to mount it.

## 1. Add the module files

Copy `src/inventory/` into your app. Copy `src/ui/MobileBottomSheet.tsx` if your project does not already have this shared component.

The module expects Tailwind utilities to use the `sc-` prefix and expects these CSS variables to exist in the app theme:

- `--bg`, `--card`, `--ink`, `--mut`, `--line`, `--chip`, `--sec`, `--tea`, `--red`

Do not add Tailwind preflight/reset to the host app; the module assumes `preflight: false`.

## 2. Install native packages (Capacitor 6)

```bash
npm install @capacitor/camera@^6 @capacitor/filesystem@^6 @aparajita/capacitor-biometric-auth@^8 @capawesome/capacitor-file-picker@^6
npx cap sync android
```

The inventory gallery/file-picker flow requires a native Android build. In the generated `AndroidManifest.xml`, include:

```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

A device biometric or secure screen credential must be configured. The system prompt allows device PIN/pattern/password fallback.

## 3. Build the React bundle

Add a build step that compiles `src/inventory/main.tsx` to `www/inventory.js`. Ensure Tailwind scans `src/**/*.ts` and `src/**/*.tsx` and emits the prefixed inventory classes into the stylesheet already loaded by the app.

Example esbuild command:

```bash
esbuild src/inventory/main.tsx --bundle --minify --platform=browser --target=es2020 --outfile=www/inventory.js
```

Load `inventory.js` after the host app script has defined the mount container and bridge:

```html
<script src="inventory.js"></script>
```

## 4. Provide the host state bridge

The component uses `window.SpeechCareInventoryBridge` to read and save inventory records. Adapt this to your app's state/persistence layer:

```ts
window.SpeechCareInventoryBridge = {
  getToys: () => structuredClone(appState.toys ?? []),
  saveToys: (toys) => {
    appState.toys = toys;
    persistAppState();
  }
};
```

The real SpeechCare integration stores these records in its existing `S.toys` array and saves through its normal local-storage / Firestore JSON sync.

## 5. Add a route and mount point

Render this element on the inventory route:

```html
<div id="speechcare-inventory-root"></div>
```

Call `window.mountSpeechCareInventory?.()` after route HTML has been inserted. The mount function unmounts the React root when the screen is left.

## 6. Connect session planning

When building a session form, provide quick-add options from all records:

```ts
const options = appState.toys.flatMap(toy =>
  toy.linkedActivities.map(activity => ({ toyId: toy.id, toyName: toy.name, activity }))
);
```

Persist the selected activity and toy name in a session `materials` field. The provided SpeechCare integration already adds this field, shows the material chips in New/Edit Session, displays the chosen materials on session cards and propagates them during group-session edits.

## Privacy note

The biometric check is a gate before the picker opens. Photos are stored in the application's private data directory, but are not cryptographically encrypted by this module. Photo bytes remain local to that device; only the relative path and inventory metadata are part of the app-state sync. Do not use this module as a substitute for encrypted storage or a clinical records compliance review.
