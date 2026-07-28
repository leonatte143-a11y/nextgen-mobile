import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BucketId, SelectedBookingItem } from '../mock/types';
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
  ConfirmBooking: {
    serviceId: string;
    partnerId?: string;
    partnerName?: string;
    partnerPhone?: string;
    partnerRating?: number;
    distanceKm?: number;
    amountOverride?: number;
    serviceNameOverride?: string;
    customRequirements?: string;
    selectedItems?: SelectedBookingItem[];
  };
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
  Shop: undefined;
  ShopDetail: { shopId: string };
  ShopJoin: undefined;
  Chat: { role: 'user' | 'partner'; bookingId?: string; otherPartyName?: string };
  PostListing: undefined;
  ListingDetail: { listingId: string };
  MarketplaceChat: { listingId: string; otherPartyName?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
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
