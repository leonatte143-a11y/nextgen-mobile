import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { getCoordsIfPermitted } from '../services/locationService';
import { isPointInPolygon } from '../utils/geoFence';
import type { AdvertisementBanner } from '../types/banner';

/** Rotate through queued ads one at a time (15s per doc 8). */
export function useSequentialAdIndex(count: number, durationMs = 15_000): number {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return undefined;
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % count);
    }, durationMs);
    return () => clearInterval(timer);
  }, [count, durationMs]);

  return idx;
}

/** Crossfade opacity driver — call `.start(callback)` after swapping the active ad index. */
export function useAdFadeAnimation(dependency: unknown) {
  const opacity = useRef(new Animated.Value(1)).current;
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency]);

  return opacity;
}

const GEO_RECHECK_MS = 30_000;

/** Hides geo-fenced ads (and implicitly pauses their rotation) once the device leaves the
 * drawn boundary, without waiting for the next full banner re-fetch. */
export function useGeoFenceVisibleBanners(banners: AdvertisementBanner[]): AdvertisementBanner[] {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const hasFencedAds = banners.some((b) => Array.isArray(b.geoFence) && b.geoFence.length >= 3);

  useEffect(() => {
    if (!hasFencedAds) return undefined;
    let active = true;
    const check = () => {
      getCoordsIfPermitted().then((c) => {
        if (active) setCoords(c);
      });
    };
    check();
    const timer = setInterval(check, GEO_RECHECK_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [hasFencedAds]);

  if (!hasFencedAds) return banners;
  return banners.filter((b) => {
    if (!Array.isArray(b.geoFence) || b.geoFence.length < 3) return true;
    if (!coords) return false;
    return isPointInPolygon(coords, b.geoFence);
  });
}

export function sortBannersByQueue<T extends { displayOrder?: number; priority?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const da = a.displayOrder ?? 0;
    const db = b.displayOrder ?? 0;
    if (da !== db) return da - db;
    return (b.priority ?? 0) - (a.priority ?? 0);
  });
}
