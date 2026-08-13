import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveTrackingAdBanner } from '../components/LiveTrackingAdBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { Booking } from '../mock/types';
import { bookingService } from '../services/bookingService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'BookingTracking'>;

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Waiting for Partner Confirmation',
  partner_assigned: 'Partner confirmed — heading your way',
  en_route: 'Partner is on the way',
  awaiting_otp: 'Partner Reached',
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
  const [confirmedNavigate, setConfirmedNavigate] = useState(false);

  useEffect(() => {
    setConfirmedNavigate(false);
  }, [route.params.bookingId]);

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
    }, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [route.params.bookingId]);

  // `status` (userStatus) never transitions to 'confirmed' on the backend — only
  // `partnerStatus` changes when the partner accepts/rejects (new -> pending/rejected).
  // partnerStatus is included in the booking payload alongside the typed fields
  // (see bookingController.js#bookingWithLineItems); cast narrowly since the
  // shared Booking type doesn't declare it.
  const partnerStatus = (booking as unknown as { partnerStatus?: string } | null)?.partnerStatus;
  const waitingForConfirmation = partnerStatus === 'new';
  const rejected = partnerStatus === 'rejected';
  const acceptedAwaitingNavigate = partnerStatus === 'pending' && !confirmedNavigate;

  const statusLabel = booking ? STATUS_LABEL[booking.status] ?? 'Booking status' : 'Booking status';

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  const backToServiceList = () => navigation.goBack();

  if (loading || !booking) {
    return <ScreenLoader />;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <View style={styles.logoMark}>
          <Text style={styles.logoN}>K</Text>
        </View>
        <Text style={styles.brandName}>KAIRO</Text>
      </View>

      {waitingForConfirmation ? (
        <View style={styles.waitingBody}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.waitingTitle}>Waiting for Partner Confirmation</Text>
          <Text style={styles.waitingSub}>
            We've notified {booking.partnerName || 'your partner'}. This screen will update automatically once
            they confirm your booking.
          </Text>
        </View>
      ) : rejected ? (
        <View style={styles.waitingBody}>
          <Ionicons name="star" size={44} color={colors.error} />
          <Text style={styles.waitingTitle}>Rejected</Text>
          <Text style={styles.waitingSub}>
            {booking.partnerName || 'Your partner'} was unable to accept this booking. Please choose another
            provider.
          </Text>
        </View>
      ) : acceptedAwaitingNavigate ? (
        <View style={styles.waitingBody}>
          <Ionicons name="star" size={44} color={colors.success} />
          <Text style={styles.waitingTitle}>Accepted</Text>
          <Text style={styles.waitingSub}>
            {booking.partnerName || 'Your partner'} has accepted your booking and will be on the way shortly.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.partnerCard}>
            <View style={styles.partnerAvatar}>
              <Text style={styles.partnerAvatarTxt}>{booking.partnerName?.[0] ?? 'P'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.partnerName}>{booking.partnerName}</Text>
              <Text style={styles.partnerMeta}>★ {booking.partnerRating?.toFixed(1) ?? '—'}</Text>
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

          <View style={styles.statusCard}>
            <View style={[styles.statusDot, styles.statusDotOn]} />
            <Text style={styles.statusTitle}>{statusLabel}</Text>
          </View>
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {acceptedAwaitingNavigate ? (
          <>
            <PrimaryButton title="Navigate" onPress={() => setConfirmedNavigate(true)} />
            <View style={{ height: spacing.sm }} />
            <PrimaryButton title="Close" variant="outline" onPress={goHome} />
          </>
        ) : rejected ? (
          <PrimaryButton title="Close" variant="outline" onPress={backToServiceList} />
        ) : (
          <PrimaryButton title="Close" variant="outline" onPress={goHome} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoN: { fontSize: 15, fontWeight: '900', color: colors.white },
  brandName: { fontSize: 16, fontWeight: '900', color: colors.navy },
  waitingBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  waitingTitle: { fontSize: 18, fontWeight: '800', color: colors.charcoal, textAlign: 'center' },
  waitingSub: { color: colors.grey, textAlign: 'center', lineHeight: 20 },
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerAvatarTxt: { fontSize: 20, fontWeight: '800', color: colors.primary },
  partnerName: { fontWeight: '800', fontSize: 16, color: colors.charcoal },
  partnerMeta: { color: colors.grey, marginTop: 4, fontSize: 13 },
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  statusDot: { width: 14, height: 14, borderRadius: 7 },
  statusDotOn: { backgroundColor: colors.success },
  statusDotWaiting: { backgroundColor: colors.warning },
  statusTitle: { fontWeight: '800', fontSize: 15, color: colors.charcoal },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
