EAS Preview APK build
=====================

Quick steps to produce a Preview APK that connects to Railway staging backend.

Prerequisites
- Install `eas-cli`: `npm install -g eas-cli`
- Login: `eas login`
- Ensure your project is an Expo Managed project (no native modules requiring custom dev clients unless intended).

Preview build (internal QA)

1. Ensure `EXPO_PUBLIC_API_URL` is set for the `preview` profile in `eas.json` (already configured to Railway staging).
2. Build preview APK:

```bash
cd mobile-app
npm run eas:build:preview:android
```

3. After build completes, download the APK from the EAS build page or use the CLI URL.
4. Install on device (adb):

```bash
adb install -r path/to/app.apk
```

Troubleshooting: Build succeeded but prompt error

When the build completes, you may see:

```
? Install and run the Android build on an emulator? » (Y/n)
TypeError: Cannot read properties of undefined (reading 'toLowerCase')
```

**This is a known EAS CLI issue in non-interactive terminals.** Your build is complete and successful.

**Solution:** Use the QR code link shown in the output:

```
🤖 Open this link on your Android devices (or scan the QR code) to install the app:
https://expo.dev/accounts/YOUR_ORG/projects/kairo-mobile/builds/BUILD_ID
```

Download and install directly, or download from https://expo.dev → Your org → kairo-mobile → Builds.

Notes
- For sensitive values you may prefer to set build-time secrets via `eas secret:create` and reference them in `eas.json`.
- Local development (`expo start`) and Expo Go are unaffected by these changes. Use `.env.local` to point to your local backend.
