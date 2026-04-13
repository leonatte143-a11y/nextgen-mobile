import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { NexgenTextInput } from '../components/NexgenTextInput';
import { colors, radius, spacing } from '../constants/theme';
import { usePartner } from '../context/PartnerContext';
import type { PartnerLocationEditScreenProps } from '../navigation/partnerStackTypes';

const RADIUS_OPTIONS = [3, 5, 8, 10, 15] as const;

export function PartnerLocationEditScreen({ navigation }: PartnerLocationEditScreenProps) {
  const { profile, updateProfile, refreshPartner, isLoading } = usePartner();
  const [city, setCity] = useState('');
  const [innerKm, setInnerKm] = useState(5);
  const [outerKm, setOuterKm] = useState(10);
  const [outOfStation, setOutOfStation] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setCity(profile.primaryCity);
      setInnerKm(profile.serviceInnerRadiusKm);
      setOuterKm(profile.serviceOuterRadiusKm);
      setOutOfStation(profile.allowOutOfStation);
    }
  }, [profile]);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile({
        primaryCity: city.trim() || profile.primaryCity,
        serviceInnerRadiusKm: innerKm,
        serviceOuterRadiusKm: outerKm,
        allowOutOfStation: outOfStation,
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
    <View style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Service location</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.statusCard}>
          <Ionicons name="navigate-circle" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>GPS status</Text>
            <Text style={styles.statusTxt}>Monitoring live location for job matching (mock).</Text>
          </View>
        </View>

        <Text style={styles.label}>Primary city / area</Text>
        <NexgenTextInput
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loading: { color: colors.grey },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 48,
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
