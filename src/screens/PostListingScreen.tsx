import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
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
import { NexgenTextInput } from '../components/NexgenTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { getCurrentCoords, requestLocationPermission } from '../services/locationService';
import { marketplaceService } from '../services/marketplaceService';
import type { ListingType, MarketplaceCategory } from '../types/marketplace';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TYPES: { value: ListingType; label: string; hint: string }[] = [
  { value: 'rent', label: 'Rent Out', hint: 'Tools & machinery — set a security deposit' },
  { value: 'sell', label: 'Sell', hint: 'Bikes, gear, anything OLX-style' },
  { value: 'resale', label: 'Resale', hint: 'Leftover project materials at a discount' },
];

const MAX_PHOTOS = 4;

export function PostListingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [listingType, setListingType] = useState<ListingType>('sell');
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [price, setPrice] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [rentPricePerDay, setRentPricePerDay] = useState('');
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    marketplaceService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const filteredSuggestions = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return categories.slice(0, 8);
    return categories.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [categoryQuery, categories]);

  const pickPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit reached', `You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add listing photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    const asset = result.assets[0];
    const mime = asset.mimeType || 'image/jpeg';
    setPhotos((prev) => [...prev, `data:${mime};base64,${asset.base64}`]);
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const ok = await requestLocationPermission();
      if (!ok) return;
      const c = await getCurrentCoords();
      if (c) setCoords(c);
    } finally {
      setLocating(false);
    }
  };

  const canSave =
    title.trim().length > 2 &&
    (categoryId || categoryQuery.trim()) &&
    (listingType === 'rent' ? Number(depositAmount) > 0 : Number(price) > 0);

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await marketplaceService.createListing('user', {
        listingType,
        categoryId: categoryId || undefined,
        categoryName: categoryId ? undefined : categoryQuery.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        photos,
        price: listingType === 'rent' ? undefined : Number(price) || undefined,
        depositAmount: listingType === 'rent' ? Number(depositAmount) || undefined : undefined,
        rentPricePerDay: listingType === 'rent' ? Number(rentPricePerDay) || undefined : undefined,
        city: city.trim() || undefined,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });
      Alert.alert('Posted!', 'Your listing is live on NEXGEN Market.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not post listing.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Post Ad</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>What are you posting?</Text>
        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <Pressable
              key={t.value}
              style={[styles.typeChip, listingType === t.value && styles.typeChipOn]}
              onPress={() => setListingType(t.value)}
            >
              <Text style={[styles.typeTxt, listingType === t.value && styles.typeTxtOn]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>{TYPES.find((t) => t.value === listingType)?.hint}</Text>

        <Text style={styles.label}>Photos ({photos.length}/{MAX_PHOTOS})</Text>
        <View style={styles.photoRow}>
          {photos.map((uri, i) => (
            <View key={i} style={styles.photoThumbWrap}>
              <Image source={{ uri }} style={styles.photoThumb} />
              <Pressable
                style={styles.photoRemove}
                onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <Ionicons name="close" size={14} color={colors.white} />
              </Pressable>
            </View>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <Pressable style={styles.photoAdd} onPress={pickPhoto}>
              <Ionicons name="camera-outline" size={22} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>

        <NexgenTextInput label="Product Name" value={title} onChangeText={setTitle} placeholder="e.g. Hand-cutting machine" />

        <Text style={styles.label}>Category</Text>
        <NexgenTextInput
          value={categoryQuery}
          onChangeText={(t) => {
            setCategoryQuery(t);
            setCategoryId('');
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="e.g. Heavy Tools"
        />
        {showSuggestions && filteredSuggestions.length > 0 ? (
          <View style={styles.suggestBox}>
            {filteredSuggestions.map((c) => (
              <Pressable
                key={c.id}
                style={styles.suggestRow}
                onPress={() => {
                  setCategoryId(c.id);
                  setCategoryQuery(c.name);
                  setShowSuggestions(false);
                }}
              >
                <Text style={styles.suggestTxt}>{c.name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {listingType === 'rent' ? (
          <>
            <NexgenTextInput
              label="Security Deposit Amount (₹)"
              value={depositAmount}
              onChangeText={(t) => setDepositAmount(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
            />
            <NexgenTextInput
              label="Rent per day (₹, optional)"
              value={rentPricePerDay}
              onChangeText={(t) => setRentPricePerDay(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
            />
            <Text style={styles.hint}>
              The deposit is held until the item is returned — you and the renter settle it directly.
            </Text>
          </>
        ) : (
          <NexgenTextInput
            label="Price (₹)"
            value={price}
            onChangeText={(t) => setPrice(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
          />
        )}

        <NexgenTextInput label="Description" value={description} onChangeText={setDescription} multiline />
        <NexgenTextInput label="City (optional)" value={city} onChangeText={setCity} />

        <Pressable style={styles.locBtn} onPress={useMyLocation}>
          <Ionicons name="locate-outline" size={18} color={colors.primary} />
          <Text style={styles.locTxt}>{locating ? 'Fetching location…' : coords ? 'Location added ✓' : 'Use my current location'}</Text>
        </Pressable>

        <PrimaryButton title="Post listing" onPress={submit} loading={saving} disabled={!canSave} />
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
  label: { fontWeight: '700', color: colors.charcoal, marginTop: spacing.md, marginBottom: spacing.sm },
  hint: { color: colors.grey, fontSize: 12, marginBottom: spacing.sm, lineHeight: 18 },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.greyLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeTxt: { fontWeight: '700', color: colors.charcoal, fontSize: 13 },
  typeTxtOn: { color: colors.white },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  photoThumbWrap: { width: 72, height: 72, borderRadius: radius.md, overflow: 'hidden' },
  photoThumb: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 2,
  },
  photoAdd: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greyLight,
  },
  suggestBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  suggestRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  suggestTxt: { fontWeight: '600', color: colors.charcoal },
  locBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  locTxt: { color: colors.primary, fontWeight: '700' },
});
