import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { AppNotification } from '../mock/types';
import { notificationService } from '../services/notificationService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Tab = 'all' | 'orders' | 'offers';

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<Tab>('all');
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.list();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((n) => {
    if (tab === 'orders') return n.type === 'order' || n.type === 'health';
    if (tab === 'offers') return n.type === 'offer';
    return true;
  });

  const markAll = async () => {
    await notificationService.markAllRead();
    load();
  };

  const onTap = async (item: AppNotification) => {
    if (!item.read) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      try {
        await notificationService.markRead(item.id);
      } catch {
        load();
      }
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <Pressable onPress={markAll} hitSlop={8}>
          <Text style={styles.mark}>Mark all read</Text>
        </Pressable>
      </View>
      <View style={styles.tabs}>
        {(['all', 'orders', 'offers'] as const).map((t) => (
          <Pressable key={t} style={[styles.pill, tab === t && styles.pillOn]} onPress={() => setTab(t)}>
            <Text style={[styles.pillTxt, tab === t && styles.pillTxtOn]}>
              {t === 'all' ? 'All' : t === 'orders' ? 'Orders' : 'Offers'}
            </Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <ScreenLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No new updates"
          actionLabel="Explore services"
          onAction={() => navigation.navigate('AllServices')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(x) => x.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable onPress={() => onTap(item)} style={[styles.card, !item.read && styles.unread]}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={item.type === 'offer' ? 'gift-outline' : 'notifications-outline'}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
                <Text style={styles.time}>{item.timeLabel}</Text>
              </View>
              {!item.read ? <View style={styles.dot} /> : null}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '800' },
  mark: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  tabs: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.greyLight,
  },
  pillOn: { backgroundColor: colors.primary },
  pillTxt: { fontWeight: '600', color: colors.charcoal },
  pillTxtOn: { color: colors.white },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'flex-start',
  },
  unread: { backgroundColor: colors.orangeTint },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontWeight: '800', color: colors.charcoal },
  cardBody: { color: colors.grey, marginTop: 4, lineHeight: 20 },
  time: { fontSize: 12, color: colors.grey, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
});
