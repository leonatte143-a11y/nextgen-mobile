import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ServiceCard } from '../components/ServiceCard';
import { EmptyState } from '../components/EmptyState';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, spacing } from '../constants/theme';
import type { CatalogService } from '../mock/types';
import { catalogService } from '../services/catalogService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'ServiceList'>;

export function ServiceListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { bucketId, title } = route.params ?? {};
  const [items, setItems] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await catalogService.getServicesByBucket(bucketId ?? null);
      setItems(data);
      setLoading(false);
    })();
  }, [bucketId]);

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>{title ?? 'Services'}</Text>
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
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
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
  title: { fontSize: 18, fontWeight: '800' },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
});
