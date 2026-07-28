import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveTrackingAdBanner } from '../components/LiveTrackingAdBanner';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { Booking } from '../mock/types';
import { bookingService } from '../services/bookingService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'BookingTracking'>;

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Waiting for partner acceptance',
  partner_assigned: 'Partner accepted your booking',
  en_route: 'Partner is on the way',
  in_progress: 'Service in progress',
  completed: 'Service completed',
  cancelled: 'Booking cancelled',
};

export function BookingTrackingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const b = await bookingService.getBooking(route.params.bookingId);
      if (active) {
        setBooking(b);
        setLoading(false);
      }
    };
    load();
    const timer = setInterval(() => {
      bookingService.getBooking(route.params.bookingId).then((b) => {
        if (active) setBooking(b);
      }).catch(() => undefined);
    }, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [route.params.bookingId]);

  const accepted = useMemo(() => {
    if (!booking) return false;
    return booking.status !== 'confirmed';
  }, [booking]);

  const statusLabel = booking ? STATUS_LABEL[booking.status] ?? 'Booking status' : 'Booking status';

  if (loading || !booking) {
    return <ScreenLoader />;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Booking Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.statusCard}>
          <View style={[styles.statusDot, accepted ? styles.statusDotOn : styles.statusDotWaiting]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>{statusLabel}</Text>
            <Text style={styles.statusSub}>
              {accepted
                ? `${booking.partnerName} has accepted your booking.`
                : 'We are notifying nearby partners about your booking.'}
            </Text>
          </View>
        </View>

        <View style={styles.map}>
          <Ionicons name="map-outline" size={32} color={colors.grey} />
          <Text style={styles.mapLabel}>Map</Text>
          <Text style={styles.mapSub}>
            {booking.etaMins ? `Estimated arrival in ${booking.etaMins} mins` : 'Live location will appear here'}
          </Text>
        </View>

        <LiveTrackingAdBanner />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '800' },
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statusDot: { width: 14, height: 14, borderRadius: 7 },
  statusDotOn: { backgroundColor: colors.success },
  statusDotWaiting: { backgroundColor: colors.warning },
  statusTitle: { fontWeight: '800', fontSize: 15, color: colors.charcoal },
  statusSub: { color: colors.grey, marginTop: 4, fontSize: 13 },
  map: {
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  mapLabel: { fontWeight: '800', color: colors.charcoal },
  mapSub: { color: colors.grey, fontSize: 12 },
});
