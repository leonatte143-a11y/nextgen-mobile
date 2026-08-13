import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import type { SubServiceItem } from '../../data/serviceCatalog';
import { GRID_COLUMNS, getGridCardWidth, isGridPlaceholder, padGridRows } from '../../utils/gridLayout';

type Props = {
  items: SubServiceItem[];
  onItemPress: (item: SubServiceItem) => void;
};

const CARD_WIDTH = getGridCardWidth();

function SubCategoryGridComponent({ items, onItemPress }: Props) {
  const gridData = useMemo(() => padGridRows(items, GRID_COLUMNS), [items]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof gridData)[number] }) => {
      if (isGridPlaceholder(item)) {
        return <View style={[styles.placeholder, { width: CARD_WIDTH }]} />;
      }
      return (
        <Pressable
          onPress={() => onItemPress(item)}
          style={({ pressed }) => [styles.card, { width: CARD_WIDTH }, pressed && styles.pressed]}
        >
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon} size={19} color={colors.primary} />
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </Pressable>
      );
    },
    [onItemPress],
  );

  return (
    <FlatList
      data={gridData}
      keyExtractor={(item) => item.id}
      numColumns={GRID_COLUMNS}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      renderItem={renderItem}
    />
  );
}

export const SubCategoryGrid = memo(SubCategoryGridComponent);

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  placeholder: { opacity: 0 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: { opacity: 0.9, borderColor: colors.primary, backgroundColor: colors.orangeTint },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: 11, fontWeight: '700', color: colors.charcoal, textAlign: 'center' },
  sub: { fontSize: 9, color: colors.grey, textAlign: 'center', marginTop: 2 },
});
