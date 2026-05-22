import * as ExpoSplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SplashScreenView } from '../components/SplashScreen';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

const SPLASH_MIN_MS = 2500;

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'> };

export function SplashScreen({ navigation }: Props) {
  const { isHydrating, hasCompletedLanguageOnboarding, userToken, partnerToken } = useAuth();
  const [animationDone, setAnimationDone] = useState(false);
  const mountedAt = useRef(Date.now());
  const hasNavigated = useRef(false);

  const onAnimationComplete = useCallback(() => {
    setAnimationDone(true);
  }, []);

  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (isHydrating || !animationDone || hasNavigated.current) return;

    const elapsed = Date.now() - mountedAt.current;
    const waitMs = Math.max(0, SPLASH_MIN_MS - elapsed);

    const timer = setTimeout(() => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      if (!hasCompletedLanguageOnboarding) {
        navigation.replace('Language');
        return;
      }
      if (partnerToken) {
        navigation.replace('PartnerHome');
        return;
      }
      if (userToken) {
        navigation.replace('MainTabs');
        return;
      }
      navigation.replace('RoleSelection');
    }, waitMs);

    return () => clearTimeout(timer);
  }, [
    isHydrating,
    animationDone,
    hasCompletedLanguageOnboarding,
    userToken,
    partnerToken,
    navigation,
  ]);

  return <SplashScreenView onAnimationComplete={onAnimationComplete} />;
}
