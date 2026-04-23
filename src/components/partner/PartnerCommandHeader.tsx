import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

const ORANGE = '#FF8C00';
const BADGE_BLUE = '#1E88E5';

type Props = {
  name: string;
  rating: number;
  isOnline: boolean;
  onToggleOnline: (next: boolean) => void;
};

function StarBar({ r }: { r: number }) {
  const out: React.ReactNode[] = [];
  for (let i = 1; i <= 5; i += 1) {
    const fill = Math.min(1, Math.max(0, r - (i - 1)));
    out.push(
      <Text key={i} style={{ color: fill >= 1 ? '#FFD54F' : fill > 0 ? '#FFD54F' : 'rgba(255,255,255,0.35)' }}>
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

export function PartnerCommandHeader({ name, rating, isOnline, onToggleOnline }: Props) {
  const initial = name.trim().charAt(0) || 'P';
  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }} />
      <View style={styles.rightBlock}>
        <View style={styles.toggleRow}>
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
        <View style={styles.orangeBox}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{initial}</Text>
            </View>
            <View style={styles.verified}>
              <Ionicons name="checkmark" size={10} color={colors.white} />
            </View>
          </View>
          <StarBar r={rating} />
          <Text style={styles.ratingText}>
            {rating.toFixed(1)} <Text style={styles.star}>★</Text>
          </Text>
          <Text style={styles.verifiedPro}>Verified Professional</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', marginBottom: spacing.lg },
  rightBlock: { alignItems: 'flex-end' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
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
  orangeBox: {
    backgroundColor: ORANGE,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    minWidth: 140,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: colors.white, fontSize: 26, fontWeight: '900' },
  verified: {
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
  starRow: { flexDirection: 'row', gap: 2, marginTop: spacing.xs, justifyContent: 'center' },
  ratingText: { color: colors.white, fontWeight: '800', marginTop: spacing.xs, fontSize: 16, textAlign: 'center' },
  star: { fontSize: 16 },
  verifiedPro: { color: colors.white, fontSize: 12, fontWeight: '600', marginTop: 4, opacity: 0.95, textAlign: 'center' },
});
