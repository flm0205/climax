import React from 'react';
import Svg, { Text, G } from 'react-native-svg';

interface LogoSvgProps {
  width?: number;
  height?: number;
  opacity?: number;
}

export default function LogoSvg({ width = 400, height = 200, opacity = 1 }: LogoSvgProps) {
  const scale = width / 400;

  return (
    <Svg width={width} height={height} viewBox="0 0 400 200" style={{ opacity }}>
      <G transform={`scale(${scale})`}>
        <Text
          x="200"
          y="130"
          fontFamily="Arial, sans-serif"
          fontSize="95"
          fontWeight="900"
          fill="#D4A239"
          textAnchor="middle"
          letterSpacing="8"
        >
          CLIMAX
        </Text>
      </G>
    </Svg>
  );
}
