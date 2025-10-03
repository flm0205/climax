import { Card, Player, Suit } from '../types/game';
import { CARD_RANK } from '../constants/cards';
import { getValidCards } from './tricks';

const AI_NAMES = [
  'Marco',
  'Giuseppe',
  'Antonio',
  'Francesco',
  'Luigi',
  'Giovanni',
  'Alessandro',
  'Paolo',
  'Matteo',
  'Roberto',
];

export function getAIName(index: number): string {
  return AI_NAMES[index % AI_NAMES.length];
}

export function calculateAIBet(hand: Card[], leadSuit: Suit, isOneCardRound: boolean): number {
  if (isOneCardRound) {
    return Math.random() < 0.5 ? 0 : 1;
  }

  let highCardCount = 0;
  let leadSuitHighCards = 0;

  for (const card of hand) {
    const rank = CARD_RANK[card.value];

    if (rank >= 11) {
      highCardCount++;

      if (card.suit === leadSuit) {
        leadSuitHighCards++;
      }
    }
  }

  const baseBet = Math.floor(highCardCount / 2);
  const leadSuitBonus = leadSuitHighCards > 0 ? 1 : 0;

  const randomVariation = Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0;

  let bet = baseBet + leadSuitBonus + randomVariation;

  bet = Math.max(0, Math.min(bet, hand.length));

  return bet;
}

export function selectAICard(hand: Card[], turnSuit: Suit | null, leadSuit: Suit): Card {
  const validCards = getValidCards(hand, turnSuit);

  if (validCards.length === 0) {
    return hand[0];
  }

  const leadSuitCards = validCards.filter((c) => c.suit === leadSuit);

  if (leadSuitCards.length > 0) {
    leadSuitCards.sort((a, b) => CARD_RANK[b.value] - CARD_RANK[a.value]);
    return leadSuitCards[0];
  }

  if (turnSuit) {
    const turnSuitCards = validCards.filter((c) => c.suit === turnSuit);
    if (turnSuitCards.length > 0) {
      turnSuitCards.sort((a, b) => CARD_RANK[b.value] - CARD_RANK[a.value]);

      if (Math.random() < 0.7) {
        return turnSuitCards[0];
      } else {
        return turnSuitCards[turnSuitCards.length - 1];
      }
    }
  }

  validCards.sort((a, b) => CARD_RANK[a.value] - CARD_RANK[b.value]);
  return validCards[0];
}

export function getAIActionDelay(): number {
  return 1000 + Math.random() * 2000;
}
