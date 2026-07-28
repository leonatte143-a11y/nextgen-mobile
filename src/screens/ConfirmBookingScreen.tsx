import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaymentMethodGrid, type PaymentMethodId } from '../components/booking/PaymentMethodGrid';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLoader } from '../components/ScreenLoader';
import { NexgenTextInput } from '../components/NexgenTextInput';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import type { CatalogService } from '../mock/types';
import { catalogService } from '../services/catalogService';
import { formatTelUrl, displayPhone } from '../utils/phone';
import { bookingService } from '../services/bookingService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'ConfirmBooking'>;

const PAY_LABELS: Record<PaymentMethodId, string> = {
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net Banking',
  wallet: 'Wallet',
  cash: 'Cash',
};

function cityFromAddress(address?: string): string {
  const text = (address || '').toLowerCase();
  if (text.includes('guntur')) return 'Guntur';
  if (text.includes('rajahmundry') || text.includes('rajamahendravaram')) return 'Rajahmundry';
  return 'Rajahmundry';
}

export function ConfirmBookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { user } = useAuth();
  const selectedItems = route.params.selectedItems;

  const [svc, setSvc] = useState<CatalogService | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [promo, setPromo] = useState('');
  const [pay, setPay] = useState<PaymentMethodId>('upi');
  const [submitting, setSubmitting] = useState(false);
  const [visitingCharge, setVisitingCharge] = useState(30);
  const [quotedDistanceKm, setQuotedDistanceKm] = useState<number | null>(
    route.params.distanceKm ?? null,
  );
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteWarning, setQuoteWarning] = useState<string | null>(null);

  const partnerName = route.params.partnerName ?? svc?.partner.name ?? 'Partner';
  const partnerPhone = route.params.partnerPhone ?? svc?.partner.phone;
  const partnerRating = route.params.partnerRating ?? svc?.partner.rating;
  const partnerId = route.params.partnerId ?? svc?.partner.id;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const s = await catalogService.getServiceById(route.params.serviceId);
      setSvc(s);
      setLoading(false);
    })();
  }, [route.params.serviceId]);

  useEffect(() => {
    if (!partnerId) return;

    let cancelled = false;
    (async () => {
      setQuoteLoading(true);
      setQuoteWarning(null);
      try {
        const quote = await bookingService.quoteVisitingCharge({
          partnerId,
          city: cityFromAddress(user?.address),
        });
        if (cancelled) return;
        setVisitingCharge(quote.visitingCharges);
        setQuotedDistanceKm(quote.distanceKm);
        if (quote.warning) setQuoteWarning(quote.warning);
      } catch {
        if (!cancelled) {
          try {
            const fallbackKm = route.params.distanceKm ?? svc?.distanceKm ?? 2.5;
            const res = await catalogService.getVisitingCharge(fallbackKm);
            setVisitingCharge(res.amount);
            setQuotedDistanceKm(fallbackKm);
            setQuoteWarning('Using estimated distance; location unavailable.');
          } catch {
            setVisitingCharge(30);
            setQuoteWarning('Could not calculate visiting charges.');
          }
        }
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [partnerId, user?.address, route.params.distanceKm, svc?.distanceKm]);

  const itemsSubtotal = useMemo(() => {
    if (selectedItems?.length) {
      return selectedItems.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
    }
    return route.params.amountOverride ?? svc?.basePrice ?? 0;
  }, [selectedItems, route.params.amountOverride, svc?.basePrice]);

  const bill = useMemo(() => {
    const base = itemsSubtotal;
    const vf = visitingCharge;
    const beforeGst = base + vf;
    const gst = Math.round(beforeGst * 0.18);
    let total = beforeGst + gst;
    const promoDiscount = promo.trim().toUpperCase() === 'NEXGEN2026' ? 50 : 0;
    if (promoDiscount) total = Math.max(0, total - promoDiscount);
    return { base, vf, gst, total, promoDiscount };
  }, [itemsSubtotal, visitingCharge, promo]);

  const titleName = route.params.serviceNameOverride ?? svc?.name ?? 'Service';

  const book = async () => {
    if (!svc) return;
    setSubmitting(true);
    try {
      const address = user?.address ?? 'Rajahmundry, AP';
      const b = await bookingService.createBooking({
        serviceId: svc.id,
        partnerId,
        distanceKm: quotedDistanceKm ?? route.params.distanceKm,
        visitingCharges: visitingCharge,
        address,
        notes,
        customRequirements: route.params.customRequirements,
        paymentMethod: PAY_LABELS[pay],
        promoCode: promo,
        amountOverride: bill.total,
        serviceNameOverride: route.params.serviceNameOverride,
        selectedItems,
      });
      navigation.replace('BookingTracking', { bookingId: b.id });
    } catch {
      Alert.alert('Error', 'Could not complete booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !svc) {
    return <ScreenLoader />;
  }

  const isRemote = svc.bucketId === 'tech_supply';

  const onCall = () => {
    const tel = formatTelUrl(partnerPhone);
    if (!tel) {
      Alert.alert('Unavailable', 'Partner phone number is not available.');
      return;
    }
    Linking.openURL(tel);
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Confirm Booking</Text>
        <Pressable onPress={() => navigation.navigate('Support')}>
          <Ionicons name="help-circle-outline" size={24} color={colors.charcoal} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.summary}>
          <View style={styles.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sumTitle}>{titleName}</Text>
            <Text style={styles.sumSub}>
              Partner: {partnerName}
              {partnerRating != null ? ` (★ ${Number(partnerRating).toFixed(1)})` : ''}
            </Text>
            {partnerPhone ? <Text style={styles.sumPhone}>{displayPhone(partnerPhone)}</Text> : null}
            {isRemote ? (
              <View style={styles.locRow}>
                <Ionicons name="globe-outline" size={16} color={colors.primary} />
                <Text style={styles.loc}>Remote · Tech & Supply</Text>
              </View>
            ) : (
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={16} color={colors.primary} />
                <Text style={styles.loc}>{user?.address ?? 'Rajahmundry'}</Text>
              </View>
            )}
          </View>
        </View>

        {selectedItems && selectedItems.length > 0 ? (
          <View style={styles.lineItemsBox}>
            <Text style={styles.label}>Selected services</Text>
            {selectedItems.map((item) => (
              <View key={item.serviceItemId} style={styles.lineItemRow}>
                <Text style={styles.lineItemTitle}>
                  {item.title} × {item.quantity || 1}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.label}>Work location</Text>
        <Text style={styles.box}>{user?.address ?? 'Detecting…'}</Text>

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Notes for the partner"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Text style={styles.label}>Promo code</Text>
        <NexgenTextInput placeholder="NEXGEN2026" value={promo} onChangeText={setPromo} />

        {!isRemote && (
          <>
            {quoteLoading ? (
              <Text style={styles.rowMuted}>Calculating visiting details…</Text>
            ) : (
              <>
                {quotedDistanceKm != null ? (
                  <Text style={styles.rowMuted}>Distance: {quotedDistanceKm.toFixed(1)} km</Text>
                ) : null}
                {quoteWarning ? <Text style={styles.warn}>{quoteWarning}</Text> : null}
              </>
            )}
          </>
        )}

        <Text style={styles.h2}>Payment method</Text>
        <PaymentMethodGrid selected={pay} onSelect={setPay} />
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          title="Book Now"
          onPress={book}
          loading={submitting}
          disabled={quoteLoading}
        />
        <View style={styles.split}>
          <Pressable style={styles.half} onPress={onCall}>
            <Ionicons name="call-outline" size={18} color={colors.primary} />
            <Text style={styles.halfTxt}>Call</Text>
          </Pressable>
          <Pressable
            style={styles.half}
            onPress={() => Alert.alert('Chat', 'In-app chat is coming soon.')}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
            <Text style={styles.halfTxt}>Chat</Text>
          </Pressable>
        </View>
      </View>
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
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  title: { fontSize: 17, fontWeight: '800' },
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  accent: { width: 4, backgroundColor: colors.primary },
  sumTitle: { fontWeight: '800', fontSize: 17, marginTop: spacing.md },
  sumSub: { color: colors.grey, marginTop: 4 },
  sumPhone: { color: colors.charcoal, marginTop: 4, fontWeight: '600' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, marginBottom: spacing.sm },
  loc: { fontSize: 13, color: colors.charcoal },
  sumPrice: { fontSize: 18, fontWeight: '800', color: colors.primary, padding: spacing.md },
  lineItemsBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  lineItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  lineItemTitle: { flex: 1, color: colors.charcoal, fontWeight: '600' },
  lineItemPrice: { fontWeight: '700', color: colors.primary },
  label: { fontWeight: '700', marginTop: spacing.md, color: colors.charcoal },
  box: {
    backgroundColor: colors.greyLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    color: colors.charcoal,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    textAlignVertical: 'top',
  },
  h2: { fontWeight: '800', fontSize: 16, marginTop: spacing.lg },
  row: { color: colors.grey, marginTop: 6 },
  rowMuted: { color: colors.grey, marginTop: 6, fontSize: 13 },
  warn: { color: colors.warning, marginTop: 4, fontSize: 12 },
  promo: { color: colors.success, marginTop: 6, fontWeight: '600' },
  payable: { fontSize: 18, fontWeight: '800', marginTop: spacing.md, color: colors.charcoal },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  split: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  half: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.orangeTint,
  },
  halfTxt: { fontWeight: '800', color: colors.primary },
});
