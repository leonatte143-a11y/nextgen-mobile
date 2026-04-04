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
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLoader } from '../components/ScreenLoader';
import { NexgenTextInput } from '../components/NexgenTextInput';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { CatalogService } from '../mock/types';
import { catalogService } from '../services/catalogService';
import { bookingService } from '../services/bookingService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'ConfirmBooking'>;

const PAY = ['PhonePe', 'Google Pay', 'Paytm', 'Cash'] as const;

export function ConfirmBookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { user } = useAuth();
  const { lines, subtotal, visitingFee, estimatedTotal, clear } = useCart();
  const fromCart = route.params.fromCart && lines.length > 0;

  const [svc, setSvc] = useState<CatalogService | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [promo, setPromo] = useState('');
  const [pay, setPay] = useState<(typeof PAY)[number]>('Google Pay');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const s = await catalogService.getServiceById(route.params.serviceId);
      setSvc(s);
      setLoading(false);
    })();
  }, [route.params.serviceId]);

  const bill = useMemo(() => {
    const base = fromCart ? subtotal : svc?.basePrice ?? 0;
    const vf = visitingFee;
    const pre = base + vf;
    const admin = Math.round(pre * 0.1);
    let total = pre + admin;
    if (promo.trim().toUpperCase() === 'NEXGEN2026') total = Math.max(0, total - 50);
    return { base, vf, admin, total };
  }, [fromCart, subtotal, svc, visitingFee, promo]);

  const titleName = fromCart
    ? `${lines.length} services`
    : svc?.name ?? 'Service';

  const book = async () => {
    if (!svc && !fromCart) return;
    setSubmitting(true);
    try {
      const address = user?.address ?? 'Rajahmundry, AP';
      const b = await bookingService.createBooking({
        serviceId: fromCart ? lines[0].serviceId : svc!.id,
        address,
        notes,
        paymentMethod: pay,
        promoCode: promo,
        amountOverride: fromCart ? subtotal : undefined,
        serviceNameOverride: fromCart ? `${lines.length} services (cart)` : undefined,
      });
      if (fromCart) await clear();
      navigation.replace('BookingSuccess', { bookingId: b.id });
    } catch (e) {
      Alert.alert('Error', 'Could not complete booking (mock).');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || (!svc && !fromCart)) {
    return <ScreenLoader />;
  }

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
              Partner: {fromCart ? 'Assigned per service' : svc!.partner.name} (
              {fromCart ? '—' : `★ ${svc!.partner.rating}`})
            </Text>
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
              <Text style={styles.loc}>Nearby · {user?.address ?? 'Rajahmundry'}</Text>
            </View>
          </View>
          <Text style={styles.sumPrice}>₹{fromCart ? subtotal : svc!.basePrice}</Text>
        </View>

        <Text style={styles.label}>Work location</Text>
        <Text style={styles.box}>{user?.address ?? 'Detecting…'}</Text>
        <Pressable>
          <Text style={styles.change}>Change</Text>
        </Pressable>

        <Text style={styles.label}>Arrival</Text>
        <Text style={styles.box}>Within 45 mins (mock)</Text>

        <Text style={styles.label}>Describe problem (optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Notes for the partner"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Text style={styles.label}>Promo code</Text>
        <NexgenTextInput placeholder="NEXGEN2026" value={promo} onChangeText={setPromo} />

        <Text style={styles.h2}>Bill</Text>
        <Text style={styles.row}>Service total: ₹{bill.base}</Text>
        <Text style={styles.row}>Visiting fee: ₹{bill.vf}</Text>
        <Text style={styles.row}>Admin (10%): ₹{bill.admin}</Text>
        {promo.trim().toUpperCase() === 'NEXGEN2026' ? (
          <Text style={styles.promo}>Applied: NEXGEN2026 (−₹50)</Text>
        ) : null}
        <Text style={styles.payable}>Amount payable: ₹{bill.total}</Text>

        <Text style={styles.h2}>Payment</Text>
        <View style={styles.payRow}>
          {PAY.map((p) => (
            <Pressable key={p} style={[styles.payChip, pay === p && styles.payChipOn]} onPress={() => setPay(p)}>
              <Text style={[styles.payTxt, pay === p && styles.payTxtOn]}>{p}</Text>
              {pay === p ? <Ionicons name="checkmark-circle" size={18} color={colors.primary} /> : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          title={pay === 'Cash' ? `Confirm booking · ₹${bill.total}` : `Book now & pay ₹${bill.total}`}
          onPress={book}
          loading={submitting}
        />
        <View style={styles.split}>
          <Pressable style={styles.half} onPress={() => Linking.openURL('tel:9876543210')}>
            <Text style={styles.halfTxt}>Call</Text>
          </Pressable>
          <Pressable style={styles.half} onPress={() => Alert.alert('Chat', 'In-app chat (mock).')}>
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
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  loc: { fontSize: 13, color: colors.charcoal },
  sumPrice: { fontSize: 18, fontWeight: '800', color: colors.primary, padding: spacing.md },
  label: { fontWeight: '700', marginTop: spacing.md, color: colors.charcoal },
  box: {
    backgroundColor: colors.greyLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    color: colors.charcoal,
  },
  change: { color: colors.primary, fontWeight: '700', marginTop: spacing.sm },
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
  promo: { color: colors.success, marginTop: 6, fontWeight: '600' },
  payable: { fontSize: 18, fontWeight: '800', marginTop: spacing.md, color: colors.charcoal },
  payRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  payChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payChipOn: { borderColor: colors.primary, borderWidth: 2 },
  payTxt: { fontWeight: '600' },
  payTxtOn: { color: colors.primary },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  split: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  half: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
  },
  halfTxt: { fontWeight: '800', color: colors.primary },
});
