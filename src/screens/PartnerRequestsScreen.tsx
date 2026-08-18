import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePartner } from '../context/PartnerContext';
import { colors, radius, spacing } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';
import type { PartnerRequest } from '../mock/types';

type Props = { navigation: any; route?: { params?: { initialView?: 'active' | 'completed' } } };

export function PartnerRequestsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { requests, refreshPartner, isLoading } = usePartner();
  const [view, setView] = useState<'active' | 'completed'>(
    route?.params?.initialView === 'completed' ? 'completed' : 'active',
  );

  // Tab screens stay mounted, so react to a fresh `initialView` param (e.g. tapping
  // "Completed History" again from the dashboard) even when this screen is already open.
  useEffect(() => {
    if (route?.params?.initialView) setView(route.params.initialView);
  }, [route?.params?.initialView]);

  const visibleRequests = useMemo(() => {
    if (view === 'completed') {
      return requests.filter((request) => request.status === 'completed');
    }
    return requests.filter(
      (request) => request.status !== 'rejected' && request.status !== 'cancelled' && request.status !== 'completed',
    );
  }, [requests, view]);

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
        <Text style={styles.requestMeta}>
          {item.lineItems && item.lineItems.length > 0 ? `₹${item.partnerShare} take-home · ` : ''}
          {item.distanceKm} km
        </Text>
      </Pressable>
    );
  };

  const tabsHeader = (
    <View style={styles.headerRow}>
      <Text style={styles.title}>Requests</Text>
      <View style={styles.tabsRow}>
        <Pressable style={[styles.tabBtn, view === 'active' && styles.tabBtnOn]} onPress={() => setView('active')}>
          <Text style={[styles.tabTxt, view === 'active' && styles.tabTxtOn]}>Active</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, view === 'completed' && styles.tabBtnOn]} onPress={() => setView('completed')}>
          <Text style={[styles.tabTxt, view === 'completed' && styles.tabTxtOn]}>Completed History</Text>
        </Pressable>
      </View>
      <Text style={styles.sub}>Tap a request to view details</Text>
    </View>
  );

  if (isLoading) {
    return <EmptyState icon="🔄" title="Loading requests..." />;
  }

  if (visibleRequests.length === 0) {
    return (
      <View style={styles.root}>
        <View style={{ paddingTop: insets.top, paddingHorizontal: spacing.lg }}>{tabsHeader}</View>
        <EmptyState
          icon={view === 'completed' ? '📋' : '✅'}
          title={view === 'completed' ? 'No completed jobs yet' : 'No active partner requests'}
          subtitle={
            view === 'completed'
              ? 'Jobs you finish will show up here.'
              : 'You are all caught up. Check back soon for new lead alerts.'
          }
          actionLabel="Refresh"
          onAction={() => {
            void refreshPartner();
          }}
        />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]}
      data={visibleRequests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={tabsHeader}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  headerRow: { marginBottom: spacing.md },
  title: { fontSize: 22, fontWeight: '800' },
  sub: { color: colors.grey, marginTop: spacing.xs },
  tabsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  tabBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  tabBtnOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabTxt: { color: colors.charcoal, fontWeight: '700', fontSize: 13 },
  tabTxtOn: { color: colors.white },
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
