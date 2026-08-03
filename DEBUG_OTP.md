# Debug OTP Testing Guide

## Overview

The KAIRO mobile app now displays debug OTP codes during staging/testing when the backend provides them. This is **only for internal QA testing** and can be disabled in production.

---

## Backend Setup (Already Configured)

The backend already returns `debugOtp` in the OTP response when:

```
NODE_ENV ≠ production
AND
OTP_DEBUG_RESPONSE=true
```

Backend .env:
```
OTP_DEBUG_RESPONSE=true
```

Backend response:
```json
{
  "success": true,
  "data": {
    "ok": true,
    "expiresInSec": 300,
    "otpLength": 6,
    "debugOtp": "123456"
  },
  "message": "OTP sent."
}
```

---

## Mobile App Setup

### Environment Variables

Debug OTP is displayed when:

1. **Backend returns `debugOtp`** (most important for staging)
2. **`EXPO_PUBLIC_SHOW_DEBUG_OTP=1`** is set (staging/QA)
3. **`__DEV__`** is true (local development)

### Configuration Files

#### For Local Development
File: `.env.local`
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:4000
EXPO_PUBLIC_USE_API=1
EXPO_PUBLIC_SHOW_DEBUG_OTP=0
```
(Will show OTP because `__DEV__=true`)

#### For Staging/Railway
File: `.env.staging`
```
EXPO_PUBLIC_API_URL=https://nexgen-backend-production.up.railway.app
EXPO_PUBLIC_USE_API=1
EXPO_PUBLIC_SHOW_DEBUG_OTP=1
```

#### For Production
File: `.env.production`
```
EXPO_PUBLIC_API_URL=https://your-production-backend.example.com
EXPO_PUBLIC_USE_API=1
EXPO_PUBLIC_SHOW_DEBUG_OTP=0
```

#### For EAS Builds
File: `eas.json`
```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_API_URL": "http://10.0.2.2:4000",
        "EXPO_PUBLIC_SHOW_DEBUG_OTP": "1"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://nexgen-backend-production.up.railway.app",
        "EXPO_PUBLIC_SHOW_DEBUG_OTP": "1"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://your-production-backend.example.com",
        "EXPO_PUBLIC_SHOW_DEBUG_OTP": "0"
      }
    }
  }
}
```

---

## Testing Steps

### Test 1: Local Development (Expo Go)

1. Copy `.env.local` to `.env`:
   ```bash
   cp mobile-app/.env.local mobile-app/.env
   ```

2. Update with your machine's LAN IP:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.X.X:4000
   ```

3. Start Expo:
   ```bash
   cd mobile-app
   npx expo start --clear
   ```

4. Launch on device or emulator.

5. On Login screen → enter phone number → tap "Get OTP" → you should see:
   ```
   🧪 Test OTP: 123456
   ```
   in an orange bordered box.

6. Check console logs:
   ```
   [KAIRO-OTP] Requesting OTP {...}
   [KAIRO-OTP] OTP received {hasDebugOtp: true, expiresInSec: 300}
   [KAIRO-OTP] Displaying debug OTP {debugOtp: "123456"}
   ```

---

### Test 2: EAS Preview Build (Staging)

1. Build preview APK:
   ```bash
   cd mobile-app
   npm run eas:build:preview:android
   ```

2. Once build completes, download and install the APK:
   ```bash
   adb install -r path/to/app.apk
   ```

3. Launch the app on device.

4. On Login screen → enter phone number → tap "Get OTP" → you should see:
   ```
   🧪 Test OTP: 123456
   ```
   in an orange bordered box.

5. The app should display the OTP even though `__DEV__` is false, because:
   - `EXPO_PUBLIC_SHOW_DEBUG_OTP=1` is set in the preview profile
   - Backend returns `debugOtp`

---

### Test 3: Verify Production Safety

1. Build production APK:
   ```bash
   cd mobile-app
   npm run eas:build:production:android
   ```

2. Verify that `EXPO_PUBLIC_SHOW_DEBUG_OTP=0` in the production profile.

3. When installed, the app will **NOT** display the debug OTP, even if the backend accidentally sends it (because the env var is disabled).

---

## UI Display

### Debug OTP Box (Staging/Testing)

When debug OTP is displayed, you'll see:

