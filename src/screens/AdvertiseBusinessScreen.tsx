import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KairoTextInput } from '../components/KairoTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { getDraft, saveDraft } from '../lib/adDrafts';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'AdvertiseBusiness'>;

const REQUIRED_RATIO = 16 / 9;
const RATIO_TOLERANCE = 0.08;
// Mirrors backend/src/controllers/bannerController.js MAX_IMAGE_DATA_URL_LENGTH — checked
// client-side too so an oversized clip is rejected before the payment screen, not after.
const MAX_MEDIA_DATA_URL_LENGTH = 8 * 1024 * 1024;

export function AdvertiseBusinessScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [bannerBase64, setBannerBase64] = useState<string | null>(null);
  const [bannerType, setBannerType] = useState<'image' | 'video' | null>(null);
  const [draftId, setDraftId] = useState<string | undefined>(route.params?.draftId);
  const [savingDraft, setSavingDraft] = useState(false);

  useEffect(() => {
    (async () => {
      const prefill = route.params?.draftId ? await getDraft(route.params.draftId) : route.params?.prefill;
      if (!prefill) return;
      setBusinessName(prefill.businessName ?? '');
      setBusinessAddress(prefill.businessAddress ?? '');
      setSocialLink(prefill.socialLink ?? '');
      setWhatsappNumber(prefill.whatsappNumber ?? '');
      setBannerUri(prefill.bannerUri ?? null);
      setBannerBase64(prefill.bannerBase64 ?? null);
      setBannerType(prefill.bannerType ?? null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickBanner = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to upload your cover banner.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.6,
      allowsEditing: true,
      aspect: [16, 9],
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    const isVideo = asset.type === 'video';

    if (asset.width && asset.height) {
      const ratio = asset.width / asset.height;
      if (Math.abs(ratio - REQUIRED_RATIO) > RATIO_TOLERANCE) {
        Alert.alert(
          'Wrong aspect ratio',
          `Your ${isVideo ? 'video' : 'image'} isn't close to the required 16:9 ratio. Please choose or crop a 16:9 file.`,
        );
        return;
      }
    }

    const dataUrl = asset.base64 ? `data:${asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg')};base64,${asset.base64}` : null;
    if (dataUrl && dataUrl.length > MAX_MEDIA_DATA_URL_LENGTH) {
      Alert.alert(
        'File too large',
        isVideo
          ? 'This clip is too large to upload. Please choose a shorter/lower-resolution video.'
          : 'This image is too large. Please choose a smaller photo.',
      );
      return;
    }

    setBannerUri(asset.uri);
    setBannerType(isVideo ? 'video' : 'image');
    setBannerBase64(dataUrl);
  };

  const currentDraftFields = () => ({
    businessName: businessName.trim(),
    businessAddress: businessAddress.trim(),
    socialLink: socialLink.trim() || undefined,
    whatsappNumber: whatsappNumber.trim() || undefined,
    bannerUri: bannerUri || undefined,
    bannerBase64: bannerBase64 || undefined,
    bannerType: bannerType || undefined,
  });

  const saveAsDraft = async () => {
    if (!businessName.trim() && !bannerUri) {
      Alert.alert('Nothing to save', 'Add at least a business name or banner before saving a draft.');
      return;
    }
    setSavingDraft(true);
    try {
      const saved = await saveDraft({ id: draftId, ...currentDraftFields() });
      setDraftId(saved.id);
      Alert.alert('Draft saved', 'Find it under My Ads > Drafts.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } finally {
      setSavingDraft(false);
    }
  };

  const submit = () => {
    if (!businessName.trim()) {
      Alert.alert('Required', 'Please enter your business name.');
      return;
    }
    if (!businessAddress.trim()) {
      Alert.alert('Required', 'Please enter your business address.');
      return;
    }
    if (!bannerUri) {
      Alert.alert('Required', 'Please upload a cover banner (image or video).');
      return;
    }
    navigation.navigate('AdvertisePlan', {
      businessName: businessName.trim(),
      businessAddress: businessAddress.trim(),
      bannerUri,
      bannerBase64: bannerBase64 || undefined,
      bannerType: bannerType || 'image',
      socialLink: socialLink.trim() || undefined,
      whatsappNumber: whatsappNumber.trim() || undefined,
      draftId,
    });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Advertising</Text>
        <Pressable onPress={() => navigation.navigate('MyAds')} hitSlop={12}>
          <Ionicons name="grid-outline" size={22} color={colors.white} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.sub}>Promote your business</Text>

        <KairoTextInput label="Business Name" value={businessName} onChangeText={setBusinessName} />
        <KairoTextInput
          label="Business Address"
          value={businessAddress}
          onChangeText={setBusinessAddress}
          multiline
        />

        <Text style={styles.label}>Cover Banner</Text>
        <Text style={styles.hint}>Upload an image or short video for your ad banner slot.</Text>
        <Text style={styles.ratioHint}>Required aspect ratio: 16:9</Text>
        <Pressable style={styles.bannerPicker} onPress={pickBanner}>
          {bannerUri ? (
            bannerType === 'video' ? (
              <View style={styles.bannerPlaceholder}>
                <Ionicons name="videocam" size={28} color={colors.primary} />
                <Text style={styles.bannerPlaceholderTxt}>Video selected</Text>
              </View>
            ) : (
              <Image source={{ uri: bannerUri }} style={styles.bannerPreview} resizeMode="cover" />
            )
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Ionicons name="cloud-upload-outline" size={28} color={colors.primary} />
              <Text style={styles.bannerPlaceholderTxt}>Tap to upload image or video</Text>
            </View>
          )}
        </Pressable>

        <KairoTextInput
          label="WhatsApp Number (optional)"
          value={whatsappNumber}
          onChangeText={setWhatsappNumber}
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
        />
        <KairoTextInput
          label="Social Media Links (optional)"
          value={socialLink}
          onChangeText={setSocialLink}
          placeholder="https://instagram.com/yourbusiness"
        />

        <PrimaryButton title="Submit" onPress={submit} style={styles.submitBtn} />
        <Pressable onPress={saveAsDraft} disabled={savingDraft} style={styles.draftBtn}>
          <Ionicons name="save-outline" size={18} color={colors.primary} />
          <Text style={styles.draftBtnTxt}>{savingDraft ? 'Saving…' : 'Save as Draft'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: { color: colors.white, fontWeight: '800', fontSize: 17 },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  sub: { color: colors.grey, marginBottom: spacing.lg, fontSize: 15, fontWeight: '600' },
  label: { fontWeight: '700', color: colors.charcoal, marginTop: spacing.md, marginBottom: spacing.sm },
  hint: { color: colors.grey, fontSize: 12, marginBottom: spacing.xs, lineHeight: 18 },
  ratioHint: { color: colors.primary, fontSize: 12, fontWeight: '700', marginBottom: spacing.sm },
  bannerPicker: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  bannerPreview: { width: '100%', height: 160 },
  bannerPlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greyLight,
  },
  bannerPlaceholderTxt: { color: colors.primary, fontWeight: '700', marginTop: spacing.xs },
  submitBtn: { marginTop: spacing.xs },
  draftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  draftBtnTxt: { color: colors.primary, fontWeight: '700' },
});
