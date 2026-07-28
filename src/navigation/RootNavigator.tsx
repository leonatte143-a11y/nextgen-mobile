import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AllServicesScreen } from '../screens/AllServicesScreen';
import { CategoryServicesScreen } from '../screens/CategoryServicesScreen';
import { BookingTrackingScreen } from '../screens/BookingTrackingScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ConfirmBookingScreen } from '../screens/ConfirmBookingScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LanguageScreen } from '../screens/LanguageScreen';
import { LiveBookingScreen } from '../screens/LiveBookingScreen';
import { PostListingScreen } from '../screens/PostListingScreen';
import { ListingDetailScreen } from '../screens/ListingDetailScreen';
import { MarketplaceChatScreen } from '../screens/MarketplaceChatScreen';
import { MyFavoritesScreen } from '../screens/MyFavoritesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { PartnerHomeScreen } from '../screens/PartnerHomeScreen';
import { PartnerLoginScreen } from '../screens/PartnerLoginScreen';
import { PartnerRegisterScreen } from '../screens/PartnerRegisterScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { HealthcareEmergenciesScreen } from '../screens/HealthcareEmergenciesScreen';
import { AmbulanceSosScreen } from '../screens/AmbulanceSosScreen';
import { ClinicBookingScreen } from '../screens/ClinicBookingScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { ShopDetailScreen } from '../screens/ShopDetailScreen';
import { ShopJoinScreen } from '../screens/ShopJoinScreen';
import { SavedAddressesScreen } from '../screens/SavedAddressesScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { RewardsScreen } from '../screens/RewardsScreen';
import { ServiceDetailScreen } from '../screens/ServiceDetailScreen';
import { ServiceListScreen } from '../screens/ServiceListScreen';
import { ServiceProvidersScreen } from '../screens/ServiceProvidersScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { UserLoginScreen } from '../screens/UserLoginScreen';
import { MainTabs } from './MainTabs';
import { colors } from '../constants/theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ contentStyle: { backgroundColor: colors.primary } }}
      />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="UserLogin" component={UserLoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="PartnerLogin" component={PartnerLoginScreen} />
      <Stack.Screen name="PartnerRegister" component={PartnerRegisterScreen} />
      <Stack.Screen name="PartnerHome" component={PartnerHomeScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AllServices" component={AllServicesScreen} />
      <Stack.Screen name="CategoryServices" component={CategoryServicesScreen} />
      <Stack.Screen name="ServiceList" component={ServiceListScreen} />
      <Stack.Screen name="ServiceProviders" component={ServiceProvidersScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="ConfirmBooking" component={ConfirmBookingScreen} />
      <Stack.Screen name="BookingTracking" component={BookingTrackingScreen} />
      <Stack.Screen name="LiveBooking" component={LiveBookingScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="MyFavorites" component={MyFavoritesScreen} />
      <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
      <Stack.Screen name="HealthcareEmergencies" component={HealthcareEmergenciesScreen} />
      <Stack.Screen name="AmbulanceSos" component={AmbulanceSosScreen} />
      <Stack.Screen name="ClinicBooking" component={ClinicBookingScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
      <Stack.Screen name="ShopJoin" component={ShopJoinScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="PostListing" component={PostListingScreen} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <Stack.Screen name="MarketplaceChat" component={MarketplaceChatScreen} />
    </Stack.Navigator>
  );
}
