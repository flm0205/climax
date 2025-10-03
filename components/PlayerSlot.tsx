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

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
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
    outputRange: [COLORS.goldLight, '#FFF9E3'],
  });

  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 20],
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
    backgroundColor: 'rgba(4, 43, 18, 0.85)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.gold,
    minWidth: 180,
    maxWidth: 240,
    minHeight: 72,
    flex: 0,
    ...SHADOWS.medium,
  },
  compactContainer: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 14,
    minWidth: 160,
    maxWidth: 220,
    minHeight: 64,
  },
  mobileContainer: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.xs + 2,
    minWidth: 140,
    maxWidth: 180,
    minHeight: 60,
    borderRadius: 12,
  },
  currentTurn: {
    borderColor: COLORS.goldLight,
    borderWidth: 3,
    backgroundColor: 'rgba(226, 178, 58, 0.25)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 15,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...SHADOWS.small,
  },
  avatarCompact: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: SPACING.sm,
  },
  avatarMobile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.xs + 2,
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  nameCompact: {
    fontSize: 14,
    marginBottom: 2,
  },
  nameMobile: {
    fontSize: 13,
    marginBottom: 1,
  },
  score: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  scoreCompact: {
    fontSize: 13,
  },
  scoreMobile: {
    fontSize: 12,
  },
  bet: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  betCompact: {
    fontSize: 14,
  },
  betMobile: {
    fontSize: 13,
    marginTop: 1,
  },
  tricks: {
    color: COLORS.success,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  tricksCompact: {
    fontSize: 14,
  },
  tricksMobile: {
    fontSize: 13,
    marginTop: 1,
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
