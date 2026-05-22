import { Dimensions } from 'react-native';
import { spacing } from '../constants/theme';

export const GRID_COLUMNS = 3;

export function getGridCardWidth(
  columns = GRID_COLUMNS,
  horizontalPadding = spacing.md,
  gap = spacing.sm,
): number {
  const width = Dimensions.get('window').width;
  const totalGap = gap * (columns - 1);
  return (width - horizontalPadding * 2 - totalGap) / columns;
}
