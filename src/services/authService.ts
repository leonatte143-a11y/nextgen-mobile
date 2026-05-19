import type { PartnerProfile } from '../mock/types';
import type { User, UserRegistrationInput } from '../types/user';
import { coerceUser } from '../types/user';
import { apiService } from './apiService';

export const authService = {
  async requestOtp(phoneDigits: string): Promise<{
    ok: boolean;
    message: string;
    expiresInSec?: number;
    otpLength?: number;
    debugOtp?: string;
  }> {
    try {
      const data = await apiService.post<{
        ok: boolean;
        expiresInSec?: number;
        otpLength?: number;
        debugOtp?: string;
      }>('/api/v1/auth/otp/request', { phone: phoneDigits });
      return {
        ok: true,
        message: '',
        expiresInSec: data.expiresInSec,
        otpLength: data.otpLength,
        debugOtp: data.debugOtp,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send OTP.';
      return { ok: false, message: msg };
    }
  },

  async verifyOtp(
    phoneDigits: string,
    otp: string,
  ): Promise<{
    ok: boolean;
    token?: string;
    message: string;
    user?: User;
    attemptsLeft?: number;
    code?: string;
  }> {
    try {
      const data = await apiService.post<{
        ok: boolean;
        token?: string;
        message?: string;
        user?: unknown;
        attemptsLeft?: number;
        code?: string;
      }>('/api/v1/auth/otp/verify', { phone: phoneDigits, otp });
      const ok = !!data.ok && !!data.token;
      return {
        ok,
        token: data.token,
        message: data.message ?? (ok ? '' : 'Invalid OTP.'),
        user: data.user != null ? coerceUser(data.user) : undefined,
        attemptsLeft: data.attemptsLeft,
        code: data.code,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'OTP verify failed.';
      return { ok: false, message: msg };
    }
  },

  async registerProfile(payload: UserRegistrationInput): Promise<User> {
    const data = await apiService.post<unknown>('/api/v1/auth/register', payload);
    return coerceUser(data);
  },

  async partnerLogin(
    phoneDigits: string,
    otp: string,
  ): Promise<{ ok: boolean; token?: string; message: string; partner?: PartnerProfile }> {
    try {
      const data = await apiService.post<{
        ok: boolean;
        token?: string;
        message?: string;
        partner?: PartnerProfile;
      }>('/api/v1/auth/partner/login', { phone: phoneDigits, otp });
      const ok = !!data.ok && !!data.token;
      return {
        ok,
        token: data.token,
        message: data.message ?? (ok ? '' : 'Could not sign in.'),
        partner: data.partner,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Partner login failed.';
      return { ok: false, message: msg };
    }
  },

  async logout(): Promise<void> {
    try {
      await apiService.post('/api/v1/auth/logout', {});
    } catch {
      /* ignore */
    }
  },
};
