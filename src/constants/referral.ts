/**
 * Shared referral copy/link constants used across the app (user + partner referral flows).
 */
export const REFERRAL_APP_LINK = 'https://kairo.app/download';

export const REFERRAL_SHARE_MESSAGE = (code?: string): string =>
  code
    ? `Join me on KAIRO! Use my referral code ${code} and we both earn rewards. Download the app: ${REFERRAL_APP_LINK}`
    : `Join me on KAIRO — book trusted local service partners in minutes! Download the app: ${REFERRAL_APP_LINK}`;
