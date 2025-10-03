import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, FONT_SIZES } from '../constants/theme';

interface CompactLogoProps {
  size?: 'small' | 'medium';
}

export default function CompactLogo({ size = 'small' }: CompactLogoProps) {
  const { width } = useWindowDimensions();
  const isVerySmall = width < 360;

  const fontSize = size === 'small' ? (isVerySmall ? FONT_SIZES.lg : FONT_SIZES.xl) : FONT_SIZES.xxl;

  return (
    <View style={styles.container}>
      <Text style={[styles.logo, { fontSize }]}>CLIMAX</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(226, 178, 58, 0.15)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  logo: {
    color: COLORS.gold,
    fontWeight: '800',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
