import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
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
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { HOME_GRID_TILES } from '../mock/homeGrid';
import { SERVICE_BUCKETS } from '../mock/buckets';
import type { BucketId, CatalogService } from '../mock/types';
import { catalogService } from '../services/catalogService';
import { t } from '../i18n/strings';
import type { RootStackParamList } from '../navigation/types';
import type { MainTabScreenProps } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen(_props: MainTabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user, language } = useAuth();
  const [location, setLocation] = useState('Danavaipeta, Rajahmundry');
  const [search, setSearch] = useState('');
  const [topRated, setTopRated] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [bucket, setBucket] = useState<BucketId | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const tr = await catalogService.getTopRated(8);
      setTopRated(tr);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSearch = async () => {
    navigation.navigate('ServiceList', { bucketId: null, title: search || 'Search results' });
  };

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
        <View style={styles.headerRight}>
          <Pressable onPress={() => navigation.navigate('Notifications')} hitSlop={8}>
            <Ionicons name="notifications-outline" size={26} color={colors.charcoal} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.prof}
            hitSlop={8}
          >
            <Text style={styles.profLetter}>{(user?.firstName?.[0] ?? 'N').toUpperCase()}</Text>
          </Pressable>
        </View>
      </View>

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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buckets}>
          {SERVICE_BUCKETS.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => {
                setBucket(b.id);
                navigation.navigate('ServiceList', { bucketId: b.id, title: b.nameEn });
              }}
              style={[styles.bucket, bucket === b.id && styles.bucketOn]}
            >
              <Text style={styles.bucketEmoji}>{b.emoji}</Text>
              <Text style={styles.bucketTxt} numberOfLines={2}>
                {language === 'te' ? b.nameTe : b.nameEn}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.gridTitle}>Popular services</Text>
        <View style={styles.grid}>
          {HOME_GRID_TILES.map((tile) => (
            <Pressable
              key={tile.id}
              style={styles.gridItem}
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: tile.serviceId })}
            >
              <Text style={styles.gridEmoji}>{tile.emoji}</Text>
              <Text style={styles.gridLabel} numberOfLines={2}>
                {tile.label}
              </Text>
              <Text style={styles.gridSub} numberOfLines={1}>
                {tile.sub}
              </Text>
            </Pressable>
          ))}
          <Pressable style={styles.gridItem} onPress={() => navigation.navigate('AllServices')}>
            <Text style={styles.gridEmoji}>➕</Text>
            <Text style={styles.gridLabel}>More</Text>
            <Text style={styles.gridSub}>All services</Text>
          </Pressable>
        </View>

        <View style={styles.rowTitle}>
          <Text style={styles.h2}>{t(language, 'topRated')}</Text>
          <Text style={styles.sort}>Sort</Text>
        </View>
        <FlatList
          horizontal
          data={topRated}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
          renderItem={({ item }) => (
            <Pressable
              style={styles.topCard}
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  prof: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profLetter: { fontWeight: '800', color: colors.primary },
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
  h2: { fontSize: 18, fontWeight: '800', color: colors.charcoal },
  seeAll: { color: colors.primary, fontWeight: '700' },
  muted: { paddingHorizontal: spacing.md, color: colors.grey, marginBottom: spacing.sm },
  buckets: { paddingLeft: spacing.md, marginBottom: spacing.md },
  bucket: {
    width: 96,
    padding: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  bucketOn: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.orangeTint },
  bucketEmoji: { fontSize: 22 },
  bucketTxt: { fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 4, color: colors.charcoal },
  gridTitle: { paddingHorizontal: spacing.md, fontWeight: '800', marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.sm },
  gridItem: {
    width: '33.33%',
    padding: spacing.sm,
    alignItems: 'center',
  },
  gridEmoji: { fontSize: 28, color: colors.primary },
  gridLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center', color: colors.charcoal, marginTop: 4 },
  gridSub: { fontSize: 10, color: colors.grey, textAlign: 'center' },
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
