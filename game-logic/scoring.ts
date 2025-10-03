import { Player } from '../types/game';

export function calculateScore(bet: number, tricksWon: number): number {
  if (bet === tricksWon) {
    return 10 + tricksWon * 5;
  } else {
    const difference = Math.abs(bet - tricksWon);
    return -(10 + difference * 5);
  }
}

export function validateBets(bets: number[], totalTricks: number): boolean {
  const totalBets = bets.reduce((sum, bet) => sum + bet, 0);
  return totalBets !== totalTricks;
}

export function calculateRoundScores(
  players: Player[],
  bets: { [playerId: string]: number },
  tricksWon: { [playerId: string]: number }
): { playerId: string; playerName: string; bet: number; tricksWon: number; pointsEarned: number }[] {
  return players.map((player) => {
    const bet = bets[player.id] || 0;
    const tricks = tricksWon[player.id] || 0;
    const pointsEarned = calculateScore(bet, tricks);

    return {
      playerId: player.id,
      playerName: player.name,
      bet,
      tricksWon: tricks,
      pointsEarned,
    };
  });
}
