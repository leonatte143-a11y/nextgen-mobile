import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../../constants/theme';
import { PrimaryButton } from '../PrimaryButton';

const CITIES = ['Rajahmundry', 'Guntur', 'Vijayawada'] as const;

type Props = {
  initialCity: string;
  initialRadius: number;
};

export function PartnerServiceLocationBar({ initialCity, initialRadius }: Props) {
  const insets = useSafeAreaInsets();
  const [city, setCity] = useState(initialCity);
  const [radius, setRadius] = useState(initialRadius);
  const [locOpen, setLocOpen] = useState(false);
  const [radOpen, setRadOpen] = useState(false);
  const [mapHint, setMapHint] = useState('');
  const [rInput, setRInput] = useState(String(initialRadius));

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
            Rajahmundry / Guntur
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
            <Text style={styles.gpsPill}>GPS: Active — location lock enabled</Text>
            <Text style={styles.modalSub}>
              Primary zone: Rajahmundry / Guntur. Set center by city or type an area (e.g. Danavaipeta).
            </Text>
            {CITIES.map((c) => (
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
            <PrimaryButton title="Save" onPress={() => setLocOpen(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={radOpen} animationType="fade" transparent>
        <View style={styles.modalRoot}>
          <View style={styles.modalCard}>
            <Text style={styles.modalH}>Service radius (km)</Text>
            <Text style={styles.modalSub}>Default 10 km. Adjusting is simulated only.</Text>
            <TextInput
              style={styles.inp}
              keyboardType="number-pad"
              value={rInput}
              onChangeText={setRInput}
            />
            <PrimaryButton
              title="Apply"
              onPress={() => {
                const n = Math.max(1, Math.min(50, parseInt(rInput, 10) || 10));
                setRadius(n);
                setRInput(String(n));
                Alert.alert('Radius updated', `Partners see jobs within ${n} km.`);
                setRadOpen(false);
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
