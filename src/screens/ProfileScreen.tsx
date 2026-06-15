import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { getSearchQueryCount } from '../lib/localStorage';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import type { RootStackParamList, RootStackScreenProps } from '../navigation/types';
import { userService } from '../services/userService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type MenuTarget =
  | 'EditProfile'
  | 'MyFavorites'
  | 'Settings'
  | 'Rewards'
  | 'Referrals'
  | 'Language'
  | 'SavedAddresses'
  | 'Support';

const MENU: { label: string; icon: keyof typeof Ionicons.glyphMap; target: MenuTarget }[] = [
  { label: 'Edit profile', icon: 'person-outline', target: 'EditProfile' },
  { label: 'Saved Addresses', icon: 'location-outline', target: 'SavedAddresses' },
  { label: 'My Favorites', icon: 'heart-outline', target: 'MyFavorites' },
  { label: 'Settings', icon: 'settings-outline', target: 'Settings' },
  { label: 'Rewards', icon: 'gift-outline', target: 'Rewards' },
  { label: 'Referrals', icon: 'people-outline', target: 'Referrals' },
  { label: 'Help & Support', icon: 'help-circle-outline', target: 'Support' },
  { label: 'Language', icon: 'globe-outline', target: 'Language' },
];

export function ProfileScreen(_props: RootStackScreenProps<'Profile'>) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user, refreshProfile, logoutUser } = useAuth();
  const [bookingsCount, setBookingsCount] = useState(0);
  const [queriesCount, setQueriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setProfileError(null);
    const pr = await refreshProfile();
    if (!pr.ok) {
      setProfileError(pr.message);
    }
    try {
      const all = await bookingService.getBookings();
      setBookingsCount(all.filter((b) => b.status === 'completed').length);
    } catch {
      setBookingsCount(0);
    }
    setLoading(false);
  }, [refreshProfile]);

  useEffect(() => {
    load();
    void (async () => {
      const count = await getSearchQueryCount();
      setQueriesCount(count);
    })();
  }, [load]);

  if (loading) {
    return <ScreenLoader />;
  }

  if (!user) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={{ padding: spacing.lg, paddingTop: 48 }}>
        <Text style={styles.errTitle}>Profile unavailable</Text>
        <Text style={styles.errSub}>
          {profileError ?? 'We could not load your account. Check your connection and try again.'}
        </Text>
        <Pressable style={styles.editBtn} onPress={() => load()}>
          <Text style={styles.editTxt}>Retry</Text>
        </Pressable>
        <Pressable
          style={[styles.editBtn, { marginTop: spacing.sm }]}
          onPress={async () => {
            await logoutUser();
            navigation.reset({ index: 0, routes: [{ name: 'UserLogin' }] });
          }}
        >
          <Text style={styles.editTxt}>Sign out</Text>
        </Pressable>
      </ScrollView>
    );
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'N';

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.h1}>My Profile</Text>
          <Text style={styles.sub}>Manage your account</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Support')} hitSlop={12}>
          <Ionicons name="help-circle-outline" size={26} color={colors.white} />
        </Pressable>
      </View>
      <View style={styles.tabRow}>
        {[
          { label: 'Profile', target: 'Profile' as const },
          { label: 'Settings', target: 'Settings' as const },
          { label: 'Rewards', target: 'Rewards' as const },
          { label: 'Referrals', target: 'Referrals' as const },
        ].map((tab) => (
          <Pressable
            key={tab.label}
            style={[styles.tabItem, tab.target === 'Profile' ? styles.tabActive : null]}
            onPress={() => {
              if (tab.target !== 'Profile') navigation.navigate(tab.target);
            }}
          >
            <Text style={[styles.tabLabel, tab.target === 'Profile' ? styles.tabActiveLabel : null]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
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
          <Text style={styles.statNum}>{queriesCount}</Text>
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
          style={styles.deleteBtn}
          onPress={() => {
            Alert.alert(
              'Delete account?',
              'Your account will be deactivated. Contact support to restore access.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await userService.deleteAccount();
                      await logoutUser();
                      navigation.reset({ index: 0, routes: [{ name: 'UserLogin' }] });
                    } catch (e) {
                      Alert.alert('Error', e instanceof Error ? e.message : 'Could not delete account');
                    }
                  },
                },
              ],
            );
          }}
        >
          <Ionicons name="trash-outline" size={22} color={colors.error} />
          <Text style={styles.logoutTxt}>Delete Account</Text>
        </Pressable>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 24,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
  },
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
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: -16,
    marginBottom: spacing.sm,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabLabel: {
    fontWeight: '700',
    color: colors.charcoal,
  },
  tabActive: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  tabActiveLabel: {
    color: colors.primary,
  },
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
  errTitle: { fontSize: 22, fontWeight: '800', color: colors.charcoal },
  errSub: { color: colors.grey, marginTop: spacing.sm, marginBottom: spacing.lg },
});
