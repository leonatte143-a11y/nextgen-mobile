import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { Booking, BookingStatus } from '../mock/types';
import { bookingService } from '../services/bookingService';
import type { MainTabScreenProps } from '../navigation/types';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ACTIVE: BookingStatus[] = ['confirmed', 'partner_assigned', 'en_route', 'awaiting_otp', 'in_progress'];

function isActive(s: BookingStatus) {
  return ACTIVE.includes(s);
}

export function BookingsScreen({ navigation: tabNav }: MainTabScreenProps<'Bookings'>) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await bookingService.getBookings();
      setItems(all);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((b) => (tab === 'active' ? isActive(b.status) : !isActive(b.status)));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.h1}>My Bookings</Text>
      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'active' && styles.tabOn]} onPress={() => setTab('active')}>
          <Text style={[styles.tabTxt, tab === 'active' && styles.tabTxtOn]}>Active</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'history' && styles.tabOn]} onPress={() => setTab('history')}>
          <Text style={[styles.tabTxt, tab === 'history' && styles.tabTxtOn]}>History</Text>
        </Pressable>
      </View>
      {loading ? (
        <ScreenLoader />
      ) : tab === 'active' && filtered.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No active bookings"
          subtitle="Book a service to see live tracking here."
          actionLabel="Book a service"
          onAction={() => tabNav.navigate('Home')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(x) => x.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={load}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => {
                if (isActive(item.status)) navigation.navigate('LiveBooking', { bookingId: item.id });
              }}
            >
              <View style={styles.row}>
                <Text style={styles.name}>{item.serviceName}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.partner}>
                {item.partnerName} · ₹{item.totalAmount}
              </Text>
              {item.lineItems && item.lineItems.length > 0 ? (
                <Text style={styles.lineItems} numberOfLines={2}>
                  {item.lineItems.map((li) => li.title).join(', ')}
                </Text>
              ) : null}
              <View style={styles.badgeRow}>
                <Text
                  style={[
                    styles.badge,
                    item.status === 'completed' && styles.badgeOk,
                    item.status === 'cancelled' && styles.badgeBad,
                  ]}
                >
                  {item.status === 'completed' ? 'Completed' : item.status === 'cancelled' ? 'Cancelled' : 'Live'}
                </Text>
                {isActive(item.status) ? (
                  <Text style={styles.track}>Track →</Text>
                ) : (
                  <Pressable
                    onPress={() =>
                      navigation.navigate('ServiceDetail', { serviceId: item.serviceId })
                    }
                  >
                    <Text style={styles.rebook}>Re-book</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  h1: { fontSize: 20, fontWeight: '800', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.lg, marginBottom: spacing.md },
  tab: { paddingBottom: spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: colors.primary },
  tabTxt: { fontWeight: '600', color: colors.grey },
  tabTxtOn: { color: colors.primary, fontWeight: '800' },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontWeight: '800', fontSize: 16, flex: 1 },
  date: { color: colors.grey, fontSize: 12 },
  partner: { color: colors.grey, marginTop: 6 },
  lineItems: { color: colors.charcoal, marginTop: 4, fontSize: 12 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, alignItems: 'center' },
  badge: { fontWeight: '700', color: colors.warning },
  badgeOk: { color: colors.success },
  badgeBad: { color: colors.error },
  track: { color: colors.primary, fontWeight: '700' },
  rebook: { color: colors.primary, fontWeight: '700' },
});
