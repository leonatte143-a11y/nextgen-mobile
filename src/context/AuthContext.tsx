import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User, UserRegistrationInput } from '../types/user';
import { logAuth } from '../lib/devLog';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const KEYS = {
  userToken: 'nexgen_user_token',
  partnerToken: 'nexgen_partner_token',
  language: 'nexgen_lang',
  languageDone: 'nexgen_language_onboarding',
};

type LangCode = 'en' | 'te' | 'hi';

export type RefreshProfileResult = { ok: true } | { ok: false; message: string };

type AuthContextValue = {
  userToken: string | null;
  partnerToken: string | null;
  user: User | null;
  language: LangCode;
  hasCompletedLanguageOnboarding: boolean;
  isHydrating: boolean;
  setLanguage: (code: LangCode) => Promise<void>;
  completeLanguageOnboarding: () => Promise<void>;
  loginUser: (phone: string, otp: string) => Promise<{ ok: boolean; message?: string }>;
  loginPartner: (phone: string, otp: string) => Promise<{ ok: boolean; message?: string }>;
  logoutUser: () => Promise<void>;
  logoutPartner: () => Promise<void>;
  refreshProfile: () => Promise<RefreshProfileResult>;
  registerUser: (data: UserRegistrationInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [partnerToken, setPartnerToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguageState] = useState<LangCode>('en');
  const [hasCompletedLanguageOnboarding, setHasCompletedLanguageOnboarding] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ut, pt, lang, lo] = await Promise.all([
          AsyncStorage.getItem(KEYS.userToken),
          AsyncStorage.getItem(KEYS.partnerToken),
          AsyncStorage.getItem(KEYS.language),
          AsyncStorage.getItem(KEYS.languageDone),
        ]);
        setUserToken(ut);
        setPartnerToken(pt);
        if (lang === 'te' || lang === 'en' || lang === 'hi') setLanguageState(lang);
        setHasCompletedLanguageOnboarding(lo === '1');
        if (ut) {
          logAuth('hydrate_user_token', { present: true });
          try {
            const p = await userService.getProfile();
            setUser(p);
          } catch (e: unknown) {
            logAuth('hydrate_profile_failed', {
              message: e instanceof Error ? e.message : 'unknown',
            });
            setUser(null);
          }
        } else {
          setUser(null);
        }
        if (pt) {
          logAuth('hydrate_partner_token', { present: true });
        }
      } finally {
        setIsHydrating(false);
      }
    })();
  }, []);

  const setLanguage = useCallback(async (code: LangCode) => {
    setLanguageState(code);
    await AsyncStorage.setItem(KEYS.language, code);
  }, []);

  const completeLanguageOnboarding = useCallback(async () => {
    setHasCompletedLanguageOnboarding(true);
    await AsyncStorage.setItem(KEYS.languageDone, '1');
  }, []);

  const loginUser = useCallback(async (phone: string, otp: string) => {
    const res = await authService.verifyOtp(phone, otp);
    if (!res.ok || !res.token) {
      logAuth('login_user_failed', { message: res.message });
      return { ok: false, message: res.message || 'Invalid or expired OTP.' };
    }
    await AsyncStorage.setItem(KEYS.userToken, res.token);
    setUserToken(res.token);
    logAuth('login_user_token_stored', { userId: res.user?.id });
    try {
      const p = await userService.getProfile();
      setUser(p);
    } catch {
      if (res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    }
    return { ok: true };
  }, []);

  const registerUser = useCallback(async (data: UserRegistrationInput) => {
    await authService.registerProfile(data);
  }, []);

  const loginPartner = useCallback(async (phone: string, otp: string) => {
    const res = await authService.partnerLogin(phone, otp);
    if (!res.ok || !res.token) {
      logAuth('login_partner_failed', { message: res.message });
      return { ok: false, message: res.message || 'Could not sign in as partner.' };
    }
    await AsyncStorage.setItem(KEYS.partnerToken, res.token);
    setPartnerToken(res.token);
    logAuth('login_partner_token_stored', { partnerId: res.partner?.id });
    return { ok: true };
  }, []);

  const logoutUser = useCallback(async () => {
    logAuth('logout_user');
    await authService.logout();
    await AsyncStorage.removeItem(KEYS.userToken);
    setUserToken(null);
    setUser(null);
  }, []);

  const logoutPartner = useCallback(async () => {
    logAuth('logout_partner');
    await AsyncStorage.removeItem(KEYS.partnerToken);
    setPartnerToken(null);
  }, []);

  const refreshProfile = useCallback(async (): Promise<RefreshProfileResult> => {
    if (!userToken) {
      setUser(null);
      return { ok: false, message: 'Not signed in.' };
    }
    try {
      const p = await userService.getProfile();
      setUser(p);
      return { ok: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not load profile.';
      return { ok: false, message };
    }
  }, [userToken]);

  const value = useMemo(
    () => ({
      userToken,
      partnerToken,
      user,
      language,
      hasCompletedLanguageOnboarding,
      isHydrating,
      setLanguage,
      completeLanguageOnboarding,
      loginUser,
      loginPartner,
      logoutUser,
      logoutPartner,
      refreshProfile,
      registerUser,
    }),
    [
      userToken,
      partnerToken,
      user,
      language,
      hasCompletedLanguageOnboarding,
      isHydrating,
      setLanguage,
      completeLanguageOnboarding,
      loginUser,
      loginPartner,
      logoutUser,
      logoutPartner,
      refreshProfile,
      registerUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const authStorageKeys = KEYS;
