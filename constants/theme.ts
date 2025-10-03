export const COLORS = {
  primary: '#0F3D2E',
  primaryDark: '#081F19',
  primaryLight: '#1B5E45',
  primaryGradient: ['#081F19', '#0F3D2E', '#1B5E45'],

  accent: '#C8332E',
  accentLight: '#DC5F5A',
  accentDark: '#9A1F1B',
  accentGradient: ['#9A1F1B', '#C8332E', '#DC5F5A'],

  gold: '#E6C179',
  goldLight: '#F5D9A0',
  goldDark: '#D4A852',

  cream: '#F5F0E3',
  creamDark: '#E8DCC8',

  background: '#081F19',
  backgroundGradient: ['#04120F', '#081F19', '#0F3D2E'],
  tableGreen: '#0F3D2E',
  tablePattern: 'rgba(229, 193, 121, 0.03)',

  cardFront: '#FFFEF0',
  cardFrontGradient: ['#FFFEF0', '#FFF9E3'],
  cardBack: '#8B4513',
  cardBackGradient: ['#654321', '#8B4513', '#A0522D'],
  cardBorder: '#D4AF37',
  cardShadow: 'rgba(0, 0, 0, 0.4)',

  text: '#F5F0E3',
  textDark: '#1A1A1A',
  textSecondary: '#C5B89D',
  textMuted: '#8A8070',

  success: '#4CAF50',
  successLight: '#81C784',
  warning: '#E6C179',
  warningLight: '#F5D9A0',
  error: '#C8332E',
  errorLight: '#DC5F5A',

  overlay: 'rgba(8, 31, 25, 0.85)',
  overlayLight: 'rgba(8, 31, 25, 0.6)',
  modal: 'rgba(15, 61, 46, 0.98)',
  disabled: '#5A5550',

  glow: 'rgba(230, 193, 121, 0.4)',
  highlight: 'rgba(245, 240, 227, 0.12)',
  shimmer: 'rgba(230, 193, 121, 0.15)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const CARD_DIMENSIONS = {
  width: 80,
  height: 120,
  borderRadius: 8,
};

export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 8,
  },
  glow: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
};
