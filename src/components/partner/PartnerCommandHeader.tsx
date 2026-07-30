import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../constants/theme';

const BADGE_BLUE = '#1E88E5';
const ORANGE = '#FF8C00';

type Props = {
  name: string;
  photoUrl?: string;
  rating: number;
  isOnline: boolean;
  onToggleOnline: (next: boolean) => void;
};

function StarBar({ r }: { r: number }) {
  const out: React.ReactNode[] = [];
  for (let i = 1; i <= 5; i += 1) {
    const fill = Math.min(1, Math.max(0, r - (i - 1)));
    out.push(
      <Text key={i} style={{ color: fill > 0 ? '#FFB300' : colors.border }}>
        {fill >= 1 ? '★' : fill > 0 ? '★' : '☆'}
      </Text>,
    );
  }
  return (
    <View style={styles.starRow} accessibilityLabel={`${r.toFixed(1)} out of 5 stars`}>
      {out}
    </View>
  );
}

export function PartnerCommandHeader({ name, photoUrl, rating, isOnline, onToggleOnline }: Props) {
  const initial = name.trim().charAt(0) || 'P';
  return (
    <View style={styles.headerRow}>
      <View style={styles.leftBlock}>
        <View style={styles.avatarWrap}>
          <View style={styles.verifiedRing}>
            <View style={styles.avatar}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarLetter}>{initial}</Text>
              )}
            </View>
          </View>
          <View style={styles.verifiedDot}>
            <Ionicons name="checkmark" size={11} color={colors.white} />
          </View>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.verifiedPro}>Verified</Text>
          <StarBar r={rating} />
          <Text style={styles.ratingText}>
            {rating.toFixed(1)} <Text style={styles.star}>★</Text>
          </Text>
        </View>
      </View>

      <View style={styles.toggleCol}>
        <Text style={styles.tinyOn}>{isOnline ? 'Online' : 'Offline'}</Text>
        <Pressable
          onPress={() => onToggleOnline(!isOnline)}
          style={[styles.smallToggle, isOnline && styles.smallToggleOn]}
          hitSlop={8}
          accessibilityLabel="Toggle online"
        >
          <View style={[styles.knob, isOnline && styles.knobOn]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  leftBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  avatarWrap: { position: 'relative' },
  verifiedRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: BADGE_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarLetter: { color: colors.primary, fontSize: 24, fontWeight: '900' },
  verifiedDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BADGE_BLUE,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: { justifyContent: 'center' },
  verifiedPro: { color: colors.navy, fontSize: 14, fontWeight: '800' },
  starRow: { flexDirection: 'row', gap: 2, marginTop: 4 },
  ratingText: { color: colors.charcoal, fontWeight: '700', marginTop: 4, fontSize: 13 },
  star: { fontSize: 13 },
  toggleCol: { alignItems: 'center', gap: 6, marginTop: spacing.xs },
  tinyOn: { fontSize: 12, fontWeight: '700', color: colors.charcoal },
  smallToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  smallToggleOn: { backgroundColor: ORANGE },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white, alignSelf: 'flex-start' },
  knobOn: { alignSelf: 'flex-end' },
});
