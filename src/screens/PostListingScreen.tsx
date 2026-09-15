import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import { MARKETPLACE_FIXED_CATEGORIES } from '../constants/marketplaceCategories';
import { marketplaceService } from '../services/marketplaceService';
import type { ListingType, MarketplaceCategory } from '../types/marketplace';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TYPES: { value: ListingType; label: string; hint: string }[] = [
  { value: 'rent', label: 'Rent Out', hint: 'Tools & machinery — set a security deposit' },
  { value: 'sell', label: 'Sell', hint: 'Bikes, gear, and more — reach buyers nearby' },
  { value: 'resale', label: 'Resale', hint: 'Leftover project materials at a discount' },
];

const OTHERS = { name: 'Others', icon: 'ellipsis-horizontal-outline' as const };

// Step 1 of the Sell flow — pick what you're posting and a category, then move on to the
// dedicated details form. Kept intentionally minimal (no photos/title/price here).
export function PostListingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [listingType, setListingType] = useState<ListingType>('sell');
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);

  useEffect(() => {
    marketplaceService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const pickCategory = (name: string) => {
    const match = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    navigation.navigate('PostAdDetails', {
      listingType,
      categoryId: match?.id ?? '',
      categoryName: name,
    });
  };

  const GRID_ITEMS = [...MARKETPLACE_FIXED_CATEGORIES, OTHERS];

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.headerTitle}>Post Ad</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <Text style={styles.label}>What are you posting?</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <Pressable
                key={t.value}
                style={[styles.typeChip, listingType === t.value && styles.typeChipOn]}
                onPress={() => setListingType(t.value)}
              >
                <Text style={[styles.typeTxt, listingType === t.value && styles.typeTxtOn]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.hint}>{TYPES.find((t) => t.value === listingType)?.hint}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Popular categories</Text>
          <View style={styles.quickGrid}>
            {GRID_ITEMS.map((qc, i) => {
              const isLastCol = i % 2 === 1;
              const isLastRow = i >= GRID_ITEMS.length - (GRID_ITEMS.length % 2 === 0 ? 2 : 1);
              return (
                <Pressable
                  key={qc.name}
                  style={[
                    styles.quickCell,
                    !isLastCol && styles.quickCellBorderRight,
                    !isLastRow && styles.quickCellBorderBottom,
                  ]}
                  onPress={() => pickCategory(qc.name)}
                >
                  <Ionicons name={qc.icon} size={28} color={colors.charcoal} />
                  <Text style={styles.quickCellTxt}>{qc.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
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
  headerTitle: { color: colors.charcoal, fontWeight: '800', fontSize: 18 },
  body: { padding: spacing.lg, paddingBottom: spacing.xl, backgroundColor: colors.surface },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  quickCell: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  quickCellBorderRight: { borderRightWidth: 1, borderRightColor: colors.border },
  quickCellBorderBottom: { borderBottomWidth: 1, borderBottomColor: colors.border },
  quickCellTxt: { marginTop: spacing.sm, fontWeight: '600', color: colors.charcoal, fontSize: 13 },
  label: { fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm },
  hint: { color: colors.grey, fontSize: 12, marginTop: spacing.sm, lineHeight: 18 },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
    backgroundColor: colors.greyLight,
  },
  typeChipOn: { backgroundColor: colors.primary },
  typeTxt: { fontWeight: '700', color: colors.charcoal, fontSize: 13 },
  typeTxtOn: { color: colors.white },
});
