import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';
import type {
  MarketplaceCategory,
  MarketplaceConversation,
  MarketplaceConversationSummary,
  MarketplaceListing,
  MarketplaceMessage,
  PostListingPayload,
} from '../types/marketplace';

type Role = 'user' | 'partner';

// The unread-count endpoint doesn't exist server-side (no per-user read-state on
// marketplace conversations), so "unread" is tracked client-side: a conversation is
// unread once its lastMessageAt moves past the timestamp we last recorded as "seen"
// for it (recorded whenever MarketplaceChatScreen opens/updates that conversation).
const SEEN_KEY = 'kairo_exo_chat_seen_v1';

async function getSeenMap(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

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

  listMyConversations(role: Role): Promise<MarketplaceConversationSummary[]> {
    return apiService.get('/api/v1/marketplace/chat', role);
  },

  getConversation(
    role: Role,
    conversationId: string,
  ): Promise<{ conversation: MarketplaceConversation; messages: MarketplaceMessage[] }> {
    return apiService.get(`/api/v1/marketplace/chat/${conversationId}`, role);
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

  async markConversationSeen(conversationId: string, at: number = Date.now()): Promise<void> {
    const seen = await getSeenMap();
    seen[conversationId] = at;
    await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  },

  async getUnreadConversationCount(role: Role): Promise<number> {
    const [conversations, seen] = await Promise.all([
      marketplaceService.listMyConversations(role),
      getSeenMap(),
    ]);
    return conversations.filter((c) => {
      if (!c.lastMessageAt) return false;
      const lastMessageMs = new Date(c.lastMessageAt).getTime();
      return lastMessageMs > (seen[c.id] ?? 0);
    }).length;
  },
};
