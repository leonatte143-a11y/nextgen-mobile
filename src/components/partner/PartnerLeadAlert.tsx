import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../../constants/theme';
import type { PartnerRequest } from '../../mock/types';

const BANNER_DURATION_MS = 10_000;

type Props = {
  lead: PartnerRequest;
  onAccept: () => void;
  onDecline: () => void;
  onDismiss: () => void;
};

export function PartnerLeadAlert({ lead, onAccept, onDecline, onDismiss }: Props) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Vibration.vibrate([0, 400, 200, 400]);
    const timer = setTimeout(onDismiss, BANNER_DURATION_MS);
    return () => clearTimeout(timer);
  }, [lead.id, onDismiss]);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.card}>
        <Text style={styles.badge}>NEW LEAD</Text>
        <Text style={styles.title}>{lead.serviceName}</Text>
        <Text style={styles.meta}>
          {lead.customerName} · {lead.distanceKm} km · ₹{lead.partnerShare} take-home
        </Text>
        <Text style={styles.addr} numberOfLines={2}>
          {lead.address}
        </Text>
        <View style={styles.actions}>
          <Pressable style={styles.declineBtn} onPress={onDecline}>
            <Text style={styles.declineTxt}>Decline</Text>
          </Pressable>
          <Pressable style={styles.acceptBtn} onPress={onAccept}>
            <Text style={styles.acceptTxt}>Accept</Text>
          </Pressable>
        </View>
        <Text style={styles.timerHint}>Auto-dismisses in 10 seconds</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: spacing.md,
    elevation: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    color: colors.white,
    fontWeight: '800',
    fontSize: 11,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.charcoal },
  meta: { color: colors.grey, marginTop: spacing.xs, fontSize: 13 },
  addr: { color: colors.charcoal, marginTop: spacing.xs, fontSize: 13, lineHeight: 18 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  declineBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
  },
  declineTxt: { fontWeight: '700', color: colors.charcoal },
  acceptBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  acceptTxt: { fontWeight: '700', color: colors.white },
  timerHint: { marginTop: spacing.sm, fontSize: 11, color: colors.grey, textAlign: 'center' },
});
