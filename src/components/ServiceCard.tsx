import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';
import type { CatalogService } from '../mock/types';

type Props = {
  service: CatalogService;
  onPress: () => void;
};

export function ServiceCard({ service, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.accent} />
      <View style={styles.body}>
        <Text style={styles.name}>{service.name}</Text>
        <Text style={styles.sub}>{service.categoryLabel} · {service.subtext}</Text>
        <View style={styles.row}>
          <Text style={styles.rating}>★ {service.rating.toFixed(1)} ({service.reviewsCount})</Text>
          {service.bucketId === 'tech_supply' ? (
            <Text style={styles.dist}>Remote</Text>
          ) : (
            <Text style={styles.dist}>📍 {service.distanceKm.toFixed(1)} km</Text>
          )}
        </View>
        <Text style={styles.price}>from ₹{service.basePrice}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  pressed: { opacity: 0.92 },
  accent: { width: 4, backgroundColor: colors.primary },
  body: { flex: 1, padding: spacing.md },
  name: { fontSize: 17, fontWeight: '700', color: colors.charcoal },
  sub: { fontSize: 13, color: colors.grey, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  rating: { fontSize: 13, color: colors.charcoal },
  dist: { fontSize: 13, color: colors.grey },
  price: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
});
