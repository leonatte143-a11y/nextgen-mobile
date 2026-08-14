import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import { usePartner } from '../../context/PartnerContext';
import { partnerService } from '../../services/partnerService';
import type { PartnerCustomerReview } from '../../mock/types';

const VIDEO_TITLES = ['5★ Job · Fan repair', 'Customer shout-out', 'Safety first tips'] as const;

export function PartnerSocialProofSection() {
  const { profile } = usePartner();
  const [reviews, setReviews] = useState<PartnerCustomerReview[]>([]);

  useEffect(() => {
    let active = true;
    partnerService
      .getMyReviews()
      .then((rows) => {
        if (active) setReviews(rows);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const avgLabel = profile?.rating != null ? `${profile.rating.toFixed(1)} avg` : '— avg';

  return (
    <View style={styles.wrap}>
      <Text style={styles.h}>Social proof and performance</Text>
      <View style={styles.hr} />
      <View style={styles.rowSplit}>
        <ScrollView
          style={styles.reviewsScroll}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sh}>Customer reviews</Text>
          {reviews.length ? (
            reviews.map((r) => (
              <View key={r.id} style={styles.revCard}>
                <Text style={styles.revName}>{r.customerName}</Text>
                <Text style={styles.revLine} numberOfLines={4}>
                  {r.comment || '★'.repeat(r.rating)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.revEmpty}>No reviews yet.</Text>
          )}
        </ScrollView>
        <View style={styles.badgeCol}>
          <Text style={styles.blocH}>Feedback</Text>
          <Ionicons name="star" size={20} color={colors.primary} />
          <Text style={styles.slim}>{avgLabel}</Text>
          <Ionicons name="trending-up" size={20} color={colors.success} style={{ marginTop: spacing.md }} />
          {/* No ranking data source exists yet — kept as a simple static heuristic badge. */}
          <Text style={styles.slim}>Top 10% zone</Text>
        </View>
      </View>

      <Text style={styles.sh}>Video ratings (15s each)</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hScroll}
      >
        {VIDEO_TITLES.map((t) => (
          <View key={t} style={styles.vidCard}>
            <Text style={styles.vidSec}>15s</Text>
            <Ionicons name="videocam" size={28} color={colors.primary} />
            <Text style={styles.vidTxt} numberOfLines={2}>
              {t}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md },
  h: { fontSize: 16, fontWeight: '800' },
  hr: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  rowSplit: { flexDirection: 'row', alignItems: 'stretch' },
  reviewsScroll: { flex: 1, maxHeight: 200 },
  sh: { fontSize: 13, fontWeight: '800', color: colors.charcoal, marginBottom: spacing.sm },
  blocH: { fontSize: 10, fontWeight: '800', color: colors.primary, marginBottom: 4, textAlign: 'center' },
  revCard: {
    backgroundColor: colors.greyLight,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  revName: { fontSize: 12, fontWeight: '700' },
  revLine: { fontSize: 11, color: colors.grey, marginTop: 2 },
  revEmpty: { fontSize: 12, color: colors.grey },
  badgeCol: { width: 64, alignItems: 'center', marginLeft: spacing.sm },
  slim: { fontSize: 9, textAlign: 'center', color: colors.grey, marginTop: 2 },
  hScroll: { gap: spacing.md, paddingVertical: spacing.sm },
  vidCard: {
    width: 120,
    minHeight: 88,
    backgroundColor: colors.orangeTint,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  vidSec: { fontSize: 10, fontWeight: '800', color: colors.charcoal, marginBottom: 4, alignSelf: 'flex-end' },
  vidTxt: { fontSize: 11, fontWeight: '600', marginTop: 6, color: colors.charcoal },
  acRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  acTxt: { color: colors.charcoal, fontSize: 14 },
  hrLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.lg, justifyContent: 'center' },
  hrLinkTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },
});
