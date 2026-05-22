export type BannerRedirectType =
  | 'category'
  | 'service'
  | 'partner'
  | 'external'
  | 'offer'
  | 'event'
  | 'all_services'
  | 'none';

export type AdvertisementBanner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  redirectType: BannerRedirectType;
  redirectValue: string;
  city: string | null;
  isActive: boolean;
  priority: number;
  startDate: string | null;
  endDate: string | null;
  createdBy: string | null;
  createdAt?: string;
  updatedAt?: string;
};
