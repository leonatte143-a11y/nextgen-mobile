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
    version: '1.0.0',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FF8C00'
    },
    android: {
      ...config.android,
      package: process.env.ANDROID_PACKAGE || 'com.kairo.mobileapp',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FF8C00'
      }
    },
    extra: {
      ...(config.extra || {}),
      projectId: 'a30926c2-d34c-4ceb-ba72-767edc62b46e'
    }
  };
};
