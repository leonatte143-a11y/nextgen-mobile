import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import type { IconName } from '../../data/serviceCatalog';
import { getGridCardWidth } from '../../utils/gridLayout';

type Props = {
  title: string;
  icon: IconName;
  accentColor?: string;
  onPress: () => void;
  selected?: boolean;
};

const CARD_WIDTH = getGridCardWidth();

function CategoryGridCardComponent({ title, icon, accentColor = colors.primary, onPress, selected }: Props) {
  const iconBg = selected ? accentColor : `${accentColor}18`;
  const iconColor = selected ? colors.white : accentColor;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width: CARD_WIDTH },
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }, selected && styles.iconWrapSelected]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.title, selected && styles.titleSelected]} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

export const CategoryGridCard = memo(CategoryGridCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.orangeTint,
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconWrapSelected: { backgroundColor: colors.primary },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal,
    textAlign: 'center',
    lineHeight: 14,
  },
  titleSelected: { color: colors.primaryDark },
});
