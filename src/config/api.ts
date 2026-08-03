import { Platform } from 'react-native';

/**
 * NEXGEN Mobile App - Centralized API Configuration
 *
 * Handles URL selection for different environments:
 * - Physical devices on local Wi-Fi (LAN)
 * - Android/iOS emulators/simulators
 * - Staging (Railway)
 * - Production
 *
 * ═══════════════════════════════════════════════════════════════════
 * SETUP FOR PHYSICAL DEVICE (Local Development)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Requirement: Physical mobile and backend laptop MUST be on same Wi-Fi
 *
 * Steps:
 * 1. Find your Windows machine's IPv4:
 *    Windows CMD: ipconfig
 *    Look for "IPv4 Address" under Wi-Fi adapter (e.g., 192.168.1.12)
 *
 * 2. Create/update .env.local:
 *    EXPO_PUBLIC_API_URL=http://192.168.1.12:4000
 *    (Replace 192.168.1.12 with your actual IP)
 *
 * 3. Verify backend is accessible:
 *    - Backend must listen on 0.0.0.0:4000 (not just localhost)
 *    - Test: http://192.168.1.12:4000 in browser
 *
 * 4. Restart Expo:
 *    npx expo start --clear
 *
 * 5. Scan QR code on physical device
 *    App will display "API: http://192.168.1.12:4000"
 *    Tap "Test connection ✓" to verify
 *
 * ═══════════════════════════════════════════════════════════════════
 * EMULATOR/SIMULATOR DEFAULTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * If EXPO_PUBLIC_API_URL is not set, will use:
 * - Android Emulator: http://10.0.2.2:4000 (standard AVD bridge)
 * - iOS Simulator: http://127.0.0.1:4000 (localhost)
 *
 * ═══════════════════════════════════════════════════════════════════
 * STAGING / PRODUCTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * Create .env.staging or use EAS build:
 * EXPO_PUBLIC_API_URL=https://nexgen-backend-production.up.railway.app
 *
 * To build for staging:
 * npx eas build --platform ios --profile staging
 * npx eas build --platform android --profile staging
 */

/** Android emulator → host machine (standard AVD bridge address). */
const DEFAULT_ANDROID_EMULATOR = 'http://10.0.2.2:4000';

/** iOS simulator → localhost. */
const DEFAULT_IOS_SIMULATOR = 'http://127.0.0.1:4000';

/**
 * Read API URL from environment variable.
 * Must be prefixed with EXPO_PUBLIC_ to be visible at build time.
 * Source: .env.local, .env.staging, or EAS build environment
 */
const EXPO_API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();

/**
 * Select API URL with priority:
 * 1. EXPO_PUBLIC_API_URL (from .env file)  ← Use this for local physical devices
 * 2. Platform-specific emulator defaults     ← Fallback for local development
 */
export const BASE_URL = EXPO_API_URL || (Platform.OS === 'android' ? DEFAULT_ANDROID_EMULATOR : DEFAULT_IOS_SIMULATOR);

/**
 * Debug logging at startup (development only).
 * Shows which API URL is being used and why.
 */
if (__DEV__) {
  console.log('[NEXGEN] API Configuration:');
  console.log('[NEXGEN] BASE_URL =', BASE_URL);
  console.log('[NEXGEN] Platform =', Platform.OS);
  if (!EXPO_API_URL) {
    console.log(
      '[NEXGEN] ℹ️ Using default emulator/simulator URL (EXPO_PUBLIC_API_URL not set).',
      '\n[NEXGEN] For physical device on Wi-Fi:',
      '\n[NEXGEN]   1. Find your machine IP: ipconfig',
      '\n[NEXGEN]   2. Set .env.local: EXPO_PUBLIC_API_URL=http://YOUR_IP:4000',
      '\n[NEXGEN]   3. Restart: npx expo start --clear'
    );
  } else {
    console.log('[NEXGEN] ✓ Using environment API URL:', EXPO_API_URL);
  }
}

/**
 * Toggle real API vs mock services.
 * 1 = use real backend API
 * 0 = use mock data
 */
export const USE_API = (process.env.EXPO_PUBLIC_USE_API ?? '1') === '1';

