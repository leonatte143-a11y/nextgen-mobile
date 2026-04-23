import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

const ADS = [
  { id: 'a1', title: 'Raja Hardware', sub: 'Tools & materials — Danavaipeta' },
  { id: 'a2', title: 'Godavari Hospital', sub: '24/7 care — Amalapuram' },
  { id: 'a3', title: 'Local services', sub: 'Plumber · Electrician · AC' },
] as const;

const BANNER_W = 320;
const BANNER_H = 50;
const ROTATE_MS = 4000;

export function LiveTrackingAdBanner() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % ADS.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  const ad = ADS[idx];

  return (
    <View style={styles.wrap} accessibilityRole="summary" accessibilityLabel="Sponsored ad banner">
      <View style={styles.inner}>
        <View style={styles.pill}>
          <Text style={styles.pillTxt}>Ad</Text>
        </View>
        <Pressable
          onPress={() => {
            /* mock tap */
          }}
          style={styles.content}
        >
          <Text style={styles.title} numberOfLines={1}>
            {ad.title}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {ad.sub}
          </Text>
        </Pressable>
        <View style={styles.dots}>
          {ADS.map((_, i) => (
            <View key={ADS[i].id} style={[styles.dot, i === idx && styles.dotOn]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: BANNER_W,
    maxWidth: '100%',
    height: BANNER_H,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  pill: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillTxt: { color: colors.white, fontSize: 9, fontWeight: '800' },
  content: { flex: 1, minWidth: 0, justifyContent: 'center' },
  title: { fontWeight: '800', fontSize: 12, color: colors.charcoal },
  sub: { fontSize: 10, color: colors.grey, marginTop: 1 },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.primary },
});
