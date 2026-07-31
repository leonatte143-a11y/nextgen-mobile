import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePartner } from '../context/PartnerContext';
import { colors, radius, spacing } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';
import type { PartnerRequest } from '../mock/types';

type Props = { navigation: any };

export function PartnerRequestsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { requests, refreshPartner, isLoading } = usePartner();

  const visibleRequests = useMemo(
    () => requests.filter((request) => request.status !== 'rejected' && request.status !== 'cancelled'),
    [requests],
  );

  const renderItem = ({ item }: { item: PartnerRequest }) => {
    const badgeStyle = [
      styles.statusBadge,
      item.status === 'new'
        ? styles.badgeNew
        : item.status === 'pending' || item.status === 'in_progress'
          ? styles.badgeProgress
          : styles.badgeComplete,
    ];
    const onPressCard = () => {
      if (item.status === 'new') {
        navigation.navigate('PartnerRequestStatus', { requestId: item.id });
        return;
      }
      navigation.navigate('PartnerRequestDetail', { requestId: item.id });
    };
    return (
      <Pressable style={styles.requestCard} onPress={onPressCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestTitle}>{item.serviceName}</Text>
          <View style={badgeStyle}>
            <Text style={styles.badgeText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.requestMeta}>{item.customerName} · {item.address}</Text>
        <Text style={styles.requestMeta}>₹{item.partnerShare} take-home · {item.distanceKm} km</Text>
      </Pressable>
    );
  };

  if (isLoading) {
    return <EmptyState icon="🔄" title="Loading requests..." />;
  }

  if (visibleRequests.length === 0) {
    return (
      <EmptyState
        icon="✅"
        title="No active partner requests"
        subtitle="You are all caught up. Check back soon for new lead alerts."
        actionLabel="Refresh"
        onAction={() => {
          void refreshPartner();
        }}
      />
    );
  }

  return (
    <FlatList
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]}
      data={visibleRequests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <View style={styles.headerRow}>
          <Text style={styles.title}>Requests</Text>
          <Text style={styles.sub}>Tap a request to view details</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  headerRow: { marginBottom: spacing.md },
  title: { fontSize: 22, fontWeight: '800' },
  sub: { color: colors.grey, marginTop: spacing.xs },
  requestCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md, elevation: 1 },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestTitle: { fontSize: 16, fontWeight: '800' },
  statusBadge: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  badgeNew: { backgroundColor: colors.primary },
  badgeProgress: { backgroundColor: '#1E90FF' },
  badgeComplete: { backgroundColor: colors.success },
  badgeText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  requestMeta: { color: colors.grey, marginTop: spacing.xs },
});
