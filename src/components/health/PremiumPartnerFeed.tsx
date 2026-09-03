import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import type { PartnerSummary } from '../../mock/types';

function PremiumPartnerCard({
  partner,
  categoryTag,
  onViewProfile,
}: {
  partner: PartnerSummary;
  categoryTag: string;
  onViewProfile: (partner: PartnerSummary) => void;
}) {
  const photoUrl = partner.photoUrl || partner.photos?.[0];
  return (
    <View style={styles.card}>
      <View style={styles.photo}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photoImage} />
        ) : (
          <Text style={styles.photoTxt}>{partner.name[0]}</Text>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.badgeRow}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagTxt} numberOfLines={1}>{categoryTag.toUpperCase()}</Text>
          </View>
          <Ionicons name="checkmark-circle" size={18} color={colors.verifiedBlue} />
        </View>
        <Text style={styles.name} numberOfLines={1}>{partner.name}</Text>
        {partner.description ? (
          <Text style={styles.description} numberOfLines={3}>{partner.description}</Text>
        ) : null}
        <View style={styles.bottomBlock}>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={13} color={colors.grey} />
            <Text style={styles.metaTxt}>
              {partner.distanceKm != null ? `${partner.distanceKm.toFixed(1)} km away` : 'Nearby'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={13} color={colors.primary} />
            <Text style={styles.ratingTxt}>{partner.rating.toFixed(1)}</Text>
            <Text style={styles.metaTxt}>({partner.reviewsCount ?? 0})</Text>
          </View>
          <Pressable style={styles.viewProfileBtn} onPress={() => onViewProfile(partner)}>
            <Text style={styles.viewProfileTxt}>View Profile</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

type Props = {
  partners: PartnerSummary[];
  categoryTag: string;
  onViewProfile: (partner: PartnerSummary) => void;
};

export function PremiumPartnerFeed({ partners, categoryTag, onViewProfile }: Props) {
  return (
    <View>
      {partners.map((partner) => (
        <PremiumPartnerCard key={partner.id} partner={partner} categoryTag={categoryTag} onViewProfile={onViewProfile} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
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
  info: { flex: 1, padding: spacing.md },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginTop: 4,
  },
  viewProfileTxt: { color: colors.white, fontWeight: '700', fontSize: 12 },
});
