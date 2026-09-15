import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system/legacy';
import { useVideoPlayer, VideoView } from 'expo-video';
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
const ROTATE_MS = 5_000;

/**
 * expo-video's native players (ExoPlayer/AVPlayer) don't reliably load `data:` base64 URIs as a
 * video source — only expo-image's decoder handles those. Banners are stored as base64 data URLs,
 * so for video ads we write the payload out to a real cache file once and hand the player a
 * `file://` path instead. Keyed by banner id so repeated re-fetches reuse the same cached file.
 */
function useLocalVideoUri(dataUrlOrUri: string | null, cacheKey: string): string | null {
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!dataUrlOrUri) {
      setLocalUri(null);
      return undefined;
    }
    if (!dataUrlOrUri.startsWith('data:')) {
      setLocalUri(dataUrlOrUri);
      return undefined;
    }
    (async () => {
      try {
        const commaIdx = dataUrlOrUri.indexOf(',');
        const meta = commaIdx >= 0 ? dataUrlOrUri.slice(5, commaIdx) : '';
        const base64 = commaIdx >= 0 ? dataUrlOrUri.slice(commaIdx + 1) : dataUrlOrUri;
        const ext = meta.includes('quicktime') || meta.includes('mov') ? 'mov' : 'mp4';
        const path = `${FileSystem.cacheDirectory}banner_${cacheKey}.${ext}`;
        const info = await FileSystem.getInfoAsync(path);
        if (!info.exists) {
          await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
        }
        if (!cancelled) setLocalUri(path);
      } catch (e) {
        console.warn('[HomeAdBanner] failed to materialize video file', e);
        if (!cancelled) setLocalUri(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dataUrlOrUri, cacheKey]);

  return localUri;
}

function BannerMedia({
  bannerId,
  mediaUrl,
  isVideo,
  isActive,
  muted,
  loopAlone,
  onEnded,
}: {
  bannerId: string;
  mediaUrl: string | null;
  isVideo: boolean;
  isActive: boolean;
  muted: boolean;
  loopAlone: boolean;
  onEnded: () => void;
}) {
  const [videoReady, setVideoReady] = useState(false);
  const isScreenFocused = useIsFocused();
  const localVideoUri = useLocalVideoUri(isVideo ? mediaUrl : null, bannerId);
  // Source is always '' here and never changes across renders — useVideoPlayer treats a changed
  // source as "create a new player and release the old one", which crashed VideoView with
  // "shared object already released" once the local file resolved from null to a real path.
  // Swapping the source on an already-mounted player must go through player.replaceAsync().
  const player = useVideoPlayer('', (p) => {
    p.loop = false;
    p.muted = muted;
  });

  // Keep muted state in sync whenever the user taps the sound toggle.
  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    if (!isVideo || !localVideoUri) return;
    player
      .replaceAsync(localVideoUri)
      .then(() => {
        if (isActive && isScreenFocused) player.play();
      })
      .catch((e) => console.warn('[HomeAdBanner] failed to load video', e));
    // isActive/isScreenFocused intentionally excluded — this only needs to fire once per
    // resolved source; the separate play/pause effect below already reacts to focus changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVideo, localVideoUri, player]);

  // Play only the active slide, and only while this screen actually has focus — leaving the
  // screen (e.g. navigating to a category page) must not leave audio running in the background.
  // Reset to the start every time this slide becomes active: after a video plays to the end its
  // position stays there, so simply calling play() again on the next loop had nothing left to
  // play — no playToEnd ever fired again, which silently stalled the carousel from ever advancing.
  useEffect(() => {
    if (!isVideo) return;
    if (isActive && isScreenFocused) {
      player.currentTime = 0;
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isScreenFocused, isVideo, player]);

  useEffect(() => {
    if (!isVideo) return undefined;
    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') setVideoReady(true);
      // A broken/unplayable video must not freeze the carousel on this slide forever.
      if (status === 'error' && !loopAlone) onEnded();
    });
    const endSub = player.addListener('playToEnd', () => {
      // Only one banner to show — keep it looping rather than freezing on the last frame.
      if (loopAlone) player.replay();
      else onEnded();
    });
    return () => {
      statusSub.remove();
      endSub.remove();
    };
  }, [isVideo, player, onEnded, loopAlone]);

  if (isVideo) {
    return (
      <>
        <VideoView
          style={styles.image}
          player={player}
          contentFit="cover"
          nativeControls={false}
          surfaceType="textureView"
        />
        {!videoReady ? <View style={styles.imageFallback} /> : null}
      </>
    );
  }
  if (mediaUrl) {
    return <Image source={{ uri: mediaUrl }} style={styles.image} contentFit="cover" cachePolicy="memory-disk" transition={150} />;
  }
  return <View style={styles.imageFallback} />;
}

function HomeAdBannerComponent({ locationLabel }: Props) {
  const navigation = useNavigation<Nav>();
  const [banners, setBanners] = useState<AdvertisementBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isManualScroll = useRef(false);
  const visibleBanners = useGeoFenceVisibleBanners(banners);
  const [muted, setMuted] = useState(false);
  // Auto-slide must hold while the active ad is a video — this is set a beat after `ad` changes
  // (see effect below) rather than computed inline, since the hook that owns `idx` is what
  // produces `ad` in the first place.
  const [pauseForVideo, setPauseForVideo] = useState(false);
  const [idx, setIdx, advance] = useSequentialAdIndexState(visibleBanners.length, ROTATE_MS, pauseForVideo);
  const ad = visibleBanners[idx];
  const fadeOpacity = useAdFadeAnimation(ad?.id);

  useEffect(() => {
    setPauseForVideo(ad?.mediaType === 'video');
  }, [ad?.id, ad?.mediaType]);

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
            const mediaUrl = banner.mediaUrl || banner.imageUrl || null;
            const isVideo = banner.mediaType === 'video';
            return (
              <Pressable
                key={banner.id}
                style={({ pressed }) => [styles.card, { width: pageWidth || undefined }, pressed && styles.pressed]}
                onPress={() => handleBannerPress(banner, navigation)}
              >
                <BannerMedia
                  bannerId={banner.id}
                  mediaUrl={mediaUrl}
                  isVideo={isVideo}
                  isActive={banner.id === ad?.id}
                  muted={muted}
                  loopAlone={visibleBanners.length <= 1}
                  onEnded={advance}
                />
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
                {isVideo && banner.id === ad?.id ? (
                  <Pressable
                    style={styles.muteBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      setMuted((m) => !m);
                    }}
                    hitSlop={10}
                  >
                    <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={16} color={colors.white} />
                  </Pressable>
                ) : null}
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
    aspectRatio: 16 / 9,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  card: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.navy,
  },
  pressed: { opacity: 0.92 },
  image: { ...StyleSheet.absoluteFillObject },
  imageFallback: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.primaryDark },
  muteBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 20,
  },
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
