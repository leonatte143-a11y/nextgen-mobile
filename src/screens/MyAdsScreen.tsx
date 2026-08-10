import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';
import { bannerService, type MyAdRequest } from '../services/bannerService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_STYLES: Record<MyAdRequest['status'], { bg: string; fg: string; label: string }> = {
  pending: { bg: colors.warning, fg: colors.white, label: 'Pending' },
  approved: { bg: colors.success, fg: colors.white, label: 'Approved' },
  rejected: { bg: colors.error, fg: colors.white, label: 'Rejected' },
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function MyAdsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [ads, setAds] = useState<MyAdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await bannerService.listMyAds();
      setAds(rows);
    } catch {
      // keep whatever was previously loaded; list is best-effort
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <ScreenLoader />;

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>My Ads</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={ads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="megaphone-outline" size={40} color={colors.grey} />
            <Text style={styles.emptyTxt}>No ads submitted yet.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending;
          return (
            <View style={styles.card}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={[styles.image, styles.imageFallback]}>
                  <Ionicons name="image-outline" size={28} color={colors.grey} />
                </View>
              )}
              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={[styles.pill, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.pillTxt, { color: statusStyle.fg }]}>{statusStyle.label}</Text>
                  </View>
                </View>
                <Text style={styles.cardDates}>
                  {formatDate(item.startDate)} – {formatDate(item.endDate)}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.charcoal },
  list: { padding: spacing.md, flexGrow: 1 },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl * 2, gap: spacing.sm },
  emptyTxt: { color: colors.grey, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  image: { width: 96, height: 96 },
  imageFallback: { backgroundColor: colors.greyLight, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, padding: spacing.md, justifyContent: 'center', gap: spacing.xs },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.charcoal },
  pill: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  pillTxt: { fontSize: 11, fontWeight: '800' },
  cardDates: { fontSize: 12, color: colors.grey },
});
