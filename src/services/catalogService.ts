import type { BucketId, CatalogService, PartnerSummary, ServiceMenuItem } from '../mock/types';
import { apiService } from './apiService';

export const catalogService = {
  async getBuckets() {
    return apiService.get('/api/v1/catalog/buckets');
  },

  async getCatalog(): Promise<CatalogService[]> {
    return apiService.get('/api/v1/catalog/services');
  },

  async getServicesByBucket(bucketId: BucketId | null, searchQuery?: string): Promise<CatalogService[]> {
    if (!bucketId) return apiService.get('/api/v1/catalog/services');
    const q = searchQuery?.trim();
    const suffix = q ? `?q=${encodeURIComponent(q)}` : '';
    return apiService.get(`/api/v1/catalog/buckets/${bucketId}/services${suffix}`);
  },

  async getServiceById(id: string): Promise<CatalogService | null> {
    return apiService.get(`/api/v1/catalog/services/${id}`);
  },

  async getServicePartners(id: string): Promise<PartnerSummary[]> {
    return apiService.get(`/api/v1/catalog/services/${id}/partners`);
  },

  async searchServices(query: string): Promise<CatalogService[]> {
    const q = encodeURIComponent(query.trim());
    return apiService.get(`/api/v1/catalog/search?q=${q}`);
  },

  async getTopRated(limit = 6): Promise<CatalogService[]> {
    return apiService.get(`/api/v1/catalog/top-rated?limit=${limit}`);
  },

  async getPartnerServiceMenu(serviceId: string, partnerId: string): Promise<ServiceMenuItem[]> {
    const res = await apiService.get<{ items?: ServiceMenuItem[] }>(
      `/api/v1/catalog/services/${serviceId}/partners/${partnerId}/menu`,
    );
    return Array.isArray(res) ? res : (res?.items ?? []);
  },

  async getVisitingCharge(distanceKm: number): Promise<{ distanceKm: number; amount: number }> {
    const q = encodeURIComponent(String(distanceKm));
    return apiService.get(`/api/v1/catalog/visiting-charge?distanceKm=${q}`);
  },

  async logProfileView(partnerId: string): Promise<boolean> {
    return apiService.post(`/api/v1/catalog/partners/${partnerId}/view`, undefined, 'user');
  },
};
