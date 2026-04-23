import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import type { MainTabScreenProps } from '../navigation/types';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type MenuTarget =
  | 'EditProfile'
  | 'MyFavorites'
  | 'Settings'
  | 'Rewards'
  | 'Referrals'
  | 'Terms'
  | 'Privacy'
  | 'Language';

const MENU: { label: string; icon: keyof typeof Ionicons.glyphMap; target: MenuTarget }[] = [
  { label: 'Edit profile', icon: 'person-outline', target: 'EditProfile' },
  { label: 'My Favorites', icon: 'heart-outline', target: 'MyFavorites' },
  { label: 'Settings', icon: 'settings-outline', target: 'Settings' },
  { label: 'Rewards', icon: 'gift-outline', target: 'Rewards' },
  { label: 'Referrals', icon: 'people-outline', target: 'Referrals' },
  { label: 'Terms & Conditions', icon: 'document-text-outline', target: 'Terms' },
  { label: 'Privacy Policy', icon: 'shield-outline', target: 'Privacy' },
  { label: 'Language', icon: 'globe-outline', target: 'Language' },
];

export function ProfileScreen(_props: MainTabScreenProps<'Profile'>) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user, refreshProfile, logoutUser } = useAuth();
  const [bookingsCount, setBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    await refreshProfile();
    const all = await bookingService.getBookings();
    setBookingsCount(all.filter((b) => b.status === 'completed').length);
    setLoading(false);
  }, [refreshProfile]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !user) {
    return <ScreenLoader />;
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'N';

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.backSpacer} />
        <View>
          <Text style={styles.h1}>My Profile</Text>
          <Text style={styles.sub}>Manage your account</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avText}>{initials}</Text>
          </View>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.email}>{user.email}</Text>
          <Pressable style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editTxt}>Edit Profile</Text>
          </Pressable>
          <Pressable style={styles.proBtn}>
            <Text style={styles.proTxt}>Join NEXGEN PRO — ₹18/mo</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{bookingsCount}</Text>
          <Text style={styles.statLab}>Bookings</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>—</Text>
          <Text style={styles.statLab}>Queries</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{user.rewardPoints}</Text>
          <Text style={styles.statLab}>Points</Text>
        </View>
      </View>
      <View style={styles.menu}>
        {MENU.map((m) => (
          <Pressable key={m.label} style={styles.menuRow} onPress={() => navigation.navigate(m.target)}>
            <Ionicons name={m.icon} size={22} color={colors.primary} />
            <Text style={styles.menuTxt}>{m.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.grey} />
          </Pressable>
        ))}
        <Pressable
          style={styles.logout}
          onPress={async () => {
            await logoutUser();
            navigation.reset({ index: 0, routes: [{ name: 'UserLogin' }] });
          }}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.logoutTxt}>Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 24,
  },
  backSpacer: { height: 0 },
  h1: { fontSize: 26, fontWeight: '800', color: colors.white },
  sub: { color: colors.orangeTint, marginTop: 4 },
  cardWrap: { marginTop: -32, paddingHorizontal: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avText: { fontSize: 24, fontWeight: '800', color: colors.primary },
  name: { fontSize: 20, fontWeight: '800', color: colors.charcoal },
  email: { fontSize: 14, color: colors.grey, marginTop: 4 },
  editBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  editTxt: { fontWeight: '700', color: colors.charcoal },
  proBtn: { marginTop: spacing.sm, padding: spacing.sm },
  proTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  stats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNum: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statLab: { fontSize: 12, color: colors.grey, marginTop: 4 },
  menu: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  menuTxt: { flex: 1, fontWeight: '600', color: colors.charcoal },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  logoutTxt: { color: colors.error, fontWeight: '800', fontSize: 16 },
});
