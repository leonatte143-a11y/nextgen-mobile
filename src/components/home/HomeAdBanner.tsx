import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import { handleBannerPress } from '../../navigation/bannerActions';
import { bannerService, parseCityFromLocation } from '../../services/bannerService';
import type { AdvertisementBanner } from '../../types/banner';
import type { RootStackParamList } from '../../navigation/types';
import { BannerSkeleton } from './BannerSkeleton';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  locationLabel: string;
};

const AD_HEIGHT = 168;

function HomeAdBannerComponent({ locationLabel }: Props) {
  const navigation = useNavigation<Nav>();
  const [ad, setAd] = useState<AdvertisementBanner | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const city = parseCityFromLocation(locationLabel);
    const list = await bannerService.getHomeBanners(city);
    setAd(list[0] ?? null);
    setLoading(false);
  }, [locationLabel]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <BannerSkeleton height={AD_HEIGHT} />;
  }

  if (!ad) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>Sponsored</Text>
        <Text style={styles.placeholderSub}>Local offers from NEXGEN partners</Text>
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => handleBannerPress(ad, navigation)}
    >
      {ad.imageUrl ? (
        <Image source={{ uri: ad.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imageFallback} />
      )}
      <View style={styles.overlay} />
      <View style={styles.textBlock}>
        <Text style={styles.sponsored}>Sponsored</Text>
        <Text style={styles.title} numberOfLines={2}>
          {ad.title}
        </Text>
        {ad.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {ad.subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export const HomeAdBanner = memo(HomeAdBannerComponent);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    height: AD_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.navy,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
