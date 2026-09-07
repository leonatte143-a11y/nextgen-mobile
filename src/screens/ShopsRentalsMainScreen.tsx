import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import { MaterialsTabContent } from '../components/materials/MaterialsTabContent';
import type { MainTabScreenProps } from '../navigation/types';

const CITIES = ['Rajahmundry', 'Guntur', 'Vijayawada', 'Kakinada'] as const;

// "Shop" was removed — EXO (OLX-style buy/sell marketplace) is now the only entry point
// on the KAIRO Store page.
export function ShopsRentalsMainScreen(_props: MainTabScreenProps<'Store'>) {
  const insets = useSafeAreaInsets();
  const [city, setCity] = useState<string>(CITIES[0]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>EXO</Text>
      <Pressable style={styles.locationPill} onPress={() => setPickerOpen(true)}>
        <Ionicons name="location-outline" size={16} color={colors.charcoal} />
        <Text style={styles.locationTxt} numberOfLines={1}>{city}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.grey} />
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <MaterialsTabContent header={header} locationLabel={city} />

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose your city</Text>
            {CITIES.map((c) => (
              <Pressable
                key={c}
                style={styles.modalRow}
                onPress={() => {
                  setCity(c);
                  setPickerOpen(false);
                }}
              >
                <Text style={styles.modalRowTxt}>{c}</Text>
                {city === c ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  title: { fontSize: 26, fontWeight: '900', color: colors.navy },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 170,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.greyLight,
  },
  locationTxt: { color: colors.charcoal, fontWeight: '700', fontSize: 12, flexShrink: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.lg },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md },
  modalTitle: { fontSize: 16, fontWeight: '800', color: colors.charcoal, padding: spacing.sm },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  modalRowTxt: { fontWeight: '600', color: colors.charcoal },
});
