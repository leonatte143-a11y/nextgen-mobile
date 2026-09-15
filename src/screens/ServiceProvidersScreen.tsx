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
import { getCoordsIfPermitted } from '../services/locationService';
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
        const coords = await getCoordsIfPermitted();
        const [svc, partners] = await Promise.all([
          catalogService.getServiceById(route.params.serviceId),
          catalogService.getServicePartners(route.params.serviceId, coords, route.params.subIconQuery),
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

  const categoryTag = (service?.categoryLabel || service?.name || 'Service').toUpperCase();

  const viewProfile = (item: PartnerSummary) =>
    navigation.navigate('ServiceDetail', {
      serviceId: route.params.serviceId,
      selectedPartnerId: item.id,
    });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Service Providers</Text>
        <View style={{ width: 24 }} />
      </View>
      {providers.length === 0 ? (
        <EmptyState
          icon="📵"
          title="No partners available for this service right now in your location"
          subtitle="We couldn't find an approved provider for this service right now. Please check again later."
          actionLabel="Back to Services"
          onAction={() => navigation.goBack()}
        />
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.photo}>
                {item.photoUrl ? (
                  <Image source={{ uri: item.photoUrl }} style={styles.photoImage} />
                ) : (
                  <Text style={styles.photoTxt}>{item.name[0]}</Text>
                )}
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.verifiedBlue} />
                </View>
              </View>
              <View style={styles.info}>
                <View style={styles.badgeRow}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagTxt} numberOfLines={1}>{categoryTag}</Text>
                  </View>
                  <View style={[styles.statusTag, item.isOnline ? styles.online : styles.offline]}>
                    <Text style={styles.statusTagTxt}>{item.isOnline ? 'Online' : 'Offline'}</Text>
                  </View>
                </View>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.description} numberOfLines={3}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.bottomBlock}>
                  <View style={styles.metaRow}>
                    <Ionicons name="location" size={13} color={colors.grey} />
                    <Text style={styles.metaTxt}>
                      {item.distanceKm != null ? `${item.distanceKm.toFixed(1)} km away` : 'Nearby'}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="star" size={13} color={colors.primary} />
                    <Text style={styles.ratingTxt}>{item.rating.toFixed(1)}</Text>
                    <Text style={styles.metaTxt}>({item.reviewsCount ?? 0})</Text>
                  </View>
                  <Pressable style={styles.viewProfileBtn} onPress={() => viewProfile(item)}>
                    <Text style={styles.viewProfileTxt}>View Profile</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.white} />
                  </Pressable>
                </View>
              </View>
            </View>
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
  card: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  photo: {
    width: '35%',
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoTxt: { color: colors.primary, fontSize: 32, fontWeight: '800' },
  verifiedBadge: {
    position: 'absolute',
    top: '50%',
    right: 6,
    marginTop: -9,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    padding: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  info: { flex: 1, padding: spacing.md },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusTag: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  statusTagTxt: { color: colors.white, fontSize: 10, fontWeight: '800' },
  online: { backgroundColor: colors.online },
  offline: { backgroundColor: colors.offline },
  categoryTag: {
    backgroundColor: colors.categoryTagPurple,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    maxWidth: '80%',
  },
  categoryTagTxt: { color: colors.white, fontSize: 10, fontWeight: '800' },
  name: { fontSize: 15, fontWeight: '800', color: colors.charcoal, marginTop: spacing.sm, marginBottom: 4 },
  description: { fontSize: 12, color: colors.grey, lineHeight: 16, marginBottom: spacing.sm },
  bottomBlock: { alignItems: 'flex-end', marginTop: 'auto', gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTxt: { fontSize: 12, color: colors.grey },
  ratingTxt: { fontSize: 12, fontWeight: '800', color: colors.charcoal },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    marginTop: 4,
  },
  viewProfileTxt: { color: colors.white, fontWeight: '700', fontSize: 14 },
});
