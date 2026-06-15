import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
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
import type { ShopCategory } from '../types/shop';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CITIES = ['Rajahmundry', 'Guntur'];

export function ShopJoinScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Rajahmundry');
  const [gstOrLicense, setGstOrLicense] = useState('');
  const [leadPreference, setLeadPreference] = useState<'online' | 'offline'>('offline');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    shopService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const submit = async () => {
    if (!shopName.trim()) {
      Alert.alert('Required', 'Please enter your shop name.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Required', 'Please select a business category.');
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
        categoryId,
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
        <View style={styles.catGrid}>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.catChip, categoryId === c.id && styles.catChipOn]}
              onPress={() => setCategoryId(c.id)}
            >
              <Text style={[styles.catChipTxt, categoryId === c.id && styles.catChipTxtOn]}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

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
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  catChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipTxt: { fontWeight: '600', color: colors.charcoal, fontSize: 13 },
  catChipTxtOn: { color: colors.white },
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
