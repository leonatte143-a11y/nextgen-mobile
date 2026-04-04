import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BucketId } from '../mock/types';

export type RootStackParamList = {
  Splash: undefined;
  Language: undefined;
  UserLogin: undefined;
  Register: undefined;
  PartnerLogin: undefined;
  PartnerHome: undefined;
  MainTabs: undefined;
  AllServices: undefined;
  ServiceList: { bucketId?: BucketId | null; title?: string };
  ServiceDetail: { serviceId: string };
  ConfirmBooking: { serviceId: string; fromCart?: boolean };
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
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Cart: undefined;
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
