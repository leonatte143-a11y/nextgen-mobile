import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { PanResponder, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n/strings';
import { colors } from '../constants/theme';
import type { MainTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { ShopsRentalsMainScreen } from '../screens/ShopsRentalsMainScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Declared left-to-right tab order; swipe-left moves forward, swipe-right moves back. */
const TAB_ORDER = ['Home', 'Bookings', 'Store', 'Profile'] as const;
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
const SwipeHome = withSwipe(HomeScreen, 'Home');
const SwipeBookings = withSwipe(BookingsScreen, 'Bookings');
const SwipeStore = withSwipe(ShopsRentalsMainScreen, 'Store');
const SwipeProfile = withSwipe(ProfileScreen, 'Profile');

export function MainTabs() {
  const { language } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grey,
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.white },
      }}
    >
      <Tab.Screen
        name="Home"
        component={SwipeHome}
        options={{
          title: t(language, 'home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={SwipeBookings}
        options={{
          title: t(language, 'bookings'),
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Store"
        component={SwipeStore}
        options={{
          title: t(language, 'store'),
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SwipeProfile}
        options={{
          title: t(language, 'profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
