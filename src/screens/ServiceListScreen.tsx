import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ServiceCard } from '../components/ServiceCard';
import { EmptyState } from '../components/EmptyState';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, spacing } from '../constants/theme';
import type { CatalogService } from '../mock/types';
import { sortByFavoritePartner, useFavorites } from '../context/FavoritesContext';
import { catalogService } from '../services/catalogService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'ServiceList'>;

export function ServiceListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const insets = useSafeAreaInsets();
  const { bucketId, title, searchQuery } = route.params ?? {};
  const { isFavorite, favorites } = useFavorites();
  const [items, setItems] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let data;
        if (searchQuery?.trim()) {
          data = await catalogService.searchServices(searchQuery.trim());
          if (bucketId) {
            data = data.filter((s) => s.bucketId === bucketId);
          }
          if (data.length === 0) {
            const bucketData = await catalogService.getServicesByBucket(bucketId ?? null);
            const q = searchQuery.trim().toLowerCase();
            data = bucketData.filter((s) => {
              const hay = `${s.name} ${s.subtext} ${s.categoryLabel}`.toLowerCase();
              return hay.includes(q);
            });
          }
        } else {
          data = await catalogService.getServicesByBucket(bucketId ?? null);
        }
        setItems(sortByFavoritePartner(data, isFavorite));
      } finally {
        setLoading(false);
      }
    })();
  }, [bucketId, searchQuery, isFavorite, favorites]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{title ?? 'Services'}</Text>
        <View style={{ width: 24 }} />
      </View>
      {loading ? (
        <ScreenLoader />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No services"
          subtitle="Try another category or search."
          actionLabel="Browse all"
          onAction={() => navigation.replace('AllServices')}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => x.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() => navigation.navigate('ServiceProviders', { serviceId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', paddingHorizontal: spacing.sm },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
});
