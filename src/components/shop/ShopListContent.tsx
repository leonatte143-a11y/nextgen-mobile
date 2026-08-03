import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../PrimaryButton';
import { ScreenLoader } from '../ScreenLoader';
import { colors, radius, spacing } from '../../constants/theme';
import { getCurrentCoords, requestLocationPermission } from '../../services/locationService';
import { shopService } from '../../services/shopService';
import type { ShopCategory, ShopSummary } from '../../types/shop';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function ShopCard({ item, onPress }: { item: ShopSummary; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardIcon}>
        <Ionicons name="storefront-outline" size={26} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.shopName}</Text>
          {item.isFeatured ? <Text style={styles.featuredBadge}>Verified</Text> : null}
        </View>
        <Text style={styles.cardMeta}>{item.categoryName} · ★ {item.rating.toFixed(1)} · {item.distanceLabel}</Text>
        {item.partnerNearby ? (
          <View style={styles.partnerBadge}>
            <Text style={styles.partnerBadgeTxt}>
              Partner nearby{item.nearbyPartnerName ? ` · ${item.nearbyPartnerName}` : ''}
            </Text>
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.grey} />
    </Pressable>
  );
}

export function ShopListContent() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [featured, setFeatured] = useState<ShopSummary[]>([]);
  const [recommended, setRecommended] = useState<ShopSummary[]>([]);
  const [items, setItems] = useState<ShopSummary[]>([]);
  const [recommendedForJob, setRecommendedForJob] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let lat = coords?.lat;
      let lng = coords?.lng;
      if (!lat || !lng) {
        const ok = await requestLocationPermission();
        if (ok) {
          const c = await getCurrentCoords();
          if (c) {
            lat = c.latitude;
            lng = c.longitude;
            setCoords({ lat, lng });
          }
        }
      }
      const [cats, data] = await Promise.all([
        shopService.getCategories(),
        shopService.listNearby({
          lat,
          lng,
          q: search.trim() || undefined,
          categoryId: filterCat || undefined,
          radiusKm: 10,
        }),
      ]);
      setCategories(cats);
      setFeatured(data.featured);
      setRecommended(data.recommended);
      setItems(data.items);
      setRecommendedForJob(data.recommendedForJob);
    } catch {
      setItems([]);
      setFeatured([]);
      setRecommended([]);
    } finally {
      setLoading(false);
    }
  }, [coords, filterCat, search]);

  useEffect(() => {
    load();
  }, [load]);

  const displayItems = useMemo(() => {
    if (search.trim() || filterCat) return items;
    const ids = new Set<string>();
    const merged: ShopSummary[] = [];
    for (const s of [...featured, ...items]) {
      if (!ids.has(s.id)) {
        ids.add(s.id);
        merged.push(s);
      }
    }
    return merged;
  }, [featured, items, search, filterCat]);

  if (loading && items.length === 0) return <ScreenLoader />;

  return (
    <>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.grey} />
          <TextInput
            style={styles.searchIn}
            placeholder="Search paints, cables, PVC pipes…"
            placeholderTextColor={colors.grey}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => load()}
            returnKeyType="search"
          />
        </View>
      </View>

      <FlatList
        data={displayItems}
        keyExtractor={(x) => x.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {recommendedForJob && recommended.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommended for your current job</Text>
                {recommended.map((s) => (
                  <ShopCard
                    key={s.id}
                    item={s}
                    onPress={() => navigation.navigate('ShopDetail', { shopId: s.id })}
                  />
                ))}
              </View>
            ) : null}
            {!search.trim() && !filterCat && featured.length > 0 ? (
              <Text style={styles.sectionTitle}>KAIRO Verified Shops</Text>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <ShopCard item={item} onPress={() => navigation.navigate('ShopDetail', { shopId: item.id })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No shops found nearby. Try another search.</Text>}
        ListFooterComponent={
          <View style={styles.joinBlock}>
            <View style={styles.joinDisabled} pointerEvents="none">
              <Text style={styles.joinTitle}>Grow your business?</Text>
              <Text style={styles.joinSub}>
                Get more local leads from our users and service partners in Rajahmundry & Guntur.
              </Text>
              <PrimaryButton title="Join KAIRO" onPress={() => undefined} disabled />
            </View>
            <View style={styles.comingSoonOverlay}>
              <Text style={styles.comingSoonTxt}>Coming Soon</Text>
            </View>
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  searchRow: { padding: spacing.md, backgroundColor: colors.white },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.greyLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchIn: { flex: 1, fontSize: 15, color: colors.charcoal },
  catRow: { maxHeight: 48, backgroundColor: colors.white },
  catIn: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  catPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.greyLight,
    marginRight: spacing.sm,
  },
  catPillOn: { backgroundColor: colors.primary },
  catPillTxt: { fontWeight: '600', color: colors.charcoal, fontSize: 13 },
  catPillTxtOn: { color: colors.white },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontWeight: '800', fontSize: 16, color: colors.navy, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontWeight: '800', color: colors.charcoal, flex: 1, fontSize: 15 },
  featuredBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: colors.orangeTint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardMeta: { color: colors.grey, fontSize: 12, marginTop: 4 },
  partnerBadge: {
    marginTop: 6,
    backgroundColor: colors.trustTeal + '18',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  partnerBadgeTxt: { fontSize: 11, fontWeight: '700', color: colors.trustTeal },
  empty: { textAlign: 'center', color: colors.grey, marginTop: spacing.xl },
  joinBlock: {
    marginTop: spacing.lg,
    backgroundColor: colors.orangeTint,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
    position: 'relative',
  },
  joinDisabled: { padding: spacing.lg, opacity: 0.35 },
  joinTitle: { fontWeight: '800', fontSize: 17, color: colors.navy },
  joinSub: { color: colors.grey, marginTop: spacing.sm, marginBottom: spacing.md, lineHeight: 20 },
  comingSoonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  comingSoonTxt: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.navy,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
});
