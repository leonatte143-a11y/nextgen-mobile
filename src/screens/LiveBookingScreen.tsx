import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { Booking } from '../mock/types';
import { bookingService } from '../services/bookingService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'LiveBooking'>;

const STEPS = [
  'Booking Confirmed',
  'Partner Assigned',
  'Partner En Route',
  'Work Started (OTP)',
  'Service Completed',
] as const;

export function LiveBookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const [b, setB] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const x = await bookingService.getBooking(route.params.bookingId);
      setB(x);
      setLoading(false);
    })();
  }, [route.params.bookingId]);

  if (loading || !b) {
    return <ScreenLoader />;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Live tracking</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.map}>
          <Text style={styles.mapLabel}>Map view (mock)</Text>
          <Text style={styles.mapSub}>Orange pin → Partner · Blue dot → You</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>Arriving in {b.etaMins ?? 8} mins</Text>
          </View>
        </View>

        <View style={styles.partner}>
          <View style={styles.avatar}>
            <Text style={styles.avTxt}>{b.partnerName[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pName}>{b.partnerName}</Text>
            <Text style={styles.pRate}>★ {b.partnerRating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.otpBox}>
          <Text style={styles.otpLab}>Start OTP</Text>
          <Text style={styles.otpVal}>{b.startOtp.split('').join(' ')}</Text>
          <Text style={styles.otpHint}>Share only when the partner arrives.</Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.act} onPress={() => Linking.openURL('tel:9876543210')}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.actTxt}>Call partner</Text>
          </Pressable>
          <Pressable style={styles.act} onPress={() => Alert.alert('Chat', 'In-app chat (mock).')}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={styles.actTxt}>Chat</Text>
          </Pressable>
        </View>

        <Text style={styles.h2}>Status</Text>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.step}>
            <Text style={styles.stepIcon}>{i < 3 ? '✅' : '⚪'}</Text>
            <Text style={styles.stepTxt}>{label}</Text>
          </View>
        ))}

        <PrimaryButton
          title="Rate service (mock)"
          variant="outline"
          onPress={() =>
            navigation.navigate('Review', { bookingId: b.id, partnerName: b.partnerName })
          }
        />
        <View style={{ height: spacing.md }} />
        <PrimaryButton
          title="Cancel booking"
          variant="danger"
          onPress={async () => {
            const r = await bookingService.cancelBooking(b.id);
            Alert.alert('Cancelled', `Refund ₹${r.refund} (after ₹${r.fee} fee — mock).`);
            navigation.goBack();
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
});
