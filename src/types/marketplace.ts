export type ListingType = 'rent' | 'sell' | 'resale';
export type SellerRole = 'user' | 'partner';

export type MarketplaceCategory = { id: string; name: string };

export type MarketplaceListing = {
  id: string;
  sellerRole: SellerRole;
  sellerId: string;
  listingType: ListingType;
  categoryId: string;
  title: string;
  description: string;
  photos: string[];
  price: number | null;
  depositAmount: number | null;
  rentPricePerDay: number | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  contactPhone: string | null;
  status: string;
  moderationStatus: string | null;
  distanceKm: number | null;
  createdAt: string;
  featured: boolean;
};

export type PostListingPayload = {
  listingType: ListingType;
  categoryId?: string;
  categoryName?: string;
  title: string;
  description?: string;
  photos?: string[];
  price?: number;
  depositAmount?: number;
  rentPricePerDay?: number;
  city?: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
};

export type MarketplaceConversation = {
  id: string;
  listingId: string;
  buyerRole: SellerRole;
  buyerId: string;
  sellerRole: SellerRole;
  sellerId: string;
  status: string;
  contactShared: boolean;
};

export type MarketplaceMessage = {
  id: string;
  conversationId: string;
  senderType: SellerRole;
  senderId?: string | null;
  message: string;
  createdAt: string;
};

export type MarketplaceConversationSummary = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPhoto: string | null;
  role: 'buyer' | 'seller';
  lastMessage: string | null;
  lastMessageAt: string | null;
  status: string;
};
