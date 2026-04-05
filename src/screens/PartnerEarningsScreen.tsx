import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePartner } from '../context/PartnerContext';
import { colors, radius, spacing } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';

export function PartnerEarningsScreen() {
  const { earnings, withdrawBalance, isLoading } = usePartner();
  const [loading, setLoading] = useState(false);

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

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
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
      <Pressable style={[styles.button, loading || earnings.availableBalance === 0 ? styles.buttonDisabled : null]} onPress={handleWithdraw} disabled={loading || earnings.availableBalance === 0}>
        <Text style={[styles.buttonText, loading || earnings.availableBalance === 0 ? styles.disabledText : null]}>Settle to Bank</Text>
      </Pressable>
      {earnings.availableBalance === 0 ? <Text style={styles.note}>No balance to withdraw right now.</Text> : null}
    </ScrollView>
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
});
