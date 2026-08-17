import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import type { SubServiceItem } from '../../data/serviceCatalog';
import { GRID_COLUMNS, getGridCardWidth, isGridPlaceholder, padGridRows } from '../../utils/gridLayout';

type Props = {
  items: SubServiceItem[];
  onItemPress: (item: SubServiceItem) => void;
  /** Sub-service ids that should render as wide (full-row) cards below the standard grid,
   * in the order they should appear — pairs render two-up, a leftover single renders full-width. */
  wideIds?: string[];
};

const CARD_WIDTH = getGridCardWidth();

/** Distinct light background per card, cycled by position — text stays dark/high-contrast on all of them. */
const CARD_TINTS = ['#FFF3E0', '#E3F2FD', '#E8F5E9', '#FCE4EC', '#F3E5F5', '#FFFDE7', '#E0F7FA', '#EFEBE9'];

function SubCategoryGridComponent({ items, onItemPress, wideIds }: Props) {
  const wideIdSet = useMemo(() => new Set(wideIds ?? []), [wideIds]);
  const normalItems = useMemo(() => items.filter((i) => !wideIdSet.has(i.id)), [items, wideIdSet]);
  const wideItems = useMemo(
    () => (wideIds ?? []).map((id) => items.find((i) => i.id === id)).filter((i): i is SubServiceItem => Boolean(i)),
    [items, wideIds],
  );
  const gridData = useMemo(() => padGridRows(normalItems, GRID_COLUMNS), [normalItems]);

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof gridData)[number]; index: number }) => {
      if (isGridPlaceholder(item)) {
        return <View style={[styles.placeholder, { width: CARD_WIDTH }]} />;
      }
      return (
        <Pressable
          onPress={() => onItemPress(item)}
          style={({ pressed }) => [
            styles.card,
            { width: CARD_WIDTH, backgroundColor: CARD_TINTS[index % CARD_TINTS.length] },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon} size={19} color={colors.primary} />
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        </Pressable>
      );
    },
    [onItemPress],
  );

  const wideRows = useMemo(() => {
    const rows: SubServiceItem[][] = [];
    for (let i = 0; i < wideItems.length; i += 2) {
      rows.push(wideItems.slice(i, i + 2));
    }
    return rows;
  }, [wideItems]);

  return (
    <FlatList
      data={gridData}
      keyExtractor={(item) => item.id}
      numColumns={GRID_COLUMNS}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      renderItem={renderItem}
      ListFooterComponent={
        wideRows.length > 0 ? (
          <View style={styles.wideList}>
            {wideRows.map((row, rowIndex) => (
              <View key={row.map((i) => i.id).join('-')} style={styles.wideRow}>
                {row.map((item, itemIndex) => (
                  <Pressable
                    key={item.id}
                    onPress={() => onItemPress(item)}
                    style={({ pressed }) => [
                      styles.wideCard,
                      { backgroundColor: CARD_TINTS[(normalItems.length + rowIndex * 2 + itemIndex) % CARD_TINTS.length] },
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.wideIconWrap}>
                      <Ionicons name={item.icon} size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.wideTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        ) : null
      }
    />
  );
}

export const SubCategoryGrid = memo(SubCategoryGridComponent);

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  placeholder: { opacity: 0 },
  card: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
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
  pressed: { opacity: 0.9, borderColor: colors.primary },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: 11, fontWeight: '700', color: colors.charcoal, textAlign: 'center' },
  wideList: { gap: spacing.sm, marginTop: spacing.xs },
  wideRow: { flexDirection: 'row', gap: spacing.sm },
  wideCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  wideIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideTitle: { fontSize: 12, fontWeight: '700', color: colors.charcoal, flexShrink: 1 },
});
