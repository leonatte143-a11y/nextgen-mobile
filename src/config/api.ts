import { Platform } from 'react-native';

/**
 * API base URL for Expo.
 *
 * Expo Go on a **physical phone** does NOT use your PC unless you set `EXPO_PUBLIC_API_URL`
 * in a `.env` file in the project root (same folder as `app.json`), e.g.:
 *   EXPO_PUBLIC_API_URL=http://192.168.0.142:4000
 * Then restart: `npx expo start --clear`
 *
 * Defaults below are only correct for **emulator/simulator** (do not hardcode LAN IPs here):
 * - Android emulator: 10.0.2.2 → host machine
 * - iOS simulator: 127.0.0.1 → host machine
 */
const DEFAULT_ANDROID_EMULATOR = 'http://192.168.0.142:4000';
const DEFAULT_IOS_SIMULATOR = 'http://127.0.0.1:4000';

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? DEFAULT_ANDROID_EMULATOR : DEFAULT_IOS_SIMULATOR);

/** Toggle real API vs mock services. */
export const USE_API = (process.env.EXPO_PUBLIC_USE_API ?? '1') === '1';

