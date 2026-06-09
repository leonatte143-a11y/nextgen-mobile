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
  MainTabs: undefined;
  AllServices: undefined;
  CategoryServices: { categoryId: MainCategoryId };
  ServiceList: { bucketId?: BucketId | null; title?: string; searchQuery?: string };
  ServiceProviders: { serviceId: string };
  ServiceDetail: { serviceId: string; selectedPartnerId?: string };
  ConfirmBooking: {
    serviceId: string;
    fromCart?: boolean;
    partnerId?: string;
    partnerName?: string;
    partnerPhone?: string;
    partnerRating?: number;
    distanceKm?: number;
    amountOverride?: number;
    serviceNameOverride?: string;
    selectedItems?: SelectedBookingItem[];
  };
  BookingSuccess: { bookingId: string };
  LiveBooking: { bookingId: string };
  Notifications: undefined;
  Support: undefined;
  Review: { bookingId: string; partnerName: string };
  EditProfile: undefined;
  Settings: undefined;
  Rewards: undefined;
  Referrals: undefined;
  Terms: undefined;
  Privacy: undefined;
  MyFavorites: undefined;
  Profile: undefined;
  SavedAddresses: undefined;
  HealthcareEmergencies: undefined;
  AmbulanceSos: undefined;
  ClinicBooking: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Shop: undefined;
  Cart: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
