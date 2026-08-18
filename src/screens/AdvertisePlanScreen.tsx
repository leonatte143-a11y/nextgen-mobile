import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KairoTextInput } from '../components/KairoTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AdvertisePlan'>;

type PlanId = 'image' | 'video';

const PLANS: { id: PlanId; label: string; monthlyRate: number; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'image', label: 'Image Banner', monthlyRate: 499, icon: 'image-outline' },
  { id: 'video', label: 'Video Banner', monthlyRate: 999, icon: 'videocam-outline' },
];

export function AdvertisePlanScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const [planId, setPlanId] = useState<PlanId>(params.bannerType === 'video' ? 'video' : 'image');
  const [durationUnit, setDurationUnit] = useState<'days' | 'months'>('months');
  const [durationValue, setDurationValue] = useState('1');

  const plan = PLANS.find((p) => p.id === planId)!;

  const parsedDuration = useMemo(() => {
    const n = Math.floor(Number(durationValue) || 0);
    const max = durationUnit === 'months' ? 12 : 365;
    return Math.min(Math.max(n, 0), max);
  }, [durationValue, durationUnit]);

  const totalAmount = useMemo(() => {
    const months = durationUnit === 'months' ? parsedDuration : parsedDuration / 30;
    return Math.round(plan.monthlyRate * months);
  }, [plan, durationUnit, parsedDuration]);

  const canPay = parsedDuration > 0 && totalAmount > 0;

  const onPay = () => {
    if (!canPay) return;
    navigation.navigate('AdSubscriptionCheckout', {
      businessName: params.businessName,
      businessAddress: params.businessAddress,
      bannerUri: params.bannerUri,
      bannerBase64: params.bannerBase64,
      bannerType: params.bannerType,
      socialLink: params.socialLink,
      whatsappNumber: params.whatsappNumber,
      planId,
      durationUnit,
      durationValue: parsedDuration,
      totalAmount,
      draftId: params.draftId,
    });
  };

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Choose a Plan</Text>
        <View style={{ width: 24 }} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.label}>Plan</Text>
        <View style={styles.planRow}>
          {PLANS.map((p) => {
            const active = p.id === planId;
            return (
              <Pressable
                key={p.id}
                style={[styles.planCard, active && styles.planCardOn]}
                onPress={() => setPlanId(p.id)}
              >
                <Ionicons name={p.icon} size={26} color={active ? colors.primary : colors.grey} />
                <Text style={[styles.planLabel, active && styles.planLabelOn]}>{p.label}</Text>
                <Text style={[styles.planPrice, active && styles.planLabelOn]}>
                  ₹{p.monthlyRate} / month
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Duration</Text>
        <View style={styles.unitRow}>
          <Pressable
            style={[styles.unitChip, durationUnit === 'days' && styles.unitChipOn]}
            onPress={() => setDurationUnit('days')}
          >
            <Text style={[styles.unitTxt, durationUnit === 'days' && styles.unitTxtOn]}>Days</Text>
          </Pressable>
          <Pressable
            style={[styles.unitChip, durationUnit === 'months' && styles.unitChipOn]}
            onPress={() => setDurationUnit('months')}
          >
            <Text style={[styles.unitTxt, durationUnit === 'months' && styles.unitTxtOn]}>Months</Text>
          </Pressable>
        </View>
        <KairoTextInput
          label={durationUnit === 'months' ? 'Number of months (max 12)' : 'Number of days (max 365)'}
          keyboardType="number-pad"
          value={durationValue}
          onChangeText={setDurationValue}
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total amount</Text>
          <Text style={styles.summaryAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
        </View>

        <PrimaryButton
          title={`Pay ₹${totalAmount.toLocaleString('en-IN')} /-`}
          onPress={onPay}
          disabled={!canPay}
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: { color: colors.white, fontWeight: '800', fontSize: 17 },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  label: { fontWeight: '700', color: colors.charcoal, marginTop: spacing.md, marginBottom: spacing.sm },
  planRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  planCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  planCardOn: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.orangeTint },
  planLabel: { fontWeight: '800', color: colors.charcoal, marginTop: spacing.sm },
  planLabelOn: { color: colors.primary },
  planPrice: { fontSize: 12, color: colors.grey, marginTop: 4 },
  unitRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  unitChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
  },
  unitChipOn: { backgroundColor: colors.primary },
  unitTxt: { fontWeight: '600', color: colors.charcoal },
  unitTxtOn: { color: colors.white },
  summaryCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
    alignItems: 'center',
  },
  summaryLabel: { color: colors.grey, fontWeight: '600' },
  summaryAmount: { fontSize: 28, fontWeight: '900', color: colors.primary, marginTop: 4 },
});
