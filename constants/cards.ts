import { Suit, CardValue } from '../types/game';

export const SUITS: Suit[] = ['coins', 'cups', 'swords', 'clubs'];

export const CARD_VALUES: CardValue[] = [
  'ace',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  'jack',
  'knight',
  'king',
];

export const CARD_RANK: { [key in CardValue]: number } = {
  ace: 14,
  king: 13,
  knight: 12,
  jack: 11,
  '7': 10,
  '6': 9,
  '5': 8,
  '4': 7,
  '3': 6,
  '2': 5,
};

export const SUIT_NAMES: { [key in Suit]: string } = {
  coins: 'Coins',
  cups: 'Cups',
  swords: 'Swords',
  clubs: 'Clubs',
};

export const MAX_CARDS_PER_PLAYER: { [players: number]: number } = {
  2: 8,
  3: 8,
  4: 6,
  5: 6,
  6: 6,
};
