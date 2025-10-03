import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import { GameState, Player, Card as CardType } from '../types/game';
import { loadOfflineGame, updateOfflineGame, endOfflineGame } from '../services/offlineGameService';
import Card from '../components/Card';
import PlayerSlot from '../components/PlayerSlot';
import LeadSuitIndicator from '../components/LeadSuitIndicator';
import BettingWheel from '../components/BettingWheel';
import Button from '../components/Button';
import { canPlayCard, determineWinner } from '../game-logic/tricks';
import { calculateAIBet, selectAICard, getAIActionDelay } from '../game-logic/ai';
import { calculateRoundScores } from '../game-logic/scoring';
import { createDeck, shuffleDeck, dealCards, drawLeadSuitCard } from '../game-logic/deck';
import { isOneCardRound } from '../game-logic/rounds';

export default function OfflineGameScreen() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [roundScores, setRoundScores] = useState<any[]>([]);
  const [bettingWheelMinimized, setBettingWheelMinimized] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playerId = 'player-human';

  useEffect(() => {
    loadGame();

    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameState && gameState.phase !== 'game-end') {
      processAITurns();
    }
  }, [gameState]);

  const loadGame = async () => {
    try {
      const state = await loadOfflineGame();
      if (state) {
        setGameState(state);
      } else {
        Alert.alert('Error', 'No active game found');
        router.replace('/');
      }
    } catch (error) {
      console.error('Error loading game:', error);
      Alert.alert('Error', 'Failed to load game');
      router.replace('/');
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

    const bet = calculateAIBet(
      aiPlayer.hand,
      gameState.currentRound.leadSuitCard.suit,
      isOneCardRound(gameState.currentRound.cardsPerPlayer)
    );

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
    await updateOfflineGame(newState);
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
      await updateOfflineGame(newState);

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
      await updateOfflineGame(newState);
    } else {
      newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
      setGameState(newState);
      await updateOfflineGame(newState);
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
    await updateOfflineGame(state);

    setShowScoreboard(true);
  };

  const handleNextRound = async () => {
    if (!gameState) return;
    if (gameState.phase !== 'round-end') return;

    setShowScoreboard(false);

    const newState = { ...gameState };
    newState.currentSequenceIndex++;

    if (newState.currentSequenceIndex >= newState.roundSequence.length) {
      finishGame(newState);
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
    await updateOfflineGame(newState);
  };

  const finishGame = async (state: GameState) => {
    state.phase = 'game-end';
    setGameState(state);
    await endOfflineGame(state);
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

  const currentPlayer = gameState?.players.find((p) => p.id === playerId);
  const isOneCard = gameState?.currentRound ? isOneCardRound(gameState.currentRound.cardsPerPlayer) : false;

  if (loading || !gameState) {
    return (
      <LinearGradient colors={COLORS.backgroundGradient as any} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading game...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (gameState.phase === 'game-end') {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

    return (
      <LinearGradient colors={COLORS.backgroundGradient as any} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
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
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.backgroundGradient as any} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {gameState.currentRound && <LeadSuitIndicator leadSuitCard={gameState.currentRound.leadSuitCard} />}

        <ScrollView contentContainerStyle={styles.gameContent}>
          <View style={styles.roundInfo}>
            <Text style={styles.roundText}>
              Round {gameState.currentSequenceIndex + 1} / {gameState.roundSequence.length}
            </Text>
            {isOneCard && <Text style={styles.specialRoundText}>Special: You can't see your card!</Text>}
          </View>

          <View style={styles.playersContainer}>
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
                    <Text style={styles.trickPlayerName}>
                      {gameState.players.find((p) => p.id === cardPlay.playerId)?.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {currentPlayer && (
            <View style={styles.handContainer}>
              <Text style={styles.handLabel}>Your Hand</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hand}>
                {currentPlayer.hand.map((card) => {
                  const shouldHide = isOneCard && gameState.phase === 'betting';
                  return (
                    <Card
                      key={card.id}
                      card={card}
                      faceUp={!shouldHide}
                      onPress={() => handleCardPress(card)}
                      disabled={
                        gameState.phase !== 'playing' ||
                        gameState.currentPlayerIndex !== gameState.players.findIndex((p) => p.id === playerId)
                      }
                      size="medium"
                    />
                  );
                })}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        <Modal
          visible={
            gameState.phase === 'betting' &&
            currentPlayer &&
            currentPlayer.currentBet === null &&
            gameState.currentPlayerIndex === gameState.players.findIndex((p) => p.id === playerId)
          }
          transparent
          animationType="fade"
        >
          <View style={[styles.modalOverlay, bettingWheelMinimized && styles.modalOverlayTransparent]}>
            {gameState.currentRound && !bettingWheelMinimized && (
              <BettingWheel
                maxBet={gameState.currentRound.cardsPerPlayer}
                onBetConfirmed={placeBet}
                invalidBets={calculateInvalidBets(
                  gameState.currentRound.bets,
                  gameState.currentRound.cardsPerPlayer,
                  gameState.players.length
                )}
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
            <LinearGradient colors={[COLORS.modal, COLORS.primaryDark] as any} style={styles.scoreboardModal}>
              <Text style={styles.scoreboardTitle}>Round Complete!</Text>

              {roundScores.map((score) => (
                <View key={score.playerId} style={styles.scoreRow}>
                  <Text style={styles.scorePlayerName}>{score.playerName}</Text>
                  <Text style={styles.scoreBet}>Bet: {score.bet}</Text>
                  <Text style={styles.scoreTricks}>Won: {score.tricksWon}</Text>
                  <Text style={[styles.scorePoints, score.pointsEarned >= 0 ? styles.scorePositive : styles.scoreNegative]}>
                    {score.pointsEarned > 0 ? '+' : ''}
                    {score.pointsEarned}
                  </Text>
                </View>
              ))}

              <Button title="Continue" onPress={handleNextRound} style={styles.continueButton} disabled={gameState.phase !== 'round-end'} />
            </LinearGradient>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
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
  },
  safeArea: {
    flex: 1,
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
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  roundInfo: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  roundText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  specialRoundText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  playersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  trickArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
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
    gap: SPACING.md,
  },
  trickCard: {
    alignItems: 'center',
  },
  trickPlayerName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  handContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.md,
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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
    borderRadius: 24,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: COLORS.gold,
    ...SHADOWS.large,
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
