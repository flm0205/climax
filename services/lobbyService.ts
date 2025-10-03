import { supabase } from './supabase';
import { Lobby } from '../types/game';
import { generateLobbyCode } from '../utils/lobby';

export async function createLobby(hostId: string, hostName: string, maxPlayers: number = 6) {
  console.log('[LobbyService] Creating lobby:', { hostId, hostName, maxPlayers });

  const code = generateLobbyCode();
  console.log('[LobbyService] Generated lobby code:', code);

  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .insert({
      code,
      host_id: hostId,
      max_players: maxPlayers,
      status: 'waiting',
    })
    .select()
    .maybeSingle();

  if (lobbyError) {
    console.error('[LobbyService] Error creating lobby:', lobbyError);
    throw new Error(lobbyError.message);
  }

  if (!lobby) {
    console.error('[LobbyService] Lobby created but no data returned');
    throw new Error('Failed to create lobby');
  }

  console.log('[LobbyService] Lobby created:', lobby);

  console.log('[LobbyService] Adding host as first player...');
  const { error: playerError } = await supabase.from('lobby_players').insert({
    lobby_id: lobby.id,
    player_id: hostId,
    player_name: hostName,
    join_order: 1,
    is_connected: true,
  });

  if (playerError) {
    console.error('[LobbyService] Error adding host as player:', playerError);
    throw new Error(playerError.message);
  }

  console.log('[LobbyService] Host added as player successfully');

  return lobby;
}

export async function joinLobby(code: string, playerId: string, playerName: string) {
  console.log('[LobbyService] Joining lobby:', { code, playerId, playerName });

  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .select('*')
    .eq('code', code)
    .eq('status', 'waiting')
    .maybeSingle();

  if (lobbyError) {
    console.error('[LobbyService] Error fetching lobby:', lobbyError);
    throw new Error(lobbyError.message);
  }

  if (!lobby) {
    console.error('[LobbyService] Lobby not found or already started for code:', code);
    throw new Error('Lobby not found or already started');
  }

  console.log('[LobbyService] Lobby found:', lobby);

  console.log('[LobbyService] Fetching existing players...');
  const { data: existingPlayers, error: playersError } = await supabase
    .from('lobby_players')
    .select('*')
    .eq('lobby_id', lobby.id);

  if (playersError) {
    console.error('[LobbyService] Error fetching existing players:', playersError);
    throw new Error(playersError.message);
  }

  console.log('[LobbyService] Existing players:', existingPlayers);

  if (existingPlayers && existingPlayers.length >= lobby.max_players) {
    console.error('[LobbyService] Lobby is full');
    throw new Error('Lobby is full');
  }

  const existingPlayer = existingPlayers?.find((p) => p.player_id === playerId);
  if (existingPlayer) {
    console.log('[LobbyService] Player already in lobby, reconnecting...');
    const { error: updateError } = await supabase
      .from('lobby_players')
      .update({ is_connected: true })
      .eq('id', existingPlayer.id);

    if (updateError) {
      console.error('[LobbyService] Error reconnecting player:', updateError);
      throw new Error(updateError.message);
    }

    console.log('[LobbyService] Player reconnected successfully');
    return lobby;
  }

  const joinOrder = (existingPlayers?.length || 0) + 1;
  console.log('[LobbyService] Adding new player with join order:', joinOrder);

  const { data: insertedPlayer, error: insertError } = await supabase
    .from('lobby_players')
    .insert({
      lobby_id: lobby.id,
      player_id: playerId,
      player_name: playerName,
      join_order: joinOrder,
      is_connected: true,
    })
    .select()
    .maybeSingle();

  if (insertError) {
    console.error('[LobbyService] Error adding player:', insertError);
    throw new Error(insertError.message);
  }

  console.log('[LobbyService] Player added successfully:', insertedPlayer);

  return lobby;
}

export async function getLobbyPlayers(lobbyId: string) {
  console.log('[LobbyService] Fetching players for lobby:', lobbyId);

  const { data, error } = await supabase
    .from('lobby_players')
    .select('*')
    .eq('lobby_id', lobbyId)
    .order('join_order', { ascending: true });

  if (error) {
    console.error('[LobbyService] Error fetching players:', error);
    throw new Error(error.message);
  }

  console.log('[LobbyService] Players fetched:', data?.length || 0, 'players');
  return data || [];
}

export async function updateLobbyStatus(lobbyId: string, status: 'waiting' | 'playing' | 'finished') {
  console.log('[LobbyService] Updating lobby status:', { lobbyId, status });

  const { error } = await supabase.from('lobbies').update({ status }).eq('id', lobbyId);

  if (error) {
    console.error('[LobbyService] Error updating lobby status:', error);
    throw new Error(error.message);
  }

  console.log('[LobbyService] Lobby status updated successfully');
}

export function subscribeLobbyPlayers(lobbyId: string, callback: (payload: any) => void) {
  console.log('[LobbyService] Setting up subscription for lobby:', lobbyId);

  const channel = supabase
    .channel(`lobby-players:${lobbyId}`, {
      config: {
        broadcast: { self: true },
      },
    })
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'lobby_players',
        filter: `lobby_id=eq.${lobbyId}`,
      },
      (payload) => {
        console.log('[LobbyService] Player INSERT event:', payload);
        callback({ ...payload, eventType: 'INSERT' });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'lobby_players',
        filter: `lobby_id=eq.${lobbyId}`,
      },
      (payload) => {
        console.log('[LobbyService] Player UPDATE event:', payload);
        callback({ ...payload, eventType: 'UPDATE' });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'lobby_players',
        filter: `lobby_id=eq.${lobbyId}`,
      },
      (payload) => {
        console.log('[LobbyService] Player DELETE event:', payload);
        callback({ ...payload, eventType: 'DELETE' });
      }
    )
    .subscribe((status, err) => {
      if (err) {
        console.error('[LobbyService] Subscription error:', err);
      } else {
        console.log('[LobbyService] Subscription status:', status);
      }
    });

  return channel;
}

export function subscribeLobbyStatus(lobbyId: string, callback: (payload: any) => void) {
  console.log('[LobbyService] Setting up lobby status subscription for lobby:', lobbyId);

  const channel = supabase
    .channel(`lobby-status:${lobbyId}`, {
      config: {
        broadcast: { self: true },
      },
    })
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'lobbies',
        filter: `id=eq.${lobbyId}`,
      },
      (payload) => {
        console.log('[LobbyService] Lobby status UPDATE event:', payload);
        callback({ ...payload, eventType: 'UPDATE' });
      }
    )
    .subscribe((status, err) => {
      if (err) {
        console.error('[LobbyService] Lobby status subscription error:', err);
      } else {
        console.log('[LobbyService] Lobby status subscription status:', status);
      }
    });

  return channel;
}

export async function getLobbyById(lobbyId: string) {
  console.log('[LobbyService] Fetching lobby by ID:', lobbyId);

  const { data, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('id', lobbyId)
    .maybeSingle();

  if (error) {
    console.error('[LobbyService] Error fetching lobby:', error);
    throw new Error(error.message);
  }

  console.log('[LobbyService] Lobby fetched:', data);
  return data;
}
