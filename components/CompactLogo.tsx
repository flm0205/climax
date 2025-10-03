import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, FONT_SIZES } from '../constants/theme';
import Svg, { Text as SvgText } from 'react-native-svg';

interface CompactLogoProps {
  size?: 'small' | 'medium' | 'large';
}

export default function CompactLogo({ size = 'small' }: CompactLogoProps) {
  const { width } = useWindowDimensions();
  const isVerySmall = width < 360;

  const logoSizes = {
    small: { width: isVerySmall ? 80 : 100, height: isVerySmall ? 32 : 40, fontSize: 32 },
    medium: { width: 140, height: 56, fontSize: 44 },
    large: { width: 200, height: 80, fontSize: 56 },
  };

  const { width: logoWidth, height: logoHeight, fontSize } = logoSizes[size];

  return (
    <View style={[styles.container, size === 'large' && styles.containerLarge]}>
      <Svg width={logoWidth} height={logoHeight} viewBox="0 0 200 80">
        <SvgText
          x="100"
          y="50"
          fontSize={fontSize}
          fontWeight="bold"
          fill="#E2B23A"
          textAnchor="middle"
        >
          CLIMAX
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(226, 178, 58, 0.1)',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2.5,
  },
});
