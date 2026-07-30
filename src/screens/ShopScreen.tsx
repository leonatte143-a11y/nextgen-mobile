import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import { MaterialsTabContent } from '../components/materials/MaterialsTabContent';
import { ShopListContent } from '../components/shop/ShopListContent';
import type { RootStackParamList, RootStackScreenProps } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'Shop'>;

export function ShopScreen(_props: RootStackScreenProps<'Shop'>) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pageTab, setPageTab] = useState<'shops' | 'materials'>(route.params?.initialTab ?? 'shops');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Shops & Materials</Text>
          <Text style={styles.sub}>NEXGEN Market · nearby verified vendors</Text>
        </View>
        <Pressable style={styles.menuBtn} onPress={() => setMenuOpen(true)} hitSlop={12}>
          <Ionicons name="ellipsis-vertical" size={22} color={colors.white} />
        </Pressable>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.menuSheet}>
            <Pressable
              style={styles.menuCard}
              onPress={() => {
                setMenuOpen(false);
                navigation.navigate('ShopJoin');
              }}
            >
              <Ionicons name="trending-up-outline" size={24} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuCardTitle}>Grow Your Business</Text>
                <Text style={styles.menuCardSub}>List your shop on NEXGEN Market and get local leads.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.grey} />
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <View style={styles.pageTabRow}>
        <Pressable
          style={[styles.pageTabItem, pageTab === 'shops' && styles.pageTabItemOn]}
          onPress={() => setPageTab('shops')}
        >
          <Text style={[styles.pageTabTxt, pageTab === 'shops' && styles.pageTabTxtOn]}>Shops</Text>
        </Pressable>
        <Pressable
          style={[styles.pageTabItem, pageTab === 'materials' && styles.pageTabItemOn]}
          onPress={() => setPageTab('materials')}
        >
          <Text style={[styles.pageTabTxt, pageTab === 'materials' && styles.pageTabTxtOn]}>Materials & Rentals</Text>
        </Pressable>
      </View>

      {pageTab === 'materials' ? <MaterialsTabContent /> : <ShopListContent />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  menuBtn: { padding: spacing.xs },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  menuSheet: { position: 'absolute', top: spacing.xl + 20, right: spacing.md, width: 260 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuCardTitle: { fontWeight: '800', color: colors.charcoal, fontSize: 14 },
  menuCardSub: { color: colors.grey, fontSize: 11, marginTop: 2 },
  pageTabRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  pageTabItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
    backgroundColor: colors.greyLight,
  },
  pageTabItemOn: { backgroundColor: colors.primary },
  pageTabTxt: { fontWeight: '700', color: colors.charcoal, fontSize: 13 },
  pageTabTxtOn: { color: colors.white },
  title: { fontSize: 22, fontWeight: '800', color: colors.white },
  sub: { color: 'rgba(255,255,255,0.9)', marginTop: 4, fontSize: 13 },
});
