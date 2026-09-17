import { apiService } from './apiService';

export type GeoZone = {
  id: string;
  name: string;
  city: string;
  polygon: { lat: number; lng: number }[] | null;
};

export const geoZoneService = {
  async getActiveZones(city?: string): Promise<GeoZone[]> {
    const qs = city?.trim() ? `?city=${encodeURIComponent(city.trim())}` : '';
    return apiService.get(`/api/v1/config/geo-zones${qs}`);
  },
};
