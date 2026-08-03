import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PartnerLeadAlert } from '../components/partner/PartnerLeadAlert';
import { usePartner } from '../context/PartnerContext';
import { colors } from '../constants/theme';
import { PartnerHRVScreen } from '../screens/PartnerHRVScreen';
import { PartnerSettingsScreen } from '../screens/PartnerSettingsScreen';
import { PartnerRequestStatusScreen } from '../screens/PartnerRequestStatusScreen';
import { PartnerEnquiryScreen } from '../screens/PartnerEnquiryScreen';
import { PartnerGalleryScreen } from '../screens/PartnerGalleryScreen';
import { ChatScreen } from '../screens/ChatScreen';
import {
  PartnerDashboardScreen,
  PartnerLocationEditScreen,
  PartnerProfileScreen,
  PartnerRequestsScreen,
  PartnerRequestDetailScreen,
  PartnerServicePricingScreen,
} from '../screens';
import type { PartnerStackParamList, PartnerTabParamList } from './PartnerStackTypes';

const Tab = createBottomTabNavigator<PartnerTabParamList>();
const Stack = createNativeStackNavigator<PartnerStackParamList>();

function PartnerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grey,
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.surface },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: 'speedometer-outline',
            Requests: 'notifications-outline',
            Profile: 'person-outline',
          };
          const iconName = icons[route.name] ?? 'ellipse-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={PartnerDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Requests" component={PartnerRequestsScreen} options={{ title: 'Requests' }} />
      <Tab.Screen name="Profile" component={PartnerProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function PartnerTabs() {
  const { incomingLead, dismissIncomingLead, acceptRequest, rejectRequest } = usePartner();

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PartnerTabs" component={PartnerTabNavigator} />
        <Stack.Screen name="PartnerRequestDetail" component={PartnerRequestDetailScreen} />
        <Stack.Screen name="PartnerRequestStatus" component={PartnerRequestStatusScreen} />
        <Stack.Screen name="PartnerServicePricing" component={PartnerServicePricingScreen} />
        <Stack.Screen name="PartnerLocationEdit" component={PartnerLocationEditScreen} />
        <Stack.Screen name="PartnerHRV" component={PartnerHRVScreen} />
        <Stack.Screen name="PartnerSettings" component={PartnerSettingsScreen} />
        <Stack.Screen name="PartnerEnquiry" component={PartnerEnquiryScreen} />
        <Stack.Screen name="PartnerGallery" component={PartnerGalleryScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
      {incomingLead ? (
        <PartnerLeadAlert
          lead={incomingLead}
          onDismiss={dismissIncomingLead}
          onAccept={() => {
            void acceptRequest(incomingLead.id);
          }}
          onDecline={() => {
            void rejectRequest(incomingLead.id);
          }}
        />
      ) : null}
    </View>
  );
}
