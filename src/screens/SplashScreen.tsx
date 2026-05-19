import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';

 type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'> };

export function SplashScreen({ navigation }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const { isHydrating, hasCompletedLanguageOnboarding, userToken, partnerToken } = useAuth();

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale]);

  useEffect(() => {
    if (isHydrating) return;
    const t = setTimeout(() => {
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
    }, 1400);
    return () => clearTimeout(t);
  }, [isHydrating, hasCompletedLanguageOnboarding, userToken, partnerToken, navigation]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale }] }]}>
        <Text style={styles.logoLetter}>N</Text>
      </Animated.View>
      <Text style={styles.brand}>NEXGEN</Text>
      <Text style={styles.tag}>Your Local Service Expert</Text>
      <View style={styles.buttonRow}>
        <PrimaryButton title="Continue as User" onPress={() => navigation.replace('UserLogin')} style={styles.entryButton} />
        <PrimaryButton title="Service Partner" onPress={() => navigation.replace('PartnerLogin')} style={styles.entryButton} />
      </View>
      <View style={styles.icons}>
        <Text style={styles.mini}>🔧</Text>
        <Text style={styles.mini}>🩺</Text>
        <Text style={styles.mini}>🚗</Text>
        <Text style={styles.mini}>🎓</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoLetter: { fontSize: 44, fontWeight: '900', color: colors.white },
  brand: { fontSize: 28, fontWeight: '800', color: colors.charcoal },
  tag: { marginTop: spacing.sm, fontSize: 14, color: colors.grey },
  buttonRow: { width: '100%', paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  entryButton: { marginBottom: spacing.sm },
  icons: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xl, opacity: 0.35 },
  mini: { fontSize: 22 },
});
