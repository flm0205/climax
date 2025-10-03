import React from 'react';
import { View, StyleSheet, useWindowDimensions, Image } from 'react-native';

interface CompactLogoProps {
  size?: 'small' | 'medium' | 'large';
}

export default function CompactLogo({ size = 'small' }: CompactLogoProps) {
  const { width } = useWindowDimensions();
  const isVerySmall = width < 360;

  const logoSizes = {
    small: { width: isVerySmall ? 60 : 80, height: isVerySmall ? 30 : 40 },
    medium: { width: 140, height: 70 },
    large: { width: 200, height: 100 },
  };

  const { width: logoWidth, height: logoHeight } = logoSizes[size];

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.svg')}
        style={{ width: logoWidth, height: logoHeight }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
