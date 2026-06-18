export type ShopCategory = { id: string; name: string };

export type TrendingCategorySuggestion = ShopCategory & { searchCount?: number };

export type ShopSummary = {
  id: string;
  shopName: string;
  ownerName?: string;
  categoryId: string;
  categoryName: string;
  phone?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  leadPreference?: string;
  photoUrl?: string | null;
  rating: number;
  isFeatured: boolean;
  distanceKm?: number | null;
  distanceLabel: string;
  partnerNearby: boolean;
  partnerNearbyLabel?: string | null;
  nearbyPartnerName?: string | null;
  gstOrLicense?: string | null;
};

export type ShopListResponse = {
  featured: ShopSummary[];
  recommended: ShopSummary[];
  items: ShopSummary[];
  total: number;
  recommendedForJob: boolean;
};

export type ShopApplyPayload = {
  shopName: string;
  ownerName: string;
  categoryId?: string;
  categoryName?: string;
  phone: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  gstOrLicense?: string;
  leadPreference: 'online' | 'offline';
};
