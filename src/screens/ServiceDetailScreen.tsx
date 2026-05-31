import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import type { CatalogService, PartnerSummary } from '../mock/types';
import { catalogService } from '../services/catalogService';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'ServiceDetail'>;

export function ServiceDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { addService } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [svc, setSvc] = useState<CatalogService | null>(null);
  const [servicePartners, setServicePartners] = useState<PartnerSummary[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerLoading, setPartnerLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setPartnerLoading(true);

      const [s, partners] = await Promise.all([
        catalogService.getServiceById(route.params.serviceId),
        catalogService.getServicePartners(route.params.serviceId),
      ]);

      setSvc(s);
      const partnerList = partners ?? [];
      setServicePartners(partnerList);
      const selected =
        route.params.selectedPartnerId && partnerList.length
          ? partnerList.find((p) => p.id === route.params.selectedPartnerId) ?? partnerList[0]
          : partnerList[0] ?? null;
      setSelectedPartner(selected);
      setPartnerLoading(false);
      setLoading(false);
    })();
  }, [route.params.serviceId]);

  if (loading || !svc) {
    return <ScreenLoader />;
  }

  const isRemote = svc.bucketId === 'tech_supply';
  const favorited = selectedPartner ? isFavorite(selectedPartner.id) : false;

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>{svc.name}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.cat}>
          {svc.categoryLabel} · ★ {svc.rating.toFixed(1)} ({svc.reviewsCount})
        </Text>
        <Text style={styles.desc}>{svc.description}</Text>
        {isRemote ? (
          <View style={styles.remoteBox}>
            <Text style={styles.remoteLab}>Remote service</Text>
            <Text style={styles.deadlineTxt}>
              Project deadline: <Text style={styles.deadlineStrong}>30 Apr 2026</Text> (static)
            </Text>
          </View>
        ) : (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.near}>Nearby · {svc.distanceKm.toFixed(1)} km</Text>
          </View>
        )}
        <Text style={styles.price}>₹{svc.basePrice}</Text>
        {partnerLoading ? (
          <Text style={styles.partnerLoading}>Loading available providers...</Text>
        ) : selectedPartner ? (
          <View style={styles.partner}>
            <Pressable
              style={styles.heartFab}
              hitSlop={12}
              onPress={() =>
                void toggleFavorite({
                  partnerId: selectedPartner.id,
                  name: selectedPartner.name,
                  rating: selectedPartner.rating,
                  jobsCompleted: selectedPartner.jobsCompleted,
                  serviceId: svc.id,
                })
              }
            >
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={22}
                color={favorited ? colors.error : colors.primary}
              />
            </Pressable>
            <View style={styles.pRow}>
              <View style={styles.pPhoto}>
                <Text style={styles.pPhotoTxt}>{selectedPartner.name[0]}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.pTitle}>Selected Provider</Text>
                <Text style={styles.pName}>{selectedPartner.name}</Text>
                <Text style={styles.pSub}>
                  ★ {selectedPartner.rating.toFixed(1)} · {selectedPartner.jobsCompleted} jobs
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.partnerEmpty}>
            <Text style={styles.partnerEmptyTitle}>No available partners yet</Text>
            <Text style={styles.partnerEmptyText}>
              We couldn't find a verified online provider for this service right now. Please check back later.
            </Text>
          </View>
        )}

        {!selectedPartner && !partnerLoading && (
          <View style={styles.emptyActionsNotice}>
            <Text style={styles.emptyActionsText}>Booking and cart actions are disabled until a provider is available.</Text>
          </View>
        )}

        {!partnerLoading && servicePartners.length > 1 ? (
          <View style={styles.partnerListSection}>
            <Text style={styles.partnerListTitle}>Available providers</Text>
            {servicePartners.map((partner) => {
              const active = selectedPartner?.id === partner.id;
              return (
                <Pressable
                  key={partner.id}
                  style={[styles.providerRow, active && styles.providerRowSelected]}
                  onPress={() => setSelectedPartner(partner)}
                >
                  <View style={styles.providerPhoto}>
                    <Text style={styles.providerPhotoTxt}>{partner.name[0]}</Text>
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{partner.name}</Text>
                    <Text style={styles.providerMeta}>
                      ★ {partner.rating.toFixed(1)} · {partner.jobsCompleted} jobs
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          title="Add to cart"
          variant="outline"
          disabled={!selectedPartner}
          onPress={async () => {
            if (!selectedPartner) return;
            await addService({ ...svc, partner: selectedPartner });
            Alert.alert('Cart', `${svc.name} added to cart.`);
          }}
        />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton
          title="Book service"
          disabled={!selectedPartner}
          onPress={() => navigation.navigate('ConfirmBooking', { serviceId: svc.id })}
        />
      </View>
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
  title: { fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center' },
  body: { padding: spacing.lg },
  cat: { color: colors.grey, fontWeight: '600' },
  desc: { marginTop: spacing.md, fontSize: 15, color: colors.charcoal, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  near: { color: colors.charcoal },
  price: { fontSize: 28, fontWeight: '800', color: colors.primary, marginTop: spacing.lg },
  partner: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    position: 'relative',
  },
  heartFab: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 2, padding: spacing.xs },
  pRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingRight: 36 },
  pPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pPhotoTxt: { fontSize: 20, fontWeight: '800', color: colors.primary },
  pTitle: { fontSize: 12, color: colors.grey },
  pName: { fontSize: 17, fontWeight: '800', marginTop: 4 },
  pSub: { color: colors.grey, marginTop: 4 },
  remoteBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.orangeTint,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  remoteLab: { fontWeight: '800', color: colors.charcoal },
  deadlineTxt: { marginTop: spacing.xs, color: colors.charcoal, fontSize: 13 },
  deadlineStrong: { fontWeight: '800', color: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  secondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.md,
  },
  secTxt: { fontWeight: '700', color: colors.primary },
  partnerLoading: { marginTop: spacing.lg, color: colors.grey, fontStyle: 'italic' },
  partnerEmpty: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
  },
  partnerEmptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.xs },
  partnerEmptyText: { color: colors.grey, lineHeight: 20 },
  emptyActionsNotice: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.warning,
  },
  emptyActionsText: { color: colors.charcoal, textAlign: 'center' },
  partnerListSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  partnerListTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  providerRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  providerPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  providerPhotoTxt: { color: colors.white, fontWeight: '800' },
  providerInfo: { flex: 1, minWidth: 0 },
  providerName: { fontSize: 15, fontWeight: '700' },
  providerMeta: { color: colors.grey, marginTop: spacing.xs },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
