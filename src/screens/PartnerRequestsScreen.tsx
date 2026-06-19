import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePartner } from '../context/PartnerContext';
import { colors, radius, spacing } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';
import type { PartnerRequest } from '../mock/types';

type Props = { navigation: any };

export function PartnerRequestsScreen({ navigation }: Props) {
  const { requests, acceptRequest, rejectRequest, refreshPartner, isLoading } = usePartner();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const visibleRequests = useMemo(
    () => requests.filter((request) => request.status !== 'rejected' && request.status !== 'cancelled'),
    [requests],
  );

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      await acceptRequest(id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await rejectRequest(id);
    } finally {
      setActionLoading(null);
    }
  };

  const renderItem = ({ item }: { item: PartnerRequest }) => {
    const badgeStyle = [
      styles.statusBadge,
      item.status === 'new'
        ? styles.badgeNew
        : item.status === 'pending' || item.status === 'in_progress'
          ? styles.badgeProgress
          : styles.badgeComplete,
    ];
    return (
      <Pressable style={styles.requestCard} onPress={() => navigation.navigate('PartnerRequestDetail', { requestId: item.id })}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestTitle}>{item.serviceName}</Text>
          <View style={badgeStyle}>
            <Text style={styles.badgeText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.requestMeta}>{item.customerName} · {item.address}</Text>
        <Text style={styles.requestMeta}>₹{item.partnerShare} take-home · {item.distanceKm} km</Text>
        <View style={styles.requestActions}>
          {item.status === 'new' ? (
            <>
              <Pressable style={styles.rejectButton} onPress={() => handleReject(item.id)} disabled={actionLoading === item.id}>
                <Text style={styles.rejectLabel}>Reject</Text>
              </Pressable>
              <Pressable style={styles.acceptButton} onPress={() => handleAccept(item.id)} disabled={actionLoading === item.id}>
                <Text style={styles.acceptLabel}>Accept</Text>
              </Pressable>
            </>
          ) : item.status === 'pending' ? (
            <Pressable
              style={styles.actionButton}
              onPress={() => navigation.navigate('PartnerRequestDetail', { requestId: item.id })}
            >
              <Text style={styles.actionLabel}>Mark Arrived</Text>
            </Pressable>
          ) : item.status === 'in_progress' ? (
            <Pressable
              style={styles.actionButton}
              onPress={() => navigation.navigate('PartnerRequestDetail', { requestId: item.id })}
            >
              <Text style={styles.actionLabel}>Complete Job</Text>
            </Pressable>
          ) : null}
        </View>
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
      contentContainerStyle={styles.content}
      data={visibleRequests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <View style={styles.headerRow}>
          <Text style={styles.title}>Incoming Requests</Text>
          <Text style={styles.sub}>Tap a request to view full details</Text>
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
  badgePending: { backgroundColor: colors.orangeTint },
  badgeProgress: { backgroundColor: '#1E90FF' },
  badgeComplete: { backgroundColor: colors.success },
  badgeText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  requestMeta: { color: colors.grey, marginTop: spacing.xs },
  requestActions: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  rejectButton: { backgroundColor: colors.greyLight, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  acceptButton: { backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  rejectLabel: { color: colors.charcoal, fontWeight: '700' },
  acceptLabel: { color: colors.white, fontWeight: '700' },
  actionButton: { backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  actionLabel: { color: colors.white, fontWeight: '700' },
});
