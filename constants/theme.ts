export const COLORS = {
  primary: '#0F4741',
  primaryDark: '#0A2F2B',
  primaryLight: '#145A52',
  primaryGradient: ['#0A2F2B', '#0F4741', '#145A52'],

  accent: '#C94843',
  accentLight: '#D96962',
  accentDark: '#A93732',
  accentGradient: ['#A93732', '#C94843', '#D96962'],

  gold: '#D4A854',
  goldLight: '#E5C477',
  goldDark: '#B88F3F',

  background: '#0A2F2B',
  backgroundGradient: ['#06201D', '#0A2F2B', '#0F4741'],
  tableGreen: '#0F4741',
  tablePattern: 'rgba(255, 255, 255, 0.03)',

  cardFront: '#F5EFD8',
  cardFrontGradient: ['#F5EFD8', '#EDE5C8'],
  cardBack: '#0F4741',
  cardBackGradient: ['#0A2F2B', '#0F4741', '#145A52'],
  cardBorder: '#D4A854',
  cardShadow: 'rgba(0, 0, 0, 0.5)',

  text: '#F5EFD8',
  textDark: '#1A1A1A',
  textSecondary: '#C5D3D1',
  textMuted: '#8A9E9C',

  success: '#5BA885',
  successLight: '#7BC09F',
  warning: '#D4A854',
  warningLight: '#E5C477',
  error: '#C94843',
  errorLight: '#D96962',

  overlay: 'rgba(10, 47, 43, 0.85)',
  overlayLight: 'rgba(10, 47, 43, 0.6)',
  modal: 'rgba(10, 47, 43, 0.98)',
  disabled: '#5A6E6C',

  glow: 'rgba(212, 168, 84, 0.4)',
  highlight: 'rgba(245, 239, 216, 0.15)',
  shimmer: 'rgba(245, 239, 216, 0.2)',
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
