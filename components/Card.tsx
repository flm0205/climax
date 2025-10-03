import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Card as CardType } from '../types/game';
import { COLORS, CARD_DIMENSIONS, SPACING, SHADOWS, ANIMATIONS } from '../constants/theme';
import { SUIT_NAMES } from '../constants/cards';
import { LinearGradient } from 'expo-linear-gradient';
import { getCardImage } from '../utils/cardImages';

interface CardProps {
  card: CardType;
  faceUp?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: { width: 60, height: 90 },
  medium: { width: 80, height: 120 },
  large: { width: 100, height: 150 },
};

export default function Card({ card, faceUp = true, onPress, disabled = false, size = 'medium' }: CardProps) {
  const dimensions = SIZES[size];
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  const cardImageSource = getCardImage(card);

  const renderCardFace = () => {
    if (!cardImageSource || imageError) {
      return (
        <LinearGradient
          colors={COLORS.cardFrontGradient as any}
          style={[
            styles.card,
            {
              width: dimensions.width,
              height: dimensions.height,
            },
            disabled && styles.disabled,
          ]}
        >
          <View style={styles.cardBorder} />
          <View style={styles.cardFace}>
            <View style={styles.cornerTop}>
              <Text
                style={[
                  styles.valueCorner,
                  { color: card.suit === 'cups' || card.suit === 'coins' ? COLORS.accent : COLORS.textDark },
                ]}
              >
                {card.value.toUpperCase()}
              </Text>
              <Text style={styles.suitCorner}>{getSuitSymbol(card.suit)}</Text>
            </View>
            <View style={styles.center}>
              <Text
                style={[
                  styles.suit,
                  { color: card.suit === 'cups' || card.suit === 'coins' ? COLORS.accent : COLORS.textDark },
                ]}
              >
                {getSuitSymbol(card.suit)}
              </Text>
            </View>
            <View style={styles.cornerBottom}>
              <Text
                style={[
                  styles.valueCorner,
                  { color: card.suit === 'cups' || card.suit === 'coins' ? COLORS.accent : COLORS.textDark },
                ]}
              >
                {card.value.toUpperCase()}
              </Text>
              <Text style={styles.suitCorner}>{getSuitSymbol(card.suit)}</Text>
            </View>
            <View style={styles.suitLabel}>
              <Text style={styles.suitName}>{SUIT_NAMES[card.suit]}</Text>
            </View>
          </View>
        </LinearGradient>
      );
    }

    return (
      <View
        style={[
          styles.card,
          {
            width: dimensions.width,
            height: dimensions.height,
          },
          disabled && styles.disabled,
        ]}
      >
        <Image
          source={cardImageSource}
          style={[
            styles.cardImage,
            {
              width: dimensions.width,
              height: dimensions.height,
            },
          ]}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
    );
  };

  const CardContent = (
    <Animated.View
      style={[
        {
          width: dimensions.width,
          height: dimensions.height,
          transform: [{ scale: scaleAnim }, { rotateY: rotation }],
        },
      ]}
    >
      {faceUp ? (
        renderCardFace()
      ) : (
        <LinearGradient
          colors={COLORS.cardBackGradient as any}
          style={[
            styles.card,
            {
              width: dimensions.width,
              height: dimensions.height,
            },
            disabled && styles.disabled,
          ]}
        >
          <View style={styles.cardBorder} />
          <View style={styles.cardBackContent}>
            <Text style={styles.backText}>CLIMAX</Text>
            <View style={styles.backPattern} />
          </View>
        </LinearGradient>
      )}
    </Animated.View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
}

function getSuitSymbol(suit: string): string {
  switch (suit) {
    case 'coins':
      return '●';
    case 'cups':
      return '◆';
    case 'swords':
      return '†';
    case 'clubs':
      return '♣';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CARD_DIMENSIONS.borderRadius + 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  cardImage: {
    borderRadius: CARD_DIMENSIONS.borderRadius + 2,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderColor: COLORS.cardBorder,
    borderRadius: CARD_DIMENSIONS.borderRadius,
    opacity: 0.6,
  },
  cardFace: {
    flex: 1,
    width: '100%',
    padding: SPACING.xs,
    position: 'relative',
  },
  cornerTop: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    alignItems: 'center',
  },
  cornerBottom: {
    position: 'absolute',
    bottom: SPACING.xs,
    right: SPACING.xs,
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueCorner: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  suitCorner: {
    fontSize: 16,
    marginTop: -2,
  },
  suit: {
    fontSize: 42,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  suitLabel: {
    position: 'absolute',
    bottom: SPACING.md + 2,
    alignSelf: 'center',
  },
  suitName: {
    fontSize: 9,
    color: COLORS.textDark,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.8,
  },
  cardBackContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  backText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.gold,
    transform: [{ rotate: '-45deg' }],
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  backPattern: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    opacity: 0.1,
  },
  disabled: {
    opacity: 0.4,
  },
});
