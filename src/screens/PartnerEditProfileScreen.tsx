import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePartner } from '../context/PartnerContext';
import { colors, radius, spacing } from '../constants/theme';
import { ImageCropModal } from '../components/ImageCropModal';
import { PrimaryButton } from '../components/PrimaryButton';
import type { PartnerStackParamList } from '../navigation/PartnerStackTypes';

type NavigationProps = NativeStackNavigationProp<PartnerStackParamList>;

export function PartnerEditProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProps>();
  const { profile, updateProfile, isLoading } = usePartner();
  const [nameDraft, setNameDraft] = useState(profile?.name ?? '');
  const [loading, setLoading] = useState(false);
  const [cropVisible, setCropVisible] = useState(false);
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);

  if (isLoading || !profile) {
    return null;
  }

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to update your profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setPendingAvatarUri(result.assets[0].uri);
    setCropVisible(true);
  };

  const handleAvatarCropSave = async (finalUri: string) => {
    setCropVisible(false);
    setPendingAvatarUri(null);
    try {
      const base64 = await new FileSystem.File(finalUri).base64();
      await updateProfile({ photoUrl: `data:image/jpeg;base64,${base64}` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not update profile photo.';
      Alert.alert('Update failed', msg);
    }
  };

  const handleAvatarCropCancel = () => {
    setCropVisible(false);
    setPendingAvatarUri(null);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ name: nameDraft.trim() || profile.name });
      navigation.goBack();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not save profile.';
      Alert.alert('Update failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Pressable style={styles.avatar} onPress={pickAvatar}>
          {profile.photoUrl ? (
            <Image source={{ uri: profile.photoUrl }} style={styles.avatarPhoto} />
          ) : (
            <Text style={styles.avatarLetter}>{profile.name.charAt(0)}</Text>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={14} color={colors.white} />
          </View>
        </Pressable>
        <Text style={styles.avatarHint}>Tap the photo to change it</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={nameDraft}
          onChangeText={setNameDraft}
          placeholder="Your name"
          placeholderTextColor={colors.grey}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={profile.phone}
          editable={false}
        />

        <PrimaryButton title={loading ? 'Saving…' : 'Save'} onPress={handleSave} loading={loading} style={styles.saveBtn} />
      </ScrollView>

      <ImageCropModal
        visible={cropVisible}
        imageUri={pendingAvatarUri}
        onSave={(finalUri) => void handleAvatarCropSave(finalUri)}
        onCancel={handleAvatarCropCancel}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.charcoal },
  content: { padding: spacing.lg, alignItems: 'center' },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarLetter: { color: colors.primary, fontSize: 40, fontWeight: '800' },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.navy,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: { color: colors.grey, fontSize: 12, marginTop: spacing.sm, marginBottom: spacing.lg },
  label: { alignSelf: 'flex-start', fontSize: 13, color: colors.grey, fontWeight: '700', marginBottom: spacing.sm },
  input: {
    width: '100%',
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
    padding: spacing.md,
    color: colors.charcoal,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  inputDisabled: { opacity: 0.6 },
  saveBtn: { width: '100%', marginTop: spacing.md },
});
