import type { AdvertisementBanner } from '../types/banner';
import { apiService } from './apiService';

const CACHE_MS = 5 * 60 * 1000;

type CacheEntry = {
  cityKey: string;
  fetchedAt: number;
  data: AdvertisementBanner[];
};

let cache: CacheEntry | null = null;

function cityKey(city?: string): string {
  return (city ?? '').trim().toLowerCase() || '__all__';
}

/** Extract city name from "Area, City" location label. */
export function parseCityFromLocation(location: string): string | undefined {
  const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return undefined;
  return parts[parts.length - 1];
}

export const bannerService = {
  clearCache() {
    cache = null;
  },

  async getHomeBanners(city?: string, { force = false } = {}): Promise<AdvertisementBanner[]> {
    const key = cityKey(city);
    const now = Date.now();
    if (!force && cache && cache.cityKey === key && now - cache.fetchedAt < CACHE_MS) {
      return cache.data;
    }

    try {
      const q = city ? `?city=${encodeURIComponent(city)}` : '';
      const data = await apiService.get<AdvertisementBanner[]>(`/api/v1/banners/home${q}`);
      const list = Array.isArray(data) ? data : [];
      cache = { cityKey: key, fetchedAt: now, data: list };
      return list;
    } catch {
      if (cache?.cityKey === key) return cache.data;
      return [];
    }
  },
};
