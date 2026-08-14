import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { KairoTextInput } from '../components/KairoTextInput';
import { colors, radius, spacing } from '../constants/theme';
import { usePartner } from '../context/PartnerContext';
import { getCurrentCoords } from '../services/locationService';
import type { PartnerLocationEditScreenProps } from '../navigation/PartnerStackTypes';

const RADIUS_OPTIONS = [3, 5, 8, 10, 15] as const;

export function PartnerLocationEditScreen({ navigation }: PartnerLocationEditScreenProps) {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, refreshPartner, isLoading } = usePartner();
  const [city, setCity] = useState('');
  const [innerKm, setInnerKm] = useState(5);
  const [outerKm, setOuterKm] = useState(10);
  const [outOfStation, setOutOfStation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (profile) {
      setCity(profile.primaryCity);
      setInnerKm(profile.serviceInnerRadiusKm);
      setOuterKm(profile.serviceOuterRadiusKm);
      setOutOfStation(profile.allowOutOfStation);
      setCoords(
        profile.latitude != null && profile.longitude != null
          ? { latitude: profile.latitude, longitude: profile.longitude }
          : null,
      );
    }
  }, [profile]);

  const captureLocation = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentCoords();
      if (!pos) {
        Alert.alert('Could not get location', 'Allow location access and try again.');
        return;
      }
      setCoords(pos);
    } finally {
      setLocating(false);
    }
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile({
        primaryCity: city.trim() || profile.primaryCity,
        serviceInnerRadiusKm: innerKm,
        serviceOuterRadiusKm: outerKm,
        allowOutOfStation: outOfStation,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
      });
      await refreshPartner();
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Service location</Text>
        <View style={{ width: 24 }} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.statusCard}>
          <Ionicons name="navigate-circle" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>GPS status</Text>
            <Text style={styles.statusTxt}>
              {coords
                ? `Base point set: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
                : 'No base point set yet — capture your current location below.'}
            </Text>
          </View>
        </View>

        <Pressable style={styles.locateBtn} onPress={captureLocation} disabled={locating}>
          <Ionicons name="locate-outline" size={18} color={colors.primary} />
          <Text style={styles.locateTxt}>{locating ? 'Getting location…' : 'Use my current location as base point'}</Text>
        </Pressable>

        <Text style={styles.label}>Primary city / area</Text>
        <KairoTextInput
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Rajahmundry, Danavaipeta"
        />
        <Text style={styles.hint}>
          Use precise areas (e.g. Dowleswaram) — production can snap via Maps Places API.
        </Text>

        <Text style={styles.label}>Inner zone radius (km)</Text>
        <View style={styles.chips}>
          {RADIUS_OPTIONS.map((km) => (
            <Pressable
              key={`in-${km}`}
              style={[styles.chip, innerKm === km && styles.chipOn]}
              onPress={() => setInnerKm(km)}
            >
              <Text style={[styles.chipTxt, innerKm === km && styles.chipTxtOn]}>{km} km</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Outer zone radius (km)</Text>
        <View style={styles.chips}>
          {RADIUS_OPTIONS.map((km) => (
            <Pressable
              key={`out-${km}`}
              style={[styles.chip, outerKm === km && styles.chipOn]}
              onPress={() => setOuterKm(km)}
            >
              <Text style={[styles.chipTxt, outerKm === km && styles.chipTxtOn]}>{km} km</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Allow out-of-station requests?</Text>
            <Text style={styles.switchSub}>You may get jobs slightly outside your primary zone.</Text>
          </View>
          <Switch value={outOfStation} onValueChange={setOutOfStation} trackColor={{ true: colors.primary }} />
        </View>

        <PrimaryButton title="Save service zone" onPress={save} loading={saving} />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loading: { color: colors.grey },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.charcoal },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  statusCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.orangeTint,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  statusTitle: { fontWeight: '800', color: colors.charcoal },
  statusTxt: { color: colors.grey, fontSize: 13, marginTop: 4, lineHeight: 18 },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  locateTxt: { color: colors.primary, fontWeight: '700' },
  label: { fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm, marginTop: spacing.md },
  hint: { fontSize: 12, color: colors.grey, marginTop: spacing.xs, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.orangeTint },
  chipTxt: { fontWeight: '600', color: colors.charcoal },
  chipTxtOn: { color: colors.primary },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
  },
  switchLabel: { fontWeight: '700', color: colors.charcoal },
  switchSub: { fontSize: 12, color: colors.grey, marginTop: 4 },
});
