import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KairoLogo } from '../components/KairoLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { MARKETPLACE_FIXED_CATEGORIES } from '../constants/marketplaceCategories';
import {
  getCurrentCoords,
  requestLocationPermission,
  reverseGeocodeCityName,
} from '../services/locationService';
import { marketplaceService } from '../services/marketplaceService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'PostAdDetails'>;

const MAX_PHOTOS = 10;
const MAX_DESCRIPTION = 500;
const VEHICLE_CATEGORIES = ['cars', 'bikes', 'commercial vehicles'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'];

const CATEGORY_META: Record<string, { subtitle: string; color: string }> = {
  Cars: { subtitle: 'Sell your car or find your dream ride.', color: '#D32F2F' },
  Properties: { subtitle: 'List your property for sale or rent.', color: '#1565C0' },
  Mobiles: { subtitle: 'Sell your phone to a buyer nearby.', color: '#00897B' },
  Jobs: { subtitle: 'Post a job opening or find work nearby.', color: '#F9A825' },
  Fashion: { subtitle: 'Sell clothing, shoes and accessories.', color: '#AD1457' },
  Bikes: { subtitle: 'Sell your bike or find your next ride.', color: '#6A1B9A' },
  Electronics: { subtitle: 'Sell gadgets, appliances and more.', color: '#0277BD' },
  'Commercial Vehicles': { subtitle: 'List trucks, vans and commercial fleets.', color: '#455A64' },
  Furniture: { subtitle: 'Sell furniture and home decor.', color: '#8D6E63' },
  Pets: { subtitle: 'Find a new home for pets and supplies.', color: '#2E7D32' },
  Others: { subtitle: 'List anything else you want to sell.', color: colors.categoryTagPurple },
};

/** Minimalist underline field, scoped to this screen only — the shared KairoTextInput (boxed
 * outline) is used everywhere else in the app and isn't touched here to avoid a global restyle. */
function UnderlineInput(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
  multiline?: boolean;
  maxLength?: number;
  footer?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        style={[styles.fieldInput, focused && styles.fieldInputFocused, props.multiline && styles.fieldInputMultiline]}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={colors.grey}
        keyboardType={props.keyboardType}
        multiline={props.multiline}
        maxLength={props.maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {props.footer ? <Text style={styles.fieldFooter}>{props.footer}</Text> : null}
    </View>
  );
}

/** Underline-style dropdown — matches the flat text-input look but opens a modal option list. */
function DropdownField(props: {
  label: string;
  value: string | null;
  options: string[];
  onSelect: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <Pressable style={styles.dropdownInput} onPress={() => setOpen(true)}>
        <Text style={[styles.dropdownTxt, !props.value && styles.dropdownPlaceholder]} numberOfLines={1}>
          {props.value || props.placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.grey} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{props.label}</Text>
            {props.options.map((opt) => (
              <Pressable
                key={opt}
                style={styles.modalOption}
                onPress={() => {
                  props.onSelect(opt);
                  setOpen(false);
                }}
              >
                <Text style={styles.modalOptionTxt}>{opt}</Text>
                {props.value === opt ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export function PostAdDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const isVehicle = VEHICLE_CATEGORIES.includes(params.categoryName.toLowerCase());
  const meta = CATEGORY_META[params.categoryName] || CATEGORY_META.Others;
  const categoryIcon =
    MARKETPLACE_FIXED_CATEGORIES.find((c) => c.name === params.categoryName)?.icon ?? 'pricetag-outline';

  const [photos, setPhotos] = useState<string[]>([]);
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fuelType, setFuelType] = useState<string | null>(null);
  const [transmission, setTransmission] = useState<'Automatic' | 'Manual' | null>(null);
  const [kmDriven, setKmDriven] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [rentPricePerDay, setRentPricePerDay] = useState('');
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

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
    const remaining = MAX_PHOTOS - photos.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
    });
    if (result.canceled || !result.assets?.length) return;
    const picked = result.assets.filter((a) => a.base64);
    const toAdd = picked.slice(0, remaining);
    const newUris = toAdd.map((asset) => `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
    setPhotos((prev) => [...prev, ...newUris]);
    if (picked.length > remaining) {
      Alert.alert('Limit reached', `Only ${remaining} photo${remaining === 1 ? '' : 's'} added — you can have up to ${MAX_PHOTOS} photos.`);
    }
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const ok = await requestLocationPermission();
      if (!ok) return;
      const c = await getCurrentCoords();
      if (c) {
        setCoords(c);
        const name = await reverseGeocodeCityName(c);
        if (name) setCity(name);
      }
    } finally {
      setLocating(false);
    }
  };

  const title = isVehicle ? [brand.trim(), model.trim()].filter(Boolean).join(' ') : productName.trim();

  const canSave =
    (isVehicle ? brand.trim().length > 0 && model.trim().length > 0 : title.length > 2) &&
    (params.listingType === 'rent' ? Number(depositAmount) > 0 : Number(price) > 0);

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const vehicleLines = isVehicle
        ? [
            year.trim() ? `Year: ${year.trim()}` : null,
            fuelType ? `Fuel Type: ${fuelType}` : null,
            transmission ? `Transmission: ${transmission}` : null,
            kmDriven.trim() ? `Kilometres Driven: ${kmDriven.trim()} km` : null,
          ]
            .filter(Boolean)
            .join('\n')
        : '';
      const fullDescription = [vehicleLines, description.trim()].filter(Boolean).join('\n\n') || undefined;

      await marketplaceService.createListing('user', {
        listingType: params.listingType,
        categoryId: params.categoryId || undefined,
        categoryName: params.categoryId ? undefined : params.categoryName,
        title,
        description: fullDescription,
        photos,
        price: params.listingType === 'rent' ? undefined : Number(price) || undefined,
        depositAmount: params.listingType === 'rent' ? Number(depositAmount) || undefined : undefined,
        rentPricePerDay: params.listingType === 'rent' ? Number(rentPricePerDay) || undefined : undefined,
        city: city.trim() || undefined,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });
      Alert.alert('Posted!', 'Your listing is live on KAIRO Market.', [
        { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Store' }) },
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
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.headerTitle}>Post Ad</Text>
        <KairoLogo size={26} />
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.categoryBanner}>
          <View style={[styles.categoryIconWrap, { backgroundColor: `${meta.color}1A` }]}>
            <Ionicons name={categoryIcon} size={28} color={meta.color} />
          </View>
          <View style={styles.categoryTextWrap}>
            <Text style={styles.categoryName}>{params.categoryName}</Text>
            <Text style={styles.categorySubtitle}>{meta.subtitle}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Basic Details</Text>
        {isVehicle ? (
          <>
            <UnderlineInput label="Brand" value={brand} onChangeText={setBrand} placeholder="e.g. Hyundai" />
            <UnderlineInput label="Model" value={model} onChangeText={setModel} placeholder="e.g. Creta" />
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <UnderlineInput label="Year" value={year} onChangeText={(t) => setYear(t.replace(/\D/g, ''))} placeholder="e.g. 2021" keyboardType="number-pad" />
              </View>
              <View style={styles.gridCol}>
                <DropdownField label="Fuel Type" value={fuelType} options={FUEL_TYPES} onSelect={setFuelType} placeholder="Select" />
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Transmission</Text>
                <View style={styles.toggleRow}>
                  {(['Automatic', 'Manual'] as const).map((opt) => (
                    <Pressable
                      key={opt}
                      style={[styles.toggleBtn, transmission === opt && styles.toggleBtnOn]}
                      onPress={() => setTransmission(opt)}
                    >
                      <Text style={[styles.toggleTxt, transmission === opt && styles.toggleTxtOn]}>{opt}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.gridCol}>
                <UnderlineInput label="Kilometres Driven" value={kmDriven} onChangeText={(t) => setKmDriven(t.replace(/\D/g, ''))} placeholder="e.g. 32000" keyboardType="number-pad" />
              </View>
            </View>
          </>
        ) : (
          <UnderlineInput label="Product Name" value={productName} onChangeText={setProductName} placeholder="e.g. Hand-cutting machine" />
        )}

        <Text style={styles.sectionHeader}>Location</Text>
        <Pressable style={styles.locationPill} onPress={useMyLocation}>
          <Ionicons name="location" size={18} color={colors.categoryTagPurple} />
          <Text style={styles.locationTxt} numberOfLines={1}>
            {locating ? 'Fetching location…' : city || 'Tap to set your location'}
          </Text>
          <Ionicons name="locate-outline" size={18} color={colors.grey} />
        </Pressable>

        <Text style={styles.sectionHeader}>Price</Text>
        {params.listingType === 'rent' ? (
          <>
            <UnderlineInput
              label="Security Deposit Amount (₹)"
              value={depositAmount}
              onChangeText={(t) => setDepositAmount(t.replace(/\D/g, ''))}
              placeholder="e.g. 5000"
              keyboardType="number-pad"
            />
            <UnderlineInput
              label="Rent per day (₹, optional)"
              value={rentPricePerDay}
              onChangeText={(t) => setRentPricePerDay(t.replace(/\D/g, ''))}
              placeholder="e.g. 300"
              keyboardType="number-pad"
            />
            <Text style={styles.hint}>
              The deposit is held until the item is returned — you and the renter settle it directly.
            </Text>
          </>
        ) : (
          <UnderlineInput
            label="Expected Price (₹)"
            value={price}
            onChangeText={(t) => setPrice(t.replace(/\D/g, ''))}
            placeholder="e.g. 25000"
            keyboardType="number-pad"
          />
        )}

        <UnderlineInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe condition, features, reason for selling…"
          multiline
          maxLength={MAX_DESCRIPTION}
          footer={`${description.length}/${MAX_DESCRIPTION}`}
        />

        <Text style={styles.sectionHeader}>Upload Photos</Text>
        <View style={styles.photoRow}>
          {photos.map((uri, i) => (
            <View key={i} style={styles.photoThumbWrap}>
              <Image source={{ uri }} style={styles.photoThumb} />
              <Pressable style={styles.photoRemove} onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}>
                <Ionicons name="close" size={14} color={colors.white} />
              </Pressable>
            </View>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <Pressable
              style={[styles.photoAdd, photos.length === 0 && styles.photoAddLarge]}
              onPress={pickPhoto}
            >
              <Ionicons name="camera-outline" size={photos.length === 0 ? 30 : 22} color={colors.categoryTagPurple} />
              <Text style={styles.photoAddTxt}>Add Photos</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.photoHint}>Add up to {MAX_PHOTOS} photos (First photo will be the main image)</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton title="Post Ad" onPress={submit} loading={saving} disabled={!canSave} style={styles.submitBtn} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { color: colors.charcoal, fontWeight: '800', fontSize: 18, flex: 1, textAlign: 'center' },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  categoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.greyLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  categoryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextWrap: { flex: 1 },
  categoryName: { fontWeight: '800', fontSize: 16, color: colors.charcoal },
  categorySubtitle: { color: colors.grey, fontSize: 12, marginTop: 2, lineHeight: 16 },
  sectionHeader: { fontWeight: '800', fontSize: 16, color: colors.charcoal, marginBottom: spacing.sm, marginTop: spacing.xs },
  fieldWrap: { marginBottom: spacing.lg },
  fieldLabel: { fontSize: 13, color: colors.grey, fontWeight: '600', marginBottom: spacing.xs },
  fieldInput: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.charcoal,
  },
  fieldInputFocused: { borderBottomColor: colors.primary },
  fieldInputMultiline: { minHeight: 70, textAlignVertical: 'top' },
  fieldFooter: { alignSelf: 'flex-end', color: colors.grey, fontSize: 11, marginTop: 4 },
  gridRow: { flexDirection: 'row', gap: spacing.md },
  gridCol: { flex: 1 },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  dropdownTxt: { fontSize: 16, color: colors.charcoal, flex: 1 },
  dropdownPlaceholder: { color: colors.grey },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.xl },
  modalSheet: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md },
  modalTitle: { fontWeight: '800', fontSize: 15, color: colors.charcoal, marginBottom: spacing.sm, paddingHorizontal: spacing.sm },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  modalOptionTxt: { fontSize: 15, color: colors.charcoal },
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  toggleBtnOn: { borderColor: colors.categoryTagPurple, backgroundColor: colors.orangeTint },
  toggleTxt: { fontWeight: '600', color: colors.charcoal, fontSize: 13 },
  toggleTxtOn: { color: colors.categoryTagPurple },
  hint: { color: colors.grey, fontSize: 12, marginTop: -spacing.sm, marginBottom: spacing.lg, lineHeight: 18 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.greyLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  locationTxt: { flex: 1, color: colors.charcoal, fontWeight: '600', fontSize: 14 },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
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
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.categoryTagPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddLarge: { width: '100%', height: 110 },
  photoAddTxt: { color: colors.categoryTagPurple, fontWeight: '700', fontSize: 11, marginTop: 4 },
  photoHint: { color: colors.grey, fontSize: 11, marginBottom: spacing.lg, lineHeight: 16 },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  submitBtn: { backgroundColor: colors.primary },
});
