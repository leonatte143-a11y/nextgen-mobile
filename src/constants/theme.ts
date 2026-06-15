/**
 * NEXGEN brand — from product spec (Orange & White, AP focus).
 */
export const colors = {
  primary: '#FF8C00',
  primaryDark: '#E67E00',
  navy: '#1A237E',
  slate: '#5C6B7A',
  trustTeal: '#00897B',
  premiumGold: '#D4A017',
  white: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  charcoal: '#2C3E50',
  grey: '#757575',
  greyLight: '#F5F5F5',
  border: '#E8E8E8',
  success: '#2E7D32',
  online: '#1B5E20',
  offline: '#C62828',
  error: '#C62828',
  warning: '#F9A825',
  emergency: '#D32F2F',
  overlay: 'rgba(0,0,0,0.45)',
  orangeTint: '#FFF5E6',
  black: '#1A1A1A',
  cardShadow: 'rgba(0,0,0,0.04)',
} as const;

export const darkColors = {
  ...colors,
  background: '#121212',
  white: '#1E1E1E',
  greyLight: '#2A2A2A',
  charcoal: '#F0F0F0',
  grey: '#B0B0B0',
  border: '#333333',
  orangeTint: '#3D2A14',
  black: '#FFFFFF',
} as const;

/** Category accent colors for home service icons */
export const categoryAccentColors: Record<string, string> = {
  home_services: '#1565C0',
  home_repair: '#F9A825',
  professional_education: '#6A1B9A',
  life_health: '#2E7D32',
  events: '#C62828',
};

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
