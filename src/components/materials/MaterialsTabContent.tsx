import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import { getCoordsIfPermitted } from '../../services/locationService';
import { marketplaceService } from '../../services/marketplaceService';
import type { MarketplaceCategory, MarketplaceListing } from '../../types/marketplace';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BADGE_LABEL: Record<string, string> = { rent: 'RENT', sell: 'SELL', resale: 'RE-SELL' };
const BADGE_COLOR: Record<string, string> = { rent: colors.trustTeal, sell: colors.primary, resale: colors.premiumGold };

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

export function MaterialsTabContent({ header }: { header?: React.ReactNode }) {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const coords = await getCoordsIfPermitted();
      const [cats, items] = await Promise.all([
        marketplaceService.getCategories(),
        marketplaceService.listListings({
          categoryId: categoryId || undefined,
          q: search.trim() || undefined,
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
  }, [categoryId, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.root}>
      <FlatList
        data={listings}
        keyExtractor={(l) => l.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.sm }}
        contentContainerStyle={styles.grid}
        refreshing={loading}
        onRefresh={load}
        ListHeaderComponent={
          <>
            {header}
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color={colors.grey} />
                <TextInput
                  style={styles.searchIn}
                  placeholder="Search materials, tools, rentals…"
                  placeholderTextColor={colors.grey}
                  value={search}
                  onChangeText={setSearch}
                  onSubmitEditing={() => load()}
                  returnKeyType="search"
                />
              </View>
              <Pressable style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
                <Ionicons name="options-outline" size={20} color={colors.white} />
              </Pressable>
            </View>
          </>
        }
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

      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setFilterOpen(false)}>
          <View style={styles.modalCard}>
            <Pressable
              style={styles.modalRow}
              onPress={() => {
                setCategoryId(null);
                setFilterOpen(false);
              }}
            >
              <Ionicons name="apps-outline" size={20} color={colors.primary} />
              <Text style={styles.modalRowTxt}>All</Text>
              {!categoryId ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
            </Pressable>
            <Pressable
              style={styles.modalRow}
              onPress={() => {
                setFilterOpen(false);
                setCategoryPickerOpen(true);
              }}
            >
              <Ionicons name="pricetags-outline" size={20} color={colors.primary} />
              <Text style={styles.modalRowTxt}>Categories</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.grey} />
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={categoryPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryPickerOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCategoryPickerOpen(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Categories</Text>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                style={styles.modalRow}
                onPress={() => {
                  setCategoryId(c.id);
                  setCategoryPickerOpen(false);
                }}
              >
                <Text style={styles.modalRowTxt}>{c.name}</Text>
                {categoryId === c.id ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.greyLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchIn: { flex: 1, fontSize: 15, color: colors.charcoal },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.lg },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, maxHeight: '70%' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: colors.charcoal, padding: spacing.sm },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  modalRowTxt: { flex: 1, fontWeight: '600', color: colors.charcoal },
});
