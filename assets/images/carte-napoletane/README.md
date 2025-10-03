# Carte Napoletane - Card Images

This directory should contain the 40 card images for the Neapolitan deck.

## Required Files

The following JPG files are required for the card images to display:

### Denari (Coins) - Files 01-10
- `01_Asso_di_denari.jpg` - Ace of Coins
- `02_Due_di_denari.jpg` - Two of Coins
- `03_Tre_di_denari.jpg` - Three of Coins
- `04_Quattro_di_denari.jpg` - Four of Coins
- `05_Cinque_di_denari.jpg` - Five of Coins
- `06_Sei_di_denari.jpg` - Six of Coins
- `07_Sette_di_denari.jpg` - Seven of Coins
- `08_Otto_di_denari.jpg` - Jack of Coins
- `09_Nove_di_denari.jpg` - Knight of Coins
- `10_Dieci_di_denari.jpg` - King of Coins

### Coppe (Cups) - Files 11-20
- `11_Asso_di_coppe.jpg` - Ace of Cups
- `12_Due_di_coppe.jpg` - Two of Cups
- `13_Tre_di_coppe.jpg` - Three of Cups
- `14_Quattro_di_coppe.jpg` - Four of Cups
- `15_Cinque_di_coppe.jpg` - Five of Cups
- `16_Sei_di_coppe.jpg` - Six of Cups
- `17_Sette_di_coppe.jpg` - Seven of Cups
- `18_Otto_di_coppe.jpg` - Jack of Cups
- `19_Nove_di_coppe.jpg` - Knight of Cups
- `20_Dieci_di_coppe.jpg` - King of Cups

### Spade (Swords) - Files 21-30
- `21_Asso_di_spade.jpg` - Ace of Swords
- `22_Due_di_spade.jpg` - Two of Swords
- `23_Tre_di_spade.jpg` - Three of Swords
- `24_Quattro_di_spade.jpg` - Four of Swords
- `25_Cinque_di_spade.jpg` - Five of Swords
- `26_Sei_di_spade.jpg` - Six of Swords
- `27_Sette_di_spade.jpg` - Seven of Swords
- `28_Otto_di_spade.jpg` - Jack of Swords
- `29_Nove_di_spade.jpg` - Knight of Swords
- `30_Dieci_di_spade.jpg` - King of Swords

### Bastoni (Clubs) - Files 31-40
- `31_Asso_di_bastoni.jpg` - Ace of Clubs
- `32_Due_di_bastoni.jpg` - Two of Clubs
- `33_Tre_di_bastoni.jpg` - Three of Clubs
- `34_Quattro_di_bastoni.jpg` - Four of Clubs
- `35_Cinque_di_bastoni.jpg` - Five of Clubs
- `36_Sei_di_bastoni.jpg` - Six of Clubs
- `37_Sette_di_bastoni.jpg` - Seven of Clubs
- `38_Otto_di_bastoni.jpg` - Jack of Clubs
- `39_Nove_di_bastoni.jpg` - Knight of Clubs
- `40_Dieci_di_Bastoni.jpg` - King of Clubs (note: capital B in Bastoni)

## Naming Convention

The files follow this pattern:
```
[# of card within its suit]_[Literal naming of card based on its number in Italian]_di_[Literal naming of the suit in Italian].jpg
```

## Important Notes

1. **File Format**: All images should be JPG format
2. **File Names**: Must match exactly as listed above (case-sensitive)
3. **Italian Mapping**: The game uses English card names internally but maps them to Italian filenames:
   - English suits: coins, cups, swords, clubs
   - Italian suits: denari, coppe, spade, bastoni
   - Face cards: jack (Otto), knight (Nove), king (Dieci)

## How It Works

The card image infrastructure is already set up in the codebase:

- **`utils/cardImages.ts`**: Maps game card objects to Italian filenames
- **`components/Card.tsx`**: Displays card images when available, falls back to gradient design if not

Once you place the actual card images in this directory following the naming convention above, they will automatically be displayed in the game.

## Fallback Behavior

If card images are not found or fail to load, the Card component will automatically fall back to displaying a styled gradient card with the card value and suit symbols.
