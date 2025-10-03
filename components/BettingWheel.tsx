import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Button from './Button';

interface BettingWheelProps {
  maxBet: number;
  onBetConfirmed: (bet: number) => void;
  invalidBets?: number[];
  onMinimize?: () => void;
}

export default function BettingWheel({ maxBet, onBetConfirmed, invalidBets = [], onMinimize }: BettingWheelProps) {
  const [selectedBet, setSelectedBet] = useState(0);
  const scaleAnims = useRef<{ [key: number]: Animated.Value }>({}).current;

  const bets = Array.from({ length: maxBet + 1 }, (_, i) => i);

  const getScaleAnim = (bet: number) => {
    if (!scaleAnims[bet]) {
      scaleAnims[bet] = new Animated.Value(1);
    }
    return scaleAnims[bet];
  };

  const handleSelectBet = (bet: number) => {
    if (invalidBets.includes(bet)) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSelectedBet(bet);

    const scaleAnim = getScaleAnim(bet);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
    ]).start();
  };

  const handleConfirm = () => {
    if (!invalidBets.includes(selectedBet)) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onBetConfirmed(selectedBet);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.modal, COLORS.primaryDark] as any} style={styles.modalContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Place Your Bet</Text>
          {onMinimize && (
            <TouchableOpacity onPress={onMinimize} style={styles.minimizeButton}>
              <Text style={styles.minimizeText}>−</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>How many tricks will you win?</Text>

        <View style={styles.betsContainer}>
          {bets.map((bet) => {
            const isInvalid = invalidBets.includes(bet);
            const isSelected = bet === selectedBet;
            const scaleAnim = getScaleAnim(bet);

            return (
              <TouchableOpacity
                key={bet}
                onPress={() => handleSelectBet(bet)}
                disabled={isInvalid}
                activeOpacity={0.9}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <LinearGradient
                    colors={
                      isSelected
                        ? (COLORS.accentGradient as any)
                        : isInvalid
                        ? (['rgba(158, 158, 158, 0.2)', 'rgba(158, 158, 158, 0.1)'] as any)
                        : (['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'] as any)
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.betOption,
                      isSelected && styles.betOptionSelected,
                      isInvalid && styles.betOptionInvalid,
                      isSelected && SHADOWS.glow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.betText,
                        isSelected && styles.betTextSelected,
                        isInvalid && styles.betTextInvalid,
                      ]}
                    >
                      {bet}
                    </Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>

        {invalidBets.length > 0 && (
          <View style={styles.warningContainer}>
            <Text style={styles.warning}>Total bets cannot equal {maxBet}</Text>
          </View>
        )}

        <Button
          title={`Confirm Bet: ${selectedBet}`}
          onPress={handleConfirm}
          disabled={invalidBets.includes(selectedBet)}
          style={styles.confirmButton}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  modalContent: {
    padding: SPACING.xl,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  minimizeButton: {
    position: 'absolute',
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  minimizeText: {
    fontSize: 28,
    color: COLORS.gold,
    fontWeight: '700',
    lineHeight: 28,
    marginTop: -4,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  betsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  betOption: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: COLORS.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  betOptionSelected: {
    borderColor: COLORS.gold,
    borderWidth: 3,
  },
  betOptionInvalid: {
    opacity: 0.3,
    borderColor: COLORS.disabled,
  },
  betText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  betTextSelected: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxl + 2,
  },
  betTextInvalid: {
    color: COLORS.disabled,
  },
  warningContainer: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  warning: {
    color: COLORS.warningLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmButton: {
    minWidth: 250,
  },
});
