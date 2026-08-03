/**
 * KAIRO brand — premium dark theme (Midnight Blue & Gold).
 */
export const colors = {
  primary: '#D4AF37',
  primaryDark: '#B8952E',
  navy: '#1A237E',
  slate: '#5C6B7A',
  trustTeal: '#00897B',
  premiumGold: '#D4AF37',
  bronze: '#E56A44',
  white: '#0A192F',
  background: '#0A192F',
  surface: '#112240',
  charcoal: '#FFFFFF',
  grey: '#8892B0',
  greyLight: '#112240',
  border: '#233554',
  success: '#2E7D32',
  online: '#1B5E20',
  offline: '#C62828',
  error: '#C62828',
  warning: '#F9A825',
  emergency: '#D32F2F',
  overlay: 'rgba(0,0,0,0.6)',
  orangeTint: '#1D2C4A',
  black: '#FFFFFF',
  cardShadow: 'rgba(0,0,0,0.35)',
} as const;

export const darkColors = {
  ...colors,
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
