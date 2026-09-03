import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useRef, useState } from 'react';
import { Share, StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../constants/theme';
import { partnerService } from '../services/partnerService';
import type { PartnerReferralSummary } from '../mock/types';
import type { PartnerStackParamList } from '../navigation/PartnerStackTypes';

type NavigationProps = NativeStackNavigationProp<PartnerStackParamList>;

export function PartnerReferralScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProps>();
  const [referrals, setReferrals] = useState<PartnerReferralSummary | null>(null);
  const [referralsLoading, setReferralsLoading] = useState(true);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    partnerService
      .getReferralEarnings()
      .then(setReferrals)
      .catch(() => setReferrals(null))
      .finally(() => setReferralsLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const shareReferralCode = async (code: string) => {
    try {
      await Share.share({
        message: `Join KAIRO as a service partner using my referral code ${code} and we both get rewarded!`,
      });
    } catch {
      // ignore share cancellation
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>Referral Earnings</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        {referralsLoading ? (
          <Text style={styles.loadingTxt}>Loading referral earnings…</Text>
        ) : referrals ? (
          <>
            <View style={styles.heroCard}>
              <Ionicons name="gift" size={36} color={colors.white} />
              <Text style={styles.heroHeadline}>Get 150 points for each person you refer</Text>
              <View style={styles.codeBox}>
                <Text style={styles.referralCode}>{referrals.referralCode}</Text>
              </View>
              <View style={styles.referralActions}>
                <Pressable
                  style={styles.referralActionBtn}
                  onPress={async () => {
                    await Clipboard.setStringAsync(referrals.referralCode);
                    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                    setShowCopiedToast(true);
                    toastTimerRef.current = setTimeout(() => setShowCopiedToast(false), 1000);
                  }}
                >
                  <Ionicons name="copy-outline" size={16} color={colors.primary} />
                  <Text style={styles.referralActionTxt}>Copy</Text>
                </Pressable>
                <Pressable style={styles.referralActionBtn} onPress={() => shareReferralCode(referrals.referralCode)}>
                  <Ionicons name="share-social-outline" size={16} color={colors.primary} />
                  <Text style={styles.referralActionTxt}>Share</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="star" size={22} color={colors.primary} />
                <Text style={styles.statValue}>{referrals.rewardPoints}</Text>
                <Text style={styles.statLabel}>Points earned</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="wallet" size={22} color={colors.primary} />
                <Text style={styles.statValue}>₹{referrals.totalEarned}</Text>
                <Text style={styles.statLabel}>Cash earned</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="people" size={22} color={colors.primary} />
                <Text style={styles.statValue}>{referrals.referralCount}</Text>
                <Text style={styles.statLabel}>Referrals</Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.loadingTxt}>Could not load referral earnings.</Text>
        )}
      </ScrollView>
      {showCopiedToast ? (
        <View style={styles.copiedToast} pointerEvents="none">
          <Text style={styles.copiedToastTxt}>Copied</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.primary,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.white },
  content: { padding: spacing.lg },
  loadingTxt: { fontSize: 15, color: colors.charcoal, textAlign: 'center', marginTop: spacing.xl },
  heroCard: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heroHeadline: { color: colors.white, fontWeight: '800', fontSize: 16, textAlign: 'center' },
  codeBox: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  referralCode: { fontSize: 22, fontWeight: '900', color: colors.primary, letterSpacing: 2 },
  referralActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  referralActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  referralActionTxt: { color: colors.primary, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: '900', color: colors.charcoal },
  statLabel: { fontSize: 11, color: colors.grey, fontWeight: '600' },
  copiedToast: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  copiedToastTxt: { color: colors.white, fontWeight: '700' },
});
