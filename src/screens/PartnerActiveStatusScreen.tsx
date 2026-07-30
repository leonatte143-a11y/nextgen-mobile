import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveTrackingAdBanner } from '../components/LiveTrackingAdBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { usePartner } from '../context/PartnerContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PartnerStackParamList } from '../navigation/PartnerStackTypes';

type Props = NativeStackScreenProps<PartnerStackParamList, 'PartnerActiveStatus'>;

export function PartnerActiveStatusScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { requests } = usePartner();
  const request = requests.find((item) => item.id === route.params.requestId);

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'PartnerTabs' }] });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.customerCard}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerAvatarTxt}>{request?.customerName?.[0] ?? 'C'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName}>{request?.customerName ?? 'Customer'}</Text>
            <Text style={styles.customerAddress}>{request?.address ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.map}>
          <Ionicons name="navigate-outline" size={32} color={colors.grey} />
          <Text style={styles.mapLabel}>Navigating to customer</Text>
          <Text style={styles.mapSub}>
            {request?.distanceKm != null ? `${request.distanceKm} km away` : 'Live location will appear here'}
          </Text>
        </View>

        <LiveTrackingAdBanner />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton title="Close" variant="outline" onPress={goHome} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
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
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
