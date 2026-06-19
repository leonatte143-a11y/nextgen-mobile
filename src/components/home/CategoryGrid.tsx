import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { categoryAccentColors, spacing } from '../../constants/theme';
import type { MainCategory } from '../../data/serviceCatalog';
import { GRID_COLUMNS, getGridCardWidth, isGridPlaceholder, padGridRows } from '../../utils/gridLayout';
import { CategoryGridCard } from './CategoryGridCard';

type Props = {
  categories: MainCategory[];
  language: 'en' | 'te' | 'hi';
  onCategoryPress: (category: MainCategory) => void;
};

const CARD_WIDTH = getGridCardWidth();

function CategoryGridComponent({ categories, language, onCategoryPress }: Props) {
  const gridData = useMemo(() => padGridRows(categories, GRID_COLUMNS), [categories]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof gridData)[number] }) => {
      if (isGridPlaceholder(item)) {
        return <View style={[styles.placeholder, { width: CARD_WIDTH }]} />;
      }
      return (
        <CategoryGridCard
          title={language === 'te' ? item.titleTe : item.title}
          icon={item.icon}
          accentColor={categoryAccentColors[item.id] ?? categoryAccentColors.home_services}
          onPress={() => onCategoryPress(item)}
        />
      );
    },
    [language, onCategoryPress],
  );

  return (
    <FlatList
      data={gridData}
      keyExtractor={(item) => item.id}
      numColumns={GRID_COLUMNS}
      scrollEnabled={false}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      renderItem={renderItem}
    />
  );
}

export const CategoryGrid = memo(CategoryGridComponent);

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.md },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  placeholder: { opacity: 0 },
});
