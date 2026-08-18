import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import type { CatalogService } from '../../mock/types';
import type { IconName, PopularServiceSlot } from '../../data/serviceCatalog';
import { getAccentTint } from '../../utils/accentColor';
import { getGridCardWidth } from '../../utils/gridLayout';

type Props = {
  slot: PopularServiceSlot;
  service?: CatalogService;
  onPress: () => void;
};

const CARD_WIDTH = getGridCardWidth();

function PopularServiceCardComponent({ slot, service, onPress }: Props) {
  const tint = getAccentTint(slot.subServiceId ?? slot.id);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { width: CARD_WIDTH, backgroundColor: tint }, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={slot.icon as IconName} size={19} color={colors.primary} />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {service?.name ?? slot.name}
      </Text>
    </Pressable>
  );
}

export const PopularServiceCard = memo(PopularServiceCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pressed: { opacity: 0.9 },
  iconWrap: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  name: { fontSize: 12, fontWeight: '800', color: colors.charcoal, textAlign: 'center' },
  meta: { marginTop: spacing.xs },
  rate: { fontSize: 10, fontWeight: '600', color: colors.grey },
  price: { fontSize: 11, fontWeight: '800', color: colors.primary, marginTop: 2 },
});
