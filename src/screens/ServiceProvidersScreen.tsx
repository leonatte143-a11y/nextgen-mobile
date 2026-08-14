import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { CatalogService, PartnerSummary } from '../mock/types';
import { catalogService } from '../services/catalogService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'ServiceProviders'>;

export function ServiceProvidersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const [service, setService] = useState<CatalogService | null>(null);
  const [providers, setProviders] = useState<PartnerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [svc, partners] = await Promise.all([
          catalogService.getServiceById(route.params.serviceId),
          catalogService.getServicePartners(route.params.serviceId),
        ]);
        setService(svc);
        setProviders(partners ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.serviceId]);

  if (loading) {
    return <ScreenLoader />;
  }

  const title = service?.name || 'Service Providers';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Service Providers</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.header}>
        <Text style={styles.serviceName}>{title}</Text>
        {service ? (
          <Text style={styles.serviceMeta} numberOfLines={1}>
            {service.categoryLabel} · ★ {service.rating.toFixed(1)} ({service.reviewsCount})
          </Text>
        ) : null}
      </View>
      {providers.length === 0 ? (
        <EmptyState
          icon="📵"
          title="No partners available for this service right now."
          subtitle="We couldn't find an approved provider for this service right now. Please check again later."
          actionLabel="Back to services"
          onAction={() => navigation.goBack()}
        />
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                navigation.navigate('ServiceDetail', {
                  serviceId: route.params.serviceId,
                  selectedPartnerId: item.id,
                })
              }
            >
              <View style={styles.row}>
                <View style={styles.photo}>
                  {item.photoUrl ? (
                    <Image source={{ uri: item.photoUrl }} style={styles.photoImage} />
                  ) : (
                    <Text style={styles.photoTxt}>{item.name[0]}</Text>
                  )}
                </View>
                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={[styles.statusBadge, item.isOnline ? styles.online : styles.offline]}>
                      <Text style={styles.statusText}>{item.isOnline ? 'Online' : 'Offline'}</Text>
                    </View>
                  </View>
                  <Text style={styles.rating} numberOfLines={1}>
                    ★ {item.rating.toFixed(1)} · {item.reviewsCount ?? 0} reviews
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    Jobs completed: {item.jobsCompleted}
                  </Text>
                  <View style={styles.distanceRow}>
                    <Ionicons name="location" size={14} color={colors.primary} />
                    <Text style={styles.distance}>
                      {item.distanceKm != null ? `${item.distanceKm.toFixed(1)} km` : '—'}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
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
  header: { padding: spacing.md, paddingBottom: 0 },
  serviceName: { fontSize: 22, fontWeight: '800', color: colors.charcoal },
  serviceMeta: { fontSize: 13, color: colors.grey, marginTop: spacing.xs },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoTxt: { color: colors.primary, fontSize: 28, fontWeight: '800' },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: 16, fontWeight: '700', color: colors.charcoal, flex: 1 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  online: { backgroundColor: colors.online },
  offline: { backgroundColor: colors.offline },
  statusText: { fontSize: 11, fontWeight: '800', color: colors.white },
  rating: { fontSize: 13, color: colors.charcoal, marginTop: spacing.xs },
  meta: { fontSize: 12, color: colors.grey, marginTop: spacing.xs },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  distance: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
});
