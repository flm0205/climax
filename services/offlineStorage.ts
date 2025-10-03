import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '../types/game';

const KEYS = {
  OFFLINE_GAME: 'offline_game_state',
  OFFLINE_HISTORY: 'offline_game_history',
  PLAYER_PROFILE: 'player_profile',
  PENDING_SYNC: 'pending_sync_data',
};

export interface OfflineGameHistory {
  id: string;
  players: { id: string; name: string; score: number }[];
  winnerId: string;
  winnerName: string;
  durationSeconds: number;
  playedAt: Date;
  synced: boolean;
}

export interface PlayerProfile {
  name: string;
  gamesPlayed: number;
  gamesWon: number;
  lastPlayed?: Date;
}

export async function saveOfflineGameState(gameState: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.OFFLINE_GAME, JSON.stringify(gameState));
  } catch (error) {
    console.error('Error saving offline game state:', error);
    throw error;
  }
}

export async function getOfflineGameState(): Promise<GameState | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.OFFLINE_GAME);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading offline game state:', error);
    return null;
  }
}

export async function clearOfflineGameState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.OFFLINE_GAME);
  } catch (error) {
    console.error('Error clearing offline game state:', error);
  }
}

export async function saveOfflineGameHistory(history: OfflineGameHistory): Promise<void> {
  try {
    const existing = await getOfflineGameHistory();
    const updated = [history, ...existing];
    await AsyncStorage.setItem(KEYS.OFFLINE_HISTORY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving offline game history:', error);
    throw error;
  }
}

export async function getOfflineGameHistory(): Promise<OfflineGameHistory[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.OFFLINE_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading offline game history:', error);
    return [];
  }
}

export async function markHistoryAsSynced(historyId: string): Promise<void> {
  try {
    const history = await getOfflineGameHistory();
    const updated = history.map((item) => (item.id === historyId ? { ...item, synced: true } : item));
    await AsyncStorage.setItem(KEYS.OFFLINE_HISTORY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking history as synced:', error);
  }
}

export async function getUnsyncedHistory(): Promise<OfflineGameHistory[]> {
  const history = await getOfflineGameHistory();
  return history.filter((item) => !item.synced);
}

export async function savePlayerProfile(profile: PlayerProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PLAYER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving player profile:', error);
    throw error;
  }
}

export async function getPlayerProfile(): Promise<PlayerProfile | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PLAYER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading player profile:', error);
    return null;
  }
}

export async function updatePlayerStats(won: boolean): Promise<void> {
  try {
    const profile = (await getPlayerProfile()) || {
      name: 'Player',
      gamesPlayed: 0,
      gamesWon: 0,
    };

    profile.gamesPlayed += 1;
    if (won) {
      profile.gamesWon += 1;
    }
    profile.lastPlayed = new Date();

    await savePlayerProfile(profile);
  } catch (error) {
    console.error('Error updating player stats:', error);
  }
}
