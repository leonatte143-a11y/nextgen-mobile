/**
 * app.config.js — dynamic Expo config to inject environment-specific values.
 * - Reads process.env.EXPO_PUBLIC_API_URL (set by EAS or local .env)
 * - Provides sensible emulator defaults for local development
 */

try {
  // Load local .env files when running node (expo/eas will set envs in CI)
  // eslint-disable-next-line global-require
  require('dotenv').config();
} catch (e) {}

const DEFAULT_ANDROID_EMULATOR = 'http://10.0.2.2:4000';
const DEFAULT_IOS_SIMULATOR = 'http://127.0.0.1:4000';

module.exports = ({ config }) => {
  // Priority: EAS env var > local .env > undefined (fallback in api.ts)
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  return {
    ...config,
    name: 'KAIRO',
    slug: 'kairo-mobile',
    scheme: 'kairo',
    version: '1.0.0',
    icon: './assets/kairo_icon.jpeg',
    splash: {
      image: './assets/kairo_icon.jpeg',
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF'
    },
    android: {
      ...config.android,
      package: process.env.ANDROID_PACKAGE || 'com.kairo.mobileapp',
      // EAS Build injects the real file path via the GOOGLE_SERVICES_JSON file
      // env var (set with `eas env:set`, since the file is gitignored and EAS
      // only uploads git-tracked files). Falls back to the local file for
      // `expo prebuild`/local dev.
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/kairo_icon.jpeg',
        backgroundColor: '#FFFFFF'
      }
    },
    extra: {
      ...(config.extra || {}),
    },
    plugins: [
      ...(config.plugins || []),
      'expo-font',
      'expo-video',
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
    ]
  };
};
