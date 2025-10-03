import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { Player } from '../types/game';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import Card from './Card';

interface PlayerSlotProps {
  player: Player;
  isCurrentTurn?: boolean;
  showBet?: boolean;
  showTricks?: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  showCard?: boolean;
  isCurrentPlayer?: boolean;
}

export default function PlayerSlot({
  player,
  isCurrentTurn = false,
  showBet = false,
  showTricks = false,
  position,
  showCard = false,
  isCurrentPlayer = false,
}: PlayerSlotProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const isCompact = position === 'top';

  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCurrentTurn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isCurrentTurn]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.gold, COLORS.goldLight],
  });

  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 24],
  });

  return (
    <Animated.View style={[
      styles.container,
      isCompact && styles.compactContainer,
      isSmallScreen && styles.mobileContainer,
      isSmallScreen && isCompact && styles.mobileCompactContainer,
      isCurrentTurn && styles.currentTurn,
      isCurrentTurn && isCompact && styles.currentTurnCompact,
      isCurrentTurn && {
        borderColor,
        shadowRadius,
        shadowOpacity: 0.9,
      },
    ]}>
      <View style={[styles.avatar, isCompact && styles.avatarCompact]}>
        <Text style={[styles.avatarText, isCompact && styles.avatarTextCompact]}>
          {player.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, isCompact && styles.nameCompact]} numberOfLines={1}>
          {player.name}
        </Text>
        <Text style={[styles.score, isCompact && styles.scoreCompact]}>Score: {player.score}</Text>
        {showBet && player.currentBet !== null && <Text style={[styles.bet, isCompact && styles.betCompact]}>Bet: {player.currentBet}</Text>}
        {showTricks && <Text style={[styles.tricks, isCompact && styles.tricksCompact]}>Tricks: {player.tricksWon}</Text>}
        {!player.isConnected && <Text style={styles.disconnected}>Disconnected</Text>}
      </View>
      {showCard && player.hand.length > 0 && (
        <View style={styles.cardPreview}>
          <Card card={player.hand[0]} size="small" faceUp={!isCurrentPlayer} />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(226, 178, 58, 0.2)',
    minWidth: 150,
    ...SHADOWS.small,
  },
  compactContainer: {
    padding: SPACING.sm,
    borderRadius: 10,
    minWidth: 130,
    maxWidth: 140,
  },
  currentTurn: {
    borderColor: COLORS.gold,
    borderWidth: 3,
    backgroundColor: 'rgba(226, 178, 58, 0.15)',
    ...SHADOWS.goldGlow,
  },
  currentTurnCompact: {
    borderWidth: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.xs,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  avatarTextCompact: {
    fontSize: FONT_SIZES.md,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  nameCompact: {
    fontSize: FONT_SIZES.sm,
    marginBottom: 1,
  },
  score: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  scoreCompact: {
    fontSize: FONT_SIZES.xs,
  },
  bet: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  betCompact: {
    fontSize: FONT_SIZES.sm,
  },
  tricks: {
    color: COLORS.success,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  tricksCompact: {
    fontSize: FONT_SIZES.sm,
  },
  mobileContainer: {
    padding: SPACING.sm,
    minWidth: 140,
  },
  mobileCompactContainer: {
    padding: SPACING.xs,
    minWidth: 120,
  },
  disconnected: {
    color: COLORS.warning,
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
  },
  cardPreview: {
    marginLeft: SPACING.sm,
  },
});
