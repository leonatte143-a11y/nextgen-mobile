import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { PanResponder, View } from 'react-native';
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
  PartnerEditProfileScreen,
  PartnerLocationEditScreen,
  PartnerProfileScreen,
  PartnerRequestsScreen,
  PartnerRequestDetailScreen,
  PartnerServicePricingScreen,
} from '../screens';
import type { PartnerStackParamList, PartnerTabParamList } from './PartnerStackTypes';

const Tab = createBottomTabNavigator<PartnerTabParamList>();
const Stack = createNativeStackNavigator<PartnerStackParamList>();

/** Declared left-to-right tab order; swipe-left moves forward, swipe-right moves back. */
const TAB_ORDER = ['Dashboard', 'Requests', 'Profile'] as const;
type TabName = (typeof TAB_ORDER)[number];

/**
 * Wraps a tab screen so a horizontal swipe navigates to the adjacent tab.
 * Uses core RN `PanResponder` (no `react-native-gesture-handler` dependency in
 * this project, and no `GestureHandlerRootView` at the app root to pair it with).
 * Only claims the responder for a clearly-horizontal drag past a distance
 * threshold, so vertical scrolling/tapping inside screens is unaffected.
 */
function SwipeableTab({
  tabName,
  navigation,
  children,
}: {
  tabName: TabName;
  navigation: { navigate: (name: TabName) => void };
  children: React.ReactNode;
}) {
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > 24 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 2,
      onPanResponderRelease: (_evt, gesture) => {
        const idx = TAB_ORDER.indexOf(tabName);
        if (gesture.dx <= -60) {
          const next = TAB_ORDER[idx + 1];
          if (next) navigation.navigate(next);
        } else if (gesture.dx >= 60) {
          const prev = TAB_ORDER[idx - 1];
          if (prev) navigation.navigate(prev);
        }
      },
    }),
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

function withSwipe(ScreenComponent: React.ComponentType<any>, tabName: TabName) {
  return function SwipeWrapped(props: any) {
    return (
      <SwipeableTab tabName={tabName} navigation={props.navigation}>
        <ScreenComponent {...props} />
      </SwipeableTab>
    );
  };
}

// Defined once at module scope (not inline in render) so React Navigation sees a
// stable component reference per tab and doesn't remount screens on re-render.
const SwipeDashboard = withSwipe(PartnerDashboardScreen, 'Dashboard');
const SwipeRequests = withSwipe(PartnerRequestsScreen, 'Requests');
const SwipeProfile = withSwipe(PartnerProfileScreen, 'Profile');

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
            Profile: 'person-outline',
          };
          const iconName = icons[route.name] ?? 'ellipse-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={SwipeDashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Requests" component={SwipeRequests} options={{ title: 'Requests' }} />
      <Tab.Screen name="Profile" component={SwipeProfile} options={{ title: 'Profile' }} />
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
        <Stack.Screen name="PartnerEditProfile" component={PartnerEditProfileScreen} />
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
