import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';
import { MaterialsTabContent } from '../components/materials/MaterialsTabContent';
import type { MainTabScreenProps } from '../navigation/types';

// "Shop" was removed — EXO (OLX-style buy/sell marketplace) is now the only entry point
// on the KAIRO Store page.
export function ShopsRentalsMainScreen(_props: MainTabScreenProps<'Store'>) {
  const insets = useSafeAreaInsets();

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>EXO</Text>
      <Text style={styles.sub}>Buy / Sell</Text>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <MaterialsTabContent header={header} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { fontSize: 24, fontWeight: '900', color: colors.navy },
  sub: { color: colors.grey, marginTop: 4, fontSize: 14, fontWeight: '600' },
});
