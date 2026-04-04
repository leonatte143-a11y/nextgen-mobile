import { DEFAULT_MOCK_USER } from '../mock/defaultUser';
import type { MockUser } from '../mock/types';
import { mockRequest, mockRequestVoid } from './api';

/** In-memory OTP for demo — any 4 digits after "send" succeeds */
let lastSentOtp = '';

export const authService = {
  async requestOtp(phoneDigits: string): Promise<{ ok: boolean; message: string }> {
    return mockRequest(() => {
      if (phoneDigits.length !== 10) {
        return { ok: false, message: 'Enter a valid 10-digit number.' };
      }
      lastSentOtp = '1234'; // mock fixed OTP for predictable QA
      return { ok: true, message: 'OTP sent (mock: use 1234).' };
    });
  },

  async verifyOtp(phoneDigits: string, otp: string): Promise<{ ok: boolean; token?: string; message: string }> {
    return mockRequest(() => {
      if (otp.length !== 4) {
        return { ok: false, message: 'Enter the 4-digit OTP.' };
      }
      if (otp !== lastSentOtp && otp !== '1234') {
        return { ok: false, message: 'Invalid OTP. Try 1234 in mock mode.' };
      }
      return { ok: true, token: `mock_user_token_${phoneDigits}`, message: 'Logged in.' };
    });
  },

  async registerProfile(payload: Partial<MockUser> & { phone: string }): Promise<MockUser> {
    return mockRequest(() => ({
      ...DEFAULT_MOCK_USER,
      ...payload,
      id: `user_${payload.phone}`,
    }));
  },

  async partnerLogin(phoneDigits: string, otp: string): Promise<{ ok: boolean; token?: string }> {
    return mockRequest(() => {
      if (phoneDigits.length === 10 && otp === '1234') {
        return { ok: true, token: `mock_partner_token_${phoneDigits}` };
      }
      return { ok: false };
    });
  },

  async logout(): Promise<void> {
    await mockRequestVoid(200);
  },
};
