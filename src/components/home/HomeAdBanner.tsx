import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import {
  sortBannersByQueue,
  useAdFadeAnimation,
  useGeoFenceVisibleBanners,
  useSequentialAdIndexState,
} from '../../hooks/useSequentialAds';
import { handleBannerPress } from '../../navigation/bannerActions';
import { bannerService, parseCityFromLocation } from '../../services/bannerService';
import { getCoordsIfPermitted } from '../../services/locationService';
import type { AdvertisementBanner } from '../../types/banner';
import type { RootStackParamList } from '../../navigation/types';
import { BannerSkeleton } from './BannerSkeleton';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  locationLabel: string;
};

const AD_HEIGHT = 184;
const ROTATE_MS = 9_000;

function HomeAdBannerComponent({ locationLabel }: Props) {
  const navigation = useNavigation<Nav>();
  const [banners, setBanners] = useState<AdvertisementBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isManualScroll = useRef(false);
  const visibleBanners = useGeoFenceVisibleBanners(banners);
  const [idx, setIdx] = useSequentialAdIndexState(visibleBanners.length, ROTATE_MS);
  const ad = visibleBanners[idx];
  const fadeOpacity = useAdFadeAnimation(ad?.id);

  const load = useCallback(
    async (force = false) => {
      const city = parseCityFromLocation(locationLabel);
      const coords = await getCoordsIfPermitted();
      const list = await bannerService.getHomeBanners(city, { coords, force });
      setBanners(sortBannersByQueue(list));
      setLoading(false);
    },
    [locationLabel],
  );

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Bypass the 5-minute cache whenever Home regains focus, so a newly-approved partner ad
  // (or an admin publishing a campaign) shows up without a full app restart.
  useFocusEffect(
    useCallback(() => {
      load(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load]),
  );

  // Keep the ScrollView in sync whenever the active index changes programmatically (auto-timer).
  useEffect(() => {
    if (isManualScroll.current) {
      isManualScroll.current = false;
      return;
    }
    if (pageWidth > 0) {
      scrollRef.current?.scrollTo({ x: idx * pageWidth, animated: true });
    }
  }, [idx, pageWidth]);

  const onLayout = (e: LayoutChangeEvent) => {
    setPageWidth(e.nativeEvent.layout.width);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth <= 0) return;
    const newIdx = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    if (newIdx !== idx && newIdx >= 0 && newIdx < visibleBanners.length) {
      isManualScroll.current = true;
      setIdx(newIdx);
    }
  };

  if (loading) {
    return <BannerSkeleton height={AD_HEIGHT} />;
  }

  if (!ad) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>Sponsored</Text>
        <Text style={styles.placeholderSub}>Local offers from KAIRO partners</Text>
      </View>
    );
  }

  return (
    <View>
      <Animated.View style={[styles.wrap, { opacity: fadeOpacity }]} onLayout={onLayout}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEnabled={visibleBanners.length > 1}
        >
          {visibleBanners.map((banner) => {
            const mediaUrl = banner.mediaUrl || banner.imageUrl;
            return (
              <Pressable
                key={banner.id}
                style={({ pressed }) => [styles.card, { width: pageWidth || undefined }, pressed && styles.pressed]}
                onPress={() => handleBannerPress(banner, navigation)}
              >
                {mediaUrl && banner.mediaType !== 'video' ? (
                  <Image source={{ uri: mediaUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                  <View style={styles.imageFallback} />
                )}
                <View style={styles.overlay} />
                <View style={styles.textBlock}>
                  <Text style={styles.sponsored}>Sponsored</Text>
                  <Text style={styles.title} numberOfLines={2}>
                    {banner.title}
                  </Text>
                  {banner.subtitle ? (
                    <Text style={styles.subtitle} numberOfLines={2}>
                      {banner.subtitle}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

export const HomeAdBanner = memo(HomeAdBannerComponent);

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    height: AD_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  card: {
    height: AD_HEIGHT,
    backgroundColor: colors.navy,
  },
  pressed: { opacity: 0.92 },
  image: { ...StyleSheet.absoluteFillObject },
  imageFallback: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.primaryDark },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)' },
  textBlock: { flex: 1, justifyContent: 'flex-end', padding: spacing.md },
  sponsored: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: { color: colors.white, fontSize: 18, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4 },
  placeholder: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    height: AD_HEIGHT,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  placeholderTitle: { fontWeight: '800', color: colors.navy, fontSize: 15 },
  placeholderSub: { color: colors.grey, fontSize: 12, marginTop: 4, textAlign: 'center' },
});
