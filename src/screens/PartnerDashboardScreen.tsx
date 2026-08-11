import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PartnerCommandHeader } from '../components/partner/PartnerCommandHeader';
import { PartnerCommandGrid } from '../components/partner/PartnerCommandGrid';
import { PartnerServiceLocationBar } from '../components/partner/PartnerServiceLocationBar';
import { PartnerSocialProofSection } from '../components/partner/PartnerSocialProofSection';
import { usePartner } from '../context/PartnerContext';
import { colors, radius, spacing } from '../constants/theme';
type Props = { navigation: { navigate: (k: string) => void } };

export function PartnerDashboardScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { profile, earnings, requests, toggleOnline, isLoading } = usePartner();

  if (isLoading || !profile || !earnings) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.loading}>Loading dashboard…</Text>
      </View>
    );
  }

  const newCount = requests.filter((item) => item.status === 'new').length;
  const pendingCount = requests.filter((item) => item.status === 'pending').length;

  return (
    <View style={styles.wrap}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: 120 + insets.bottom }]}
      >
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoN}>K</Text>
          </View>
          <Text style={styles.brandName}>KAIRO</Text>
        </View>
        <Text style={styles.welcome}>Welcome, {profile.name.split(' ')[0]}</Text>
        <Text style={styles.welcomeSub}>Service Partner Command Center</Text>
        <PartnerCommandHeader
          name={profile.name}
          photoUrl={profile.photoUrl}
          rating={profile.rating}
          isOnline={profile.isOnline}
          onToggleOnline={(o) => {
            void toggleOnline(o);
          }}
        />
        <PartnerCommandGrid
          pendingCount={pendingCount}
          newCount={newCount}
          lifetimeCompleted={profile.jobsCompleted}
        />
        <PartnerSocialProofSection />
        <Text style={styles.section}>Recent Activity</Text>
        {requests.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="construct-outline" size={18} color={colors.white} />
            </View>
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>
                {item.serviceName} @ {item.address.split(',')[0]}
              </Text>
              <Text
                style={[
                  styles.activityStatus,
                  item.status === 'completed'
                    ? styles.completed
                    : item.status === 'new'
                      ? styles.pending
                      : styles.inProgress,
                ]}
              >
                {item.status === 'new'
                  ? 'New Request'
                  : item.status === 'pending'
                    ? 'Pending'
                    : item.status === 'completed'
                      ? 'Completed'
                      : 'In Progress'}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <PartnerServiceLocationBar
        initialCity={profile.primaryCity}
        initialRadius={profile.serviceOuterRadiusKm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loading: { color: colors.grey },
  wrap: { flex: 1, backgroundColor: colors.greyLight },
  root: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: 16 + 8, paddingBottom: spacing.xl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  logoMark: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoN: { fontSize: 17, fontWeight: '900', color: colors.white },
  brandName: { fontSize: 18, fontWeight: '900', color: colors.navy, letterSpacing: 1 },
  welcome: { color: colors.charcoal, fontSize: 20, fontWeight: '800' },
  welcomeSub: { color: colors.grey, marginTop: 4, marginBottom: 4, fontSize: 13, fontWeight: '600' },
  section: { marginTop: spacing.lg, fontSize: 16, fontWeight: '800' },
  activityItem: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: { flex: 1 },
  activityTitle: { fontWeight: '700', color: colors.charcoal },
  activityStatus: { marginTop: 4, fontWeight: '700' },
  pending: { color: colors.primary },
  inProgress: { color: '#0066cc' },
  completed: { color: colors.success },
  walletCard: {
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletTitle: { fontSize: 14, color: colors.grey },
  walletAmount: { marginTop: 6, fontSize: 24, fontWeight: '800' },
  walletBadge: { backgroundColor: colors.greyLight, borderRadius: radius.md, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  walletBadgeText: { color: colors.charcoal, fontWeight: '700' },
  infoCard: { marginTop: spacing.md, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg },
  infoTitle: { fontWeight: '800', marginBottom: spacing.sm },
  infoText: { color: colors.grey, marginVertical: spacing.xs },
});
