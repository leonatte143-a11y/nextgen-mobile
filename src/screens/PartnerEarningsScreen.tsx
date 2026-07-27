import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { usePartner } from '../context/PartnerContext';
import { partnerService } from '../services/partnerService';
import { colors, radius, spacing } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';
import type { PartnerReferralSummary } from '../mock/types';

type Tab = 'wallet' | 'referrals';

export function PartnerEarningsScreen() {
  const { earnings, withdrawBalance, isLoading } = usePartner();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('wallet');
  const [referrals, setReferrals] = useState<PartnerReferralSummary | null>(null);
  const [referralsLoading, setReferralsLoading] = useState(false);

  useEffect(() => {
    if (tab !== 'referrals' || referrals) return;
    setReferralsLoading(true);
    partnerService
      .getReferralEarnings()
      .then(setReferrals)
      .catch(() => setReferrals(null))
      .finally(() => setReferralsLoading(false));
  }, [tab, referrals]);

  if (isLoading || !earnings) {
    return <EmptyState icon="💰" title="Loading wallet details..." />;
  }

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await withdrawBalance();
    } finally {
      setLoading(false);
    }
  };

  const shareReferralCode = async (code: string) => {
    try {
      await Share.share({
        message: `Join NEXGEN as a service partner using my referral code ${code} and we both get rewarded!`,
      });
    } catch {
      // ignore share cancellation
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.tabRow}>
        <Pressable style={[styles.tabBtn, tab === 'wallet' && styles.tabBtnOn]} onPress={() => setTab('wallet')}>
          <Text style={[styles.tabTxt, tab === 'wallet' && styles.tabTxtOn]}>Wallet</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, tab === 'referrals' && styles.tabBtnOn]} onPress={() => setTab('referrals')}>
          <Text style={[styles.tabTxt, tab === 'referrals' && styles.tabTxtOn]}>Referral Earnings</Text>
        </Pressable>
      </View>

      {tab === 'wallet' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.cardLarge}>
            <Text style={styles.label}>Available Balance</Text>
            <Text style={styles.amount}>₹{earnings.availableBalance}</Text>
            <Text style={styles.sub}>Amt ready for settlement every Monday.</Text>
          </View>
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>₹{earnings.todayEarnings}</Text>
              <Text style={styles.metricLabel}>Today</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>₹{earnings.lifetimeEarnings}</Text>
              <Text style={styles.metricLabel}>Lifetime</Text>
            </View>
          </View>
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{earnings.completedJobs}</Text>
              <Text style={styles.metricLabel}>Completed</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{earnings.commissionRate}%</Text>
              <Text style={styles.metricLabel}>Commission</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Payout Breakdown</Text>
            <Text style={styles.summaryText}>Customer paid less 10% NEXGEN commission.</Text>
            <Text style={styles.summaryText}>Your share is automatically added to your wallet.</Text>
          </View>
          <Pressable
            style={[styles.button, loading || earnings.availableBalance === 0 ? styles.buttonDisabled : null]}
            onPress={handleWithdraw}
            disabled={loading || earnings.availableBalance === 0}
          >
            <Text style={[styles.buttonText, loading || earnings.availableBalance === 0 ? styles.disabledText : null]}>
              Settle to Bank
            </Text>
          </Pressable>
          {earnings.availableBalance === 0 ? <Text style={styles.note}>No balance to withdraw right now.</Text> : null}
        </ScrollView>
      ) : referralsLoading || !referrals ? (
        <EmptyState icon="🤝" title="Loading referral earnings..." />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.cardLarge}>
            <Text style={styles.label}>Your Referral Code</Text>
            <Text style={styles.codeTxt}>{referrals.referralCode}</Text>
            <View style={styles.codeActions}>
              <Pressable
                style={styles.codeActionBtn}
                onPress={async () => {
                  await Clipboard.setStringAsync(referrals.referralCode);
                  Alert.alert('Copied', 'Referral code copied to clipboard.');
                }}
              >
                <Ionicons name="copy-outline" size={16} color={colors.primary} />
                <Text style={styles.codeActionTxt}>Copy</Text>
              </Pressable>
              <Pressable style={styles.codeActionBtn} onPress={() => shareReferralCode(referrals.referralCode)}>
                <Ionicons name="share-social-outline" size={16} color={colors.primary} />
                <Text style={styles.codeActionTxt}>Share</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>How it works</Text>
            <Text style={styles.summaryText}>
              Share your code with other partners. When someone you refer completes their first job, you
              automatically earn 50% of NEXGEN's commission from that job.
            </Text>
          </View>
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>₹{referrals.totalEarned}</Text>
              <Text style={styles.metricLabel}>Total referral earnings</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{referrals.earnings.length}</Text>
              <Text style={styles.metricLabel}>Referrals paid out</Text>
            </View>
          </View>
          <Text style={styles.summaryTitle}>Earnings history</Text>
          {referrals.earnings.length === 0 ? (
            <Text style={styles.note}>No referral earnings yet. Share your code to get started.</Text>
          ) : (
            referrals.earnings.map((e) => (
              <View key={e.id} style={styles.referralRow}>
                <Text style={styles.referralAmount}>+₹{e.amount}</Text>
                <Text style={styles.referralMeta}>
                  Booking {e.bookingId} · {new Date(e.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  cardLarge: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  label: { color: colors.grey, fontSize: 14, marginBottom: spacing.sm },
  amount: { fontSize: 32, fontWeight: '800', color: colors.primary },
  sub: { color: colors.grey, marginTop: spacing.xs },
  metricRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  metricCard: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, elevation: 1 },
  metricValue: { fontSize: 20, fontWeight: '800' },
  metricLabel: { color: colors.grey, marginTop: spacing.xs },
  summaryCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.lg },
  summaryTitle: { fontWeight: '800', marginBottom: spacing.sm },
  summaryText: { color: colors.grey, marginBottom: spacing.xs },
  button: { backgroundColor: colors.primary, padding: spacing.lg, borderRadius: radius.md, alignItems: 'center' },
  buttonDisabled: { backgroundColor: colors.grey },
  buttonText: { color: colors.white, fontWeight: '800' },
  disabledText: { color: colors.white },
  note: { marginTop: spacing.md, color: colors.grey, textAlign: 'center' },
  tabRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.sm },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
    backgroundColor: colors.greyLight,
  },
  tabBtnOn: { backgroundColor: colors.primary },
  tabTxt: { fontWeight: '700', color: colors.charcoal },
  tabTxtOn: { color: colors.white },
  codeTxt: { fontSize: 24, fontWeight: '900', color: colors.charcoal, letterSpacing: 1 },
  codeActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  codeActionBtn: {
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
  codeActionTxt: { color: colors.primary, fontWeight: '700' },
  referralRow: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 1,
  },
  referralAmount: { fontSize: 16, fontWeight: '800', color: colors.success },
  referralMeta: { color: colors.grey, fontSize: 12, marginTop: 4 },
});
