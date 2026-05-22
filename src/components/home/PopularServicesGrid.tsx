import React, { memo, useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { spacing } from '../../constants/theme';
import type { CatalogService } from '../../mock/types';
import { buildPopularDisplay, type PopularServiceSlot } from '../../data/serviceCatalog';
import { GRID_COLUMNS } from '../../utils/gridLayout';
import { PopularServiceCard } from './PopularServiceCard';

type PopularItem = PopularServiceSlot & { service?: CatalogService };

type Props = {
  catalog: CatalogService[];
  onItemPress: (item: PopularItem) => void;
};

function PopularServicesGridComponent({ catalog, onItemPress }: Props) {
  const data = buildPopularDisplay(catalog);

  const renderItem = useCallback(
    ({ item }: { item: PopularItem }) => (
      <PopularServiceCard
        slot={item}
        service={item.service}
        onPress={() => onItemPress(item)}
      />
    ),
    [onItemPress],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      numColumns={GRID_COLUMNS}
      scrollEnabled={false}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      renderItem={renderItem}
    />
  );
}

export const PopularServicesGrid = memo(PopularServicesGridComponent);

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.md },
  row: { justifyContent: 'space-between' },
});
