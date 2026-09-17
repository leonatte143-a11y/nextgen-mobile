import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, spacing } from '../../constants/theme';
import { MARKETPLACE_FIXED_CATEGORIES } from '../../constants/marketplaceCategories';
import { useTypewriterPlaceholder } from '../../hooks/useTypewriterPlaceholder';

const EXO_SEARCH_TERMS = ['Cars', 'Bikes', 'Furniture', 'Properties', 'Mobiles'];
import { useMarketplaceFavorites } from '../../context/MarketplaceFavoritesContext';
import { getCoordsIfPermitted } from '../../services/locationService';
import { marketplaceService } from '../../services/marketplaceService';
import { notificationService } from '../../services/notificationService';
import type { MarketplaceCategory, MarketplaceListing } from '../../types/marketplace';
import type { RootStackParamList } from '../../navigation/types';
import { ExoBottomBar } from './ExoBottomBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** ₹ 10,50,000 — Indian lakh/crore digit grouping. */
function formatINR(amount: number): string {
  return `₹ ${new Intl.NumberFormat('en-IN').format(Math.round(amount))}`;
}

function ListingCard({ item, onPress }: { item: MarketplaceListing; onPress: () => void }) {
  const { isFavorite, toggleFavorite } = useMarketplaceFavorites();
  const favorited = isFavorite(item.id);
  const priceLabel =
    item.listingType === 'rent' ? `${formatINR(item.rentPricePerDay ?? 0)}/day` : formatINR(item.price ?? 0);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        {item.photos?.[0] ? (
          <Image source={{ uri: item.photos[0] }} style={styles.image} contentFit="cover" />
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
      <View style={styles.cardBody}>
        <Text style={styles.price}>{priceLabel}</Text>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.footerLocation}>
            <Ionicons name="location-outline" size={12} color={colors.grey} />
            <Text style={styles.meta} numberOfLines={1}>{(item.city || 'Nearby').toUpperCase()}</Text>
          </View>
          {item.contactPhone ? (
            <Pressable
              style={styles.callBtn}
              onPress={() => Linking.openURL(`tel:${item.contactPhone}`)}
              hitSlop={8}
            >
              <Ionicons name="call" size={14} color={colors.white} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export function MaterialsTabContent({ header, locationLabel }: { header?: React.ReactNode; locationLabel?: string }) {
  const navigation = useNavigation<Nav>();
  const { favoriteIds } = useMarketplaceFavorites();
  const [search, setSearch] = useState('');
  const animatedPlaceholder = useTypewriterPlaceholder(EXO_SEARCH_TERMS, "Search for '", search.length > 0);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);
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

  const onPressFixedCategory = (name: string) => {
    if (activeCategoryName === name) {
      setActiveCategoryName(null);
      setCategoryId(null);
      setSearch('');
      return;
    }
    setActiveCategoryName(name);
    setSearch('');
    const match = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (match) {
      setCategoryId(match.id);
    } else {
      // No matching backend category registered yet — fall back to a text search on the name.
      setCategoryId(null);
      setSearch(name);
    }
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={visibleListings}
        keyExtractor={(l) => l.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
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
                  placeholder={animatedPlaceholder}
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

            <View style={styles.categoryGrid}>
              {MARKETPLACE_FIXED_CATEGORIES.map((c) => {
                const isOn = activeCategoryName === c.name;
                return (
                  <Pressable key={c.name} style={styles.categoryTile} onPress={() => onPressFixedCategory(c.name)}>
                    <View style={[styles.categorySquare, isOn && styles.categorySquareOn]}>
                      <Ionicons name={c.icon} size={26} color={isOn ? colors.primary : colors.charcoal} />
                    </View>
                    <Text style={styles.categoryLabel} numberOfLines={1}>{c.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fresh recommendations</Text>
              <Pressable
                onPress={() => {
                  setCategoryId(null);
                  setActiveCategoryName(null);
                  setSearch('');
                  setFavoritesOnly(false);
                }}
                hitSlop={8}
              >
                <Text style={styles.seeAll}>See All &gt;</Text>
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  categoryTile: { alignItems: 'center', width: '20%', marginBottom: spacing.md },
  categorySquare: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySquareOn: { backgroundColor: colors.orangeTint },
  categoryLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: colors.charcoal,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.charcoal },
  seeAll: { fontSize: 13, fontWeight: '700', color: colors.categoryTagPurple },
  grid: { paddingHorizontal: spacing.md, paddingBottom: 24 },
  gridRow: { gap: spacing.sm },
  empty: { textAlign: 'center', color: colors.grey, marginTop: spacing.xl },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 6,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  cardBody: { padding: 8, flex: 1 },
  imageWrap: { height: 140, backgroundColor: colors.greyLight },
  image: { width: '100%', height: '100%' },
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
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  price: { fontWeight: '800', color: colors.charcoal, fontSize: 16 },
  title: { fontWeight: '500', color: colors.charcoal, fontSize: 13, marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: spacing.sm,
  },
  footerLocation: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1, marginRight: spacing.sm },
  meta: { color: colors.grey, fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  callBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
