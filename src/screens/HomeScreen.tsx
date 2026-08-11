import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { HomeAdBanner } from '../components/home/HomeAdBanner';
import { PopularServicesGrid } from '../components/home/PopularServicesGrid';
import { SearchFilterModal, type SearchFilters } from '../components/home/SearchFilterModal';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { MAIN_CATEGORIES, type MainCategory } from '../data/serviceCatalog';
import type { CatalogService } from '../mock/types';
import { catalogService } from '../services/catalogService';
import { notificationService } from '../services/notificationService';
import { incrementSearchQueryCount } from '../lib/localStorage';
import { t } from '../i18n/strings';
import type { RootStackParamList } from '../navigation/types';
import type { MainTabScreenProps } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_FILTERS: SearchFilters = {
  radiusKm: 5,
  minRating: 0,
  categoryId: null,
  onlineOnly: false,
};

export function HomeScreen(_props: MainTabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { language } = useAuth();
  const [location] = useState('Danavaipeta, Rajahmundry');
  const [search, setSearch] = useState('');
  const [topRated, setTopRated] = useState<CatalogService[]>([]);
  const [catalog, setCatalog] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, all] = await Promise.all([
        catalogService.getTopRated(8),
        catalogService.getCatalog(),
      ]);
      setTopRated(tr);
      setCatalog(all);
    } finally {
      setLoading(false);
    }
  }, []);

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
      void loadUnread();
    }, [loadUnread]),
  );

  const onSearch = useCallback(async () => {
    await incrementSearchQueryCount();
    navigation.navigate('ServiceList', {
      bucketId: filters.categoryId as CatalogService['bucketId'] | null,
      title: search.trim() || 'Search results',
      searchQuery: search.trim() || undefined,
    });
  }, [navigation, search, filters.categoryId]);

  const onCategoryPress = useCallback(
    (category: MainCategory) => {
      if (category.id === 'life_health') {
        navigation.navigate('HealthcareEmergencies');
        return;
      }
      navigation.navigate('CategoryServices', { categoryId: category.id });
    },
    [navigation],
  );

  const onPopularPress = useCallback(
    (item: { service?: CatalogService; searchTerms: string[]; name: string }) => {
      if (item.service) {
        navigation.navigate('ServiceProviders', { serviceId: item.service.id });
        return;
      }
      navigation.navigate('ServiceList', {
        bucketId: null,
        title: item.name,
        searchQuery: item.searchTerms[0],
      });
    },
    [navigation],
  );

  const applyFilters = (next: SearchFilters) => {
    setFilters(next);
    setFilterOpen(false);
    navigation.navigate('ServiceList', {
      bucketId: next.categoryId as CatalogService['bucketId'] | null,
      title: 'Filtered services',
      searchQuery: search.trim() || undefined,
    });
  };

  const categories = useMemo(() => MAIN_CATEGORIES, []);

  const filteredTopRated = useMemo(() => {
    return topRated.filter((item) => {
      if (filters.minRating > 0 && item.rating < filters.minRating) return false;
      if (filters.categoryId && item.bucketId !== filters.categoryId) return false;
      if (filters.onlineOnly && !item.partner?.isOnline) return false;
      return true;
    });
  }, [topRated, filters]);

  if (loading && topRated.length === 0) {
    return <ScreenLoader />;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <View style={styles.brandBlock}>
          <Text style={styles.brandName}>KAIRO</Text>
        </View>
        <View style={[styles.headerSide, styles.headerActions]}>
          <Pressable onPress={() => navigation.navigate('Notifications')} style={styles.bellWrap} hitSlop={8}>
            <Ionicons name="notifications-outline" size={24} color={colors.charcoal} />
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={colors.grey} />
            <TextInput
              style={styles.searchIn}
              placeholder={t(language, 'searchPlaceholder')}
              placeholderTextColor={colors.grey}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={onSearch}
              returnKeyType="search"
            />
            <Pressable onPress={() => Alert.alert('Voice search', 'Voice search will be available in a future update.')} hitSlop={8}>
              <Ionicons name="mic-outline" size={20} color={colors.navy} />
            </Pressable>
          </View>
          <Pressable style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
            <Ionicons name="options-outline" size={22} color={colors.navy} />
          </Pressable>
        </View>

        <View style={styles.bannerWrap}>
          <HomeAdBanner locationLabel={location} />
        </View>

        <View style={styles.rowTitle}>
          <Text style={styles.h2}>{t(language, 'chooseService')}</Text>
        </View>
        <Text style={styles.muted}>{t(language, 'expertsIn')}</Text>
        <CategoryGrid categories={categories} language={language} onCategoryPress={onCategoryPress} />

        <View style={styles.shopExoRow}>
          <Pressable
            style={styles.shopExoCard}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Store' })}
          >
            <View style={styles.marketIcon}>
              <Ionicons name="storefront-outline" size={22} color={colors.primary} />
            </View>
            <Text style={styles.marketTitle}>Shop</Text>
          </Pressable>
          <Pressable
            style={styles.shopExoCard}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Store' })}
          >
            <View style={styles.marketIcon}>
              <Ionicons name="swap-horizontal-outline" size={22} color={colors.primary} />
            </View>
            <Text style={styles.marketTitle}>EXO</Text>
            <Text style={styles.marketSub}>Buy or Sell</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Popular services</Text>
        <PopularServicesGrid catalog={catalog} onItemPress={onPopularPress} />

        <View style={styles.rowTitle}>
          <Text style={styles.h2}>{t(language, 'topRated')}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {filteredTopRated.map((item) => (
            <Pressable
              key={item.id}
              style={styles.topCard}
              onPress={() => navigation.navigate('ServiceProviders', { serviceId: item.id })}
            >
              <View style={styles.topPhoto}>
                <Text style={styles.topPhotoTxt}>{item.partner.name[0]}</Text>
              </View>
              <Text style={styles.topName} numberOfLines={1}>{item.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>KAIRO</Text>
          <Text style={styles.footerTag}>Your trusted home services platform — Andhra Pradesh</Text>
          <Text style={styles.footerLink}>support@kairo.com · +91 98765 43210</Text>
        </View>
      </ScrollView>

      <SearchFilterModal
        visible={filterOpen}
        initial={filters}
        onClose={() => setFilterOpen(false)}
        onApply={applyFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerSide: { flex: 1 },
  brandBlock: { alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 28, fontWeight: '900', color: colors.navy, letterSpacing: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.sm },
  bellWrap: { padding: 4, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeTxt: { color: colors.white, fontSize: 10, fontWeight: '800' },
  profileRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: { color: colors.white, fontWeight: '800', fontSize: 13 },
  scroll: { paddingBottom: spacing.xl, paddingTop: 0 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    gap: 10,
  },
  bannerWrap: {
    marginBottom: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    minHeight: 48,
  },
  searchIn: { flex: 1, paddingVertical: spacing.sm, fontSize: 15, color: colors.charcoal },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopExoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  shopExoCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  marketIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketTitle: { fontWeight: '900', fontSize: 16, color: colors.navy, letterSpacing: 0.2 },
  marketSub: { color: colors.grey, fontSize: 12, marginTop: 2 },
  rowTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  h2: { fontSize: 18, fontWeight: '800', color: colors.navy, paddingHorizontal: spacing.md, marginTop: spacing.md },
  muted: { paddingHorizontal: spacing.md, color: colors.grey, marginBottom: spacing.sm },
  sectionTitle: {
    paddingHorizontal: spacing.md,
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  carousel: { paddingHorizontal: spacing.md, gap: spacing.md, paddingBottom: spacing.md },
  topCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  topPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  topPhotoTxt: { fontWeight: '800', color: colors.primary },
  topName: { fontWeight: '700', fontSize: 14, color: colors.charcoal },
  topRate: { fontSize: 13, color: colors.grey, marginTop: 2 },
  topPrice: { fontSize: 15, fontWeight: '800', color: colors.primary, marginTop: 4 },
  why: { padding: spacing.md },
  whyRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  whyIcon: { fontSize: 24 },
  whyTitle: { fontWeight: '700', color: colors.charcoal },
  whySub: { color: colors.grey, fontSize: 13, marginTop: 2 },
  footer: { padding: spacing.xl, alignItems: 'center', backgroundColor: colors.greyLight },
  footerBrand: { fontWeight: '900', fontSize: 18, color: colors.primary },
  footerTag: { color: colors.grey, textAlign: 'center', marginTop: spacing.sm },
  footerLink: { color: colors.charcoal, marginTop: spacing.md, fontSize: 13 },
});
