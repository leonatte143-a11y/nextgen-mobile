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

  const header = (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>KAIRO Store</Text>
        <Text style={styles.sub}>KAIRO Market · nearby verified vendors</Text>
      </View>

      <View style={styles.cardsRow}>
        <Pressable
          style={[styles.card, activeTab === 'shops' && styles.cardOn]}
          onPress={() => setActiveTab('shops')}
        >
          <Ionicons
            name="storefront-outline"
            size={26}
            color={activeTab === 'shops' ? colors.white : colors.primary}
          />
          <Text style={[styles.cardTitle, activeTab === 'shops' && styles.cardTitleOn]}>Shop</Text>
        </Pressable>

        <Pressable
          style={[styles.card, activeTab === 'materials' && styles.cardOn]}
          onPress={() => setActiveTab('materials')}
        >
          <Ionicons
            name="cube-outline"
            size={26}
            color={activeTab === 'materials' ? colors.white : colors.primary}
          />
          <Text style={[styles.cardTitle, activeTab === 'materials' && styles.cardTitleOn]}>
            Buy or Sell
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {activeTab === 'materials' ? (
        <MaterialsTabContent header={header} />
      ) : (
        <ShopListContent header={header} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: colors.navy },
  sub: { color: colors.grey, marginTop: 4, fontSize: 13 },
  cardsRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    minHeight: 104,
  },
  cardOn: { backgroundColor: colors.primary },
  cardTitle: { fontSize: 14, fontWeight: '800', color: colors.navy, textAlign: 'center' },
  cardTitleStacked: { lineHeight: 18 },
  cardTitleOn: { color: colors.white },
});
