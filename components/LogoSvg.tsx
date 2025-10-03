import React from 'react';
import Svg, { Text } from 'react-native-svg';

interface LogoSvgProps {
  width?: number;
  height?: number;
  opacity?: number;
}

export default function LogoSvg({ width = 400, height = 200, opacity = 1 }: LogoSvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 400 200" style={{ opacity }}>
      <Text
        x="200"
        y="120"
        fontFamily="Arial"
        fontSize="80"
        fontWeight="bold"
        fill="#E2B23A"
        textAnchor="middle"
      >
        CLIMAX
      </Text>
    </Svg>
  );
}