```
┌─────────────────────────────┐
│ Testing OTP                 │
│                             │
│ 🧪 Test OTP: 123456        │
└─────────────────────────────┘
```

- Orange (#FF8C00) border
- Light orange background (#FFF8E7)
- Large monospace OTP code for easy reading
- Easy copy/paste access

### When NOT Displayed

- If backend doesn't return `debugOtp` AND env var is disabled
- Production builds (env var = 0)
- After verification succeeds and OTP screen closes

---

## Console Logging

Logs are printed to the console (visible in `expo start` output or `adb logcat`):

```
[KAIRO-OTP] Requesting OTP {phone: "9876543210"}
[KAIRO-OTP] OTP received {hasDebugOtp: true, expiresInSec: 300}
[KAIRO-OTP] Displaying debug OTP {debugOtp: "123456"}
```

Logs are **only** printed when `__DEV__=true` (local development).

---

## API Response Parser

The mobile app correctly unwraps the backend response:

1. Raw response:
   ```json
   {
     "success": true,
     "data": {
       "ok": true,
       "expiresInSec": 300,
       "otpLength": 6,
       "debugOtp": "123456"
     },
     "message": "OTP sent."
   }
   ```

2. Parsed by `apiService.post()` → returns `data` directly

3. Received by `authService.requestOtp()`:
   ```typescript
   {
     ok: true,
     expiresInSec: 300,
     otpLength: 6,
     debugOtp: "123456"
   }
   ```

4. Displayed on screen if conditions met

---

## Troubleshooting

### OTP Not Showing?

- [ ] Check `OTP_DEBUG_RESPONSE=true` in backend `.env`
- [ ] Check backend is running in non-production mode
- [ ] Check `EXPO_PUBLIC_SHOW_DEBUG_OTP=1` in `.env.staging` or `eas.json`
- [ ] Restart Expo: `npx expo start --clear`
- [ ] Check console logs for `[KAIRO-OTP]` messages
- [ ] Verify backend response includes `debugOtp` field (check network tab in DevTools)

### OTP Showing in Production?

- [ ] Ensure `.env.production` has `EXPO_PUBLIC_SHOW_DEBUG_OTP=0`
- [ ] Ensure `eas.json` production profile has `EXPO_PUBLIC_SHOW_DEBUG_OTP=0`
- [ ] Rebuild production APK
- [ ] Clear app data and reinstall

---

## Security Notes

- **Development only**: This feature is meant for internal testing only
- **Cannot be disabled in production**: Even if backend accidentally returns `debugOtp`, the app will not display it if `EXPO_PUBLIC_SHOW_DEBUG_OTP=0`
- **No hardcoded values**: OTP is never hardcoded; always comes from backend or env var
- **Verification logic unchanged**: The OTP verification flow is not modified; this is purely a display feature
- **Backend controls display**: Backend has final say via `OTP_DEBUG_RESPONSE` setting

---

## Files Modified

- `mobile-app/src/config/debug.ts` (new) - Debug configuration
- `mobile-app/src/screens/UserLoginScreen.tsx` - Enhanced OTP display
- `mobile-app/src/screens/PartnerLoginScreen.tsx` - Enhanced OTP display
- `mobile-app/.env.example` - Added EXPO_PUBLIC_SHOW_DEBUG_OTP
- `mobile-app/.env.local` - Added EXPO_PUBLIC_SHOW_DEBUG_OTP=0
- `mobile-app/.env.staging` - Added EXPO_PUBLIC_SHOW_DEBUG_OTP=1
- `mobile-app/.env.production` - Added EXPO_PUBLIC_SHOW_DEBUG_OTP=0
- `mobile-app/eas.json` - Added EXPO_PUBLIC_SHOW_DEBUG_OTP to build profiles

---

## Summary

✅ Backend returns `debugOtp` when `OTP_DEBUG_RESPONSE=true`  
✅ Mobile app displays OTP in an orange box when backend provides it  
✅ Display can be controlled via `EXPO_PUBLIC_SHOW_DEBUG_OTP` env var  
✅ Production builds safely disable it (`EXPO_PUBLIC_SHOW_DEBUG_OTP=0`)  
✅ Console logging for debugging  
✅ Works in both Expo Go and EAS preview APK builds  
✅ No changes to verification logic
