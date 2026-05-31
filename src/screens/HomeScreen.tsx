import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { HomeBannerCarousel } from '../components/home/HomeBannerCarousel';
import { PopularServicesGrid } from '../components/home/PopularServicesGrid';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { MAIN_CATEGORIES, type MainCategory } from '../data/serviceCatalog';
import type { CatalogService } from '../mock/types';
import { catalogService } from '../services/catalogService';
import { t } from '../i18n/strings';
import type { RootStackParamList } from '../navigation/types';
import type { MainTabScreenProps } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen(_props: MainTabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { language } = useAuth();
  const [location] = useState('Danavaipeta, Rajahmundry');
  const [search, setSearch] = useState('');
  const [topRated, setTopRated] = useState<CatalogService[]>([]);
  const [catalog, setCatalog] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    load();
  }, [load]);

  const onSearch = useCallback(() => {
    navigation.navigate('ServiceList', {
      bucketId: null,
      title: search.trim() || 'Search results',
      searchQuery: search.trim() || undefined,
    });
  }, [navigation, search]);

  const onCategoryPress = useCallback(
    (category: MainCategory) => {
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

  const categories = useMemo(() => MAIN_CATEGORIES, []);

  if (loading && topRated.length === 0) {
    return <ScreenLoader />;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <View style={styles.brandRow}>
            <View style={styles.miniLogo}>
              <Text style={styles.miniN}>N</Text>
            </View>
            <View>
              <Text style={styles.brand}>NEXGEN</Text>
              <Pressable onPress={() => {}} style={styles.locRow}>
                <Ionicons name="location-outline" size={16} color={colors.primary} />
                <Text style={styles.loc} numberOfLines={1}>
                  {location}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Notifications')}
          style={styles.headerAction}
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={26} color={colors.charcoal} />
        </Pressable>
      </View>

      <HomeBannerCarousel locationLabel={location} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.banner}>
          <Text style={styles.bannerTxt}>NEXGEN — Rajahmundry & Guntur</Text>
          <Text style={styles.bannerSub}>Verified professionals at your doorstep</Text>
        </View>

        <View style={styles.searchRow}>
          <Pressable style={styles.mic}>
            <Ionicons name="mic-outline" size={22} color={colors.primary} />
          </Pressable>
          <TextInput
            style={styles.searchIn}
            placeholder={t(language, 'searchPlaceholder')}
            placeholderTextColor={colors.grey}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={onSearch}
            returnKeyType="search"
          />
          <Pressable onPress={() => navigation.navigate('ServiceList', { bucketId: null })}>
            <Ionicons name="options-outline" size={22} color={colors.charcoal} />
          </Pressable>
        </View>

        <View style={styles.rowTitle}>
          <Text style={styles.h2}>{t(language, 'chooseService')}</Text>
          <Pressable onPress={() => navigation.navigate('AllServices')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        <Text style={styles.muted}>{t(language, 'expertsIn')}</Text>
        <CategoryGrid
          categories={categories}
          language={language}
          onCategoryPress={onCategoryPress}
        />

        <Text style={styles.sectionTitle}>Popular services</Text>
        <PopularServicesGrid catalog={catalog} onItemPress={onPopularPress} />

        <View style={styles.rowTitle}>
          <Text style={styles.h2}>{t(language, 'topRated')}</Text>
          <Text style={styles.sort}>Sort</Text>
        </View>
        <FlatList
          horizontal
          data={topRated}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={styles.carousel}
          renderItem={({ item }) => (
            <Pressable
              style={styles.topCard}
              onPress={() => navigation.navigate('ServiceProviders', { serviceId: item.id })}
            >
              <View style={styles.topPhoto}>
                <Text style={styles.topPhotoTxt}>{item.partner.name[0]}</Text>
              </View>
              <Text style={styles.topName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.topRate}>★ {item.rating.toFixed(1)}</Text>
              <Text style={styles.topPrice}>from ₹{item.basePrice}</Text>
            </Pressable>
          )}
        />

        <Text style={styles.h2}>Why choose NEXGEN?</Text>
        <View style={styles.why}>
          {[
            ['🔍', 'Verified Partners', 'Background verified professionals'],
            ['💯', 'Quality Service', 'Top-rated with proven track record'],
            ['⚡', 'Quick Response', 'Within 30 minutes of booking'],
            ['💰', 'Best Prices', 'Transparent pricing, no hidden charges'],
          ].map(([icon, t1, t2]) => (
            <View key={String(t1)} style={styles.whyRow}>
              <Text style={styles.whyIcon}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.whyTitle}>{t1}</Text>
                <Text style={styles.whySub}>{t2}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>NEXGEN</Text>
          <Text style={styles.footerTag}>Your trusted home services platform — Andhra Pradesh</Text>
          <Text style={styles.footerLink}>support@nexgen.com · +91 98765 43210</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  miniLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniN: { color: colors.white, fontWeight: '900', fontSize: 20 },
  brand: { fontSize: 16, fontWeight: '900', color: colors.primary },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 220 },
  loc: { fontSize: 12, color: colors.grey },
  headerAction: { paddingTop: 2 },
  scroll: { paddingBottom: spacing.xl },
  banner: {
    margin: spacing.md,
    backgroundColor: colors.orangeTint,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  bannerTxt: { fontWeight: '800', color: colors.charcoal, fontSize: 16 },
  bannerSub: { color: colors.grey, marginTop: 4 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  mic: { padding: spacing.sm },
  searchIn: { flex: 1, paddingVertical: spacing.md, fontSize: 15, color: colors.charcoal },
  rowTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  h2: { fontSize: 18, fontWeight: '800', color: colors.charcoal, paddingHorizontal: spacing.md, marginTop: spacing.md },
  seeAll: { color: colors.primary, fontWeight: '700' },
  muted: { paddingHorizontal: spacing.md, color: colors.grey, marginBottom: spacing.sm },
  sectionTitle: {
    paddingHorizontal: spacing.md,
    fontSize: 18,
    fontWeight: '800',
    color: colors.charcoal,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sort: { color: colors.primary, fontWeight: '600' },
  carousel: { paddingHorizontal: spacing.md, gap: spacing.md, paddingBottom: spacing.md },
  topCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginRight: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  topPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  topPhotoTxt: { fontWeight: '800', color: colors.primary },
  topName: { fontWeight: '700', fontSize: 14 },
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
