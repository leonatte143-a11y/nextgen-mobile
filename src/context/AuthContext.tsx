import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_MOCK_USER } from '../mock/defaultUser';
import type { MockUser } from '../mock/types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const KEYS = {
  userToken: 'nexgen_user_token',
  partnerToken: 'nexgen_partner_token',
  language: 'nexgen_lang',
  languageDone: 'nexgen_language_onboarding',
};

type LangCode = 'en' | 'te';

type AuthContextValue = {
  userToken: string | null;
  partnerToken: string | null;
  user: MockUser | null;
  language: LangCode;
  hasCompletedLanguageOnboarding: boolean;
  isHydrating: boolean;
  setLanguage: (code: LangCode) => Promise<void>;
  completeLanguageOnboarding: () => Promise<void>;
  loginUser: (phone: string, otp: string) => Promise<boolean>;
  loginPartner: (phone: string, otp: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  logoutPartner: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  registerUser: (data: Partial<MockUser> & { phone: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [partnerToken, setPartnerToken] = useState<string | null>(null);
  const [user, setUser] = useState<MockUser | null>(null);
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
        if (lang === 'te' || lang === 'en') setLanguageState(lang);
        setHasCompletedLanguageOnboarding(lo === '1');
        if (ut) {
          const p = await userService.getProfile();
          setUser(p);
        } else {
          setUser({ ...DEFAULT_MOCK_USER });
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
    if (!res.ok || !res.token) return false;
    await AsyncStorage.setItem(KEYS.userToken, res.token);
    setUserToken(res.token);
    await userService.updateProfile({ phone });
    const p = await userService.getProfile();
    setUser(p);
    return true;
  }, []);

  const registerUser = useCallback(async (data: Partial<MockUser> & { phone: string }) => {
    const profile = await authService.registerProfile(data);
    await userService.updateProfile(profile);
    setUser(profile);
  }, []);

  const loginPartner = useCallback(async (phone: string, otp: string) => {
    const res = await authService.partnerLogin(phone, otp);
    if (!res.ok || !res.token) return false;
    await AsyncStorage.setItem(KEYS.partnerToken, res.token);
    setPartnerToken(res.token);
    return true;
  }, []);

  const logoutUser = useCallback(async () => {
    await authService.logout();
    await AsyncStorage.removeItem(KEYS.userToken);
    setUserToken(null);
    setUser({ ...DEFAULT_MOCK_USER });
  }, []);

  const logoutPartner = useCallback(async () => {
    await AsyncStorage.removeItem(KEYS.partnerToken);
    setPartnerToken(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const p = await userService.getProfile();
    setUser(p);
  }, []);

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
