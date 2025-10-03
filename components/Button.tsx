import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, Animated } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, ANIMATIONS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 3,
    }).start();
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return COLORS.greenGradient;
      case 'secondary':
        return COLORS.accentGradient;
      case 'outline':
        return ['transparent', 'transparent'];
      default:
        return COLORS.greenGradient;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={1}
      style={[{ transform: [{ scale: scaleAnim }] }, style]}
    >
      <Animated.View>
        <LinearGradient
          colors={getGradientColors() as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            styles[variant],
            isDisabled && styles.disabled,
            variant !== 'outline' && SHADOWS.medium,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={variant === 'outline' ? COLORS.accent : COLORS.text} />
          ) : (
            <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primary: {
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  secondary: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  outline: {
    backgroundColor: 'rgba(226, 178, 58, 0.05)',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  primaryText: {
    color: COLORS.text,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  secondaryText: {
    color: COLORS.text,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  outlineText: {
    color: COLORS.gold,
    fontWeight: '700',
  },
});
