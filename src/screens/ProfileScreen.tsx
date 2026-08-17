import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLoader } from '../components/ScreenLoader';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { getSearchQueryCount } from '../lib/localStorage';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { t } from '../i18n/strings';
import type { RootStackParamList, MainTabScreenProps } from '../navigation/types';
import { userService } from '../services/userService';

const PHOTO_KEY = 'kairo_user_photo';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type MenuTarget =
  | 'Settings'
  | 'Rewards'
  | 'Conversations'
  | 'MyFavorites'
  | 'SavedAddresses'
  | 'AdvertiseBusiness';

export function ProfileScreen(_props: MainTabScreenProps<'Profile'>) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user, partnerToken, refreshProfile, logoutUser, language } = useAuth();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  type MenuItem = {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    target?: MenuTarget;
    comingSoon?: boolean;
    highlight?: boolean;
    onPress?: () => void;
  };

  const MENU_TOP: MenuItem[] = [
    { label: 'My Favorites', icon: 'heart-outline', target: 'MyFavorites' },
    { label: 'Advertise your business', icon: 'megaphone-outline', target: 'AdvertiseBusiness', highlight: true },
    { label: t(language, 'settings'), icon: 'settings-outline', target: 'Settings' },
    { label: t(language, 'rewards'), icon: 'gift-outline', target: 'Rewards' },
  ];
  const MENU_BOTTOM: MenuItem[] = [
    { label: t(language, 'helpSupport'), icon: 'help-circle-outline', target: 'Conversations' },
    { label: 'Saved Addresses', icon: 'location-outline', target: 'SavedAddresses' },
  ];
  const [bookingsCount, setBookingsCount] = useState(0);
  const [queriesCount, setQueriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [accountModalVisible, setAccountModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(PHOTO_KEY).then((v) => {
        setPhotoUri(v ?? null);
      });
    }, []),
  );

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
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.h1}>My Profile</Text>
          <Text style={styles.sub}>Manage your account</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Conversations', { role: 'user' })} hitSlop={12}>
          <Ionicons name="help-circle-outline" size={26} color={colors.white} />
        </Pressable>
      </View>
      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avText}>{initials}</Text>
            )}
          </View>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.email}>{user.phone}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.grey} />
            <Text style={styles.locationTxt}>Danavaipeta, Rajahmundry</Text>
          </View>
          <View style={styles.cardActions}>
            <Pressable style={styles.pairBtn} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={styles.pairBtnTxt}>{t(language, 'editProfile')}</Text>
            </Pressable>
            <Pressable
              style={styles.pairBtn}
              onPress={() => navigation.navigate('Support')}
            >
              <Ionicons name="chatbubbles-outline" size={16} color={colors.primary} />
              <Text style={styles.pairBtnTxt}>Support</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <Pressable
        style={styles.switchBtn}
        onPress={() => {
          if (partnerToken) {
            navigation.replace('PartnerHome');
          } else {
            navigation.navigate('PartnerLogin');
          }
        }}
      >
        <Ionicons name="swap-horizontal-outline" size={18} color={colors.white} />
        <Text style={styles.switchBtnTxt}>
          {partnerToken ? 'Switch to Partner Mode' : 'Become a Service Partner'}
        </Text>
      </Pressable>
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
        {MENU_TOP.map((m) => (
          <Pressable
            key={m.label}
            style={[styles.menuRow, m.highlight && styles.menuRowHighlight, m.comingSoon && styles.menuRowDisabled]}
            onPress={
              m.comingSoon
                ? undefined
                : m.onPress ?? (() => m.target && navigation.navigate(m.target))
            }
          >
            <Ionicons name={m.icon} size={22} color={colors.primary} />
            <Text style={styles.menuTxt}>{m.label}</Text>
            {m.comingSoon ? (
              <View style={styles.comingSoonPill}>
                <Text style={styles.comingSoonTxt}>Coming Soon</Text>
              </View>
            ) : null}
            <Ionicons name="chevron-forward" size={20} color={colors.grey} />
          </Pressable>
        ))}
        <Pressable style={styles.menuRow} onPress={() => navigation.navigate('Rewards')}>
          <Ionicons name="share-social-outline" size={22} color={colors.primary} />
          <Text style={styles.menuTxt}>Refer & Earn</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.grey} />
        </Pressable>
        {MENU_BOTTOM.map((m) => (
          <Pressable
            key={m.label}
            style={[styles.menuRow, m.highlight && styles.menuRowHighlight, m.comingSoon && styles.menuRowDisabled]}
            onPress={
              m.comingSoon
                ? undefined
                : m.onPress ?? (() => m.target && navigation.navigate(m.target))
            }
          >
            <Ionicons name={m.icon} size={22} color={colors.primary} />
            <Text style={styles.menuTxt}>{m.label}</Text>
            {m.comingSoon ? (
              <View style={styles.comingSoonPill}>
                <Text style={styles.comingSoonTxt}>Coming Soon</Text>
              </View>
            ) : null}
            <Ionicons name="chevron-forward" size={20} color={colors.grey} />
          </Pressable>
        ))}
        <Pressable style={styles.deleteBtn} onPress={() => setAccountModalVisible(true)}>
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <Text style={styles.deleteTxt}>Delete Account</Text>
        </Pressable>
        <PrimaryButton
          title="Logout"
          variant="outline"
          style={styles.logoutButton}
          onPress={async () => {
            await logoutUser();
            navigation.reset({ index: 0, routes: [{ name: 'UserLogin' }] });
          }}
        />
      </View>
      <Modal
        visible={accountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Account Options</Text>
            <Pressable
              style={styles.modalOption}
              onPress={async () => {
                setAccountModalVisible(false);
                try {
                  const result = await userService.toggleFreeze();
                  Alert.alert(
                    result.isFrozen ? 'Account frozen' : 'Account unfrozen',
                    result.isFrozen
                      ? 'Your account is now frozen. You can unfreeze anytime by logging back in and selecting this option again.'
                      : 'Your account has been unfrozen.',
                  );
                } catch (e) {
                  Alert.alert('Error', e instanceof Error ? e.message : 'Could not update account status');
                }
              }}
            >
              <Ionicons name="snow-outline" size={18} color={colors.primary} />
              <Text style={styles.modalOptionTxt}>Freeze/Unfreeze Account</Text>
            </Pressable>
            <Pressable
              style={styles.modalOption}
              onPress={() => {
                setAccountModalVisible(false);
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
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[styles.modalOptionTxt, { color: colors.error }]}>Delete Account Permanently</Text>
            </Pressable>
            <Pressable style={styles.modalCancel} onPress={() => setAccountModalVisible(false)}>
              <Text style={styles.modalCancelTxt}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    paddingBottom: spacing.xl,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
  },
  h1: { fontSize: 26, fontWeight: '800', color: colors.white },
  sub: { color: colors.orangeTint, marginTop: 4 },
  cardWrap: { marginTop: -20, paddingHorizontal: spacing.md },
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
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avText: { fontSize: 34, fontWeight: '800', color: colors.primary },
  name: { fontSize: 20, fontWeight: '800', color: colors.charcoal, textAlign: 'center' },
  email: { fontSize: 14, color: colors.grey, marginTop: 4, textAlign: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationTxt: { fontSize: 13, color: colors.grey },
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
  cardActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, alignSelf: 'stretch' },
  pairBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.orangeTint,
  },
  pairBtnTxt: { fontWeight: '700', color: colors.primary, fontSize: 13 },
  proBtn: { marginTop: spacing.sm, padding: spacing.sm },
  proTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  switchBtnTxt: { color: colors.white, fontWeight: '800' },
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
    marginTop: spacing.lg,
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
  menuRowDisabled: { opacity: 0.55 },
  menuRowHighlight: { backgroundColor: colors.orangeTint },
  comingSoonPill: {
    backgroundColor: colors.greyLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  comingSoonTxt: { fontSize: 10, fontWeight: '700', color: colors.grey },
  logoutButton: { marginTop: spacing.md, borderColor: colors.error },
  deleteTxt: { color: colors.error, fontWeight: '700', fontSize: 13 },
  errTitle: { fontSize: 22, fontWeight: '800', color: colors.charcoal },
  errSub: { color: colors.grey, marginTop: spacing.sm, marginBottom: spacing.lg },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.charcoal, marginBottom: spacing.md },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionTxt: { fontWeight: '700', color: colors.charcoal, fontSize: 15 },
  modalCancel: { marginTop: spacing.md, alignItems: 'center', padding: spacing.sm },
  modalCancelTxt: { color: colors.grey, fontWeight: '700' },
});
