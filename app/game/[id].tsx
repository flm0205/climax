import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, Modal, useWindowDimensions, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../../constants/theme';
import CompactLogo from '../../components/CompactLogo';
import LogoSvg from '../../components/LogoSvg';
import { GameState, Player, Card as CardType } from '../../types/game';
import { getGameState, updateGameState, subscribeGameState, saveGameHistory } from '../../services/gameService';
import { updateLobbyStatus } from '../../services/lobbyService';
import Card from '../../components/Card';
import PlayerSlot from '../../components/PlayerSlot';
import LeadSuitIndicator from '../../components/LeadSuitIndicator';
import BettingWheel from '../../components/BettingWheel';
import Button from '../../components/Button';
import { canPlayCard, determineWinner, getValidCards } from '../../game-logic/tricks';
import { calculateAIBet, selectAICard, getAIActionDelay } from '../../game-logic/ai';
import { calculateScore, calculateRoundScores } from '../../game-logic/scoring';
import { createDeck, shuffleDeck, dealCards, drawLeadSuitCard } from '../../game-logic/deck';
import { isOneCardRound } from '../../game-logic/rounds';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, playerId } = params as { id: string; playerId: string };

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [roundScores, setRoundScores] = useState<any[]>([]);
  const [bettingWheelMinimized, setBettingWheelMinimized] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadGameState();

    console.log('[Game] Setting up game state subscription for game:', id);
    const channel = subscribeGameState(id, (payload) => {
      console.log('[Game] Received game state update:', payload.eventType);
      if (payload.new?.game_state) {
        console.log('[Game] Updating game state from subscription');
        setGameState(payload.new.game_state);
      }
    });

    channel.on('system', {}, (payload: any) => {
      console.log('[Game] Subscription system event:', payload);
    });

    console.log('[Game] Setting up polling fallback (every 2 seconds)');
    pollIntervalRef.current = setInterval(() => {
      console.log('[Game] Polling for game state updates...');
      loadGameState();
    }, 2000);

    return () => {
      console.log('[Game] Cleaning up subscriptions');
      channel.unsubscribe();
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (gameState && gameState.phase !== 'game-end') {
      processAITurns();
    }

    if (gameState && gameState.phase === 'round-end' && !showScoreboard) {
      if (gameState.currentRound) {
        const scores = calculateRoundScores(gameState.players, gameState.currentRound.bets, gameState.currentRound.tricksWon);
        setRoundScores(scores);
        setShowScoreboard(true);
      }
    }
  }, [gameState]);

  const loadGameState = async () => {
    try {
      console.log('[Game] Loading game state for game:', id);
      const state = await getGameState(id);
      if (state) {
        console.log('[Game] Game state loaded. Phase:', state.phase, 'Current player index:', state.currentPlayerIndex);
        setGameState(state);
      } else {
        console.warn('[Game] No game state returned');
      }
    } catch (error) {
      console.error('[Game] Error loading game state:', error);
      Alert.alert('Error', 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const processAITurns = () => {
    if (!gameState) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.type === 'ai') {
      const delay = getAIActionDelay();

      aiTimerRef.current = setTimeout(() => {
        if (gameState.phase === 'betting') {
          handleAIBet(currentPlayer);
        } else if (gameState.phase === 'playing') {
          handleAIPlay(currentPlayer);
        }
      }, delay);
    }
  };

  const handleAIBet = (aiPlayer: Player) => {
    if (!gameState || !gameState.currentRound) return;

    const bet = calculateAIBet(aiPlayer.hand, gameState.currentRound.leadSuitCard.suit, isOneCardRound(gameState.currentRound.cardsPerPlayer));

    placeBet(bet);
  };

  const handleAIPlay = (aiPlayer: Player) => {
    if (!gameState || !gameState.currentRound) return;

    const turnSuit = gameState.currentRound.currentTrick.leadSuit;
    const selectedCard = selectAICard(aiPlayer.hand, turnSuit, gameState.currentRound.leadSuitCard.suit);

    playCard(selectedCard);
  };

  const placeBet = async (bet: number) => {
    if (!gameState || !gameState.currentRound) return;

    const newState = { ...gameState };
    const currentRound = newState.currentRound;
    if (!currentRound) return;

    const currentPlayer = newState.players[newState.currentPlayerIndex];

    currentPlayer.currentBet = bet;
    currentRound.bets[currentPlayer.id] = bet;

    newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;

    if (Object.keys(currentRound.bets).length === newState.players.length) {
      newState.phase = 'playing';
      const startingPlayerIndex = (currentRound.dealerIndex + 1) % newState.players.length;
      newState.currentPlayerIndex = startingPlayerIndex;
    }

    setBettingWheelMinimized(false);
    setGameState(newState);
    await updateGameState(id, newState);
  };

  const playCard = async (card: CardType) => {
    if (!gameState || !gameState.currentRound) return;

    const newState = { ...gameState };
    const currentRound = newState.currentRound;
    if (!currentRound) return;

    const currentPlayer = newState.players[newState.currentPlayerIndex];

    currentPlayer.hand = currentPlayer.hand.filter((c) => c.id !== card.id);

    currentRound.currentTrick.cards.push({
      playerId: currentPlayer.id,
      card,
    });

    if (currentRound.currentTrick.cards.length === 1) {
      currentRound.currentTrick.leadSuit = card.suit;
    }

    if (currentRound.currentTrick.cards.length === newState.players.length) {
      const winnerId = determineWinner(currentRound.currentTrick, currentRound.leadSuitCard.suit);

      currentRound.currentTrick.winnerId = winnerId;
      currentRound.completedTricks.push({ ...currentRound.currentTrick });

      currentRound.tricksWon[winnerId] = (currentRound.tricksWon[winnerId] || 0) + 1;

      newState.players.forEach((player) => {
        player.tricksWon = currentRound.tricksWon[player.id] || 0;
      });

      const winnerIndex = newState.players.findIndex((p) => p.id === winnerId);

      setGameState(newState);
      await updateGameState(id, newState);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (currentRound.completedTricks.length === currentRound.cardsPerPlayer) {
        endRound(newState);
        return;
      }

      currentRound.currentTrick = {
        cards: [],
        winnerId: null,
        leadSuit: null,
      };

      newState.currentPlayerIndex = winnerIndex;
      setGameState(newState);
      await updateGameState(id, newState);
    } else {
      newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
      setGameState(newState);
      await updateGameState(id, newState);
    }
  };

  const endRound = async (state: GameState) => {
    if (!state.currentRound) return;

    const scores = calculateRoundScores(state.players, state.currentRound.bets, state.currentRound.tricksWon);

    scores.forEach((scoreData) => {
      const player = state.players.find((p) => p.id === scoreData.playerId);
      if (player) {
        player.score += scoreData.pointsEarned;
        player.tricksWon = scoreData.tricksWon;
      }
    });

    setRoundScores(scores);
    state.phase = 'round-end';

    setGameState(state);
    await updateGameState(id, state);

    setShowScoreboard(true);
  };

  const handleNextRound = async () => {
    console.log('[Game] handleNextRound called. Phase:', gameState?.phase);
    if (!gameState) {
      console.warn('[Game] No game state available');
      return;
    }
    if (gameState.phase !== 'round-end') {
      console.warn('[Game] Cannot continue - phase is not round-end. Current phase:', gameState.phase);
      return;
    }

    console.log('[Game] Closing scoreboard and preparing next round');
    setShowScoreboard(false);

    const newState = { ...gameState };
    newState.currentSequenceIndex++;

    if (newState.currentSequenceIndex >= newState.roundSequence.length) {
      endGame(newState);
      return;
    }

    const cardsPerPlayer = newState.roundSequence[newState.currentSequenceIndex];
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck, newState.players.length, cardsPerPlayer);

    newState.players.forEach((player, index) => {
      player.hand = hands[index];
      player.currentBet = null;
      player.tricksWon = 0;
    });

    const leadSuitCard = drawLeadSuitCard(deck, newState.players.length * cardsPerPlayer);

    const prevDealerIndex = newState.currentRound?.dealerIndex ?? 0;
    const newDealerIndex = (prevDealerIndex + 1) % newState.players.length;
    const startingPlayerIndex = (newDealerIndex + 1) % newState.players.length;

    newState.currentRound = {
      roundNumber: newState.currentSequenceIndex + 1,
      cardsPerPlayer,
      leadSuitCard,
      currentTrick: {
        cards: [],
        winnerId: null,
        leadSuit: null,
      },
      completedTricks: [],
      bets: {},
      tricksWon: {},
      dealerIndex: newDealerIndex,
    };

    newState.phase = 'betting';
    newState.currentPlayerIndex = startingPlayerIndex;

    setGameState(newState);
    await updateGameState(id, newState);
  };

  const endGame = async (state: GameState) => {
    const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    state.phase = 'game-end';
    setGameState(state);
    await updateGameState(id, state);

    const duration = Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000);

    await saveGameHistory(
      state.lobbyId,
      state.players.map((p) => ({ id: p.id, name: p.name, score: p.score })),
      winner.id,
      winner.name,
      duration
    );

    await updateLobbyStatus(state.lobbyId, 'finished');
  };

  const handleCardPress = (card: CardType) => {
    if (!gameState || !gameState.currentRound) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return;

    if (gameState.phase !== 'playing') return;

    const turnSuit = gameState.currentRound.currentTrick.leadSuit;
    if (!canPlayCard(card, currentPlayer.hand, turnSuit)) {
      Alert.alert('Invalid Move', 'You must follow the turn suit if you have it');
      return;
    }

    playCard(card);
  };

  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const isShortScreen = height < 700;
  const currentPlayer = gameState?.players.find((p) => p.id === playerId);
  const isOneCard = gameState?.currentRound ? isOneCardRound(gameState.currentRound.cardsPerPlayer) : false;

  const currentPlayerIndex = gameState?.players.findIndex((p) => p.id === playerId) ?? -1;
  const isMyTurn = gameState?.currentPlayerIndex === currentPlayerIndex;
  const shouldShowBettingModal = gameState?.phase === 'betting' && currentPlayer && currentPlayer.currentBet === null && isMyTurn;

  if (gameState) {
    console.log('[Game] Render state:', {
      playerId,
      currentPlayerIndex,
      gameStatePlayerIndex: gameState.currentPlayerIndex,
      isMyTurn,
      phase: gameState.phase,
      currentBet: currentPlayer?.currentBet,
      shouldShowBettingModal,
      players: gameState.players.map(p => ({ id: p.id, name: p.name, currentBet: p.currentBet })),
    });
  }

  if (loading || !gameState) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (gameState.phase === 'game-end') {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameEndContainer}>
          <Text style={styles.gameEndTitle}>Game Over!</Text>

          <View style={styles.podium}>
            <Text style={styles.winnerLabel}>Winner</Text>
            <Text style={styles.winnerName}>{sortedPlayers[0].name}</Text>
            <Text style={styles.winnerScore}>{sortedPlayers[0].score} points</Text>
          </View>

          <View style={styles.finalScores}>
            {sortedPlayers.map((player, index) => (
              <View key={player.id} style={styles.finalScoreRow}>
                <Text style={styles.finalScoreRank}>#{index + 1}</Text>
                <Text style={styles.finalScoreName}>{player.name}</Text>
                <Text style={styles.finalScorePoints}>{player.score}</Text>
              </View>
            ))}
          </View>

          <Button title="Back to Home" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoWatermark}>
        <LogoSvg width={400} height={200} opacity={0.12} />
      </View>
      <ScrollView contentContainerStyle={[styles.gameContent, isShortScreen && styles.gameContentCompact]}>
        <View style={[styles.topSection, isSmallScreen && styles.topSectionMobile]}>
          <View style={styles.roundInfoContainer}>
            <Text style={[styles.roundText, isSmallScreen && styles.roundTextMobile]}>
              Round {gameState.currentSequenceIndex + 1} / {gameState.roundSequence.length}
            </Text>
            {isOneCard && <Text style={[styles.specialRoundText, isSmallScreen && styles.specialRoundTextMobile]}>Special: You can't see your card!</Text>}
          </View>
          {gameState.currentRound && (
            <View style={styles.leadSuitContainer}>
              <LeadSuitIndicator leadSuitCard={gameState.currentRound.leadSuitCard} />
            </View>
          )}
        </View>

        <View style={[styles.playersContainer, isSmallScreen && styles.playersContainerMobile]}>
          {gameState.players.map((player, index) => (
            <PlayerSlot
              key={player.id}
              player={player}
              isCurrentTurn={index === gameState.currentPlayerIndex}
              showBet={true}
              showTricks={gameState.phase === 'playing'}
              position="top"
              showCard={isOneCard && gameState.phase === 'betting'}
              isCurrentPlayer={player.id === playerId}
            />
          ))}
        </View>

        {gameState.phase === 'playing' && gameState.currentRound && gameState.currentRound.currentTrick.cards.length > 0 && (
          <View style={styles.trickArea}>
            <Text style={styles.trickLabel}>Current Trick</Text>
            <View style={styles.trickCards}>
              {gameState.currentRound.currentTrick.cards.map((cardPlay) => (
                <View key={cardPlay.playerId} style={styles.trickCard}>
                  <Card card={cardPlay.card} size="small" />
                  <Text style={styles.trickPlayerName}>{gameState.players.find((p) => p.id === cardPlay.playerId)?.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {currentPlayer && (
          <View style={[styles.handContainer, currentPlayer.hand.length === 1 && styles.handContainerSingle]}>
            {currentPlayer.hand.length > 1 && <Text style={styles.handLabel}>Your Hand</Text>}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.hand,
                currentPlayer.hand.length === 1 && styles.handSingle
              ]}
              snapToInterval={isSmallScreen ? 90 : 100}
              decelerationRate="fast"
            >
              {currentPlayer.hand.map((card) => {
                const shouldHide = isOneCard && gameState.phase === 'betting';
                const isSingleCard = currentPlayer.hand.length === 1;
                return (
                  <View
                    key={card.id}
                    style={[
                      styles.cardWrapper,
                      isSingleCard && styles.cardWrapperSingle
                    ]}
                  >
                    <Card
                      card={card}
                      faceUp={!shouldHide}
                      onPress={() => handleCardPress(card)}
                      disabled={gameState.phase !== 'playing' || gameState.currentPlayerIndex !== gameState.players.findIndex((p) => p.id === playerId)}
                      size={isSingleCard ? 'large' : 'medium'}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <Modal visible={shouldShowBettingModal} transparent animationType="fade">
        <View style={[styles.modalOverlay, bettingWheelMinimized && styles.modalOverlayTransparent]}>
          {gameState.currentRound && !bettingWheelMinimized && (
            <BettingWheel
              maxBet={gameState.currentRound.cardsPerPlayer}
              onBetConfirmed={placeBet}
              invalidBets={calculateInvalidBets(gameState.currentRound.bets, gameState.currentRound.cardsPerPlayer, gameState.players.length)}
              onMinimize={() => setBettingWheelMinimized(true)}
            />
          )}
          {bettingWheelMinimized && (
            <View style={styles.minimizedButton}>
              <Button title="Place Your Bet" onPress={() => setBettingWheelMinimized(false)} variant="primary" />
            </View>
          )}
        </View>
      </Modal>

      <Modal visible={showScoreboard} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.scoreboardModal}>
            <Text style={styles.scoreboardTitle}>Round Complete!</Text>

            {roundScores.map((score) => (
              <View key={score.playerId} style={styles.scoreRow}>
                <Text style={styles.scorePlayerName}>{score.playerName}</Text>
                <Text style={styles.scoreBet}>Bet: {score.bet}</Text>
                <Text style={styles.scoreTricks}>Won: {score.tricksWon}</Text>
                <Text style={[styles.scorePoints, score.pointsEarned >= 0 ? styles.scorePositive : styles.scoreNegative]}>{score.pointsEarned > 0 ? '+' : ''}{score.pointsEarned}</Text>
              </View>
            ))}

            <Button
              title="Continue"
              onPress={() => {
                console.log('[Game] Continue button pressed');
                handleNextRound();
              }}
              style={styles.continueButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function calculateInvalidBets(currentBets: { [key: string]: number }, totalTricks: number, totalPlayers: number): number[] {
  const betSum = Object.values(currentBets).reduce((sum, bet) => sum + bet, 0);
  const remainingPlayers = totalPlayers - Object.keys(currentBets).length;

  if (remainingPlayers === 1) {
    const invalidBet = totalTricks - betSum;
    if (invalidBet >= 0 && invalidBet <= totalTricks) {
      return [invalidBet];
    }
  }

  return [];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  logoWatermark: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 400,
    height: 200,
    transform: [{ translateX: -200 }, { translateY: -100 }],
    zIndex: 0,
    pointerEvents: 'none',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
  },
  gameContent: {
    flexGrow: 1,
    padding: SPACING.xs,
    paddingBottom: SPACING.lg,
  },
  gameContentCompact: {
    padding: 4,
    paddingBottom: SPACING.md,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
    gap: SPACING.xs,
  },
  topSectionMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  leadSuitContainer: {
    flexShrink: 0,
  },
  roundInfoContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(4, 43, 18, 0.9)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.gold,
    ...SHADOWS.medium,
    flex: 1,
    maxWidth: 500,
  },
  roundText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  roundTextMobile: {
    fontSize: 24,
  },
  specialRoundText: {
    fontSize: 16,
    color: COLORS.goldLight,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  specialRoundTextMobile: {
    fontSize: 14,
  },
  playersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    maxWidth: 900,
    alignSelf: 'center',
  },
  playersContainerMobile: {
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    rowGap: SPACING.xs,
  },
  trickArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  trickLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  trickCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  trickCard: {
    alignItems: 'center',
  },
  trickPlayerName: {
    fontSize: FONT_SIZES.xs - 1,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  handContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.md,
    minHeight: 140,
  },
  handContainerSingle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  handLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  hand: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  handSingle: {
    justifyContent: 'center',
  },
  cardWrapper: {
    minWidth: 44,
    minHeight: 44,
  },
  cardWrapperSingle: {
    shadowColor: '#E2B23A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalOverlayTransparent: {
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  minimizedButton: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  scoreboardModal: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  scoreboardTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  scorePlayerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 2,
  },
  scoreBet: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  scoreTricks: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  scorePoints: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  scorePositive: {
    color: COLORS.success,
  },
  scoreNegative: {
    color: COLORS.error,
  },
  continueButton: {
    marginTop: SPACING.lg,
  },
  gameEndContainer: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  gameEndTitle: {
    fontSize: FONT_SIZES.xxxl + 10,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  podium: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  winnerLabel: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  winnerName: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  winnerScore: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
  finalScores: {
    marginBottom: SPACING.xl,
  },
  finalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  finalScoreRank: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.accent,
    width: 40,
  },
  finalScoreName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  finalScorePoints: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
});
