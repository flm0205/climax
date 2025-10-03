import React from 'react';
import { View, StyleSheet, useWindowDimensions, Image } from 'react-native';

interface CompactLogoProps {
  size?: 'small' | 'medium' | 'large';
}

export default function CompactLogo({ size = 'small' }: CompactLogoProps) {
  const { width } = useWindowDimensions();
  const isVerySmall = width < 360;

  const logoSizes = {
    small: { width: isVerySmall ? 120 : 160, height: isVerySmall ? 60 : 80 },
    medium: { width: 280, height: 140 },
    large: { width: 400, height: 200 },
  };

  const { width: logoWidth, height: logoHeight } = logoSizes[size];

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/Logo_Transparent.png')}
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
