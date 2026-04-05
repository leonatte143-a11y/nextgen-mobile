import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/theme';
import {
  PartnerDashboardScreen,
  PartnerEarningsScreen,
  PartnerProfileScreen,
  PartnerRequestsScreen,
  PartnerRequestDetailScreen,
} from '../screens';

type PartnerStackParamList = {
  PartnerTabs: undefined;
  PartnerRequestDetail: { requestId: string };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<PartnerStackParamList>();

function PartnerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grey,
        tabBarStyle: { borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: 'speedometer-outline',
            Requests: 'notifications-outline',
            Earnings: 'wallet-outline',
            Profile: 'person-outline',
          };
          const iconName = icons[route.name] ?? 'ellipse-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={PartnerDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Requests" component={PartnerRequestsScreen} options={{ title: 'Requests' }} />
      <Tab.Screen name="Earnings" component={PartnerEarningsScreen} options={{ title: 'Wallet' }} />
      <Tab.Screen name="Profile" component={PartnerProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function PartnerTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PartnerTabs" component={PartnerTabNavigator} />
      <Stack.Screen name="PartnerRequestDetail" component={PartnerRequestDetailScreen} />
    </Stack.Navigator>
  );
}
