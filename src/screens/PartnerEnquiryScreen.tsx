import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { partnerService, type PartnerEnquiry } from '../services/partnerService';

function timeAgo(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function PartnerEnquiryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [enquiries, setEnquiries] = useState<PartnerEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await partnerService.getEnquiries();
      setEnquiries(rows);
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

  // Mark all enquiries as read whenever this screen gains focus, so the
  // entry-point red dot clears immediately. Update local state in-place
  // rather than refetching, so the "opened" (muted) styling shows at once.
  useFocusEffect(
    useCallback(() => {
      partnerService
        .markEnquiriesRead()
        .then(() => {
          setEnquiries((prev) => prev.map((item) => ({ ...item, read: true })));
        })
        .catch(() => {
          // best-effort; if this fails the badge/styling simply won't clear yet
        });
    }, []),
  );

  if (loading) return <ScreenLoader />;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Enquiry</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={enquiries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="eye-outline" size={40} color={colors.grey} />
            <Text style={styles.emptyTitle}>No enquiries yet</Text>
            <Text style={styles.emptySub}>Users who view your profile will show up here.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const unread = item.read === false;
          return (
            <View style={[styles.card, unread ? styles.cardUnread : styles.cardRead]}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, opacity: unread ? 1 : 0.6 }}>
                <View style={styles.titleRow}>
                  {unread ? <View style={styles.unreadDot} /> : null}
                  <Text style={[styles.cardTitle, unread ? styles.cardTitleUnread : styles.cardTitleRead]}>
                    {item.payload?.viewerName || 'A user'} viewed your profile
                  </Text>
                </View>
                {item.payload?.viewerPhone ? (
                  <Text style={styles.cardDetail}>📞 {item.payload.viewerPhone}</Text>
                ) : null}
                {item.payload?.viewerLocation ? (
                  <Text style={styles.cardDetail}>📍 {item.payload.viewerLocation}</Text>
                ) : null}
                <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
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
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.charcoal },
  list: { padding: spacing.md, flexGrow: 1 },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl * 2, gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.charcoal },
  emptySub: { color: colors.grey, textAlign: 'center', lineHeight: 20 },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  cardUnread: {
    backgroundColor: colors.orangeTint,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  cardRead: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  cardTitle: { color: colors.charcoal },
  cardTitleUnread: { fontWeight: '700' },
  cardTitleRead: { fontWeight: '400' },
  cardDetail: { color: colors.grey, marginTop: 4, fontSize: 13 },
  time: { fontSize: 12, color: colors.grey, marginTop: 6 },
});
