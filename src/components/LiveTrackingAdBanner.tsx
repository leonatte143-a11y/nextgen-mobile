import React, { useEffect, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  sortBannersByQueue,
  useAdFadeAnimation,
  useGeoFenceVisibleBanners,
  useSequentialAdIndex,
} from '../hooks/useSequentialAds';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../constants/theme';
import { handleBannerPress } from '../navigation/bannerActions';
import { bannerService } from '../services/bannerService';
import type { AdvertisementBanner } from '../types/banner';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BANNER_W = 320;
const BANNER_H = 50;
const ROTATE_MS = 15_000;

export function LiveTrackingAdBanner() {
  const navigation = useNavigation<Nav>();
  const [banners, setBanners] = useState<AdvertisementBanner[]>([]);
  const visibleBanners = useGeoFenceVisibleBanners(banners);
  const idx = useSequentialAdIndex(visibleBanners.length, ROTATE_MS);
  const ad = visibleBanners[idx];
  const fadeOpacity = useAdFadeAnimation(ad?.id);

  useEffect(() => {
    bannerService
      .getHomeBanners(undefined, { force: true, placement: 'partner_live_tracking' })
      .then((list) => setBanners(sortBannersByQueue(list)))
      .catch(() => setBanners([]));
  }, []);

  if (!ad) return null;

  const mediaUrl = ad.mediaUrl || ad.imageUrl;

  return (
    <View style={styles.wrap} accessibilityRole="summary" accessibilityLabel="Sponsored ad banner">
      <Animated.View style={[styles.inner, { opacity: fadeOpacity }]}>
        <View style={styles.pill}>
          <Text style={styles.pillTxt}>Ad</Text>
        </View>
        {mediaUrl && ad.mediaType !== 'video' ? (
          <Image source={{ uri: mediaUrl }} style={styles.thumb} resizeMode="cover" />
        ) : null}
        <Pressable
          onPress={() => handleBannerPress(ad, navigation)}
          style={styles.content}
        >
          <Text style={styles.title} numberOfLines={1}>
            {ad.title}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {ad.subtitle || (ad.mediaType === 'video' ? 'Tap to watch' : 'Tap to learn more')}
          </Text>
        </Pressable>
        <View style={styles.dots}>
          {visibleBanners.map((b) => (
            <View key={b.id} style={[styles.dot, b.id === ad.id && styles.dotOn]} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: BANNER_W,
    maxWidth: '100%',
    height: BANNER_H,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  thumb: { width: 36, height: 36, borderRadius: 6 },
  pill: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillTxt: { color: colors.white, fontSize: 9, fontWeight: '800' },
  content: { flex: 1, minWidth: 0, justifyContent: 'center' },
  title: { fontWeight: '800', fontSize: 12, color: colors.charcoal },
  sub: { fontSize: 10, color: colors.grey, marginTop: 1 },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.primary },
});
