import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { useCart } from '../context/CartContext';
import type { RootStackParamList } from '../navigation/types';
import type { MainTabScreenProps } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CartScreen(_props: MainTabScreenProps<'Cart'>) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { lines, setQty, removeLine, subtotal, visitingFee, estimatedTotal } = useCart();

  if (lines.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        subtitle="Add Fan Repair, Plumbing, and more in one work order."
        actionLabel="Browse services"
        onAction={() => navigation.navigate('AllServices')}
      />
    );
  }

  const firstId = lines[0]?.serviceId;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.h1}>My Service Cart</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>{lines.length} items</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {lines.map((line) => (
          <View key={line.lineId} style={styles.card}>
            <View style={styles.cardMain}>
              <Text style={styles.icon}>🔧</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{line.service.name}</Text>
                <Text style={styles.sub}>Base: ₹{line.service.basePrice}</Text>
              </View>
              <Pressable onPress={() => removeLine(line.lineId)} hitSlop={10}>
                <Ionicons name="trash-outline" size={22} color={colors.error} />
              </Pressable>
            </View>
            <View style={styles.stepper}>
              <Pressable onPress={() => setQty(line.lineId, line.qty - 1)} style={styles.stepBtn}>
                <Text style={styles.stepSym}>−</Text>
              </Pressable>
              <Text style={styles.qty}>{line.qty}</Text>
              <Pressable onPress={() => setQty(line.lineId, line.qty + 1)} style={styles.stepBtn}>
                <Text style={styles.stepSym}>+</Text>
              </Pressable>
            </View>
          </View>
        ))}
        <Pressable style={styles.addMore} onPress={() => navigation.navigate('AllServices')}>
          <Text style={styles.addMoreTxt}>+ Add another service</Text>
        </Pressable>
        <View style={styles.note}>
          <Text style={styles.noteTxt}>
            Multiple categories may assign different partners — shown at checkout (mock).
          </Text>
        </View>
        <View style={styles.bill}>
          <Text style={styles.billRow}>Services total: ₹{subtotal}</Text>
          <Text style={styles.billRow}>Visiting fee: ₹{visitingFee}</Text>
          <Text style={styles.billTotal}>Estimated: ₹{estimatedTotal}</Text>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          title={`Proceed to booking (${lines.length} services)`}
          onPress={() => {
            if (firstId) navigation.navigate('ConfirmBooking', { serviceId: firstId, fromCart: true });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  h1: { fontSize: 18, fontWeight: '800' },
  badge: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeTxt: { color: colors.white, fontWeight: '700', fontSize: 12 },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { fontSize: 22 },
  name: { fontWeight: '800', fontSize: 16 },
  sub: { color: colors.grey, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.md },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepSym: { fontSize: 20, fontWeight: '700' },
  qty: { fontSize: 16, fontWeight: '800', minWidth: 24, textAlign: 'center' },
  addMore: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addMoreTxt: { color: colors.primary, fontWeight: '700' },
  note: { backgroundColor: colors.orangeTint, padding: spacing.md, borderRadius: radius.md },
  noteTxt: { fontSize: 12, color: colors.charcoal },
  bill: { marginTop: spacing.lg },
  billRow: { color: colors.grey, marginBottom: 4 },
  billTotal: { fontSize: 18, fontWeight: '800', color: colors.charcoal, marginTop: spacing.sm },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
