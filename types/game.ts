export type Suit = 'coins' | 'cups' | 'swords' | 'clubs';

export type CardValue = 'ace' | '2' | '3' | '4' | '5' | '6' | '7' | 'jack' | 'knight' | 'king';

export interface Card {
  suit: Suit;
  value: CardValue;
  id: string;
}

export type PlayerType = 'human' | 'ai';

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  score: number;
  currentBet: number | null;
  tricksWon: number;
  hand: Card[];
  isConnected: boolean;
}

export interface Trick {
  cards: { playerId: string; card: Card }[];
  winnerId: string | null;
  leadSuit: Suit | null;
}

export type GamePhase = 'waiting' | 'betting' | 'playing' | 'round-end' | 'game-end';

export interface Round {
  roundNumber: number;
  cardsPerPlayer: number;
  leadSuitCard: Card;
  currentTrick: Trick;
  completedTricks: Trick[];
  bets: { [playerId: string]: number };
  tricksWon: { [playerId: string]: number };
  dealerIndex: number;
}

export interface GameState {
  id: string;
  lobbyId: string;
  players: Player[];
  currentRound: Round | null;
  currentPlayerIndex: number;
  phase: GamePhase;
  roundSequence: number[];
  currentSequenceIndex: number;
  deck: Card[];
  startedAt: Date;
}

export interface Lobby {
  id: string;
  code: string;
  hostId: string;
  playerIds: string[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
}

export interface GameHistory {
  id: string;
  players: { id: string; name: string; score: number }[];
  winnerId: string;
  duration: number;
  playedAt: Date;
}

export interface ScoreChange {
  playerId: string;
  playerName: string;
  bet: number;
  tricksWon: number;
  pointsEarned: number;
  totalScore: number;
}
