import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { PrimaryButton } from '../PrimaryButton';
import { colors, radius, spacing } from '../../constants/theme';
import { MAIN_CATEGORIES } from '../../data/serviceCatalog';

export type SearchFilters = {
  radiusKm: number;
  minRating: number;
  categoryId: string | null;
  onlineOnly: boolean;
};

type Props = {
  visible: boolean;
  initial: SearchFilters;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
};

const RADIUS_OPTIONS = [2, 5, 10, 15];
const RATING_OPTIONS = [0, 3, 4, 4.5];

export function SearchFilterModal({ visible, initial, onClose, onApply }: Props) {
  const [filters, setFilters] = useState<SearchFilters>(initial);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Filter services</Text>

          <Text style={styles.label}>Location radius (km)</Text>
          <View style={styles.chips}>
            {RADIUS_OPTIONS.map((r) => (
              <Pressable
                key={r}
                style={[styles.chip, filters.radiusKm === r && styles.chipOn]}
                onPress={() => setFilters((f) => ({ ...f, radiusKm: r }))}
              >
                <Text style={[styles.chipTxt, filters.radiusKm === r && styles.chipTxtOn]}>{r} km</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Minimum star rating</Text>
          <View style={styles.chips}>
            {RATING_OPTIONS.map((r) => (
              <Pressable
                key={r}
                style={[styles.chip, filters.minRating === r && styles.chipOn]}
                onPress={() => setFilters((f) => ({ ...f, minRating: r }))}
              >
                <Text style={[styles.chipTxt, filters.minRating === r && styles.chipTxtOn]}>
                  {r === 0 ? 'Any' : `${r}+ ★`}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            <Pressable
              style={[styles.chip, !filters.categoryId && styles.chipOn]}
              onPress={() => setFilters((f) => ({ ...f, categoryId: null }))}
            >
              <Text style={[styles.chipTxt, !filters.categoryId && styles.chipTxtOn]}>All</Text>
            </Pressable>
            {MAIN_CATEGORIES.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.chip, filters.categoryId === c.id && styles.chipOn]}
                onPress={() => setFilters((f) => ({ ...f, categoryId: c.id }))}
              >
                <Text style={[styles.chipTxt, filters.categoryId === c.id && styles.chipTxtOn]}>
                  {c.title}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Online partners only</Text>
            <Switch
              value={filters.onlineOnly}
              onValueChange={(v) => setFilters((f) => ({ ...f, onlineOnly: v }))}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.actions}>
            <PrimaryButton title="Apply filters" onPress={() => onApply(filters)} />
            <Pressable onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.white, marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '700', color: colors.slate, marginTop: spacing.sm, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.orangeTint, borderColor: colors.primary },
  chipTxt: { fontSize: 13, color: colors.slate, fontWeight: '600' },
  chipTxtOn: { color: colors.primary },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  switchLabel: { fontSize: 15, fontWeight: '600', color: colors.charcoal },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  cancel: { alignItems: 'center', padding: spacing.sm },
  cancelTxt: { color: colors.grey, fontWeight: '600' },
});
