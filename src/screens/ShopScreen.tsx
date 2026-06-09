import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { CatalogService } from '../mock/types';
import { catalogService } from '../services/catalogService';
import type { MainTabScreenProps } from '../navigation/types';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ShopScreen(_props: MainTabScreenProps<'Shop'>) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await catalogService.getCatalog();
      const shopItems = all.filter(
        (s) => s.bucketId === 'tech_supply' || s.categoryLabel?.toLowerCase().includes('supply'),
      );
      setItems(shopItems.length ? shopItems : all.slice(0, 12));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <ScreenLoader />;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>NEXGEN Shop</Text>
        <Text style={styles.sub}>Marketplace · supplies & tech services</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('ServiceProviders', { serviceId: item.id })}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="cube-outline" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.categoryLabel} · ★ {item.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.price}>₹{item.basePrice}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No marketplace items yet. Check back soon.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.white },
  sub: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 13 },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontWeight: '700', color: colors.charcoal, fontSize: 15 },
  meta: { color: colors.grey, fontSize: 12, marginTop: 2 },
  price: { fontWeight: '800', color: colors.primary, fontSize: 15 },
  empty: { textAlign: 'center', color: colors.grey, marginTop: spacing.xl },
});
