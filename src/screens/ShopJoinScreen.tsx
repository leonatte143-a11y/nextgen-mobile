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
import { ANDHRA_PRADESH_CITIES, DEFAULT_AP_CITY } from '../constants/apCities';
import { colors, radius, spacing } from '../constants/theme';
import { detectCityFromGps, getCurrentCoords, requestLocationPermission } from '../services/locationService';
import { shopService } from '../services/shopService';
import type { TrendingCategorySuggestion } from '../types/shop';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ShopJoinScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [suggestions, setSuggestions] = useState<TrendingCategorySuggestion[]>([]);
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState<string>(DEFAULT_AP_CITY);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [gstOrLicense, setGstOrLicense] = useState('');
  const [leadPreference, setLeadPreference] = useState<'local' | 'regional'>('local');
  const [loading, setLoading] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  const pickShopPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to upload your shop banner.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    const asset = result.assets[0];
    const mime = asset.mimeType || 'image/jpeg';
    setPhotoDataUrl(`data:${mime};base64,${asset.base64}`);
  };

  useEffect(() => {
    shopService.getTrendingSuggestions().then(setSuggestions).catch(() => setSuggestions([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const detected = await detectCityFromGps(ANDHRA_PRADESH_CITIES);
      if (!cancelled && detected) setCity(detected);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSuggestions = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 8);
    return suggestions.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [categoryQuery, suggestions]);

  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return ANDHRA_PRADESH_CITIES;
    return ANDHRA_PRADESH_CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [citySearch]);

  const selectCategory = (item: TrendingCategorySuggestion) => {
    setCategoryId(item.id);
    setCategoryQuery(item.name);
    setShowSuggestions(false);
  };

  const submit = async () => {
    if (!shopName.trim()) {
      Alert.alert('Required', 'Please enter your shop name.');
      return;
    }
    const categoryName = categoryQuery.trim();
    if (!categoryId && !categoryName) {
      Alert.alert('Required', 'Please enter or select a business category.');
      return;
    }
    if (!acceptedTerms) {
      Alert.alert('Terms required', 'Please accept the KAIRO Terms and Conditions to continue.');
      return;
    }
    setLoading(true);
    try {
      const locOk = await requestLocationPermission();
      let latitude: number | undefined;
      let longitude: number | undefined;
      if (locOk) {
        const coords = await getCurrentCoords();
        if (coords) {
          latitude = coords.latitude;
          longitude = coords.longitude;
        }
      }
      await shopService.apply({
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        categoryId: categoryId || undefined,
        categoryName: categoryId ? undefined : categoryName,
        phone: phone.replace(/\D/g, '').slice(0, 10),
        address: address.trim(),
        city,
        latitude,
        longitude,
        gstOrLicense: gstOrLicense.trim(),
        leadPreference,
        photoUrl: photoDataUrl || undefined,
      });
      Alert.alert(
        'Application submitted',
        'Our team will verify your shop and list you on KAIRO Market.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Join KAIRO</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Grow your business</Text>
        <Text style={styles.sub}>
          Get more local leads from our 10,000+ users and service partners.
        </Text>

        <NexgenTextInput label="Shop name" value={shopName} onChangeText={setShopName} />
        <NexgenTextInput label="Owner name" value={ownerName} onChangeText={setOwnerName} />

        <Text style={styles.label}>Shop photo (optional)</Text>
        <Text style={styles.hint}>A high-quality storefront or product banner helps you get more leads.</Text>
        <Pressable style={styles.photoPicker} onPress={pickShopPhoto}>
          {photoDataUrl ? (
            <Image source={{ uri: photoDataUrl }} style={styles.photoPreview} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={28} color={colors.primary} />
              <Text style={styles.photoPlaceholderTxt}>Tap to add a photo</Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.label}>Business category</Text>
        <Text style={styles.hint}>Type to search or enter a new category — trending options appear below.</Text>
        <NexgenTextInput
          value={categoryQuery}
          onChangeText={(t) => {
            setCategoryQuery(t);
            setCategoryId('');
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="e.g. Hardware, Electrical supplies"
        />
        {showSuggestions && filteredSuggestions.length > 0 ? (
          <View style={styles.suggestBox}>
            {filteredSuggestions.map((item) => (
              <Pressable key={item.id} style={styles.suggestRow} onPress={() => selectCategory(item)}>
                <Text style={styles.suggestName}>{item.name}</Text>
                {item.searchCount != null && item.searchCount > 0 ? (
                  <Text style={styles.suggestCount}>{item.searchCount} searches</Text>
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : null}

        <NexgenTextInput
          label="Phone"
          prefix="+91"
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
        />
        <NexgenTextInput label="Address" value={address} onChangeText={setAddress} multiline />

        <Text style={styles.label}>City (Andhra Pradesh)</Text>
        <Text style={styles.hint}>Auto-detected from GPS when available. Tap to change.</Text>
        <Pressable style={styles.citySelect} onPress={() => setCityPickerOpen((v) => !v)}>
          <Text style={styles.citySelectTxt}>{city}</Text>
          <Ionicons name={cityPickerOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
        </Pressable>
        {cityPickerOpen ? (
          <View style={styles.cityPicker}>
            <NexgenTextInput
              value={citySearch}
              onChangeText={setCitySearch}
              placeholder="Search AP cities"
            />
            <ScrollView style={styles.cityList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {filteredCities.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.cityRow, city === c && styles.cityRowOn]}
                  onPress={() => {
                    setCity(c);
                    setCityPickerOpen(false);
                    setCitySearch('');
                  }}
                >
                  <Text style={[styles.cityRowTxt, city === c && styles.cityRowTxtOn]}>{c}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <NexgenTextInput
          label="GST / Trade license (optional)"
          value={gstOrLicense}
          onChangeText={setGstOrLicense}
        />

        <Text style={styles.label}>Lead preference</Text>
        <View style={styles.cityRowWrap}>
          <Pressable
            style={[styles.cityChip, leadPreference === 'local' && styles.cityChipOn]}
            onPress={() => setLeadPreference('local')}
          >
            <Text style={[styles.cityTxt, leadPreference === 'local' && styles.cityTxtOn]}>Local leads (nearby)</Text>
          </Pressable>
          <Pressable
            style={[styles.cityChip, leadPreference === 'regional' && styles.cityChipOn]}
            onPress={() => setLeadPreference('regional')}
          >
            <Text style={[styles.cityTxt, leadPreference === 'regional' && styles.cityTxtOn]}>Regional leads (all AP)</Text>
          </Pressable>
        </View>

        <Pressable style={styles.termsRow} onPress={() => setAcceptedTerms((v) => !v)}>
          <Ionicons name={acceptedTerms ? 'checkbox' : 'square-outline'} size={22} color={colors.primary} />
          <Text style={styles.termsTxt}>
            I agree to the KAIRO{' '}
            <Text style={styles.termsLink} onPress={() => navigation.navigate('Terms')}>
              Terms and Conditions
            </Text>
          </Text>
        </Pressable>
        <PrimaryButton title="Submit application" onPress={submit} loading={loading} disabled={!acceptedTerms} />
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
  h1: { fontSize: 22, fontWeight: '900', color: colors.charcoal },
  sub: { color: colors.grey, marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 20 },
  label: { fontWeight: '700', color: colors.charcoal, marginTop: spacing.md, marginBottom: spacing.sm },
  hint: { color: colors.grey, fontSize: 12, marginBottom: spacing.sm, lineHeight: 18 },
  suggestBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  suggestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  suggestName: { fontWeight: '600', color: colors.charcoal, flex: 1 },
  suggestCount: { fontSize: 11, color: colors.primary, fontWeight: '700' },
  citySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.greyLight,
  },
  citySelectTxt: { fontWeight: '700', color: colors.charcoal, fontSize: 15 },
  cityPicker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    padding: spacing.sm,
    maxHeight: 220,
  },
  cityList: { maxHeight: 160 },
  cityRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  cityRowOn: { backgroundColor: colors.orangeTint },
  cityRowTxt: { color: colors.charcoal, fontWeight: '600' },
  cityRowTxtOn: { color: colors.primary, fontWeight: '800' },
  cityRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  cityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
  },
  cityChipOn: { backgroundColor: colors.primary },
  cityTxt: { fontWeight: '600', color: colors.charcoal },
  cityTxtOn: { color: colors.white },
  photoPicker: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoPreview: { width: '100%', height: 160 },
  photoPlaceholder: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greyLight,
  },
  photoPlaceholderTxt: { color: colors.primary, fontWeight: '700', marginTop: spacing.xs },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  termsTxt: { flex: 1, color: colors.charcoal, fontSize: 13 },
  termsLink: { color: colors.primary, fontWeight: '700' },
});
