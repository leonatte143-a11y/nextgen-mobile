import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
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
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function AdvertiseBusinessScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [bannerBase64, setBannerBase64] = useState<string | null>(null);
  const [bannerType, setBannerType] = useState<'image' | 'video' | null>(null);

  const REQUIRED_RATIO = 16 / 9;
  const RATIO_TOLERANCE = 0.08;

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

    setBannerUri(asset.uri);
    setBannerType(isVideo ? 'video' : 'image');
    // Video assets are not base64-encoded here (impractically large over JSON) — the submission
    // step only sends an image data URI for now; video ad requests still need a real upload flow.
    setBannerBase64(!isVideo && asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : null);
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
    });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Advertising</Text>
        <View style={{ width: 24 }} />
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

        <PrimaryButton title="Submit" onPress={submit} />
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
});
