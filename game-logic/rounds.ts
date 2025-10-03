import { MAX_CARDS_PER_PLAYER } from '../constants/cards';

export function generateRoundSequence(numPlayers: number): number[] {
  const maxCards = MAX_CARDS_PER_PLAYER[numPlayers];
  const sequence: number[] = [];

  for (let i = 1; i <= maxCards; i++) {
    sequence.push(i);
  }

  for (let i = maxCards - 1; i >= 1; i--) {
    sequence.push(i);
  }

  return sequence;
}

export function isOneCardRound(cardsInRound: number): boolean {
  return cardsInRound === 1;
}

export function calculateTotalRounds(numPlayers: number): number {
  const maxCards = MAX_CARDS_PER_PLAYER[numPlayers];
  return maxCards * 2 - 1;
}
