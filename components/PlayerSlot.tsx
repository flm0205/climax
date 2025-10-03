import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCurrentTurn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: false,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [isCurrentTurn]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.gold, COLORS.goldLight],
  });

  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 16],
  });

  const avatarColors = isCurrentPlayer
    ? ['#E2B23A', '#D4A02F']
    : ['#8B0000', '#A52A2A'];

  return (
    <Animated.View style={[
      styles.container,
      isCompact && styles.compactContainer,
      isSmallScreen && styles.mobileContainer,
      isCurrentTurn && styles.currentTurn,
      isCurrentTurn && {
        borderColor,
        shadowRadius,
        shadowOpacity: 0.8,
        transform: [{ scale: pulseAnim }],
      },
    ]}>
      <LinearGradient
        colors={avatarColors}
        style={[styles.avatar, isCompact && styles.avatarCompact, isSmallScreen && styles.avatarMobile]}
      >
        <Text style={[styles.avatarText, isCompact && styles.avatarTextCompact, isSmallScreen && styles.avatarTextMobile]}>
          {player.name.charAt(0).toUpperCase()}
        </Text>
      </LinearGradient>

      <View style={styles.info}>
        <Text style={[styles.name, isCompact && styles.nameCompact, isSmallScreen && styles.nameMobile]} numberOfLines={1}>
          {player.name}
        </Text>
        <Text style={[styles.score, isCompact && styles.scoreCompact, isSmallScreen && styles.scoreMobile]}>
          Score: {player.score}
        </Text>
        {showBet && player.currentBet !== null && (
          <Text style={[styles.bet, isCompact && styles.betCompact, isSmallScreen && styles.betMobile]}>
            Bet: {player.currentBet}
          </Text>
        )}
        {showTricks && (
          <Text style={[styles.tricks, isCompact && styles.tricksCompact, isSmallScreen && styles.tricksMobile]}>
            Tricks: {player.tricksWon}
          </Text>
        )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 178, 58, 0.25)',
    minWidth: 160,
    ...SHADOWS.small,
  },
  compactContainer: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: 12,
    minWidth: 140,
  },
  mobileContainer: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    minWidth: 145,
  },
  currentTurn: {
    borderColor: COLORS.gold,
    borderWidth: 2,
    backgroundColor: 'rgba(226, 178, 58, 0.15)',
    shadowColor: '#E2B23A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  avatarCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.xs,
  },
  avatarMobile: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatarTextCompact: {
    fontSize: FONT_SIZES.lg,
  },
  avatarTextMobile: {
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
    letterSpacing: 0.3,
  },
  nameCompact: {
    fontSize: FONT_SIZES.sm,
    marginBottom: 1,
  },
  nameMobile: {
    fontSize: FONT_SIZES.sm,
  },
  score: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  scoreCompact: {
    fontSize: FONT_SIZES.xs,
  },
  scoreMobile: {
    fontSize: FONT_SIZES.xs,
  },
  bet: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginTop: 1,
  },
  betCompact: {
    fontSize: FONT_SIZES.sm,
  },
  betMobile: {
    fontSize: FONT_SIZES.sm,
  },
  tricks: {
    color: COLORS.success,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginTop: 1,
  },
  tricksCompact: {
    fontSize: FONT_SIZES.sm,
  },
  tricksMobile: {
    fontSize: FONT_SIZES.sm,
  },
  disconnected: {
    color: COLORS.warning,
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  cardPreview: {
    marginLeft: SPACING.xs,
  },
});
