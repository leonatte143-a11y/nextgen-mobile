import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { usePartner } from '../context/PartnerContext';
import type { PartnerStackParamList } from '../navigation/PartnerStackTypes';

type Props = NativeStackScreenProps<PartnerStackParamList, 'PartnerRequestStatus'>;

export function PartnerRequestStatusScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { requests, acceptRequest, rejectRequest } = usePartner();
  const [loading, setLoading] = useState(false);

  const request = requests.find((item) => item.id === route.params.requestId);

  const onConfirm = async () => {
    if (!request || loading) return;
    setLoading(true);
    try {
      await acceptRequest(request.id);
      navigation.replace('PartnerRequestDetail', { requestId: request.id });
    } finally {
      setLoading(false);
    }
  };

  const onDecline = async () => {
    if (!request || loading) return;
    setLoading(true);
    try {
      await rejectRequest(request.id);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (!request) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Request not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.customerCard}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerAvatarTxt}>{request.customerName[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName}>{request.customerName}</Text>
            <Text style={styles.customerAddress}>{request.address}</Text>
            <Text style={styles.customerMeta}>{request.serviceName} · {request.distanceKm} km</Text>
          </View>
        </View>

        <View style={styles.map}>
          <Ionicons name="map-outline" size={32} color={colors.grey} />
          <Text style={styles.mapLabel}>Map preview</Text>
          <Text style={styles.mapSub}>{request.distanceKm} km away</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.actionsRow}>
          <Pressable style={styles.declineBtn} onPress={onDecline} disabled={loading}>
            <Text style={styles.declineTxt}>Decline</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <PrimaryButton title="Confirm" onPress={onConfirm} loading={loading} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarTxt: { fontSize: 20, fontWeight: '800', color: colors.primary },
  customerName: { fontWeight: '800', fontSize: 16, color: colors.charcoal },
  customerAddress: { color: colors.grey, marginTop: 4, fontSize: 13 },
  customerMeta: { color: colors.charcoal, marginTop: 4, fontSize: 13, fontWeight: '600' },
  map: {
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  mapLabel: { fontWeight: '800', color: colors.charcoal },
  mapSub: { color: colors.grey, fontSize: 12 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  actionsRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'stretch' },
  declineBtn: {
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineTxt: { color: colors.charcoal, fontWeight: '800' },
});
