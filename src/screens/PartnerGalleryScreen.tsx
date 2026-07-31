import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import { usePartner } from '../context/PartnerContext';

const COLUMN_GAP = spacing.sm;

export function PartnerGalleryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { profile, updateProfile } = usePartner();
  const [saving, setSaving] = useState(false);
  const photos = profile?.photos ?? [];

  const addPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add photos to your gallery.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    const asset = result.assets[0];
    const mime = asset.mimeType || 'image/jpeg';
    const uri = `data:${mime};base64,${asset.base64}`;
    setSaving(true);
    try {
      await updateProfile({ photos: [...photos, uri] });
    } finally {
      setSaving(false);
    }
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
