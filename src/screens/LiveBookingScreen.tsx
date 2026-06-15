import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { LiveTrackingAdBanner } from '../components/LiveTrackingAdBanner';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { Booking } from '../mock/types';
import { bookingService } from '../services/bookingService';
import { formatTelUrl } from '../utils/phone';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'LiveBooking'>;

const STEPS = [
  'Booking confirmed',
  'Partner assigned',
  'Partner en route',
  'Service started',
  'Service completed',
] as const;

const STATUS_STEP_INDEX: Record<string, number> = {
  partner_assigned: 1,
  en_route: 2,
  in_progress: 3,
  completed: 4,
  cancelled: 0,
};

const STATUS_LABEL: Record<string, string> = {
  partner_assigned: 'Partner assigned',
  en_route: 'Partner en route',
  in_progress: 'Service in progress',
  completed: 'Service completed',
  cancelled: 'Cancelled',
};

export function LiveBookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
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

  const activeStep = useMemo(() => {
    return booking ? STATUS_STEP_INDEX[booking.status] ?? 0 : 0;
  }, [booking]);

  if (loading || !booking) {
    return <ScreenLoader />;
  }

  const statusLabel = STATUS_LABEL[booking.status] || 'Booking status';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}> 
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Live tracking</Text>
        <View style={{ width: 24 }} />
      </View>
      <LiveTrackingAdBanner />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.map}>
          <Text style={styles.mapLabel}>Tracking overview</Text>
          <Text style={styles.mapSub}>
            {booking.etaMins ? `Estimated arrival in ${booking.etaMins} mins` : 'ETA unavailable'}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.partner}>
          <View style={styles.avatar}>
            <Text style={styles.avTxt}>{booking.partnerName[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pName}>{booking.partnerName}</Text>
            <Text style={styles.pRate}>★ {booking.partnerRating.toFixed(1)}</Text>
          </View>
        </View>

        {booking.lineItems && booking.lineItems.length > 0 ? (
          <View style={styles.servicesBox}>
            <Text style={styles.h2}>Booked services</Text>
            {booking.lineItems.map((li) => (
              <View key={li.id || li.title} style={styles.serviceRow}>
                <Text style={styles.serviceTitle}>
                  {li.title} × {li.quantity}
                </Text>
                <Text style={styles.servicePrice}>₹{li.lineTotal}</Text>
              </View>
            ))}
            {booking.visitingFee != null ? (
              <Text style={styles.serviceMeta}>Visiting charges: ₹{booking.visitingFee}</Text>
            ) : null}
            {booking.promoDiscount != null && booking.promoDiscount > 0 ? (
              <Text style={styles.serviceMeta}>Promo: −₹{booking.promoDiscount}</Text>
            ) : null}
            <Text style={styles.serviceTotal}>Total: ₹{booking.totalAmount}</Text>
          </View>
        ) : null}

        {booking.status === 'completed' ? null : booking.status === 'in_progress' && booking.endOtp ? (
          <View style={styles.otpBox}>
            <Text style={styles.otpLab}>Completion OTP</Text>
            <Text style={styles.otpVal}>{booking.endOtp.split('').join(' ')}</Text>
            <Text style={styles.otpHint}>Share with the partner when work is finished.</Text>
          </View>
        ) : booking.startOtp ? (
          <View style={styles.otpBox}>
            <Text style={styles.otpLab}>Start OTP</Text>
            <Text style={styles.otpVal}>{booking.startOtp.split('').join(' ')}</Text>
            <Text style={styles.otpHint}>Share only when the partner arrives.</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            style={styles.act}
            onPress={() => {
              const tel = formatTelUrl(booking.partnerPhone) || formatTelUrl('9876543210');
              if (tel) Linking.openURL(tel);
            }}
          >
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.actTxt}>{booking.partnerPhone ? 'Call partner' : 'Contact support'}</Text>
          </Pressable>
          <Pressable
            style={styles.act}
            onPress={() => Linking.openURL('mailto:support@nexgen.com?subject=Live%20booking%20help')}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={styles.actTxt}>Chat support</Text>
          </Pressable>
        </View>

        <Text style={styles.h2}>Status</Text>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.step}>
            <Text style={styles.stepIcon}>{i <= activeStep ? '✅' : '⚪'}</Text>
            <Text style={styles.stepTxt}>{label}</Text>
          </View>
        ))}

        {booking.status === 'completed' ? (
          <PrimaryButton
            title="Rate service"
            variant="outline"
            onPress={() =>
              navigation.navigate('Review', { bookingId: booking.id, partnerName: booking.partnerName })
            }
          />
        ) : null}
        <View style={{ height: spacing.md }} />
        <PrimaryButton
          title="Cancel booking"
          variant="danger"
          loading={cancelling}
          onPress={async () => {
            try {
              setCancelling(true);
              const r = await bookingService.cancelBooking(booking.id);
              Alert.alert('Booking cancelled', `Refund ₹${r.refund} processed with a fee of ₹${r.fee}.`);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Unable to cancel', String(error));
            } finally {
              setCancelling(false);
            }
          }}
        />
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
  map: {
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  mapLabel: { fontWeight: '800', color: colors.charcoal },
  mapSub: { color: colors.grey, marginTop: 4, fontSize: 12 },
  badge: {
    position: 'absolute',
    bottom: spacing.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    elevation: 2,
  },
  badgeTxt: { fontWeight: '700', color: colors.primary },
  partner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avTxt: { fontSize: 22, fontWeight: '800', color: colors.primary },
  pName: { fontSize: 18, fontWeight: '800' },
  pRate: { color: colors.grey, marginTop: 2 },
  servicesBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  serviceTitle: { flex: 1, fontWeight: '600', color: colors.charcoal },
  servicePrice: { fontWeight: '700', color: colors.primary },
  serviceMeta: { color: colors.grey, marginTop: 4, fontSize: 13 },
  serviceTotal: { fontWeight: '800', marginTop: spacing.sm, color: colors.charcoal },
  otpBox: {
    backgroundColor: colors.orangeTint,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  otpLab: { fontWeight: '700', color: colors.charcoal },
  otpVal: { fontSize: 32, fontWeight: '900', color: colors.primary, marginTop: spacing.sm, letterSpacing: 4 },
  otpHint: { fontSize: 12, color: colors.grey, marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  act: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.greyLight,
  },
  actTxt: { fontWeight: '700', color: colors.primary },
  h2: { fontWeight: '800', fontSize: 16, marginBottom: spacing.sm },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  stepIcon: { fontSize: 16 },
  stepTxt: { color: colors.charcoal },
  statusNote: { color: colors.grey, fontSize: 13, marginTop: spacing.sm },
});
