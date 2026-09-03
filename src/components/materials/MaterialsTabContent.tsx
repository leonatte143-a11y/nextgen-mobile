import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { HomeAdBanner } from '../home/HomeAdBanner';
import { colors, radius, spacing } from '../../constants/theme';
import { useMarketplaceFavorites } from '../../context/MarketplaceFavoritesContext';
import { getCoordsIfPermitted } from '../../services/locationService';
import { marketplaceService } from '../../services/marketplaceService';
import { notificationService } from '../../services/notificationService';
import type { MarketplaceCategory, MarketplaceListing } from '../../types/marketplace';
import type { RootStackParamList } from '../../navigation/types';
import { ExoBottomBar } from './ExoBottomBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  vehicle: 'car-outline',
  car: 'car-outline',
  property: 'business-outline',
  real: 'business-outline',
  mobile: 'phone-portrait-outline',
  phone: 'phone-portrait-outline',
  electronic: 'tv-outline',
  furniture: 'bed-outline',
  tool: 'hammer-outline',
  heavy: 'construct-outline',
  construction: 'construct-outline',
  job: 'briefcase-outline',
};

function iconForCategory(name: string): keyof typeof Ionicons.glyphMap {
  const key = name.toLowerCase();
  const match = Object.keys(CATEGORY_ICONS).find((k) => key.includes(k));
  return match ? CATEGORY_ICONS[match] : 'pricetag-outline';
}

function relativeDate(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function ListingCard({ item, onPress }: { item: MarketplaceListing; onPress: () => void }) {
  const { isFavorite, toggleFavorite } = useMarketplaceFavorites();
  const favorited = isFavorite(item.id);
  const priceLabel =
    item.listingType === 'rent' ? `₹${item.rentPricePerDay ?? 0}/day` : `₹${item.price ?? 0}`;
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
        {item.featured ? (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredTxt}>FEATURED</Text>
          </View>
        ) : null}
        <Pressable style={styles.heartBtn} onPress={() => toggleFavorite(item.id)} hitSlop={8}>
          <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={16} color={favorited ? colors.primary : colors.charcoal} />
        </Pressable>
      </View>
      <Text style={styles.price}>{priceLabel}</Text>
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.meta} numberOfLines={1}>
        {(item.city || 'Nearby')} · {relativeDate(item.createdAt)}
      </Text>
    </Pressable>
  );
}

export function MaterialsTabContent({ header, locationLabel }: { header?: React.ReactNode; locationLabel?: string }) {
  const navigation = useNavigation<Nav>();
  const { favoriteIds } = useMarketplaceFavorites();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

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

  const loadUnread = useCallback(async () => {
    try {
      const notes = await notificationService.list();
      setUnreadCount(notes.filter((n) => !n.read).length);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
      loadUnread();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load, loadUnread]),
  );

  const visibleListings = favoritesOnly ? listings.filter((l) => favoriteIds.includes(l.id)) : listings;

  return (
    <View style={styles.root}>
      <FlatList
        data={visibleListings}
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
                  placeholder="Search 'Jobs', 'Mobiles', etc."
                  placeholderTextColor={colors.grey}
                  value={search}
                  onChangeText={setSearch}
                  onSubmitEditing={() => load()}
                  returnKeyType="search"
                />
                <Pressable
                  onPress={() => Alert.alert('Voice search', 'Voice search will be available in a future update.')}
                  hitSlop={8}
                >
                  <Ionicons name="mic-outline" size={18} color={colors.navy} />
                </Pressable>
              </View>
              <Pressable style={styles.iconBtn} onPress={() => setFavoritesOnly((v) => !v)} hitSlop={8}>
                <Ionicons name={favoritesOnly ? 'heart' : 'heart-outline'} size={22} color={favoritesOnly ? colors.primary : colors.charcoal} />
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')} hitSlop={8}>
                <Ionicons name="notifications-outline" size={22} color={colors.charcoal} />
                {unreadCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeTxt}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                ) : null}
              </Pressable>
            </View>

            <View style={styles.bannerWrap}>
              <HomeAdBanner locationLabel={locationLabel || 'Rajahmundry'} />
            </View>

            {categories.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryGrid}
              >
                {[{ id: null, name: 'All' } as { id: string | null; name: string }, ...categories].map((c) => (
                  <Pressable
                    key={c.id ?? 'all'}
                    style={styles.categoryTile}
                    onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
                  >
                    <View style={[styles.categorySquare, categoryId === c.id && styles.categorySquareOn]}>
                      <Ionicons
                        name={c.id ? iconForCategory(c.name) : 'apps-outline'}
                        size={26}
                        color={categoryId === c.id ? colors.primary : colors.charcoal}
                      />
                    </View>
                    <Text style={styles.categoryLabel} numberOfLines={1}>{c.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            <Text style={styles.sectionTitle}>Fresh recommendations</Text>
          </>
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No listings yet. Be the first to post one nearby.</Text> : null
        }
        renderItem={({ item }) => (
          <ListingCard item={item} onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })} />
        )}
      />
      <ExoBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.greyLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchIn: { flex: 1, fontSize: 15, color: colors.charcoal },
  iconBtn: { padding: 4, position: 'relative' },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeTxt: { color: colors.white, fontSize: 9, fontWeight: '800' },
  bannerWrap: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    maxWidth: 900,
  },
  categoryTile: { alignItems: 'center', width: 72 },
  categorySquare: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySquareOn: { backgroundColor: colors.orangeTint },
  categoryLabel: { marginTop: 4, fontSize: 11, fontWeight: '600', color: colors.charcoal, textAlign: 'center' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.charcoal,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  grid: { paddingHorizontal: spacing.md, paddingBottom: 24 },
  empty: { textAlign: 'center', color: colors.grey, marginTop: spacing.xl },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageWrap: { height: 110, backgroundColor: colors.greyLight },
  image: { width: '100%', height: '100%', borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md },
  imageFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  featuredBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FFD84D',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  featuredTxt: { color: '#1A1A1A', fontWeight: '800', fontSize: 9 },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: { fontWeight: '800', color: colors.charcoal, fontSize: 14, marginHorizontal: spacing.sm, marginTop: spacing.sm },
  title: { fontWeight: '600', color: colors.charcoal, fontSize: 13, marginHorizontal: spacing.sm, marginTop: 2 },
  meta: { color: colors.grey, fontSize: 11, marginHorizontal: spacing.sm, marginTop: 2, marginBottom: spacing.sm },
});
