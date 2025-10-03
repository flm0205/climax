export const COLORS = {
  primary: '#042B12',
  primaryDark: '#021A0A',
  primaryLight: '#0F4D2A',
  primaryGradient: ['#042B12', '#0A3B1A', '#0F4D2A'],
  greenGradient: ['#0A3B1A', '#0F4D2A', '#14612E'],

  accent: '#D94545',
  accentLight: '#E57373',
  accentDark: '#C62828',
  accentGradient: ['#C62828', '#D94545', '#E57373'],
  redGradient: ['#B71C1C', '#D94545'],

  gold: '#E2B23A',
  goldLight: '#F5D76E',
  goldDark: '#D4A029',
  goldGradient: ['#D4A029', '#E2B23A', '#F5D76E'],

  background: '#042B12',
  backgroundGradient: ['#021A0A', '#042B12', '#0A3B1A'],
  tableGreen: '#0F4D2A',
  tablePattern: 'rgba(226, 178, 58, 0.03)',

  cardFront: '#FFFEF0',
  cardFrontGradient: ['#FFFEF0', '#FFF9E3'],
  cardBack: '#0A3B1A',
  cardBackGradient: ['#042B12', '#0A3B1A', '#0F4D2A'],
  cardBorder: '#E2B23A',
  cardShadow: 'rgba(0, 0, 0, 0.5)',

  text: '#FFFFFF',
  textDark: '#1A1A1A',
  textSecondary: '#D4C5B8',
  textMuted: '#9A8F7A',
  textBeige: '#F5E6D3',

  success: '#4CAF50',
  successLight: '#81C784',
  warning: '#FF9800',
  warningLight: '#FFB74D',
  error: '#D94545',
  errorLight: '#E57373',

  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.6)',
  modal: 'rgba(4, 43, 18, 0.97)',
  disabled: '#5A5A5A',

  glow: 'rgba(226, 178, 58, 0.5)',
  glowStrong: 'rgba(226, 178, 58, 0.8)',
  highlight: 'rgba(226, 178, 58, 0.2)',
  highlightStrong: 'rgba(226, 178, 58, 0.3)',
  shimmer: 'rgba(245, 215, 110, 0.25)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
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
  borderRadius: 10,
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
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  glow: {
    shadowColor: '#E2B23A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
  },
  goldGlow: {
    shadowColor: '#E2B23A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 15,
  },
};
