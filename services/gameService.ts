import { supabase } from './supabase';
import { GameState } from '../types/game';

export async function createGame(lobbyId: string, gameState: GameState) {
  const { data, error } = await supabase
    .from('games')
    .insert({
      lobby_id: lobbyId,
      game_state: gameState,
      current_phase: gameState.phase,
      current_round: gameState.currentSequenceIndex + 1,
    })
    .select()
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create game');
  }

  return data;
}

export async function updateGameState(gameId: string, gameState: GameState) {
  const { error } = await supabase
    .from('games')
    .update({
      game_state: gameState,
      current_phase: gameState.phase,
      current_round: gameState.currentSequenceIndex + 1,
    })
    .eq('id', gameId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getGameState(gameId: string): Promise<GameState | null> {
  const { data, error } = await supabase.from('games').select('game_state').eq('id', gameId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.game_state || null;
}

export async function getGameByLobby(lobbyId: string) {
  const { data, error } = await supabase.from('games').select('*').eq('lobby_id', lobbyId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function subscribeGameState(gameId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, callback)
    .subscribe();
}

export async function saveGameHistory(lobbyId: string, players: any[], winnerId: string, winnerName: string, durationSeconds: number) {
  const { error } = await supabase.from('game_history').insert({
    lobby_id: lobbyId,
    players,
    winner_id: winnerId,
    winner_name: winnerName,
    duration_seconds: durationSeconds,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getGameHistory(limit: number = 20) {
  const { data, error } = await supabase.from('game_history').select('*').order('played_at', { ascending: false }).limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
