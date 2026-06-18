import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { shopService } from '../services/shopService';
import type { TrendingCategorySuggestion } from '../types/shop';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CITIES = ['Rajahmundry', 'Guntur'];

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
  const [city, setCity] = useState('Rajahmundry');
  const [gstOrLicense, setGstOrLicense] = useState('');
  const [leadPreference, setLeadPreference] = useState<'online' | 'offline'>('offline');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    shopService.getTrendingSuggestions().then(setSuggestions).catch(() => setSuggestions([]));
  }, []);

  const filteredSuggestions = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 8);
    return suggestions.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [categoryQuery, suggestions]);

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
      });
      Alert.alert(
        'Application submitted',
        'Our team will verify your shop and list you on NEXGEN Market.',
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
        <Text style={styles.headerTitle}>Join NEXGEN</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Grow your business</Text>
        <Text style={styles.sub}>
          Get more local leads from our 10,000+ users and service partners.
        </Text>

        <NexgenTextInput label="Shop name" value={shopName} onChangeText={setShopName} />
        <NexgenTextInput label="Owner name" value={ownerName} onChangeText={setOwnerName} />

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
        <Text style={styles.label}>City</Text>
        <View style={styles.cityRow}>
          {CITIES.map((c) => (
            <Pressable
              key={c}
              style={[styles.cityChip, city === c && styles.cityChipOn]}
              onPress={() => setCity(c)}
            >
              <Text style={[styles.cityTxt, city === c && styles.cityTxtOn]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <NexgenTextInput
          label="GST / Trade license (optional)"
          value={gstOrLicense}
          onChangeText={setGstOrLicense}
        />

        <Text style={styles.label}>Lead preference</Text>
        <View style={styles.cityRow}>
          <Pressable
            style={[styles.cityChip, leadPreference === 'offline' && styles.cityChipOn]}
            onPress={() => setLeadPreference('offline')}
          >
            <Text style={[styles.cityTxt, leadPreference === 'offline' && styles.cityTxtOn]}>Offline visit</Text>
          </Pressable>
          <Pressable
            style={[styles.cityChip, leadPreference === 'online' && styles.cityChipOn]}
            onPress={() => setLeadPreference('online')}
          >
            <Text style={[styles.cityTxt, leadPreference === 'online' && styles.cityTxtOn]}>Online booking</Text>
          </Pressable>
        </View>

        <PrimaryButton title="Submit application" onPress={submit} loading={loading} />
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
  cityRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  cityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
  },
  cityChipOn: { backgroundColor: colors.primary },
  cityTxt: { fontWeight: '600', color: colors.charcoal },
  cityTxtOn: { color: colors.white },
});
