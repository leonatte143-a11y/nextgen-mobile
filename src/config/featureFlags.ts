/**
 * Runtime feature flags for NEXGEN mobile app.
 *
 * Controlled via EXPO_PUBLIC_ env variables for Expo/EAS.
 *
 * When false, partner onboarding skips the optional academy question flow.
 */
export const ENABLE_PARTNER_QUESTIONS = process.env.EXPO_PUBLIC_ENABLE_PARTNER_QUESTIONS === '1';
