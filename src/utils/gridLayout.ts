import { Dimensions } from 'react-native';
import { spacing } from '../constants/theme';

export const GRID_COLUMNS = 3;

export type GridPlaceholder = { id: string; __placeholder: true };

export function isGridPlaceholder<T>(item: T | GridPlaceholder): item is GridPlaceholder {
  return Boolean(item && typeof item === 'object' && '__placeholder' in item);
}

/** Pad incomplete last row so icons keep fixed column positions. */
export function padGridRows<T extends { id: string }>(
  items: T[],
  columns = GRID_COLUMNS,
): Array<T | GridPlaceholder> {
  const rem = items.length % columns;
  if (rem === 0) return items;
  const pads: GridPlaceholder[] = Array.from({ length: columns - rem }, (_, i) => ({
    id: `__grid_pad_${i}`,
    __placeholder: true,
  }));
  return [...items, ...pads];
}

export function getGridCardWidth(
  columns = GRID_COLUMNS,
  horizontalPadding = spacing.md,
  gap = spacing.sm,
): number {
  const width = Dimensions.get('window').width;
  const totalGap = gap * (columns - 1);
  return (width - horizontalPadding * 2 - totalGap) / columns;
}
