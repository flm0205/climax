import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card as CardType } from '../types/game';
import Card from './Card';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';

interface LeadSuitIndicatorProps {
  leadSuitCard: CardType;
}

export default function LeadSuitIndicator({ leadSuitCard }: LeadSuitIndicatorProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  return (
    <View style={[styles.container, isSmallScreen && styles.containerSmall]}>
      <LinearGradient
        colors={['rgba(4, 43, 18, 0.95)', 'rgba(10, 59, 26, 0.95)']}
        style={styles.gradient}
      >
        <Text style={styles.label}>Lead Suit</Text>
        <Card card={leadSuitCard} faceUp={true} size="small" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  containerSmall: {
    top: 8,
    transform: [{ scale: 0.85 }],
  },
  gradient: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.gold,
    ...SHADOWS.goldGlow,
  },
  label: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
