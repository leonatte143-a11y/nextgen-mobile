import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { formatTelUrl } from '../utils/phone';
import { catalogService } from '../services/catalogService';
import { bookingService } from '../services/bookingService';
import type { CatalogService, PartnerSummary } from '../mock/types';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'ServiceDetail'>;

export function ServiceDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { user } = useAuth();
  const [svc, setSvc] = useState<CatalogService | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<PartnerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerLoading, setPartnerLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const loggedPartnerIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setPartnerLoading(true);

      const [s, partners] = await Promise.all([
        catalogService.getServiceById(route.params.serviceId),
        catalogService.getServicePartners(route.params.serviceId),
      ]);

      setSvc(s);
      const partnerList = partners ?? [];
      const selected =
        route.params.selectedPartnerId && partnerList.length
          ? partnerList.find((p) => p.id === route.params.selectedPartnerId) ?? partnerList[0]
          : partnerList[0] ?? null;
      setSelectedPartner(selected);
      setPartnerLoading(false);
      setLoading(false);
    })();
  }, [route.params.serviceId, route.params.selectedPartnerId]);

  React.useEffect(() => {
    if (!selectedPartner?.id) return;
    if (loggedPartnerIdRef.current === selectedPartner.id) return;
    loggedPartnerIdRef.current = selectedPartner.id;
    catalogService.logProfileView(selectedPartner.id).catch(() => {});
  }, [selectedPartner?.id]);

  const partnerDistance = selectedPartner?.distanceKm ?? svc?.distanceKm ?? 0;
  const outsideServiceArea = Boolean(
    selectedPartner &&
      !selectedPartner.allowOutOfStation &&
      selectedPartner.serviceOuterRadiusKm != null &&
      partnerDistance > selectedPartner.serviceOuterRadiusKm,
  );

  if (loading || !svc) {
    return <ScreenLoader />;
  }

  const callPartner = () => {
    const tel = formatTelUrl(selectedPartner?.phone);
    if (!tel) {
      Alert.alert('Unavailable', 'Partner phone number is not available.');
      return;
    }
    Linking.openURL(tel);
  };

  const chatPartner = () => {
    Alert.alert('Chat', `Start a chat with ${selectedPartner?.name ?? 'your provider'} (coming soon).`);
  };

  const bookService = async () => {
    if (!selectedPartner || booking || outsideServiceArea) return;
    setBooking(true);
    setRequestSent(true);
    try {
      const b = await bookingService.createBooking({
        serviceId: svc.id,
        partnerId: selectedPartner.id,
        distanceKm: partnerDistance,
        address: user?.address ?? 'Rajahmundry, AP',
        paymentMethod: 'Cash',
      });
      navigation.replace('BookingTracking', { bookingId: b.id });
    } catch (e: unknown) {
      setRequestSent(false);
      const msg = e instanceof Error ? e.message : 'Could not book this service. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setBooking(false);
    }
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={[styles.top, { paddingTop: spacing.md + insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>{svc.name}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {partnerLoading ? (
          <Text style={styles.partnerLoading}>Loading available providers...</Text>
        ) : selectedPartner ? (
          <View style={styles.partner}>
            <View style={styles.pRow}>
              <View style={styles.pPhoto}>
                {selectedPartner.photoUrl ? (
                  <Image source={{ uri: selectedPartner.photoUrl }} style={styles.pPhotoImg} />
                ) : (
                  <Text style={styles.pPhotoTxt}>{selectedPartner.name[0]}</Text>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.pTitle}>Selected Provider</Text>
                <Text style={styles.pName}>{selectedPartner.name}</Text>
                <Text style={styles.pSub}>
                  ★ {selectedPartner.rating.toFixed(1)} · {selectedPartner.jobsCompleted} jobs ·{' '}
                  {svc.distanceKm != null ? `Nearby ${svc.distanceKm.toFixed(1)} km` : 'Location available'}
                </Text>
                {selectedPartner.phone ? (
                  <Text style={styles.pPhone}>📞 {selectedPartner.phone}</Text>
                ) : null}
              </View>
            </View>
            <View style={[styles.partnerStatus, selectedPartner.isOnline ? styles.online : styles.offline]}>
              <Text style={styles.statusTextLight}>
                {selectedPartner.isOnline ? 'Online' : 'Offline'}
              </Text>
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

        {selectedPartner?.description ? (
          <Text style={styles.description}>{selectedPartner.description}</Text>
        ) : null}

        {selectedPartner ? (
          <View style={styles.actions}>
            <Pressable style={styles.secondary} onPress={callPartner}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <Text style={styles.secTxt}>Call</Text>
            </Pressable>
            <Pressable style={styles.secondary} onPress={chatPartner}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
              <Text style={styles.secTxt}>Chat</Text>
            </Pressable>
          </View>
        ) : null}

        {selectedPartner ? (
          <View style={styles.splitRow}>
            <View style={styles.splitCol}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              {selectedPartner.photos && selectedPartner.photos.length > 0 ? (
                <View style={styles.galleryGrid}>
                  {selectedPartner.photos.map((uri, i) => (
                    <Image key={`${uri}-${i}`} source={{ uri }} style={styles.galleryImg} />
                  ))}
                </View>
              ) : (
                <Text style={styles.emptySectionText}>No photos uploaded by this partner yet.</Text>
              )}
            </View>
            <View style={styles.splitCol}>
              <Text style={styles.sectionTitle}>Ratings</Text>
              {selectedPartner.reviews && selectedPartner.reviews.length > 0 ? (
                <View style={styles.reviewList}>
                  {selectedPartner.reviews.map((r) => (
                    <View key={r.id} style={styles.reviewRow}>
                      <Text style={styles.reviewBullet}>•</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewAuthor}>
                          {r.author} <Text style={styles.reviewStars}>★ {r.rating.toFixed(1)}</Text>
                        </Text>
                        <Text style={styles.reviewComment}>{r.comment}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptySectionText}>
                  {selectedPartner.reviewsCount ? `${selectedPartner.reviewsCount} reviews · details unavailable yet.` : 'No reviews yet.'}
                </Text>
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        {requestSent ? (
          <Text style={styles.requestSentText}>Request sent — connecting you to a partner…</Text>
        ) : outsideServiceArea ? (
          <Text style={styles.outsideAreaText}>
            You're outside {selectedPartner?.name}'s service area — booking is unavailable.
          </Text>
        ) : (
          <PrimaryButton
            title="Book service"
            disabled={!selectedPartner || booking}
            onPress={bookService}
          />
        )}
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
  sectionTitle: { fontSize: 16, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.sm, color: colors.charcoal },
  emptySectionText: { color: colors.grey, fontSize: 13, fontStyle: 'italic' },
  description: { color: colors.charcoal, fontSize: 14, lineHeight: 20, marginTop: spacing.lg },
  splitRow: { flexDirection: 'row', gap: spacing.md },
  splitCol: { flex: 1, minWidth: 0 },
  requestSentText: { textAlign: 'center', color: colors.primary, fontWeight: '700', paddingVertical: spacing.sm },
  outsideAreaText: { textAlign: 'center', color: colors.error, fontWeight: '700', paddingVertical: spacing.sm },
  partner: {
    padding: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
  },
  partnerStatus: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  online: { backgroundColor: colors.online },
  offline: { backgroundColor: colors.offline },
  statusTextLight: { fontSize: 11, fontWeight: '800', color: colors.white },
  pRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pPhotoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  pPhotoTxt: { fontSize: 28, fontWeight: '800', color: colors.primary },
  pTitle: { fontSize: 12, color: colors.grey },
  pName: { fontSize: 17, fontWeight: '800', marginTop: 4 },
  pSub: { color: colors.grey, marginTop: 4 },
  pPhone: { color: colors.navy, fontWeight: '700', marginTop: 6, fontSize: 14 },
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
    padding: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
  },
  partnerEmptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.xs },
  partnerEmptyText: { color: colors.grey, lineHeight: 20 },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  galleryImg: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
  },
  reviewList: { gap: spacing.md },
  reviewRow: { flexDirection: 'row', gap: spacing.sm },
  reviewBullet: { color: colors.primary, fontSize: 16, lineHeight: 20 },
  reviewAuthor: { fontWeight: '700', color: colors.charcoal },
  reviewStars: { color: colors.grey, fontWeight: '600', fontSize: 12 },
  reviewComment: { color: colors.grey, marginTop: 2, lineHeight: 20 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
