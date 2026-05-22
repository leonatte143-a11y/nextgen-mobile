import React, { memo, useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { spacing } from '../../constants/theme';
import type { MainCategory } from '../../data/serviceCatalog';
import { GRID_COLUMNS } from '../../utils/gridLayout';
import { CategoryGridCard } from './CategoryGridCard';

type Props = {
  categories: MainCategory[];
  language: 'en' | 'te';
  onCategoryPress: (category: MainCategory) => void;
};

function CategoryGridComponent({ categories, language, onCategoryPress }: Props) {
  const renderItem = useCallback(
    ({ item }: { item: MainCategory }) => (
      <CategoryGridCard
        title={language === 'te' ? item.titleTe : item.title}
        icon={item.icon}
        onPress={() => onCategoryPress(item)}
      />
    ),
    [language, onCategoryPress],
  );

  return (
    <FlatList
      data={categories}
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
  row: { justifyContent: 'space-between' },
});
