import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import { handleBannerPress } from '../../navigation/bannerActions';
import { bannerService, parseCityFromLocation } from '../../services/bannerService';
import type { AdvertisementBanner } from '../../types/banner';
import type { RootStackParamList } from '../../navigation/types';
import { BannerSkeleton } from './BannerSkeleton';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_WIDTH = SCREEN_WIDTH - spacing.md * 2;
const BANNER_HEIGHT = 160;
const AUTO_MS = 4000;

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  locationLabel: string;
};

function HomeBannerCarouselComponent({ locationLabel }: Props) {
  const navigation = useNavigation<Nav>();
  const listRef = useRef<FlatList<AdvertisementBanner>>(null);
  const [banners, setBanners] = useState<AdvertisementBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const userDragging = useRef(false);

  const city = parseCityFromLocation(locationLabel);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await bannerService.getHomeBanners(city);
    setBanners(data);
    setLoading(false);
    setIndex(0);
    indexRef.current = 0;
  }, [city]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = setInterval(() => {
      if (userDragging.current) return;
      const next = (indexRef.current + 1) % banners.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      indexRef.current = next;
      setIndex(next);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (i >= 0 && i < banners.length) {
      indexRef.current = i;
      setIndex(i);
    }
  }, [banners.length]);

  const renderItem: ListRenderItem<AdvertisementBanner> = useCallback(
    ({ item }) => (
      <View style={styles.slideOuter}>
      <Pressable
        onPress={() => handleBannerPress(item, navigation)}
        style={({ pressed }) => [styles.slide, pressed && styles.slidePressed]}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imageFallback} />
        )}
        <View style={styles.overlay} />
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          ) : null}
          <View style={styles.cta}>
            <Text style={styles.ctaTxt}>{item.ctaText || 'Book Now'}</Text>
          </View>
        </View>
      </Pressable>
      </View>
    ),
    [navigation],
  );

  if (loading) return <BannerSkeleton />;
  if (!banners.length) return null;

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={banners}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          userDragging.current = true;
        }}
        onScrollEndDrag={() => {
          userDragging.current = false;
        }}
        onMomentumScrollEnd={() => {
          userDragging.current = false;
        }}
        getItemLayout={(_, i) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * i,
          index: i,
        })}
        renderItem={renderItem}
      />
      {banners.length > 1 ? (
        <View style={styles.dots}>
          {banners.map((b, i) => (
            <View key={b.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export const HomeBannerCarousel = memo(HomeBannerCarouselComponent);

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  slideOuter: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  slidePressed: { opacity: 0.94 },
  image: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  textBlock: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  title: { color: colors.white, fontSize: 17, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 4 },
  cta: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  ctaTxt: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: { width: 18, backgroundColor: colors.primary },
});
