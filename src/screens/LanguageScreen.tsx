import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Language'> };

export function LanguageScreen({ navigation }: Props) {
  const { setLanguage, completeLanguageOnboarding, userToken, partnerToken } = useAuth();
  const [sel, setSel] = useState<'en' | 'te'>('en');

  const onContinue = async () => {
    await setLanguage(sel);
    if (partnerToken) {
      navigation.replace('PartnerHome');
      return;
    }
    if (userToken) {
      navigation.replace('MainTabs');
      return;
    }
    await completeLanguageOnboarding();
    navigation.replace('UserLogin');
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Ionicons name="globe-outline" size={28} color={colors.primary} />
        <Text style={styles.h1}>Choose Language</Text>
        <Text style={styles.h2}>మీ భాషను ఎంచుకోండి</Text>
      </View>
      <Pressable
        onPress={() => setSel('en')}
        style={[styles.card, sel === 'en' && styles.cardOn]}
      >
        <Text style={styles.cardTitle}>English</Text>
        <Text style={styles.cardSub}>Default Language</Text>
        {sel === 'en' ? <Ionicons name="checkmark-circle" size={24} color={colors.primary} /> : null}
      </Pressable>
      <Pressable
        onPress={() => setSel('te')}
        style={[styles.card, sel === 'te' && styles.cardOn]}
      >
        <Text style={[styles.cardTitle, sel === 'te' && styles.te]}>తెలుగు</Text>
        <Text style={styles.cardSub}>రాజమండ్రి & గుంటూరు ప్రాంతీయ భాష</Text>
        {sel === 'te' ? <Ionicons name="checkmark-circle" size={24} color={colors.primary} /> : null}
      </Pressable>
      <View style={styles.footer}>
        <PrimaryButton title="Continue / కొనసాగించు" onPress={onContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, padding: spacing.lg, paddingTop: 56 },
  header: { marginBottom: spacing.xl },
  h1: { fontSize: 22, fontWeight: '800', color: colors.charcoal, marginTop: spacing.sm },
  h2: { fontSize: 15, color: colors.grey, marginTop: spacing.xs },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  cardOn: { borderColor: colors.primary, backgroundColor: colors.orangeTint },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal },
  te: { color: colors.primary },
  cardSub: { position: 'absolute', left: spacing.lg, top: 44, fontSize: 12, color: colors.grey },
  footer: { marginTop: 'auto', marginBottom: spacing.lg },
});
