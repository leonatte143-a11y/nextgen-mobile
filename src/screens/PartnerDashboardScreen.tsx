import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePartner } from '../context/PartnerContext';
import { colors, radius, spacing } from '../constants/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<Record<string, undefined>, 'Dashboard'> };

export function PartnerDashboardScreen({ navigation }: Props) {
  const { profile, earnings, requests, toggleOnline, isLoading } = usePartner();

  if (isLoading || !profile || !earnings) {
    return null;
  }

  const newCount = requests.filter((item) => item.status === 'new').length;
  const pendingCount = requests.filter((item) => item.status === 'pending').length;
  const completedCount = requests.filter((item) => item.status === 'completed').length;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Welcome, {profile.name.split(' ')[0]}</Text>
          <Text style={styles.subtitle}>Service Partner Command Center</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
        </View>
      </View>
      <View style={styles.onlineRow}>
        <Text style={styles.onlineLabel}>{profile.isOnline ? 'Online' : 'Offline'}</Text>
        <Pressable
          style={[styles.onlineButton, profile.isOnline ? styles.onlineActive : styles.onlineInactive]}
          onPress={() => toggleOnline(!profile.isOnline)}
        >
          <Text style={styles.onlineButtonText}>{profile.isOnline ? 'Go Offline' : 'Go Online'}</Text>
        </Pressable>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCardPrimary}>
          <Text style={styles.statValue}>₹{earnings.todayEarnings}</Text>
          <Text style={styles.statLabel}>Today's Earnings</Text>
        </View>
        <View style={styles.statCard}> 
          <Text style={styles.statValue}>{profile.rating.toFixed(1)} ★</Text>
          <Text style={styles.statLabel}>Top Rated Expert</Text>
        </View>
      </View>
      <View style={styles.bucketRow}>
        <Pressable style={styles.bucketCardOrange} onPress={() => navigation.navigate('Requests')}>
          <Text style={styles.bucketTitle}>0{newCount} New Requests</Text>
          <Text style={styles.bucketSubtitle}>Tap to accept new bookings</Text>
        </Pressable>
        <View style={styles.bucketColumn}>
          <Pressable style={styles.bucketCardWhite} onPress={() => navigation.navigate('Requests')}>
            <Text style={styles.bucketTitle}>{pendingCount} Pending</Text>
            <Text style={styles.bucketSubtitle}>Jobs accepted</Text>
          </Pressable>
          <Pressable style={styles.bucketCardGrey} onPress={() => navigation.navigate('Requests')}>
            <Text style={styles.bucketTitle}>{completedCount} Completed</Text>
            <Text style={styles.bucketSubtitle}>History of finished jobs</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.section}>Recent Activity</Text>
      {requests.slice(0, 3).map((item) => (
        <View key={item.id} style={styles.activityItem}>
          <View style={styles.activityIcon}> 
            <Ionicons name="construct-outline" size={18} color={colors.white} />
          </View>
          <View style={styles.activityText}>
            <Text style={styles.activityTitle}>{item.serviceName} @ {item.address.split(',')[0]}</Text>
            <Text style={[styles.activityStatus, item.status === 'completed' ? styles.completed : item.status === 'new' ? styles.pending : styles.inProgress]}>
              {item.status === 'new' ? 'New Request' : item.status === 'pending' ? 'Pending' : item.status === 'completed' ? 'Completed' : 'In Progress'}
            </Text>
          </View>
        </View>
      ))}
      <Text style={styles.section}>Wallet</Text>
      <View style={styles.walletCard}>
        <View>
          <Text style={styles.walletTitle}>Available Balance</Text>
          <Text style={styles.walletAmount}>₹{earnings.availableBalance}</Text>
        </View>
        <View style={styles.walletBadge}>
          <Text style={styles.walletBadgeText}>₹{earnings.pendingPayout} pending</Text>
        </View>
      </View>
      <Text style={styles.section}>Training & Safety</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Training Progress</Text>
        <Text style={styles.infoText}>{profile.trainingProgress}% completed</Text>
        <Text style={styles.infoText}>Verified: {profile.verificationStatus}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  content: { padding: spacing.lg, paddingTop: 24, paddingBottom: spacing.xl },
  header: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { maxWidth: '70%' },
  title: { color: colors.white, fontSize: 22, fontWeight: '800' },
  subtitle: { marginTop: 6, color: colors.orangeTint },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 22 },
  onlineRow: { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.white, borderRadius: radius.md },
  onlineLabel: { fontSize: 16, fontWeight: '700' },
  onlineButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md },
  onlineActive: { backgroundColor: colors.primary },
  onlineInactive: { backgroundColor: colors.greyLight },
  onlineButtonText: { color: colors.white, fontWeight: '700' },
  statsRow: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.md },
  statCardPrimary: { flex: 1.2, backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.md, elevation: 1 },
  statCard: { flex: 0.8, backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.md, elevation: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statLabel: { marginTop: 6, color: colors.grey },
  bucketRow: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.md },
  bucketCardOrange: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.lg },
  bucketColumn: { flex: 1, justifyContent: 'space-between' },
  bucketCardWhite: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.primary },
  bucketCardGrey: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  bucketTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  bucketSubtitle: { color: colors.orangeTint, marginTop: 6, fontSize: 13 },
  section: { marginTop: spacing.lg, fontSize: 16, fontWeight: '800' },
  activityItem: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  activityIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  activityText: { flex: 1 },
  activityTitle: { fontWeight: '700', color: colors.charcoal },
  activityStatus: { marginTop: 4, fontWeight: '700' },
  pending: { color: colors.primary },
  inProgress: { color: '#0066cc' },
  completed: { color: colors.success },
  walletCard: { marginTop: spacing.md, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletTitle: { fontSize: 14, color: colors.grey },
  walletAmount: { marginTop: 6, fontSize: 24, fontWeight: '800' },
  walletBadge: { backgroundColor: colors.greyLight, borderRadius: radius.md, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  walletBadgeText: { color: colors.charcoal, fontWeight: '700' },
  infoCard: { marginTop: spacing.md, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg },
  infoTitle: { fontWeight: '800', marginBottom: spacing.sm },
  infoText: { color: colors.grey, marginVertical: spacing.xs },
});
