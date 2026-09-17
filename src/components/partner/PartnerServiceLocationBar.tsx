import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../../constants/theme';
import { PrimaryButton } from '../PrimaryButton';
import { detectCityFromGps, getCurrentCoords, reverseGeocodeCityName, type Coords } from '../../services/locationService';
import { ANDHRA_PRADESH_CITIES } from '../../constants/apCities';
import { usePartner } from '../../context/PartnerContext';

const QUICK_CITIES = ['Rajahmundry', 'Vijayawada'] as const;

type Props = {
  initialCity: string;
  initialRadius: number;
};

export function PartnerServiceLocationBar({ initialCity, initialRadius }: Props) {
  const insets = useSafeAreaInsets();
  const { updateProfile } = usePartner();
  const [city, setCity] = useState(initialCity);
  const [radius, setRadius] = useState(initialRadius);
  const [locOpen, setLocOpen] = useState(false);
  const [radOpen, setRadOpen] = useState(false);
  const [mapHint, setMapHint] = useState('');
  const [rInput, setRInput] = useState(String(initialRadius));
  const [detecting, setDetecting] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [savingLoc, setSavingLoc] = useState(false);
  const [savingRadius, setSavingRadius] = useState(false);

  const useMyLocation = async () => {
    setDetecting(true);
    try {
      const pos = await getCurrentCoords();
      if (pos) setCoords(pos);
      const detected = await detectCityFromGps(ANDHRA_PRADESH_CITIES);
      if (detected) {
        setCity(detected);
        return;
      }
      const fallback = pos ? await reverseGeocodeCityName(pos) : null;
      if (fallback) setCity(fallback);
      else Alert.alert('Location', 'Could not detect your city. Please select one below.');
    } finally {
      setDetecting(false);
    }
  };

  const saveLocation = async () => {
    setSavingLoc(true);
    try {
      const finalCity = (mapHint.trim() || city).trim();
      await updateProfile({
        primaryCity: finalCity,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
      });
      setCity(finalCity);
      setMapHint('');
      setLocOpen(false);
    } catch {
      Alert.alert('Could not save', 'Please check your connection and try again.');
    } finally {
      setSavingLoc(false);
    }
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={() => setLocOpen(true)}>
          <Ionicons name="create-outline" size={16} color={colors.white} />
          <Text style={styles.btnTxt}>Edit location</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.meta} numberOfLines={1}>
            {mapHint || city} · {radius} km
          </Text>
          <Text style={styles.subMeta} numberOfLines={1}>
            Service area: {city}
          </Text>
        </View>
        <Pressable onPress={() => setRadOpen(true)} hitSlop={8}>
          <Ionicons name="options-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <Modal visible={locOpen} animationType="slide" transparent>
        <View style={styles.modalRoot}>
          <View style={styles.modalCard}>
            <Text style={styles.modalH}>Service territory</Text>
            <Text style={styles.gpsPill}>
              {coords
                ? `GPS: base point captured (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`
                : 'GPS: no base point captured yet'}
            </Text>
            <Text style={styles.modalSub}>
              Primary zone: {city}. Set center by city or type an area (e.g. your neighborhood).
            </Text>
            <Pressable style={styles.gpsBtn} onPress={useMyLocation} disabled={detecting}>
              <Ionicons name="locate-outline" size={16} color={colors.primary} />
              <Text style={styles.gpsBtnTxt}>{detecting ? 'Detecting…' : 'Use my location'}</Text>
            </Pressable>
            {QUICK_CITIES.map((c) => (
              <Pressable
                key={c}
                style={[styles.chip, city === c && styles.chipOn]}
                onPress={() => setCity(c)}
              >
                <Text style={[styles.chipTxt, city === c && styles.chipTxtOn]}>{c}</Text>
              </Pressable>
            ))}
            <TextInput
              style={styles.inp}
              placeholder="e.g. Danavaipeta or service area"
              value={mapHint}
              onChangeText={setMapHint}
            />
            <PrimaryButton title="Save" onPress={saveLocation} loading={savingLoc} />
          </View>
        </View>
      </Modal>

      <Modal visible={radOpen} animationType="fade" transparent>
        <View style={styles.modalRoot}>
          <View style={styles.modalCard}>
            <Text style={styles.modalH}>Service radius (km)</Text>
            <Text style={styles.modalSub}>Default 10 km.</Text>
            <TextInput
              style={styles.inp}
              keyboardType="number-pad"
              value={rInput}
              onChangeText={setRInput}
            />
            <PrimaryButton
              title="Apply"
              loading={savingRadius}
              onPress={async () => {
                const n = Math.max(1, Math.min(50, parseInt(rInput, 10) || 10));
                setSavingRadius(true);
                try {
                  await updateProfile({ serviceOuterRadiusKm: n });
                  setRadius(n);
                  setRInput(String(n));
                  Alert.alert('Radius updated', `Partners see jobs within ${n} km.`);
                  setRadOpen(false);
                } catch {
                  Alert.alert('Could not save', 'Please check your connection and try again.');
                } finally {
                  setSavingRadius(false);
                }
              }}
            />
            <Pressable onPress={() => setRadOpen(false)} style={styles.close}>
              <Text style={styles.closeTxt}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    zIndex: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.md,
  },
  btnTxt: { color: colors.white, fontWeight: '800', fontSize: 12 },
  meta: { color: colors.charcoal, fontWeight: '600', fontSize: 13 },
  subMeta: { color: colors.grey, fontSize: 10, marginTop: 2 },
  gpsPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.orangeTint,
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg },
  modalH: { fontSize: 17, fontWeight: '800' },
  modalSub: { color: colors.grey, marginTop: 6, marginBottom: spacing.md, fontSize: 13 },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  gpsBtnTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  chip: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.greyLight, marginBottom: 8 },
  chipOn: { backgroundColor: colors.orangeTint, borderWidth: 1, borderColor: colors.primary },
  chipTxt: { fontWeight: '600' },
  chipTxtOn: { color: colors.primary, fontWeight: '800' },
  inp: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  close: { marginTop: spacing.md, alignItems: 'center' },
  closeTxt: { color: colors.grey, fontWeight: '600' },
});
