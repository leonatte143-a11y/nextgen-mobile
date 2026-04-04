import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NexgenTextInput } from '../components/NexgenTextInput';
import { colors, radius, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FAQ = [
  { q: 'Booking Issues', a: 'Partner late, reschedule, cancel before 2h for full refund.' },
  { q: 'Payments & Refunds', a: 'Failed UPI, wallet credits, settlement timelines.' },
  { q: 'NEXGEN Wallet', a: 'Use reward points at checkout as discount.' },
  { q: 'Safety & Quality', a: 'Report a partner from booking details.' },
];

export function SupportScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <View style={[styles.hero, { paddingTop: 48 }]}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.h1}>How can we help you?</Text>
        <NexgenTextInput
          placeholder="Search (e.g. refund, partner late)"
          style={styles.searchInner}
        />
      </View>
      <View style={styles.quick}>
        <Quick icon="chatbubbles-outline" label="Chat" onPress={() => Alert.alert('Chat', 'WhatsApp / in-app (mock)')} />
        <Quick icon="call-outline" label="Call" onPress={() => Linking.openURL('tel:9876543210')} />
        <Quick
          icon="mail-outline"
          label="Email"
          onPress={() => Linking.openURL('mailto:support@nexgen.com')}
        />
      </View>
      <Text style={styles.section}>FAQ</Text>
      {FAQ.map((f) => (
        <View key={f.q} style={styles.faq}>
          <View style={styles.faqRow}>
            <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
            <Text style={styles.faqQ}>{f.q}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.grey} />
          </View>
          <Text style={styles.faqA}>{f.a}</Text>
        </View>
      ))}
      <Text style={styles.section}>Recent booking</Text>
      <View style={styles.issue}>
        <Text style={styles.issueTxt}>Fan Repair · ₹250</Text>
        <Pressable onPress={() => Alert.alert('Ticket', 'Support ticket created (mock).')}>
          <Text style={styles.issueBtn}>Report an issue</Text>
        </Pressable>
      </View>
      <Pressable style={styles.sos} onPress={() => Linking.openURL('tel:112')}>
        <Text style={styles.sosTxt}>SOS / Emergency</Text>
      </Pressable>
    </ScrollView>
  );
}

function Quick({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.qItem} onPress={onPress}>
      <View style={styles.qCircle}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.qLab}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { paddingBottom: spacing.xl },
  hero: { backgroundColor: colors.primary, padding: spacing.lg, paddingBottom: spacing.xl },
  back: { marginBottom: spacing.md },
  h1: { color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
  searchInner: { backgroundColor: colors.white },
  quick: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -spacing.lg, paddingHorizontal: spacing.md },
  qItem: { alignItems: 'center', flex: 1 },
  qCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  qLab: { marginTop: spacing.sm, fontWeight: '600', fontSize: 12 },
  section: { fontWeight: '800', marginTop: spacing.xl, marginHorizontal: spacing.md },
  faq: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  faqRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  faqQ: { flex: 1, fontWeight: '700' },
  faqA: { color: colors.grey, fontSize: 13, marginTop: spacing.sm, lineHeight: 20 },
  issue: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  issueTxt: { fontWeight: '600' },
  issueBtn: { color: colors.primary, fontWeight: '800' },
  sos: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.error,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  sosTxt: { color: colors.white, fontWeight: '800' },
});
