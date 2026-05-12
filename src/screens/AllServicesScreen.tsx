import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { BucketId, CatalogService } from '../mock/types';
import { sortByFavoritePartner, useFavorites } from '../context/FavoritesContext';
import { catalogService } from '../services/catalogService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function AllServicesScreen() {
  const navigation = useNavigation<Nav>();
  const { isFavorite, favorites } = useFavorites();
  const [items, setItems] = useState<CatalogService[]>([]);
  const [buckets, setBuckets] = useState<Array<{ id: string; nameEn: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BucketId | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [data, b] = await Promise.all([
        catalogService.getServicesByBucket(filter),
        catalogService.getBuckets(),
      ]);
      setBuckets(b as any);
      setItems(sortByFavoritePartner(data, isFavorite));
      setLoading(false);
    })();
  }, [filter, isFavorite, favorites]);

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Choose a Service</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        horizontal
        data={[{ id: 'all', label: 'All' } as const, ...buckets.map((b) => ({ id: b.id, label: b.nameEn }))]}
        keyExtractor={(x) => x.id}
        style={styles.tabs}
        contentContainerStyle={styles.tabsIn}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.tab, (filter === item.id || (item.id === 'all' && filter === null)) && styles.tabOn]}
            onPress={() => setFilter(item.id === 'all' ? null : (item.id as BucketId))}
          >
            <Text
              style={[
                styles.tabTxt,
                (filter === item.id || (item.id === 'all' && filter === null)) && styles.tabTxtOn,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        )}
      />
      {loading ? (
        <ScreenLoader />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => x.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
            >
              <Text style={styles.emoji}>🔧</Text>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.sub} numberOfLines={2}>
                {item.subtext}
              </Text>
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
  tabs: { maxHeight: 52 },
  tabsIn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.greyLight,
    marginRight: spacing.sm,
  },
  tabOn: { backgroundColor: colors.primary },
  tabTxt: { fontWeight: '600', color: colors.charcoal },
  tabTxtOn: { color: colors.white },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  card: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    minHeight: 120,
  },
  emoji: { fontSize: 28, color: colors.primary },
  name: { fontWeight: '800', textAlign: 'center', marginTop: spacing.sm, fontSize: 13, color: colors.charcoal },
  sub: { fontSize: 10, color: colors.grey, textAlign: 'center', marginTop: 4 },
});
