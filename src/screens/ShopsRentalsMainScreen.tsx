import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import { MaterialsTabContent } from '../components/materials/MaterialsTabContent';
import { ShopListContent } from '../components/shop/ShopListContent';
import type { MainTabScreenProps } from '../navigation/types';

export function ShopsRentalsMainScreen(_props: MainTabScreenProps<'Store'>) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'shops' | 'materials'>('shops');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Shops, Materials & Rentals</Text>
        <Text style={styles.sub}>KAIRO Market · nearby verified vendors</Text>
      </View>

      <View style={styles.cardsRow}>
        <Pressable
          style={[styles.card, activeTab === 'shops' && styles.cardOn]}
          onPress={() => setActiveTab('shops')}
        >
          <Ionicons
            name="storefront-outline"
            size={34}
            color={activeTab === 'shops' ? colors.white : colors.primary}
          />
          <Text style={[styles.cardTitle, activeTab === 'shops' && styles.cardTitleOn]}>Shops</Text>
        </Pressable>

        <Pressable
          style={[styles.card, activeTab === 'materials' && styles.cardOn]}
          onPress={() => setActiveTab('materials')}
        >
          <Ionicons
            name="cube-outline"
            size={34}
            color={activeTab === 'materials' ? colors.white : colors.primary}
          />
          <Text style={[styles.cardTitle, styles.cardTitleStacked, activeTab === 'materials' && styles.cardTitleOn]}>
            Sell{'\n'}or{'\n'}Rental
          </Text>
        </Pressable>
      </View>

      {activeTab === 'materials' ? <MaterialsTabContent /> : <ShopListContent />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: colors.white },
  sub: { color: colors.grey, marginTop: 4, fontSize: 13 },
  cardsRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
    minHeight: 130,
  },
  cardOn: { backgroundColor: colors.primary },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.white, textAlign: 'center' },
  cardTitleStacked: { lineHeight: 20 },
  cardTitleOn: { color: colors.white },
});
