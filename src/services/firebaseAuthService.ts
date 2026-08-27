import { getApp } from '@react-native-firebase/app';
import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';
import type { ConfirmationResult } from '@react-native-firebase/auth';

export type FirebaseOtpConfirmation = ConfirmationResult;

function toE164(phoneDigits: string): string {
  const digits = phoneDigits.replace(/\D/g, '').slice(-10);
  return `+91${digits}`;
}

export const firebaseAuthService = {
  async requestOtp(
    phoneDigits: string,
  ): Promise<{ ok: boolean; confirmation?: FirebaseOtpConfirmation; message?: string }> {
    try {
      const auth = getAuth(getApp());
      const confirmation = await signInWithPhoneNumber(auth, toE164(phoneDigits));
      return { ok: true, confirmation };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send OTP.';
      return { ok: false, message: msg };
    }
  },

  async confirmOtp(
    confirmation: FirebaseOtpConfirmation,
    code: string,
  ): Promise<{ ok: boolean; idToken?: string; message?: string }> {
    try {
      const userCredential = await confirmation.confirm(code);
      if (!userCredential?.user) return { ok: false, message: 'Verification failed.' };
      const idToken = await userCredential.user.getIdToken();
      return { ok: true, idToken };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid OTP.';
      return { ok: false, message: msg };
    }
  },
};
