import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import Card from './Card';
import { Card as CardType } from '../types/game';

interface LeadSuitIndicatorProps {
  leadSuitCard: CardType;
}

export default function LeadSuitIndicator({ leadSuitCard }: LeadSuitIndicatorProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const isVerySmall = width < 360;

  return (
    <View style={[styles.container, isSmallScreen && styles.containerSmall, isVerySmall && styles.containerVerySmall]}>
      <LinearGradient
        colors={['rgba(4, 43, 18, 0.95)', 'rgba(10, 59, 26, 0.95)']}
        style={[styles.gradient, isSmallScreen && styles.gradientSmall]}
      >
        <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>LEAD SUIT</Text>
        <Card card={leadSuitCard} faceUp={true} size="small" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerSmall: {
    transform: [{ scale: 0.8 }],
  },
  containerVerySmall: {
    transform: [{ scale: 0.7 }],
  },
  gradient: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gold,
    shadowColor: '#E2B23A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 80,
  },
  gradientSmall: {
    paddingVertical: SPACING.xs - 1,
    paddingHorizontal: SPACING.xs,
    borderWidth: 1.5,
    borderRadius: 8,
    minWidth: 70,
  },
  label: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.xs - 1,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelSmall: {
    fontSize: FONT_SIZES.xs - 2,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
});
