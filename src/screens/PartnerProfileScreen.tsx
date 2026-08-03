import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePartner } from '../context/PartnerContext';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { partnerService } from '../services/partnerService';
import type { PartnerReferralSummary } from '../mock/types';
import type { RootStackParamList } from '../navigation/types';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export function PartnerProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProps>();
  const { userToken, logoutPartner } = useAuth();
  const { profile, updateProfile, isLoading } = usePartner();
  const [bio, setBio] = useState('Trusted expert for home electrical and repair services.');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [phoneDraft, setPhoneDraft] = useState('');
  const [referrals, setReferrals] = useState<PartnerReferralSummary | null>(null);
  const [referralsLoading, setReferralsLoading] = useState(true);

  useEffect(() => {
    partnerService
      .getReferralEarnings()
      .then(setReferrals)
      .catch(() => setReferrals(null))
      .finally(() => setReferralsLoading(false));
  }, []);

  if (isLoading || !profile) {
    return null;
  }

  const startEdit = () => {
    setNameDraft(profile.name);
    setPhoneDraft(profile.phone);
    setEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        name: nameDraft.trim() || profile.name,
        phone: phoneDraft.trim() || profile.phone,
        skills: profile.skills,
        categories: profile.categories,
      });
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutPartner();
    navigation.replace('UserLogin');
  };

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to update your profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    const asset = result.assets[0];
    const mime = asset.mimeType || 'image/jpeg';
    await updateProfile({ photoUrl: `data:${mime};base64,${asset.base64}` });
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
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]}
    >
      <View style={styles.appHeader}>
        <View style={styles.logoMark}>
          <Text style={styles.logoN}>K</Text>
        </View>
        <Text style={styles.brandName}>KAIRO</Text>
      </View>

      <View style={styles.profileCard}>
        <Pressable style={styles.profileImage} onPress={pickAvatar}>
          <Text style={styles.profileLetter}>{profile.name.charAt(0)}</Text>
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={14} color={colors.white} />
          </View>
        </Pressable>
        <View style={styles.profileInfo}>
          {editing ? (
            <>
              <TextInput style={styles.editInput} value={nameDraft} onChangeText={setNameDraft} placeholder="Name" placeholderTextColor={colors.orangeTint} />
              <TextInput
                style={styles.editInput}
                value={phoneDraft}
                onChangeText={setPhoneDraft}
                placeholder="Phone"
                placeholderTextColor={colors.orangeTint}
                keyboardType="phone-pad"
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </View>
      </View>

      {editing ? (
        <PrimaryButton title={loading ? 'Saving…' : 'Save'} onPress={handleSave} loading={loading} style={styles.editSaveBtn} />
      ) : (
        <Pressable style={styles.editProfileBtn} onPress={startEdit}>
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={styles.editProfileTxt}>Edit Profile</Text>
        </Pressable>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          style={styles.bioInput}
          multiline
          numberOfLines={2}
          placeholder="Write a short description of who you are and what you do"
          placeholderTextColor={colors.grey}
        />
      </View>

      <View style={styles.section}>
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
                  Alert.alert('Copied', 'Referral code copied to clipboard.');
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

      <Pressable style={styles.menuRow} onPress={() => (navigation as any).navigate('PartnerSettings')}>
        <Ionicons name="settings-outline" size={20} color={colors.primary} />
        <Text style={styles.menuTxt}>Settings</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.grey} />
      </Pressable>
      <Pressable style={styles.menuRow} onPress={() => navigation.navigate('Language')}>
        <Ionicons name="globe-outline" size={20} color={colors.primary} />
        <Text style={styles.menuTxt}>Languages</Text>
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
        <Ionicons name="trash-outline" size={20} color={colors.error} />
        <Text style={styles.deleteTxt}>Delete Account</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  appHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  logoMark: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoN: { fontSize: 17, fontWeight: '900', color: colors.white },
  brandName: { fontSize: 16, fontWeight: '900', color: colors.navy },
  profileCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  profileImage: { width: 104, height: 104, borderRadius: 52, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  profileLetter: { color: colors.primary, fontSize: 40, fontWeight: '800' },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.navy,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.sm,
    color: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
    fontWeight: '700',
  },
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
  sectionTitle: { fontSize: 14, color: colors.grey, fontWeight: '700', marginBottom: spacing.sm },
  sectionText: { fontSize: 15, color: colors.charcoal, marginBottom: spacing.xs },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  tagGrey: { backgroundColor: colors.greyLight, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  tagText: { color: colors.white, fontWeight: '700' },
  textArea: { borderRadius: radius.md, backgroundColor: colors.greyLight, minHeight: 120, padding: spacing.md, textAlignVertical: 'top' },
  bioInput: { borderRadius: radius.md, backgroundColor: colors.greyLight, minHeight: 52, padding: spacing.md, textAlignVertical: 'top', color: colors.charcoal },
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
  referralActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.sm },
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
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  deleteTxt: { color: colors.error, fontWeight: '800', fontSize: 16 },
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
  modalScroll: { marginBottom: spacing.md },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { color: colors.charcoal, fontWeight: '600' },
  chipOnTxt: { color: colors.white },
  modalActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  modalCancel: { padding: spacing.md },
  modalCancelTxt: { color: colors.grey, fontWeight: '700' },
});
