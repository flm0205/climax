import React from 'react';
import { Image } from 'react-native';

interface LogoSvgProps {
  width?: number;
  height?: number;
  opacity?: number;
}

export default function LogoSvg({ width = 400, height = 200, opacity = 1 }: LogoSvgProps) {
  return (
    <Image
      source={require('../assets/images/Logo_Transparent.png')}
      style={{ width, height, opacity }}
      resizeMode="contain"
    />
  );
}
