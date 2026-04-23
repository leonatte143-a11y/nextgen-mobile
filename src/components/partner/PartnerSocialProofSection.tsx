import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import type { PartnerStackParamList } from '../../navigation/PartnerStackTypes';

const REVIEWS = [
  { id: 'r1', name: 'Lakshmi R.', line: 'Punctual and very professional. Fan works like new.' },
  { id: 'r2', name: 'Krishna M.', line: 'Fair price and clean work. Recommended in Rajahmundry.' },
  { id: 'r3', name: 'Padma S.', line: 'Explained the issue well before starting the repair.' },
] as const;

const VIDEO_TITLES = ['5★ Job · Fan repair', 'Customer shout-out', 'Safety first tips'] as const;

const ACADEMY = ['Payouts & wallet', 'Handling cancellations', 'Upskilling: AC service'] as const;

export function PartnerSocialProofSection() {
  const navigation = useNavigation<NativeStackNavigationProp<PartnerStackParamList>>();
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
          {REVIEWS.map((r) => (
            <View key={r.id} style={styles.revCard}>
              <Text style={styles.revName}>{r.name}</Text>
              <Text style={styles.revLine} numberOfLines={4}>
                {r.line}
              </Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.badgeCol}>
          <Text style={styles.blocH}>Feedback</Text>
          <Ionicons name="star" size={20} color={colors.primary} />
          <Text style={styles.slim}>4.8 avg</Text>
          <Ionicons name="trending-up" size={20} color={colors.success} style={{ marginTop: spacing.md }} />
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

      <Text style={styles.sh}>NEXGEN Academy — Training and Safety</Text>
      {ACADEMY.map((a) => (
        <View key={a} style={styles.acRow}>
          <Ionicons name="play-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.acTxt}>Video · {a}</Text>
        </View>
      ))}
      <Pressable style={styles.hrLink} onPress={() => navigation.navigate('PartnerHRV')}>
        <Text style={styles.hrLinkTxt}>Open HR verification dashboard</Text>
        <Ionicons name="open-outline" size={16} color={colors.primary} />
      </Pressable>
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
