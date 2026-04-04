/**
 * NEXGEN brand — from product spec (Orange & White, AP focus).
 */
export const colors = {
  primary: '#FF8C00',
  primaryDark: '#E67E00',
  white: '#FFFFFF',
  background: '#FFFFFF',
  charcoal: '#2D2D2D',
  grey: '#757575',
  greyLight: '#F5F5F5',
  border: '#E8E8E8',
  success: '#2E7D32',
  error: '#C62828',
  warning: '#F9A825',
  overlay: 'rgba(0,0,0,0.45)',
  orangeTint: '#FFF5E6',
  black: '#1A1A1A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  title: { fontSize: 22, fontWeight: '700' as const },
  heading: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  small: { fontSize: 10, fontWeight: '400' as const },
};
