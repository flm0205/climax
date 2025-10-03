import { Card, CardValue, Suit } from '../types/game';

const ITALIAN_SUITS: Record<Suit, string> = {
  coins: 'denari',
  cups: 'coppe',
  swords: 'spade',
  clubs: 'bastoni',
};

const ITALIAN_VALUES: Record<CardValue, string> = {
  ace: 'Asso',
  '2': 'Due',
  '3': 'Tre',
  '4': 'Quattro',
  '5': 'Cinque',
  '6': 'Sei',
  '7': 'Sette',
  jack: 'Otto',
  knight: 'Nove',
  king: 'Dieci',
};

const loadCardImages = (): Record<string, any> => {
  try {
    return {
      'coins-ace': require('../assets/images/carte-napoletane/01_Asso_di_denari.jpg'),
      'coins-2': require('../assets/images/carte-napoletane/02_Due_di_denari.jpg'),
      'coins-3': require('../assets/images/carte-napoletane/03_Tre_di_denari.jpg'),
      'coins-4': require('../assets/images/carte-napoletane/04_Quattro_di_denari.jpg'),
      'coins-5': require('../assets/images/carte-napoletane/05_Cinque_di_denari.jpg'),
      'coins-6': require('../assets/images/carte-napoletane/06_Sei_di_denari.jpg'),
      'coins-7': require('../assets/images/carte-napoletane/07_Sette_di_denari.jpg'),
      'coins-jack': require('../assets/images/carte-napoletane/08_Otto_di_denari.jpg'),
      'coins-knight': require('../assets/images/carte-napoletane/09_Nove_di_denari.jpg'),
      'coins-king': require('../assets/images/carte-napoletane/10_Dieci_di_denari.jpg'),

      'cups-ace': require('../assets/images/carte-napoletane/11_Asso_di_coppe.jpg'),
      'cups-2': require('../assets/images/carte-napoletane/12_Due_di_coppe.jpg'),
      'cups-3': require('../assets/images/carte-napoletane/13_Tre_di_coppe.jpg'),
      'cups-4': require('../assets/images/carte-napoletane/14_Quattro_di_coppe.jpg'),
      'cups-5': require('../assets/images/carte-napoletane/15_Cinque_di_coppe.jpg'),
      'cups-6': require('../assets/images/carte-napoletane/16_Sei_di_coppe.jpg'),
      'cups-7': require('../assets/images/carte-napoletane/17_Sette_di_coppe.jpg'),
      'cups-jack': require('../assets/images/carte-napoletane/18_Otto_di_coppe.jpg'),
      'cups-knight': require('../assets/images/carte-napoletane/19_Nove_di_coppe.jpg'),
      'cups-king': require('../assets/images/carte-napoletane/20_Dieci_di_coppe.jpg'),

      'swords-ace': require('../assets/images/carte-napoletane/21_Asso_di_spade.jpg'),
      'swords-2': require('../assets/images/carte-napoletane/22_Due_di_spade.jpg'),
      'swords-3': require('../assets/images/carte-napoletane/23_Tre_di_spade.jpg'),
      'swords-4': require('../assets/images/carte-napoletane/24_Quattro_di_spade.jpg'),
      'swords-5': require('../assets/images/carte-napoletane/25_Cinque_di_spade.jpg'),
      'swords-6': require('../assets/images/carte-napoletane/26_Sei_di_spade.jpg'),
      'swords-7': require('../assets/images/carte-napoletane/27_Sette_di_spade.jpg'),
      'swords-jack': require('../assets/images/carte-napoletane/28_Otto_di_spade.jpg'),
      'swords-knight': require('../assets/images/carte-napoletane/29_Nove_di_spade.jpg'),
      'swords-king': require('../assets/images/carte-napoletane/30_Dieci_di_spade.jpg'),

      'clubs-ace': require('../assets/images/carte-napoletane/31_Asso_di_bastoni.jpg'),
      'clubs-2': require('../assets/images/carte-napoletane/32_Due_di_bastoni.jpg'),
      'clubs-3': require('../assets/images/carte-napoletane/33_Tre_di_bastoni.jpg'),
      'clubs-4': require('../assets/images/carte-napoletane/34_Quattro_di_bastoni.jpg'),
      'clubs-5': require('../assets/images/carte-napoletane/35_Cinque_di_bastoni.jpg'),
      'clubs-6': require('../assets/images/carte-napoletane/36_Sei_di_bastoni.jpg'),
      'clubs-7': require('../assets/images/carte-napoletane/37_Sette_di_bastoni.jpg'),
      'clubs-jack': require('../assets/images/carte-napoletane/38_Otto_di_bastoni.jpg'),
      'clubs-knight': require('../assets/images/carte-napoletane/39_Nove_di_bastoni.jpg'),
      'clubs-king': require('../assets/images/carte-napoletane/40_Dieci_di_Bastoni.jpg'),
    };
  } catch (error) {
    return {};
  }
};

const CARD_IMAGE_MAP = loadCardImages();

export function getCardImage(card: Card): any {
  const cardKey = `${card.suit}-${card.value}`;
  return CARD_IMAGE_MAP[cardKey] || null;
}

export function getCardImagePath(suit: Suit, value: CardValue): string {
  const italianSuit = ITALIAN_SUITS[suit];
  const italianValue = ITALIAN_VALUES[value];
  return `${italianValue}_di_${italianSuit}.jpg`;
}

export function hasCardImages(): boolean {
  return Object.keys(CARD_IMAGE_MAP).length > 0;
}
