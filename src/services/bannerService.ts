import type { AdvertisementBanner } from '../types/banner';
import { apiService } from './apiService';
import type { Coords } from './locationService';

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

  async getHomeBanners(
    city?: string,
    { force = false, placement = 'home_dashboard', coords }: { force?: boolean; placement?: string; coords?: Coords | null } = {},
  ): Promise<AdvertisementBanner[]> {
    const key = `${cityKey(city)}:${placement}`;
    const now = Date.now();
    // Geo-fenced campaigns need a live coords check, so skip the cache when we have a fresh position.
    if (!force && !coords && cache && cache.cityKey === key && now - cache.fetchedAt < CACHE_MS) {
      return cache.data;
    }

    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      params.set('placement', placement);
      if (coords) {
        params.set('lat', String(coords.latitude));
        params.set('lng', String(coords.longitude));
      }
      const q = params.toString();
      const data = await apiService.get<AdvertisementBanner[]>(`/api/v1/banners/home?${q}`);
      const list = Array.isArray(data) ? data : [];
      cache = { cityKey: key, fetchedAt: now, data: list };
      return list;
    } catch {
      if (cache?.cityKey === key) return cache.data;
      return [];
    }
  },
};
