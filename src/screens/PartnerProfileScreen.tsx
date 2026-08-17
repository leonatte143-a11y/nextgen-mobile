import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePartner } from '../context/PartnerContext';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { partnerService } from '../services/partnerService';
import type { PublicCategory } from '../services/partnerService';
import type { PartnerReferralSummary } from '../mock/types';
import type { RootStackParamList } from '../navigation/types';
import { MAIN_CATEGORIES } from '../data/serviceCatalog';

/** Legacy parent/bucket-level labels that should never appear as selectable partner
 * categories — they're grouping labels, not real services (also covers the health-category
 * rename: Lab Technician/RMP doctors are replaced by Diagnostics/Hospitals & Clinics). */
const EXCLUDED_CATEGORY_LABELS = new Set(
  ['Lab Technician', 'RMP doctors', 'Home Repair', 'Home Service', 'Life & Health', 'Professional & Education'].map(
    (s) => s.toLowerCase(),
  ),
);
const EXTRA_CATEGORY_LABELS = ['Diagnostics', 'Hospitals / Clinics'];

const STATIC_PARTNER_CATEGORIES = Array.from(
  new Set(MAIN_CATEGORIES.flatMap((category) => category.subServices.map((service) => service.title))),
).filter((name) => !/^other/i.test(name.trim()) && !EXCLUDED_CATEGORY_LABELS.has(name.toLowerCase()));

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export function PartnerProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProps>();
  const { userToken, logoutPartner } = useAuth();
  const { profile, updateProfile, isLoading } = usePartner();
  const [description, setDescription] = useState('');
  const [descEditing, setDescEditing] = useState(false);
  const [descSaving, setDescSaving] = useState(false);
  const [referrals, setReferrals] = useState<PartnerReferralSummary | null>(null);
  const [referralsLoading, setReferralsLoading] = useState(true);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [extraCategories, setExtraCategories] = useState<PublicCategory[]>([]);
  const [newCategorySelections, setNewCategorySelections] = useState<string[]>([]);
  const [savingCategories, setSavingCategories] = useState(false);
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
    partnerService
      .getCategories()
      .then(setExtraCategories)
      .catch(() => setExtraCategories([]));
  }, []);

  useEffect(() => {
    if (profile) {
      setDescription(profile.description ?? '');
    }
  }, [profile]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const allCategoryOptions = React.useMemo(() => {
    const seen = new Set(STATIC_PARTNER_CATEGORIES.map((s) => s.toLowerCase()));
    const merged = [...STATIC_PARTNER_CATEGORIES];
    for (const cat of extraCategories) {
      const name = cat.nameEn;
      if (!name) continue;
      const key = name.toLowerCase();
      if (key === 'other' || key === 'others' || /^other/i.test(key) || EXCLUDED_CATEGORY_LABELS.has(key)) continue;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(name);
      }
    }
    for (const name of EXTRA_CATEGORY_LABELS) {
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(name);
      }
    }
    return merged.sort((a, b) => a.localeCompare(b));
  }, [extraCategories]);

  const filteredCategoryOptions = React.useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return allCategoryOptions;
    return allCategoryOptions.filter((option) => option.toLowerCase().includes(q));
  }, [allCategoryOptions, categorySearch]);

  if (isLoading || !profile) {
    return null;
  }

  const cancelDescEdit = () => {
    setDescription(profile.description ?? '');
    setDescEditing(false);
  };

  const saveDescription = async () => {
    setDescSaving(true);
    try {
      await updateProfile({ description: description.trim() });
      setDescEditing(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not save description.';
      Alert.alert('Update failed', msg);
    } finally {
      setDescSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutPartner();
    navigation.replace('UserLogin');
  };

  const shareReferralCode = async (code: string) => {
    try {
      await Share.share({
        message: `Join KAIRO as a service partner using my referral code ${code} and we both get rewarded!`,
      });
    } catch {
      // ignore share cancellation
    }
  };

  const openCategoriesModal = () => {
    setNewCategorySelections([]);
    setCategorySearch('');
    setCategoriesModalOpen(true);
  };

  const closeCategoriesModal = () => {
    setNewCategorySelections([]);
    setCategoriesModalOpen(false);
  };

  const toggleNewCategory = (option: string) => {
    setNewCategorySelections((prev) =>
      prev.includes(option) ? prev.filter((c) => c !== option) : [...prev, option],
    );
  };

  const saveCategories = async () => {
    if (newCategorySelections.length === 0) {
      closeCategoriesModal();
      return;
    }
    setSavingCategories(true);
    try {
      const merged = Array.from(new Set([...profile.categories, ...newCategorySelections]));
      await updateProfile({ categories: merged });
      closeCategoriesModal();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not update categories.';
      Alert.alert('Update failed', msg);
    } finally {
      setSavingCategories(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This will permanently deactivate your partner account. Contact support to restore access.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await partnerService.deleteAccount();
              await logoutPartner();
              navigation.reset({ index: 0, routes: [{ name: 'UserLogin' }] });
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Could not delete account');
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]}
    >
      <View style={styles.profileTitleRow}>
        <Text style={styles.profileTitle}>My Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileImage}>
          {profile.photoUrl ? (
            <Image source={{ uri: profile.photoUrl }} style={styles.profileImagePhoto} />
          ) : (
            <Text style={styles.profileLetter}>{profile.name.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            {profile.verificationStatus === 'Verified' ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color={colors.white} />
              </View>
            ) : null}
            <Text style={styles.profileName}>{profile.name}</Text>
          </View>
          <Text style={styles.profileSub}>{profile.phone}</Text>
          <Text style={styles.profileSub}>{profile.verificationStatus}</Text>
        </View>
      </View>

      <Pressable style={styles.editProfileBtn} onPress={() => (navigation as any).navigate('PartnerEditProfile')}>
        <Ionicons name="create-outline" size={18} color={colors.primary} />
        <Text style={styles.editProfileTxt}>Edit Profile</Text>
      </Pressable>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Description</Text>
          {!descEditing ? (
            <Pressable onPress={() => setDescEditing(true)} hitSlop={8}>
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.bioInput, !descEditing && styles.bioInputReadonly]}
          multiline
          numberOfLines={3}
          placeholder="Write a short description of who you are and what you do"
          placeholderTextColor={colors.grey}
          editable={descEditing}
        />
        {descEditing ? (
          <View style={styles.editActionsRow}>
            <PrimaryButton
              title={descSaving ? 'Saving…' : 'Save'}
              onPress={saveDescription}
              loading={descSaving}
              style={[styles.editSaveBtn, styles.editActionBtn]}
            />
            <PrimaryButton
              title="Cancel"
              variant="outline"
              onPress={cancelDescEdit}
              disabled={descSaving}
              style={[styles.editSaveBtn, styles.editActionBtn]}
            />
          </View>
        ) : null}
      </View>

      <Pressable style={styles.menuRow} onPress={() => (navigation as any).navigate('PartnerServicePricing')}>
        <Ionicons name="list-outline" size={20} color={colors.primary} />
        <Text style={styles.menuTxt}>Service Menu</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.grey} />
      </Pressable>

      <View style={[styles.section, styles.referralSection]}>
        <Text style={styles.sectionTitle}>Referral Earnings</Text>
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

      <View style={styles.categoriesSection}>
        <Text style={styles.categoriesTitle}>Manage Categories</Text>
        <View style={styles.tagsRow}>
          {profile.categories.length > 0 ? (
            profile.categories.map((cat) => (
              <View key={cat} style={styles.tag}>
                <Text style={styles.tagText}>{cat}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.sectionText}>No categories added yet.</Text>
          )}
        </View>
        <Pressable style={styles.addCategoriesBtn} onPress={openCategoriesModal}>
          <Ionicons name="add-circle-outline" size={18} color={colors.white} />
          <Text style={styles.addCategoriesTxt}>Add Categories</Text>
        </Pressable>
      </View>

      <Pressable style={styles.menuRow} onPress={() => (navigation as any).navigate('PartnerSettings')}>
        <Ionicons name="settings-outline" size={20} color={colors.primary} />
        <Text style={styles.menuTxt}>Settings</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.grey} />
      </Pressable>
      <Pressable
        style={styles.switchModeBtn}
        onPress={() => {
          if (userToken) {
            navigation.replace('MainTabs');
          } else {
            navigation.navigate('UserLogin');
          }
        }}
      >
        <Ionicons name="swap-horizontal-outline" size={18} color={colors.white} />
        <Text style={styles.switchModeTxt}>{userToken ? 'Switch to User Mode' : 'Sign in as User'}</Text>
      </Pressable>

      <PrimaryButton title="Logout" variant="outline" onPress={handleLogout} style={styles.logoutButton} />

      <Pressable style={styles.deleteBtn} onPress={confirmDeleteAccount}>
        <Ionicons name="trash-outline" size={15} color={colors.error} />
        <Text style={styles.deleteTxt}>Delete Account</Text>
      </Pressable>

      <Modal visible={categoriesModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add service categories</Text>
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={18} color={colors.grey} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search categories..."
                placeholderTextColor={colors.grey}
                value={categorySearch}
                onChangeText={setCategorySearch}
              />
            </View>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.categoryColumn}>
                {filteredCategoryOptions
                  .filter((option) => !profile.categories.includes(option))
                  .map((option) => {
                    const selected = newCategorySelections.includes(option);
                    return (
                      <Pressable
                        key={option}
                        style={[styles.categoryRow, selected && styles.categoryRowOn]}
                        onPress={() => toggleNewCategory(option)}
                      >
                        <Text style={[styles.categoryRowTxt, selected && styles.categoryRowTxtOn]}>{option}</Text>
                        {selected ? <Ionicons name="checkmark" size={18} color={colors.white} /> : null}
                      </Pressable>
                    );
                  })}
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <PrimaryButton
                title={savingCategories ? 'Saving…' : 'Done'}
                onPress={saveCategories}
                loading={savingCategories}
                style={{ flex: 1 }}
              />
              <Pressable style={styles.modalCancel} onPress={closeCategoriesModal} disabled={savingCategories}>
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    {showCopiedToast ? (
      <View style={styles.copiedToast} pointerEvents="none">
        <Text style={styles.copiedToastTxt}>Copied</Text>
      </View>
    ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.greyLight },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  profileTitleRow: { alignItems: 'center', marginBottom: spacing.md },
  profileTitle: { fontSize: 20, fontWeight: '800', color: colors.navy },
  profileCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  profileImage: { width: 104, height: 104, borderRadius: 52, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  profileImagePhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  profileLetter: { color: colors.primary, fontSize: 40, fontWeight: '800' },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { color: colors.white, fontSize: 20, fontWeight: '800' },
  profileSub: { color: colors.orangeTint, marginTop: spacing.xs },
  editActionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  editActionBtn: { flex: 1, marginTop: 0 },
  editSaveBtn: { marginTop: spacing.md },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  editProfileTxt: { color: colors.primary, fontWeight: '800' },
  section: { marginTop: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 14, color: colors.grey, fontWeight: '700', marginBottom: spacing.sm },
  sectionText: { fontSize: 15, color: colors.charcoal, marginBottom: spacing.xs },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  tagText: { color: colors.white, fontWeight: '700' },
  bioInput: { borderRadius: radius.md, backgroundColor: colors.greyLight, minHeight: 64, padding: spacing.md, textAlignVertical: 'top', color: colors.charcoal },
  bioInputReadonly: { opacity: 0.85 },
  referralSection: { padding: spacing.md },
  categoriesSection: {
    marginTop: spacing.lg,
    backgroundColor: colors.orangeTint,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  categoriesTitle: { fontSize: 15, color: colors.navy, fontWeight: '800', marginBottom: spacing.sm },
  addCategoriesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  addCategoriesTxt: { color: colors.white, fontWeight: '800' },
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  menuTxt: { flex: 1, fontWeight: '600', color: colors.charcoal },
  logoutButton: { marginTop: spacing.lg, borderWidth: 1, borderColor: colors.primary },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  deleteTxt: { color: colors.error, fontWeight: '700', fontSize: 13, opacity: 0.85 },
  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  switchModeTxt: { color: colors.white, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.lg },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: spacing.md },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: spacing.sm, color: colors.charcoal, fontSize: 14 },
  modalScroll: { marginBottom: spacing.md },
  categoryColumn: { gap: spacing.xs },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  categoryRowOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryRowTxt: { color: colors.charcoal, fontWeight: '600' },
  categoryRowTxtOn: { color: colors.white },
  modalActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  modalCancel: { padding: spacing.md },
  modalCancelTxt: { color: colors.grey, fontWeight: '700' },
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
