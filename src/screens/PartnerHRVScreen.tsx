import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import type { PartnerStackParamList } from '../navigation/PartnerStackTypes';

const ROWS: { k: string; t: string; s: 'Pass' | 'Fail' }[] = [
  { k: 'identity', t: 'Identity verification', s: 'Pass' },
  { k: 'addr', t: 'Address validation', s: 'Pass' },
  { k: 'bank', t: 'Bank verification', s: 'Pass' },
  { k: 'cert', t: 'Certification check', s: 'Fail' },
  { k: 'quiz', t: 'NEXGEN Academy quiz (score 8/10, mock)', s: 'Pass' },
];

type Nav = NativeStackNavigationProp<PartnerStackParamList>;

function badge(st: 'Pass' | 'Fail') {
  return st === 'Pass' ? { bg: colors.success, fg: colors.white } : { bg: colors.error, fg: colors.white };
}

export function PartnerHRVScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.h1}>HR verification</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.p}>Onboarding status (UI only — mock)</Text>
        {ROWS.map((r) => {
          const b = badge(r.s);
          return (
            <View key={r.k} style={styles.card}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
              <View style={styles.m}>
                <Text style={styles.title}>{r.t}</Text>
                <Text style={styles.sub}>
                  {r.s === 'Pass' ? 'Cleared' : 'Needs review (dummy)'}
                </Text>
              </View>
              <View style={[styles.pill, { backgroundColor: b.bg }]}>
                <Text style={[styles.pillTxt, { color: b.fg }]}>{r.s}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.border },
  h1: { fontSize: 17, fontWeight: '800' },
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  p: { marginBottom: spacing.lg, color: colors.grey },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  m: { flex: 1, marginLeft: spacing.md },
  title: { fontWeight: '800', color: colors.charcoal },
  sub: { color: colors.grey, fontSize: 12, marginTop: 2 },
  pill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.full },
  pillTxt: { fontWeight: '800', fontSize: 12 },
});
