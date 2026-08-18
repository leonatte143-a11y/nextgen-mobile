import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { formatTelUrl } from '../utils/phone';
import { catalogService } from '../services/catalogService';
import { bookingService } from '../services/bookingService';
import { getCoordsIfPermitted } from '../services/locationService';
import type { CatalogService, PartnerReview, PartnerSummary, ServiceMenuItem } from '../mock/types';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'ServiceDetail'>;

const GALLERY_COLS = 3;
const GALLERY_GAP = spacing.sm;
const GALLERY_THUMB_SIZE = (Dimensions.get('window').width - spacing.lg * 2 - GALLERY_GAP * (GALLERY_COLS - 1)) / GALLERY_COLS;
type Tab = 'gallery' | 'services' | 'ratings';

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
  const [activeTab, setActiveTab] = useState<Tab>('gallery');
  const [serviceMenu, setServiceMenu] = useState<ServiceMenuItem[] | null>(null);
  const [serviceMenuLoading, setServiceMenuLoading] = useState(false);
  const [reviews, setReviews] = useState<PartnerReview[] | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const loggedPartnerIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setPartnerLoading(true);

      const coords = await getCoordsIfPermitted();
      const [s, partners] = await Promise.all([
        catalogService.getServiceById(route.params.serviceId),
        catalogService.getServicePartners(route.params.serviceId, coords),
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

  React.useEffect(() => {
    if (activeTab !== 'services' || !selectedPartner || serviceMenu != null || serviceMenuLoading) return;
    setServiceMenuLoading(true);
    catalogService
      .getPartnerServiceMenu(route.params.serviceId, selectedPartner.id)
      .then((items) => setServiceMenu(items))
      .catch(() => setServiceMenu([]))
      .finally(() => setServiceMenuLoading(false));
  }, [activeTab, selectedPartner, serviceMenu, serviceMenuLoading, route.params.serviceId]);

  React.useEffect(() => {
    if (activeTab !== 'ratings' || !selectedPartner || reviews != null || reviewsLoading) return;
    setReviewsLoading(true);
    catalogService
      .getPartnerReviews(selectedPartner.id)
      .then((rows) => setReviews(rows))
      .catch(() => setReviews(selectedPartner.reviews ?? []))
      .finally(() => setReviewsLoading(false));
  }, [activeTab, selectedPartner, reviews, reviewsLoading]);

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

  const TABS: { key: Tab; label: string }[] = [
    { key: 'gallery', label: 'Gallery' },
    { key: 'services', label: 'Services' },
    { key: 'ratings', label: 'Ratings' },
  ];

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
                {selectedPartner.description ? (
                  <Text style={styles.description}>{selectedPartner.description}</Text>
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

        {selectedPartner ? (
          <View style={styles.actions}>
            <Pressable style={styles.secondary} onPress={callPartner}>
              <Ionicons name="call-outline" size={20} color={colors.success} />
              <Text style={[styles.secTxt, { color: colors.success }]}>Call</Text>
            </Pressable>
            <Pressable style={styles.secondary} onPress={chatPartner}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.warning} />
              <Text style={[styles.secTxt, { color: colors.warning }]}>Chat</Text>
            </Pressable>
          </View>
        ) : null}

        {selectedPartner ? (
          <View style={styles.tabSection}>
            <View style={styles.tabBar}>
              {TABS.map((tabDef) => {
                const isActive = activeTab === tabDef.key;
                return (
                  <Pressable
                    key={tabDef.key}
                    style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                    onPress={() => setActiveTab(tabDef.key)}
                  >
                    <Text style={[styles.tabTxt, isActive && styles.tabTxtActive]}>{tabDef.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {activeTab === 'gallery' ? (
              selectedPartner.photos && selectedPartner.photos.length > 0 ? (
                <View style={styles.galleryGrid}>
                  {selectedPartner.photos.map((uri, i) => (
                    <Image key={`${uri}-${i}`} source={{ uri }} style={styles.galleryImg} />
                  ))}
                </View>
              ) : (
                <Text style={styles.emptySectionText}>No photos uploaded by this partner yet.</Text>
              )
            ) : null}

            {activeTab === 'services' ? (
              serviceMenuLoading ? (
                <Text style={styles.emptySectionText}>Loading services…</Text>
              ) : serviceMenu && serviceMenu.length > 0 ? (
                <View style={styles.menuList}>
                  {serviceMenu.map((item) => (
                    <View key={item.id} style={styles.menuRow}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.menuTitle}>{item.title}</Text>
                        {item.subtitle ? <Text style={styles.menuSubtitle}>{item.subtitle}</Text> : null}
                      </View>
                      <Text style={styles.menuPrice}>₹{item.price}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptySectionText}>This partner hasn't listed a service menu yet.</Text>
              )
            ) : null}

            {activeTab === 'ratings' ? (
              reviewsLoading ? (
                <Text style={styles.emptySectionText}>Loading reviews…</Text>
              ) : reviews && reviews.length > 0 ? (
                <View style={styles.reviewList}>
                  {reviews.map((r) => (
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
              )
            ) : null}
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
  emptySectionText: { color: colors.grey, fontSize: 13, fontStyle: 'italic' },
  description: { color: colors.charcoal, fontSize: 13, lineHeight: 18, marginTop: 6 },
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
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  secTxt: { fontWeight: '700' },
  partnerLoading: { marginTop: spacing.lg, color: colors.grey, fontStyle: 'italic' },
  partnerEmpty: {
    padding: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
  },
  partnerEmptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.xs },
  partnerEmptyText: { color: colors.grey, lineHeight: 20 },
  tabSection: { marginTop: spacing.lg },
  tabBar: {
    flexDirection: 'row',
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: colors.primary },
  tabTxt: { fontWeight: '700', color: colors.grey, fontSize: 13 },
  tabTxtActive: { color: colors.white },
  galleryGrid: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: GALLERY_GAP },
  galleryImg: {
    width: GALLERY_THUMB_SIZE,
    height: GALLERY_THUMB_SIZE,
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
  },
  menuList: { marginTop: spacing.md, gap: spacing.sm },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
  },
  menuTitle: { fontWeight: '700', color: colors.charcoal },
  menuSubtitle: { color: colors.grey, fontSize: 12, marginTop: 2 },
  menuPrice: { fontWeight: '800', color: colors.primary },
  reviewList: { marginTop: spacing.md, gap: spacing.md },
  reviewRow: { flexDirection: 'row', gap: spacing.sm },
  reviewBullet: { color: colors.primary, fontSize: 16, lineHeight: 20 },
  reviewAuthor: { fontWeight: '700', color: colors.charcoal },
  reviewStars: { color: colors.grey, fontWeight: '600', fontSize: 12 },
  reviewComment: { color: colors.grey, marginTop: 2, lineHeight: 20 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
