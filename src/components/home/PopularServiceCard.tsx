import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import type { CatalogService } from '../../mock/types';
import type { IconName, PopularServiceSlot } from '../../data/serviceCatalog';
import { getGridCardWidth } from '../../utils/gridLayout';

type Props = {
  slot: PopularServiceSlot;
  service?: CatalogService;
  onPress: () => void;
};

const CARD_WIDTH = getGridCardWidth();

function PopularServiceCardComponent({ slot, service, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { width: CARD_WIDTH }, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={slot.icon as IconName} size={22} color={colors.primary} />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {service?.name ?? slot.name}
      </Text>
      <Text style={styles.sub} numberOfLines={1}>
        {service?.subtext ?? slot.subtitle}
      </Text>
    </Pressable>
  );
}

export const PopularServiceCard = memo(PopularServiceCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pressed: { opacity: 0.9, borderColor: colors.primary },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  name: { fontSize: 12, fontWeight: '800', color: colors.charcoal, textAlign: 'center' },
  sub: { fontSize: 9, color: colors.grey, textAlign: 'center', marginTop: 2 },
  meta: { marginTop: spacing.xs },
  rate: { fontSize: 10, fontWeight: '600', color: colors.grey },
  price: { fontSize: 11, fontWeight: '800', color: colors.primary, marginTop: 2 },
});
