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
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Referral Earnings</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.section}>
          {referralsLoading ? (
            <Text style={styles.sectionText}>Loading referral earnings…</Text>
          ) : referrals ? (
            <>
              <Text style={styles.referralCode}>{referrals.referralCode}</Text>
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
              <Text style={styles.sectionText}>Total earned: ₹{referrals.totalEarned}</Text>
            </>
          ) : (
            <Text style={styles.sectionText}>Could not load referral earnings.</Text>
          )}
        </View>
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
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.charcoal },
  content: { padding: spacing.lg },
  section: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg },
  sectionText: { fontSize: 15, color: colors.charcoal, marginBottom: spacing.xs },
  referralCode: { fontSize: 22, fontWeight: '900', color: colors.charcoal, letterSpacing: 1 },
  referralActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.xs },
  referralActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.orangeTint,
  },
  referralActionTxt: { color: colors.primary, fontWeight: '700' },
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
