import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

export type PaymentMethodId = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cash';

export type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  brandColor: string;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'upi', label: 'UPI', subtitle: 'GPay · PhonePe · Paytm', icon: 'phone-portrait-outline', brandColor: '#5F259F' },
  { id: 'card', label: 'Cards', subtitle: 'Debit / Credit', icon: 'card-outline', brandColor: '#1565C0' },
  { id: 'netbanking', label: 'Net Banking', subtitle: 'All major banks', icon: 'business-outline', brandColor: '#2E7D32' },
  { id: 'wallet', label: 'Wallet', subtitle: 'KAIRO Pay', icon: 'wallet-outline', brandColor: '#FF8C00' },
  { id: 'cash', label: 'Cash', subtitle: 'Pay after service', icon: 'cash-outline', brandColor: '#757575' },
];

type Props = {
  selected: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
};

export function PaymentMethodGrid({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {PAYMENT_METHODS.map((method) => {
        const active = selected === method.id;
        return (
          <Pressable
            key={method.id}
            style={[styles.tile, active && styles.tileOn]}
            onPress={() => onSelect(method.id)}
          >
            <View style={[styles.iconCircle, { backgroundColor: `${method.brandColor}18` }]}>
              <Ionicons name={method.icon} size={22} color={method.brandColor} />
            </View>
            <Text style={[styles.label, active && styles.labelOn]}>{method.label}</Text>
            <Text style={styles.sub} numberOfLines={1}>
              {method.subtitle}
            </Text>
            {active ? (
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.check} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tile: {
    width: '48%',
    minWidth: 150,
    flexGrow: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    position: 'relative',
  },
  tileOn: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.orangeTint },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: { fontWeight: '800', color: colors.charcoal, fontSize: 14 },
  labelOn: { color: colors.primary },
  sub: { fontSize: 11, color: colors.grey, marginTop: 2 },
  check: { position: 'absolute', top: spacing.sm, right: spacing.sm },
});
