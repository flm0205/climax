import { GameState, Player } from '../types/game';
import { createDeck, shuffleDeck, dealCards, drawLeadSuitCard } from '../game-logic/deck';
import { generateRoundSequence } from '../game-logic/rounds';
import { getAIName } from '../game-logic/ai';
import {
  saveOfflineGameState,
  getOfflineGameState,
  clearOfflineGameState,
  saveOfflineGameHistory,
  updatePlayerStats,
  OfflineGameHistory,
} from './offlineStorage';

export async function createOfflineGame(
  playerName: string,
  numPlayers: number = 4
): Promise<GameState> {
  const playerId = 'player-human';
  const players: Player[] = [
    {
      id: playerId,
      name: playerName,
      type: 'human',
      score: 0,
      currentBet: null,
      tricksWon: 0,
      hand: [],
      isConnected: true,
    },
  ];

  for (let i = 1; i < numPlayers; i++) {
    players.push({
      id: `ai-${i}`,
      name: getAIName(i - 1),
      type: 'ai',
      score: 0,
      currentBet: null,
      tricksWon: 0,
      hand: [],
      isConnected: true,
    });
  }

  const deck = shuffleDeck(createDeck());
  const roundSequence = generateRoundSequence(players.length);
  const cardsPerPlayer = roundSequence[0];
  const hands = dealCards(deck, players.length, cardsPerPlayer);

  players.forEach((player, index) => {
    player.hand = hands[index];
  });

  const leadSuitCard = drawLeadSuitCard(deck, players.length * cardsPerPlayer);

  const dealerIndex = Math.floor(Math.random() * players.length);
  const startingPlayerIndex = (dealerIndex + 1) % players.length;

  const gameState: GameState = {
    id: `offline-${Date.now()}`,
    lobbyId: 'offline',
    players,
    currentRound: {
      roundNumber: 1,
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
      dealerIndex,
    },
    currentPlayerIndex: startingPlayerIndex,
    phase: 'betting',
    roundSequence,
    currentSequenceIndex: 0,
    deck,
    startedAt: new Date(),
  };

  await saveOfflineGameState(gameState);
  return gameState;
}

export async function loadOfflineGame(): Promise<GameState | null> {
  return await getOfflineGameState();
}

export async function updateOfflineGame(gameState: GameState): Promise<void> {
  await saveOfflineGameState(gameState);
}

export async function endOfflineGame(gameState: GameState): Promise<void> {
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const duration = Math.floor((Date.now() - new Date(gameState.startedAt).getTime()) / 1000);

  const history: OfflineGameHistory = {
    id: `offline-history-${Date.now()}`,
    players: gameState.players.map((p) => ({ id: p.id, name: p.name, score: p.score })),
    winnerId: winner.id,
    winnerName: winner.name,
    durationSeconds: duration,
    playedAt: new Date(),
    synced: false,
  };

  await saveOfflineGameHistory(history);

  const humanPlayer = gameState.players.find((p) => p.type === 'human');
  if (humanPlayer) {
    await updatePlayerStats(winner.id === humanPlayer.id);
  }

  await clearOfflineGameState();
}

export async function hasActiveOfflineGame(): Promise<boolean> {
  const game = await getOfflineGameState();
  return game !== null && game.phase !== 'game-end';
}
