export const COLORS = {
  primary: '#1B5E20',
  primaryDark: '#0D3E12',
  primaryLight: '#2E7D32',
  primaryGradient: ['#0D3E12', '#1B5E20', '#2E7D32'],

  accent: '#D32F2F',
  accentLight: '#EF5350',
  accentDark: '#B71C1C',
  accentGradient: ['#B71C1C', '#D32F2F', '#EF5350'],

  gold: '#FFD700',
  goldLight: '#FFE55C',
  goldDark: '#FFC107',

  background: '#0A2E0F',
  backgroundGradient: ['#061A0A', '#0A2E0F', '#0D3E12'],
  tableGreen: '#1B5E20',
  tablePattern: 'rgba(255, 255, 255, 0.03)',

  cardFront: '#FFFEF0',
  cardFrontGradient: ['#FFFEF0', '#FFF9E3'],
  cardBack: '#8B4513',
  cardBackGradient: ['#654321', '#8B4513', '#A0522D'],
  cardBorder: '#D4AF37',
  cardShadow: 'rgba(0, 0, 0, 0.4)',

  text: '#FFFFFF',
  textDark: '#1A1A1A',
  textSecondary: '#B8C5B8',
  textMuted: '#7A8F7A',

  success: '#4CAF50',
  successLight: '#81C784',
  warning: '#FF9800',
  warningLight: '#FFB74D',
  error: '#F44336',
  errorLight: '#E57373',

  overlay: 'rgba(0, 0, 0, 0.75)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  modal: 'rgba(13, 62, 18, 0.98)',
  disabled: '#9E9E9E',

  glow: 'rgba(255, 215, 0, 0.4)',
  highlight: 'rgba(255, 255, 255, 0.15)',
  shimmer: 'rgba(255, 255, 255, 0.2)',
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
