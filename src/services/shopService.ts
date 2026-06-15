import type { ShopApplyPayload, ShopCategory, ShopListResponse, ShopSummary } from '../types/shop';
import { apiService } from './apiService';

export const shopService = {
  async getCategories(): Promise<ShopCategory[]> {
    return apiService.get('/api/v1/shops/categories');
  },

  async listNearby(params: {
    lat?: number;
    lng?: number;
    q?: string;
    categoryId?: string;
    radiusKm?: number;
  }): Promise<ShopListResponse> {
    const query = new URLSearchParams();
    if (params.lat != null) query.set('lat', String(params.lat));
    if (params.lng != null) query.set('lng', String(params.lng));
    if (params.q) query.set('q', params.q);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.radiusKm != null) query.set('radiusKm', String(params.radiusKm));
    const qs = query.toString();
    return apiService.get(`/api/v1/shops/nearby${qs ? `?${qs}` : ''}`, 'user');
  },

  async getShop(id: string, lat?: number, lng?: number): Promise<ShopSummary> {
    const query = new URLSearchParams();
    if (lat != null) query.set('lat', String(lat));
    if (lng != null) query.set('lng', String(lng));
    const qs = query.toString();
    return apiService.get(`/api/v1/shops/${id}${qs ? `?${qs}` : ''}`);
  },

  async trackCall(shopId: string): Promise<void> {
    await apiService.post(`/api/v1/shops/${shopId}/call`, {});
  },

  async trackDirections(shopId: string): Promise<void> {
    await apiService.post(`/api/v1/shops/${shopId}/directions`, {});
  },

  async apply(payload: ShopApplyPayload): Promise<{ id: string; status: string }> {
    return apiService.post('/api/v1/shops/apply', payload);
  },
};
