import type { BucketId, CatalogService } from '../mock/types';
import { apiService } from './apiService';

export const catalogService = {
  async getBuckets() {
    return apiService.get('/api/v1/catalog/buckets');
  },

  async getCatalog(): Promise<CatalogService[]> {
    return apiService.get('/api/v1/catalog/services');
  },

  async getServicesByBucket(bucketId: BucketId | null): Promise<CatalogService[]> {
    if (!bucketId) return apiService.get('/api/v1/catalog/services');
    return apiService.get(`/api/v1/catalog/buckets/${bucketId}/services`);
  },

  async getServiceById(id: string): Promise<CatalogService | null> {
    return apiService.get(`/api/v1/catalog/services/${id}`);
  },

  async searchServices(query: string): Promise<CatalogService[]> {
    const q = encodeURIComponent(query.trim());
    return apiService.get(`/api/v1/catalog/search?q=${q}`);
  },

  async getTopRated(limit = 6): Promise<CatalogService[]> {
    return apiService.get(`/api/v1/catalog/top-rated?limit=${limit}`);
  },
};
