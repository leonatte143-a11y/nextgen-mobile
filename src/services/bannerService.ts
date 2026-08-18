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

export type SubmitAdRequestPayload = {
  businessName: string;
  businessAddress?: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  redirectValue?: string;
  startDate?: string;
  endDate?: string;
};

/** A partner's own submitted ad, as returned by GET /api/v1/partners/ads. Adds the
 * approval-status fields that aren't on the shared AdvertisementBanner type (which
 * describes admin/home-feed banners) — kept local to avoid touching that shared type. */
export type MyAdRequest = AdvertisementBanner & {
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string | null;
  partnerId?: string | null;
};

export const bannerService = {
  clearCache() {
    cache = null;
  },

  /** "Advertise your business" is a User-App flow (Profile menu), so it submits through the
   * user-scoped endpoint by default. Partners have their own separate advertise entry point
   * that still posts to the partner-scoped endpoint. */
  async submitAdRequest(
    payload: SubmitAdRequestPayload,
    scope: 'user' | 'partner' = 'user',
  ): Promise<AdvertisementBanner> {
    const path = scope === 'partner' ? '/api/v1/partners/ads' : '/api/v1/users/ads';
    return apiService.post<AdvertisementBanner>(path, payload, scope);
  },

  async listMyAds(scope: 'user' | 'partner' = 'user'): Promise<MyAdRequest[]> {
    const path = scope === 'partner' ? '/api/v1/partners/ads' : '/api/v1/users/ads';
    const data = await apiService.get<MyAdRequest[]>(path, scope);
    return Array.isArray(data) ? data : [];
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
