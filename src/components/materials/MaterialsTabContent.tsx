import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import { getCoordsIfPermitted } from '../../services/locationService';
import { marketplaceService } from '../../services/marketplaceService';
import type { ListingType, MarketplaceCategory, MarketplaceListing } from '../../types/marketplace';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TYPE_FILTERS: { label: string; value: ListingType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Rentals', value: 'rent' },
  { label: 'Classifieds', value: 'sell' },
  { label: 'Resale', value: 'resale' },
];

const BADGE_LABEL: Record<ListingType, string> = { rent: 'RENT', sell: 'SELL', resale: 'RE-SELL' };
const BADGE_COLOR: Record<ListingType, string> = { rent: colors.trustTeal, sell: colors.primary, resale: colors.premiumGold };

function ListingCard({ item, onPress }: { item: MarketplaceListing; onPress: () => void }) {
  const priceLabel =
    item.listingType === 'rent'
      ? `₹${item.rentPricePerDay ?? 0}/day · ₹${item.depositAmount ?? 0} deposit`
      : `₹${item.price ?? 0}`;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        {item.photos?.[0] ? (
          <Image source={{ uri: item.photos[0] }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="image-outline" size={28} color={colors.grey} />
          </View>
        )}
        <View style={[styles.badge, { backgroundColor: BADGE_COLOR[item.listingType] }]}>
          <Text style={styles.badgeTxt}>{BADGE_LABEL[item.listingType]}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.price}>{priceLabel}</Text>
      <Text style={styles.meta} numberOfLines={1}>
        {item.distanceKm != null ? `${item.distanceKm} km away` : item.city || 'Nearby'}
      </Text>
    </Pressable>
  );
}

export function MaterialsTabContent() {
  const navigation = useNavigation<Nav>();
  const [typeFilter, setTypeFilter] = useState<ListingType | 'all'>('all');
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const coords = await getCoordsIfPermitted();
      const [cats, items] = await Promise.all([
        marketplaceService.getCategories(),
        marketplaceService.listListings({
          listingType: typeFilter === 'all' ? undefined : typeFilter,
          categoryId: categoryId || undefined,
          lat: coords?.latitude,
          lng: coords?.longitude,
        }),
      ]);
      setCategories(cats);
      setListings(items);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, categoryId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.root}>
      <FlatList
        horizontal
        data={TYPE_FILTERS}
        keyExtractor={(t) => t.value}
        style={styles.filterRow}
        contentContainerStyle={styles.filterIn}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.pill, typeFilter === item.value && styles.pillOn]}
            onPress={() => setTypeFilter(item.value)}
          >
            <Text style={[styles.pillTxt, typeFilter === item.value && styles.pillTxtOn]}>{item.label}</Text>
          </Pressable>
        )}
      />
      <FlatList
        horizontal
        data={[{ id: '', name: 'All categories' }, ...categories]}
        keyExtractor={(c) => c.id || 'all'}
        style={styles.filterRow}
        contentContainerStyle={styles.filterIn}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.catPill, (categoryId === item.id || (!item.id && !categoryId)) && styles.pillOn]}
            onPress={() => setCategoryId(item.id || null)}
          >
            <Text style={[styles.pillTxt, (categoryId === item.id || (!item.id && !categoryId)) && styles.pillTxtOn]}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />
      <FlatList
        data={listings}
        keyExtractor={(l) => l.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.sm }}
        contentContainerStyle={styles.grid}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No listings yet. Be the first to post one nearby.</Text> : null
        }
        renderItem={({ item }) => (
          <ListingCard item={item} onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })} />
        )}
      />
      <Pressable style={styles.fab} onPress={() => navigation.navigate('PostListing')}>
        <Ionicons name="add" size={22} color={colors.white} />
        <Text style={styles.fabTxt}>Post Ad</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filterRow: { maxHeight: 44, backgroundColor: colors.white },
  filterIn: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.greyLight,
    marginRight: spacing.sm,
  },
  catPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.greyLight,
    marginRight: spacing.sm,
  },
  pillOn: { backgroundColor: colors.primary },
  pillTxt: { fontWeight: '600', color: colors.charcoal, fontSize: 12 },
  pillTxtOn: { color: colors.white },
  grid: { padding: spacing.md, paddingBottom: 100 },
  empty: { textAlign: 'center', color: colors.grey, marginTop: spacing.xl },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageWrap: { height: 110, backgroundColor: colors.greyLight },
  image: { width: '100%', height: '100%' },
  imageFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 6, left: 6, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeTxt: { color: colors.white, fontWeight: '800', fontSize: 10 },
  title: { fontWeight: '700', color: colors.charcoal, fontSize: 13, marginTop: spacing.sm, marginHorizontal: spacing.sm },
  price: { fontWeight: '800', color: colors.primary, fontSize: 13, marginHorizontal: spacing.sm, marginTop: 2 },
  meta: { color: colors.grey, fontSize: 11, marginHorizontal: spacing.sm, marginTop: 2, marginBottom: spacing.sm },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    elevation: 4,
  },
  fabTxt: { color: colors.white, fontWeight: '800' },
});
