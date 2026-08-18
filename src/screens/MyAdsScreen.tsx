import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { AdDraft } from '../lib/adDrafts';
import { deleteDraft, listDrafts } from '../lib/adDrafts';
import type { RootStackParamList } from '../navigation/types';
import { bannerService, type MyAdRequest } from '../services/bannerService';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Tab = 'live' | 'pending' | 'drafts';

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function MyAdsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<Tab>('live');
  const [ads, setAds] = useState<MyAdRequest[]>([]);
  const [drafts, setDrafts] = useState<AdDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const goHome = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  }, [navigation]);

  // Ads reached this screen via a payment success replace(), which leaves the
  // ad-creation stack sitting underneath — override back so it always exits to Home
  // instead of popping back into that stale form flow.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        goHome();
        return true;
      });
      return () => sub.remove();
    }, [goHome]),
  );

  const load = useCallback(async () => {
    try {
      const [rows, draftRows] = await Promise.all([bannerService.listMyAds(), listDrafts()]);
      setAds(rows);
      setDrafts(draftRows);
    } catch {
      // best-effort — keep whatever was previously loaded
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

  const liveAds = ads.filter((a) => a.status === 'approved');
  const pendingAds = ads.filter((a) => a.status !== 'approved');

  const renew = (item: MyAdRequest) => {
    navigation.navigate('AdvertiseBusiness', {
      prefill: {
        businessName: item.title,
        businessAddress: item.subtitle ?? undefined,
        bannerUri: item.imageUrl,
        bannerBase64: item.imageUrl,
        bannerType: item.mediaType as 'image' | 'video',
      },
    });
  };

  const openDraft = (draft: AdDraft) => {
    navigation.navigate('AdvertiseBusiness', { draftId: draft.id });
  };

  const removeDraft = async (id: string) => {
    await deleteDraft(id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  if (loading) return <ScreenLoader />;

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={goHome} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>My Ads</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabBar}>
        {(['live', 'pending', 'drafts'] as Tab[]).map((t) => (
          <Pressable key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabTxt, tab === t && styles.tabTxtActive]}>
              {t === 'live' ? 'Live' : t === 'pending' ? 'Pending' : 'Drafts'}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'drafts' ? (
        <FlatList
          data={drafts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-outline" size={40} color={colors.grey} />
              <Text style={styles.emptyTxt}>No drafts saved.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => openDraft(item)}>
              {item.bannerUri ? (
                <Image source={{ uri: item.bannerUri }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={[styles.image, styles.imageFallback]}>
                  <Ionicons name="image-outline" size={28} color={colors.grey} />
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.businessName || 'Untitled draft'}</Text>
                <Text style={styles.cardDates}>Saved {formatDate(item.savedAt)}</Text>
              </View>
              <Pressable style={styles.deleteBtn} onPress={() => void removeDraft(item.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </Pressable>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={tab === 'live' ? liveAds : pendingAds}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="megaphone-outline" size={40} color={colors.grey} />
              <Text style={styles.emptyTxt}>{tab === 'live' ? 'No live ads yet.' : 'Nothing under review.'}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={[styles.image, styles.imageFallback]}>
                  <Ionicons name="image-outline" size={28} color={colors.grey} />
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardDates}>
                  {formatDate(item.startDate)} – {formatDate(item.endDate)}
                </Text>
                {tab === 'pending' ? (
                  <Text style={styles.reasonTxt} numberOfLines={2}>
                    {item.reviewNote || (item.status === 'rejected' ? 'Rejected — contact support for details.' : 'Under review by KAIRO.')}
                  </Text>
                ) : null}
                {tab === 'live' ? (
                  <Pressable style={styles.renewBtn} onPress={() => renew(item)}>
                    <Ionicons name="refresh-outline" size={14} color={colors.white} />
                    <Text style={styles.renewTxt}>Renew</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.charcoal },
  tabBar: {
    flexDirection: 'row',
    margin: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  tabBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.primary },
  tabTxt: { fontWeight: '700', color: colors.grey, fontSize: 13 },
  tabTxtActive: { color: colors.white },
  list: { padding: spacing.md, paddingTop: 0, flexGrow: 1 },
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
    alignItems: 'center',
  },
  image: { width: 96, height: 96 },
  imageFallback: { backgroundColor: colors.greyLight, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, padding: spacing.md, justifyContent: 'center', gap: spacing.xs },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.charcoal },
  cardDates: { fontSize: 12, color: colors.grey },
  reasonTxt: { fontSize: 12, color: colors.error, marginTop: 2 },
  renewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: spacing.xs,
  },
  renewTxt: { color: colors.white, fontWeight: '700', fontSize: 12 },
  deleteBtn: { padding: spacing.md },
});
