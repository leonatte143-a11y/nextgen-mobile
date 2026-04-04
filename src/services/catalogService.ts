import { CATALOG_SERVICES } from '../mock/catalog';
import { SERVICE_BUCKETS } from '../mock/buckets';
import type { BucketId, CatalogService } from '../mock/types';
import { mockRequest } from './api';

export const catalogService = {
  async getBuckets() {
    return mockRequest(() => [...SERVICE_BUCKETS]);
  },

  async getCatalog(): Promise<CatalogService[]> {
    return mockRequest(() => [...CATALOG_SERVICES]);
  },

  async getServicesByBucket(bucketId: BucketId | null): Promise<CatalogService[]> {
    return mockRequest(() =>
      bucketId ? CATALOG_SERVICES.filter((s) => s.bucketId === bucketId) : [...CATALOG_SERVICES],
    );
  },

  async getServiceById(id: string): Promise<CatalogService | null> {
    return mockRequest(() => CATALOG_SERVICES.find((s) => s.id === id) ?? null);
  },

  async searchServices(query: string): Promise<CatalogService[]> {
    const q = query.trim().toLowerCase();
    return mockRequest(() => {
      if (!q) return [...CATALOG_SERVICES];
      return CATALOG_SERVICES.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.categoryLabel.toLowerCase().includes(q) ||
          s.subtext.toLowerCase().includes(q),
      );
    });
  },

  async getTopRated(limit = 6): Promise<CatalogService[]> {
    return mockRequest(() =>
      [...CATALOG_SERVICES].sort((a, b) => b.rating - a.rating).slice(0, limit),
    );
  },
};
