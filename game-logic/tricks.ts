import { Card, Suit, Trick } from '../types/game';
import { CARD_RANK } from '../constants/cards';

export function canPlayCard(card: Card, hand: Card[], turnSuit: Suit | null): boolean {
  if (!turnSuit) {
    return true;
  }

  const hasCardOfTurnSuit = hand.some((c) => c.suit === turnSuit);

  if (hasCardOfTurnSuit) {
    return card.suit === turnSuit;
  }

  return true;
}

export function determineWinner(trick: Trick, leadSuit: Suit): string {
  if (trick.cards.length === 0) {
    throw new Error('Cannot determine winner of empty trick');
  }

  const turnSuit = trick.leadSuit;
  if (!turnSuit) {
    throw new Error('Trick has no lead suit');
  }

  const leadSuitCards = trick.cards.filter((c) => c.card.suit === leadSuit);

  if (leadSuitCards.length > 0) {
    let highestCard = leadSuitCards[0];
    let highestRank = CARD_RANK[highestCard.card.value];

    for (const cardPlay of leadSuitCards) {
      const rank = CARD_RANK[cardPlay.card.value];
      if (rank > highestRank) {
        highestRank = rank;
        highestCard = cardPlay;
      }
    }

    return highestCard.playerId;
  }

  const turnSuitCards = trick.cards.filter((c) => c.card.suit === turnSuit);

  let highestCard = turnSuitCards[0];
  let highestRank = CARD_RANK[highestCard.card.value];

  for (const cardPlay of turnSuitCards) {
    const rank = CARD_RANK[cardPlay.card.value];
    if (rank > highestRank) {
      highestRank = rank;
      highestCard = cardPlay;
    }
  }

  return highestCard.playerId;
}

export function getValidCards(hand: Card[], turnSuit: Suit | null): Card[] {
  if (!turnSuit) {
    return hand;
  }

  const cardsOfTurnSuit = hand.filter((c) => c.suit === turnSuit);

  if (cardsOfTurnSuit.length > 0) {
    return cardsOfTurnSuit;
  }

  return hand;
}
