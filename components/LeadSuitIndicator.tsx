import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card as CardType } from '../types/game';
import Card from './Card';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

interface LeadSuitIndicatorProps {
  leadSuitCard: CardType;
}

export default function LeadSuitIndicator({ leadSuitCard }: LeadSuitIndicatorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Lead Suit</Text>
      <Card card={leadSuitCard} faceUp={true} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
});
