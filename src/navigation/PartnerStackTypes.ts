import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

/** Stack wrapping the partner tab navigator + modal/detail flows */
export type PartnerStackParamList = {
  PartnerTabs: undefined;
  PartnerRequestDetail: { requestId: string };
  PartnerActiveStatus: { requestId: string };
  PartnerServicePricing: undefined;
  PartnerLocationEdit: undefined;
  PartnerHRV: undefined;
  PartnerSettings: undefined;
  Chat: { role: 'user' | 'partner'; bookingId?: string; otherPartyName?: string };
};

export type PartnerTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  Profile: undefined;
};

export type PartnerDashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<PartnerTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<PartnerStackParamList>
>;

export type PartnerServicePricingScreenProps = NativeStackScreenProps<
  PartnerStackParamList,
  'PartnerServicePricing'
>;

export type PartnerLocationEditScreenProps = NativeStackScreenProps<
  PartnerStackParamList,
  'PartnerLocationEdit'
>;
