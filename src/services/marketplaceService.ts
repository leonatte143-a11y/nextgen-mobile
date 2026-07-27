import { apiService } from './apiService';
import type {
  MarketplaceCategory,
  MarketplaceConversation,
  MarketplaceListing,
  MarketplaceMessage,
  PostListingPayload,
} from '../types/marketplace';

type Role = 'user' | 'partner';

export const marketplaceService = {
  getCategories(): Promise<MarketplaceCategory[]> {
    return apiService.get('/api/v1/marketplace/categories');
  },

  listListings(params: {
    listingType?: string;
    categoryId?: string;
    city?: string;
    q?: string;
    lat?: number;
    lng?: number;
  }): Promise<MarketplaceListing[]> {
    const query = new URLSearchParams();
    if (params.listingType) query.set('listingType', params.listingType);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.city) query.set('city', params.city);
    if (params.q) query.set('q', params.q);
    if (params.lat != null) query.set('lat', String(params.lat));
    if (params.lng != null) query.set('lng', String(params.lng));
    const qs = query.toString();
    return apiService.get(`/api/v1/marketplace/listings${qs ? `?${qs}` : ''}`);
  },

  getListing(id: string): Promise<MarketplaceListing> {
    return apiService.get(`/api/v1/marketplace/listings/${id}`);
  },

  createListing(role: Role, payload: PostListingPayload): Promise<MarketplaceListing> {
    return apiService.post('/api/v1/marketplace/listings', payload, role);
  },

  getMyListings(role: Role): Promise<MarketplaceListing[]> {
    return apiService.get('/api/v1/marketplace/my-listings', role);
  },

  reportListing(role: Role, id: string, reason: string): Promise<{ ok: boolean }> {
    return apiService.post(`/api/v1/marketplace/listings/${id}/report`, { reason }, role);
  },

  startOrGetConversation(
    role: Role,
    listingId: string,
  ): Promise<{ conversation: MarketplaceConversation; messages: MarketplaceMessage[] }> {
    return apiService.post('/api/v1/marketplace/chat', { listingId }, role);
  },

  sendMessage(role: Role, conversationId: string, message: string): Promise<MarketplaceMessage> {
    return apiService.post(`/api/v1/marketplace/chat/${conversationId}/messages`, { message }, role);
  },

  shareContact(role: Role, conversationId: string): Promise<{ conversation: MarketplaceConversation; message: MarketplaceMessage }> {
    return apiService.post(`/api/v1/marketplace/chat/${conversationId}/share-contact`, {}, role);
  },
};
