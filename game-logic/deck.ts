import { Card, Suit, CardValue } from '../types/game';
import { SUITS, CARD_VALUES } from '../constants/cards';

export function createDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const value of CARD_VALUES) {
      deck.push({
        suit,
        value,
        id: `${suit}-${value}`,
      });
    }
  }

  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function dealCards(deck: Card[], numPlayers: number, cardsPerPlayer: number): Card[][] {
  const hands: Card[][] = Array.from({ length: numPlayers }, () => []);

  let cardIndex = 0;
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
      if (cardIndex < deck.length) {
        hands[playerIndex].push(deck[cardIndex]);
        cardIndex++;
      }
    }
  }

  return hands;
}

export function drawLeadSuitCard(deck: Card[], dealtCards: number): Card {
  const availableCards = deck.slice(dealtCards);
  const randomIndex = Math.floor(Math.random() * availableCards.length);
  return availableCards[randomIndex];
}
