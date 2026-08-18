import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import React, { useState } from 'react';
import { ActionSheetIOS, Alert, FlatList, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import { usePartner } from '../context/PartnerContext';
import { ImageCropModal } from '../components/ImageCropModal';

const COLUMN_GAP = spacing.sm;

export function PartnerGalleryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { profile, updateProfile } = usePartner();
  const [saving, setSaving] = useState(false);
  const [cropVisible, setCropVisible] = useState(false);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const photos = profile?.photos ?? [];

  const pickFrom = async (source: 'camera' | 'gallery') => {
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Allow camera access to take a photo.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (result.canceled || !result.assets?.[0]?.uri) return;
        setPendingUri(result.assets[0].uri);
        setCropVisible(true);
        return;
      }
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo library access to add photos to your gallery.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      setPendingUri(result.assets[0].uri);
      setCropVisible(true);
    } catch (e: unknown) {
      Alert.alert('Could not open camera/gallery', e instanceof Error ? e.message : 'Please try again.');
    }
  };

  const addPhoto = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Camera', 'Gallery'], cancelButtonIndex: 0 },
        (index) => {
          if (index === 1) void pickFrom('camera');
          if (index === 2) void pickFrom('gallery');
        },
      );
      return;
    }
    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Camera', onPress: () => void pickFrom('camera') },
      { text: 'Gallery', onPress: () => void pickFrom('gallery') },
    ]);
  };

  const handleCropSave = async (finalUri: string) => {
    setCropVisible(false);
    setPendingUri(null);
    setSaving(true);
    try {
      const base64 = await new FileSystem.File(finalUri).base64();
      const uri = `data:image/jpeg;base64,${base64}`;
      await updateProfile({ photos: [...photos, uri] });
    } catch (e: unknown) {
      Alert.alert('Update failed', e instanceof Error ? e.message : 'Could not add photo.');
    } finally {
      setSaving(false);
    }
  };

  const handleCropCancel = () => {
    setCropVisible(false);
    setPendingUri(null);
  };

  const removePhoto = async (uri: string) => {
    setSaving(true);
    try {
      await updateProfile({ photos: photos.filter((p) => p !== uri) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Gallery</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.hint}>Photos here appear on your public profile grid that users see.</Text>

      <FlatList
        data={photos}
        keyExtractor={(uri, i) => `${uri.slice(0, 24)}-${i}`}
        numColumns={3}
        columnWrapperStyle={{ gap: COLUMN_GAP }}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={<Text style={styles.empty}>No photos yet. Add your first one below.</Text>}
        renderItem={({ item }) => (
          <View style={styles.photoWrap}>
            <Image source={{ uri: item }} style={styles.photo} />
            <Pressable style={styles.removeBtn} onPress={() => removePhoto(item)} disabled={saving}>
              <Ionicons name="close" size={14} color={colors.white} />
            </Pressable>
          </View>
        )}
      />

      <Pressable style={styles.addBtn} onPress={addPhoto} disabled={saving}>
        <Ionicons name="add" size={22} color={colors.white} />
        <Text style={styles.addBtnTxt}>{saving ? 'Saving…' : 'Add Photo'}</Text>
      </Pressable>

      <ImageCropModal
        visible={cropVisible}
        imageUri={pendingUri}
        onSave={(finalUri) => void handleCropSave(finalUri)}
        onCancel={handleCropCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.charcoal },
  hint: { color: colors.grey, fontSize: 12, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  grid: { padding: spacing.md, flexGrow: 1 },
  empty: { textAlign: 'center', color: colors.grey, marginTop: spacing.xl },
  photoWrap: { flex: 1 / 3, aspectRatio: 1, marginBottom: COLUMN_GAP, position: 'relative' },
  photo: { width: '100%', height: '100%', borderRadius: radius.md, backgroundColor: colors.greyLight },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  addBtnTxt: { color: colors.white, fontWeight: '800' },
});
