/**
 * Debug/staging configuration for internal QA testing.
 *
 * Show OTP only during:
 * - Development (__DEV__)
 * - Staging builds when env var is enabled
 * - When backend explicitly returns debugOtp
 */

/**
 * Whether to show debug OTP on login/register screens.
 *
 * Enabled by:
 * 1. EXPO_PUBLIC_SHOW_DEBUG_OTP=1 (staging)
 * 2. __DEV__ (local development)
 * 3. Always show if API response contains debugOtp (safest fallback)
 */
export const SHOW_DEBUG_OTP =
  __DEV__ || (process.env.EXPO_PUBLIC_SHOW_DEBUG_OTP === '1');

/**
 * Whether to enable verbose logging for OTP flow (development only).
 */
export const DEBUG_OTP_LOGS = __DEV__;

/**
 * Log OTP-related events for debugging.
 */
export function logOtpEvent(event: string, data?: Record<string, unknown>): void {
  if (DEBUG_OTP_LOGS) {
    console.log(`[KAIRO-OTP] ${event}`, data || '');
  }
}
