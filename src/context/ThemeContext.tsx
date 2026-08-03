import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { colors as lightColors, darkColors, spacing, radius, typography } from '../constants/theme';

const KEY = 'kairo_dark_mode';

export type AppColors = typeof lightColors | typeof darkColors;

type ThemeContextValue = {
  isDark: boolean;
  colors: AppColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  setDarkMode: (enabled: boolean) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(KEY);
      setIsDark(v === '1');
    })();
  }, []);

  const setDarkMode = useCallback(async (enabled: boolean) => {
    setIsDark(enabled);
    await AsyncStorage.setItem(KEY, enabled ? '1' : '0');
  }, []);

  const toggleDarkMode = useCallback(async () => {
    await setDarkMode(!isDark);
  }, [isDark, setDarkMode]);

  const value = useMemo(
    () => ({
      isDark,
      colors: isDark ? darkColors : lightColors,
      spacing,
      radius,
      typography,
      setDarkMode,
      toggleDarkMode,
    }),
    [isDark, setDarkMode, toggleDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
