import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_PARTNER_CUSTOMER_REVIEWS } from '../mock/partnerData';
import { usePartner } from '../context/PartnerContext';
import { colors, radius, spacing } from '../constants/theme';
import type { PartnerDashboardNavigationProp } from '../navigation/partnerStackTypes';

const TRAINING_CLIPS = [
  { id: 't1', title: 'Customer greeting', sub: 'Telugu / English' },
  { id: 't2', title: 'Cleanliness', sub: 'After repair' },
  { id: 't3', title: 'OTP safety', sub: 'App rules' },
  { id: 't4', title: 'Tool care', sub: '1 min' },
];

const VIDEO_PLACEHOLDERS = ['v1', 'v2', 'v3'];

function StarRow({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: size, color: i <= Math.round(value) ? colors.primary : colors.border }}>
          ★
        </Text>
      ))}
    </View>
  );
}

export function PartnerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PartnerDashboardNavigationProp>();
  const { profile, earnings, requests, toggleOnline, isLoading } = usePartner();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  if (isLoading || !profile || !earnings) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.loading}>Loading dashboard…</Text>
      </View>
    );
  }

  const newCount = requests.filter((item) => item.status === 'new').length;
  const pendingCount = requests.filter((item) => item.status === 'pending').length;
  const completedCount = requests.filter((item) => item.status === 'completed').length;
  const firstName = profile.name.split(' ')[0];

  const locationSummary = `${profile.primaryCity} · ${profile.serviceInnerRadiusKm}km inner | ${profile.serviceOuterRadiusKm}km outer`;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome + identity (orange box right) */}
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeLeft}>
          <Text style={styles.welcomeHi}>Welcome,</Text>
          <Text style={styles.welcomeName}>{firstName}</Text>
          <Text style={styles.welcomeSub}>Partner command center</Text>
        </View>
        <View style={styles.orangeIdentity}>
          <View style={styles.toggleWrap}>
            <Switch
              value={profile.isOnline}
              onValueChange={(v) => toggleOnline(v)}
              trackColor={{ false: colors.border, true: colors.primaryDark }}
              thumbColor={colors.white}
              style={styles.smallSwitch}
            />
          </View>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{profile.name.charAt(0)}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            </View>
          </View>
          <StarRow value={profile.rating} size={16} />
          <Text style={styles.ratingNum}>{profile.rating.toFixed(1)} ★</Text>
          <Text style={styles.verifiedLabel}>Verified Expert</Text>
        </View>
      </View>

      {/* Service location bar — Edit on LEFT */}
      <View style={styles.locationBar}>
        <Pressable
          style={styles.editLocBtn}
          onPress={() => navigation.navigate('PartnerLocationEdit')}
          hitSlop={8}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={styles.editLocTxt}>Edit</Text>
        </Pressable>
        <View style={styles.locationInfo}>
          <View style={styles.locRow}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.locTitle} numberOfLines={2}>
              {locationSummary}
            </Text>
          </View>
          <Text style={styles.locMeta}>
            GPS monitoring · {profile.allowOutOfStation ? 'Out-of-station ON' : 'Local zone only'}
          </Text>
        </View>
      </View>

      {/* 6-box work grid */}
      <Text style={styles.section}>Requests</Text>
      <View style={styles.gridRow}>
        <Pressable style={styles.gridHalf} onPress={() => navigation.navigate('Earnings')}>
          <Ionicons name="cash-outline" size={22} color={colors.primary} />
          <Text style={styles.gridVal}>₹{earnings.todayEarnings}</Text>
          <Text style={styles.gridLab}>Earnings today</Text>
        </Pressable>
        <Pressable style={styles.gridHalf} onPress={() => navigation.navigate('Requests')}>
          <Ionicons name="time-outline" size={22} color={colors.primary} />
          <Text style={styles.gridVal}>{pendingCount}</Text>
          <Text style={styles.gridLab}>Pending works</Text>
        </Pressable>
      </View>

      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Pressable style={styles.gridBigOrange} onPress={() => navigation.navigate('Requests')}>
          <Text style={styles.bigOrangeTitle}>
            {String(newCount).padStart(2, '0')} New incoming requests
          </Text>
          <Text style={styles.bigOrangeSub}>Tap to accept or reject — full-screen ping on new job</Text>
          <View style={styles.pulseDot} />
        </Pressable>
      </Animated.View>

      <View style={styles.gridRow}>
        <Pressable style={styles.gridHalfTall} onPress={() => navigation.navigate('PartnerServicePricing')}>
          <Ionicons name="pricetags-outline" size={22} color={colors.primary} />
          <Text style={styles.gridLabBold}>Service pricing</Text>
          <Text style={styles.gridSmall}>90/10 split · manage base costs</Text>
          <Text style={styles.gridLink}>View breakdown →</Text>
        </Pressable>
        <Pressable style={styles.gridHalfTall} onPress={() => navigation.navigate('Requests')}>
          <Ionicons name="checkmark-done-outline" size={22} color={colors.success} />
          <Text style={styles.gridVal}>{completedCount}</Text>
          <Text style={styles.gridLab}>Completed jobs</Text>
        </Pressable>
      </View>

      <View style={styles.gridRewards}>
        <Ionicons name="trophy-outline" size={24} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rewardsVal}>{earnings.rewardPoints} pts</Text>
          <Text style={styles.gridLab}>Rewards / loyalty</Text>
        </View>
      </View>

      {/* Recent activity */}
      <Text style={styles.section}>Recent activity</Text>
      {requests.slice(0, 3).map((item) => (
        <View key={item.id} style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <Ionicons name="construct-outline" size={18} color={colors.white} />
          </View>
          <View style={styles.activityText}>
            <Text style={styles.activityTitle}>
              {item.serviceName} @ {item.address.split(',')[0]}
            </Text>
            <Text
              style={[
                styles.activityStatus,
                item.status === 'completed'
                  ? styles.stCompleted
                  : item.status === 'new'
                    ? styles.stNew
                    : styles.stPending,
              ]}
            >
              {item.status === 'new'
                ? 'New request'
                : item.status === 'pending'
                  ? 'Pending'
                  : item.status === 'completed'
                    ? 'Completed'
                    : item.status}
            </Text>
          </View>
        </View>
      ))}

      {/* Rating bar + customer reviews (reviews on the right) */}
      <Text style={styles.section}>Feedback from your customers</Text>
      <View style={styles.reviewRow}>
        <View style={styles.ratingCol}>
          <Text style={styles.bigRating}>{profile.rating.toFixed(1)}</Text>
          <StarRow value={profile.rating} size={18} />
          <Text style={styles.ratingCount}>{profile.jobsCompleted}+ jobs</Text>
        </View>
        <ScrollView
          style={styles.reviewsScroll}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {MOCK_PARTNER_CUSTOMER_REVIEWS.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewName}>{r.customerName}</Text>
                <StarRow value={r.rating} size={12} />
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
              <Text style={styles.reviewTime}>{r.timeLabel}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Video rating strip */}
      <Text style={styles.sectionMuted}>Video ratings</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videoScroll}>
        {VIDEO_PLACEHOLDERS.map((v) => (
          <Pressable key={v} style={styles.videoCard}>
            <Ionicons name="play-circle" size={40} color={colors.white} />
            <Text style={styles.videoLbl}>Customer clip</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Training & safety under video bar */}
      <Text style={styles.section}>Training & safety</Text>
      <Text style={styles.academySub}>NEXGEN Academy · 1-minute clips</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trainScroll}>
        {TRAINING_CLIPS.map((t) => (
          <View key={t.id} style={styles.trainCard}>
            <View style={styles.trainThumb}>
              <Ionicons name="videocam-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.trainTitle}>{t.title}</Text>
            <Text style={styles.trainSub}>{t.sub}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.trainFoot}>
        <Text style={styles.trainProgress}>Progress: {profile.trainingProgress}% completed</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loading: { color: colors.grey },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  welcomeLeft: { flex: 1, justifyContent: 'center', paddingTop: spacing.sm },
  welcomeHi: { color: colors.grey, fontSize: 14 },
  welcomeName: { fontSize: 26, fontWeight: '900', color: colors.charcoal },
  welcomeSub: { color: colors.grey, marginTop: 4, fontSize: 13 },
  orangeIdentity: {
    width: 148,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  toggleWrap: { transform: [{ scaleX: 0.85 }, { scaleY: 0.8 }], marginBottom: spacing.sm },
  smallSwitch: {},
  avatarWrap: { position: 'relative', marginBottom: spacing.sm },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontSize: 28, fontWeight: '900', color: colors.white },
  verifiedBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  starRow: { flexDirection: 'row', gap: 2 },
  ratingNum: { color: colors.white, fontWeight: '800', marginTop: 4, fontSize: 15 },
  verifiedLabel: { color: colors.white, fontWeight: '800', fontSize: 11, marginTop: 6 },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  editLocBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: spacing.sm },
  editLocTxt: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  locationInfo: { flex: 1 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locTitle: { flex: 1, fontWeight: '700', color: colors.charcoal, fontSize: 14 },
  locMeta: { fontSize: 11, color: colors.grey, marginTop: 4 },
  section: { fontSize: 17, fontWeight: '800', color: colors.charcoal, marginBottom: spacing.sm, marginTop: spacing.sm },
  sectionMuted: { fontSize: 14, fontWeight: '700', color: colors.grey, marginTop: spacing.lg, marginBottom: spacing.sm },
  gridRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  gridHalf: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridHalfTall: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    minHeight: 120,
  },
  gridBigOrange: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 112,
    justifyContent: 'center',
  },
  bigOrangeTitle: { color: colors.white, fontSize: 20, fontWeight: '900' },
  bigOrangeSub: { color: colors.orangeTint, marginTop: 8, fontSize: 13, lineHeight: 18 },
  pulseDot: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
    opacity: 0.9,
  },
  gridVal: { fontSize: 22, fontWeight: '900', color: colors.primary, marginTop: 6 },
  gridLab: { color: colors.grey, marginTop: 4, fontSize: 13 },
  gridLabBold: { fontWeight: '800', color: colors.charcoal, marginTop: 6, fontSize: 15 },
  gridSmall: { color: colors.grey, fontSize: 12, marginTop: 4 },
  gridLink: { color: colors.primary, fontWeight: '800', marginTop: 10, fontSize: 13 },
  gridRewards: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.orangeTint,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  rewardsVal: { fontSize: 22, fontWeight: '900', color: colors.primary },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: { flex: 1 },
  activityTitle: { fontWeight: '700', color: colors.charcoal },
  activityStatus: { marginTop: 4, fontWeight: '700', fontSize: 13 },
  stNew: { color: colors.primary },
  stPending: { color: '#0066cc' },
  stCompleted: { color: colors.success },
  reviewRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'stretch',
    marginBottom: spacing.md,
    minHeight: 160,
  },
  ratingCol: {
    width: 88,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bigRating: { fontSize: 28, fontWeight: '900', color: colors.primary },
  ratingCount: { fontSize: 10, color: colors.grey, marginTop: 6, textAlign: 'center' },
  reviewsScroll: { flex: 1, maxHeight: 200 },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewName: { fontWeight: '800', color: colors.charcoal, fontSize: 13 },
  reviewComment: { color: colors.grey, fontSize: 12, marginTop: 6, lineHeight: 18 },
  reviewTime: { fontSize: 10, color: colors.grey, marginTop: 4 },
  videoScroll: { marginBottom: spacing.md },
  videoCard: {
    width: 120,
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.charcoal,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLbl: { color: colors.white, fontSize: 11, marginTop: spacing.sm },
  academySub: { color: colors.grey, marginBottom: spacing.sm, fontSize: 13 },
  trainScroll: { marginBottom: spacing.sm },
  trainCard: { width: 132, marginRight: spacing.md },
  trainThumb: {
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  trainTitle: { fontWeight: '800', fontSize: 13, marginTop: 8, color: colors.charcoal },
  trainSub: { fontSize: 11, color: colors.grey, marginTop: 2 },
  trainFoot: { paddingVertical: spacing.sm },
  trainProgress: { fontWeight: '700', color: colors.primary, fontSize: 13 },
});
