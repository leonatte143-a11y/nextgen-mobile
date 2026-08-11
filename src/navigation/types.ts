import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BucketId } from '../mock/types';
import type { MainCategoryId } from '../data/serviceCatalog';

export type RootStackParamList = {
  Splash: undefined;
  Language: undefined;
  RoleSelection: undefined;
  UserLogin: undefined;
  Register: undefined;
  PartnerLogin: undefined;
  PartnerRegister: undefined;
  PartnerHome: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  AllServices: undefined;
  CategoryServices: { categoryId: MainCategoryId };
  ServiceList: { bucketId?: BucketId | null; title?: string; searchQuery?: string };
  ServiceProviders: { serviceId: string };
  ServiceDetail: { serviceId: string; selectedPartnerId?: string };
  BookingTracking: { bookingId: string };
  LiveBooking: { bookingId: string };
  Notifications: undefined;
  Support: undefined;
  Review: { bookingId: string; partnerName: string };
  EditProfile: undefined;
  Settings: undefined;
  Rewards: undefined;
  Terms: undefined;
  Privacy: undefined;
  MyFavorites: undefined;
  SavedAddresses: undefined;
  HealthcareEmergencies: undefined;
  AmbulanceSos: undefined;
  ClinicBooking: undefined;
  Shop: { initialTab?: 'shops' | 'materials' } | undefined;
  ShopDetail: { shopId: string };
  ShopJoin: undefined;
  Chat: { role: 'user' | 'partner'; bookingId?: string; otherPartyName?: string };
  PostListing: undefined;
  ListingDetail: { listingId: string };
  MarketplaceChat: { listingId: string; otherPartyName?: string };
  AdvertiseBusiness: undefined;
  AdvertisePlan: {
    businessName: string;
    businessAddress: string;
    bannerUri?: string;
    bannerBase64?: string;
    bannerType?: 'image' | 'video';
    socialLink?: string;
  };
  AdSubscriptionCheckout: {
    businessName: string;
    businessAddress?: string;
    bannerUri?: string;
    bannerBase64?: string;
    socialLink?: string;
    planId: 'image' | 'video';
    durationUnit: 'days' | 'months';
    durationValue: number;
    totalAmount: number;
  };
  MyAds: undefined;
  Conversations: { role: 'user' | 'partner' } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Store: { initialTab?: 'shops' | 'materials' } | undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
