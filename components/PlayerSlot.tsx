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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(226, 178, 58, 0.3)',
    minWidth: 180,
    ...SHADOWS.medium,
  },
  compactContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 14,
    minWidth: 150,
  },
  mobileContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    minWidth: 160,
  },
  currentTurn: {
    borderColor: COLORS.gold,
    borderWidth: 3,
    backgroundColor: 'rgba(226, 178, 58, 0.2)',
    ...SHADOWS.goldGlow,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarCompact: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: SPACING.sm,
  },
  avatarMobile: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatarTextCompact: {
    fontSize: FONT_SIZES.xl,
  },
  avatarTextMobile: {
    fontSize: FONT_SIZES.lg,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  nameCompact: {
    fontSize: FONT_SIZES.md,
    marginBottom: 2,
  },
  nameMobile: {
    fontSize: FONT_SIZES.md,
  },
  score: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  scoreCompact: {
    fontSize: FONT_SIZES.sm,
  },
  scoreMobile: {
    fontSize: FONT_SIZES.sm,
  },
  bet: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    marginTop: 2,
  },
  betCompact: {
    fontSize: FONT_SIZES.md,
  },
  betMobile: {
    fontSize: FONT_SIZES.md,
  },
  tricks: {
    color: COLORS.success,
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    marginTop: 2,
  },
  tricksCompact: {
    fontSize: FONT_SIZES.md,
  },
  tricksMobile: {
    fontSize: FONT_SIZES.md,
  },
  disconnected: {
    color: COLORS.warning,
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  cardPreview: {
    marginLeft: SPACING.sm,
  },
});
