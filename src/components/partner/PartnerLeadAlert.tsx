import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../constants/theme';
import type { PartnerRequest } from '../../mock/types';

const ALERT_DURATION_MS = 30_000;
// Buzz, pause, buzz, pause — repeated for the life of the alert, like an incoming call.
const RING_PATTERN = [0, 500, 300, 500, 300];

type Props = {
  lead: PartnerRequest;
  onAccept: () => void;
  onDecline: () => void;
  onDismiss: () => void;
};

/**
 * Full-screen, call-style incoming lead alert. Not a true OS-level "draw over other apps"
 * overlay (that needs a custom native build outside Expo managed workflow) — this covers
 * the whole in-app screen with a hard-to-miss, continuously-vibrating modal instead.
 */
export function PartnerLeadAlert({ lead, onAccept, onDecline, onDismiss }: Props) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Vibration.vibrate(RING_PATTERN, true);
    const timer = setTimeout(onDismiss, ALERT_DURATION_MS);
    return () => {
      Vibration.cancel();
      clearTimeout(timer);
    };
  }, [lead.id, onDismiss]);

  return (
    <Modal visible transparent={false} animationType="slide" presentationStyle="fullScreen" onRequestClose={onDismiss}>
      <View style={[styles.wrap, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.pulseIcon}>
          <Ionicons name="briefcase" size={40} color={colors.white} />
        </View>
        <Text style={styles.badge}>NEW LEAD</Text>
        <Text style={styles.title}>{lead.serviceName}</Text>
        <Text style={styles.meta}>
          {lead.customerName} · {lead.distanceKm} km · ₹{lead.partnerShare} take-home
        </Text>
        <Text style={styles.addr} numberOfLines={3}>
          {lead.address}
        </Text>
        <View style={styles.spacer} />
        <View style={styles.actions}>
          <Pressable style={styles.declineBtn} onPress={onDecline}>
            <Ionicons name="close" size={28} color={colors.white} />
            <Text style={styles.declineTxt}>Decline</Text>
          </Pressable>
          <Pressable style={styles.acceptBtn} onPress={onAccept}>
            <Ionicons name="checkmark" size={28} color={colors.white} />
            <Text style={styles.acceptTxt}>Accept</Text>
          </Pressable>
        </View>
        <Text style={styles.timerHint}>Auto-dismisses in 30 seconds</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.navy,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  pulseIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  badge: {
    backgroundColor: colors.primary,
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.white, textAlign: 'center' },
  meta: { color: colors.orangeTint, marginTop: spacing.sm, fontSize: 15, textAlign: 'center' },
  addr: { color: colors.white, marginTop: spacing.md, fontSize: 14, lineHeight: 20, textAlign: 'center', opacity: 0.85 },
  spacer: { flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, width: '100%' },
  declineBtn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  declineTxt: { fontWeight: '700', color: colors.white },
  acceptBtn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.success,
  },
  acceptTxt: { fontWeight: '700', color: colors.white },
  timerHint: { marginTop: spacing.lg, fontSize: 12, color: colors.orangeTint, textAlign: 'center' },
});
