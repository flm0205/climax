import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, Share, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import Button from '../../components/Button';
import { getLobbyPlayers, subscribeLobbyPlayers, subscribeLobbyStatus, updateLobbyStatus, getLobbyById } from '../../services/lobbyService';
import { createGame, getGameByLobby } from '../../services/gameService';
import { generateLobbyLink } from '../../utils/lobby';
import { GameState, Player } from '../../types/game';
import { createDeck, shuffleDeck, dealCards, drawLeadSuitCard } from '../../game-logic/deck';
import { generateRoundSequence } from '../../game-logic/rounds';
import { getAIName } from '../../game-logic/ai';

export default function LobbyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { code, playerId, playerName, isHost } = params as { code: string; playerId: string; playerName: string; isHost: string };

  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [lobbyData, setLobbyData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const channelRef = useRef<any>(null);
  const statusChannelRef = useRef<any>(null);
  const broadcastChannelRef = useRef<any>(null);
  const pollIntervalRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const subscriptionHealthCheckRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initializeLobby = async () => {
      console.log('[Lobby] Initializing lobby:', code);
      console.log('[Lobby] Player info:', { playerId, playerName, isHost });

      try {
        setLoading(true);
        setError(null);
        setConnectionStatus('connecting');

        const { supabase } = await import('../../services/supabase');

        console.log('[Lobby] Fetching lobby data...');
        const { data: lobby, error: lobbyError } = await supabase
          .from('lobbies')
          .select('*')
          .eq('code', code)
          .maybeSingle();

        if (lobbyError) {
          console.error('[Lobby] Error fetching lobby:', lobbyError);
          throw new Error(lobbyError.message);
        }

        if (!lobby) {
          console.error('[Lobby] Lobby not found for code:', code);
          throw new Error('Lobby not found');
        }

        console.log('[Lobby] Lobby data loaded:', lobby);

        if (!mounted) return;
        setLobbyData(lobby);

        console.log('[Lobby] Fetching initial player list...');
        const initialPlayers = await getLobbyPlayers(lobby.id);
        console.log('[Lobby] Initial players loaded:', initialPlayers);

        if (!mounted) return;
        setPlayers(initialPlayers);
        setLastUpdate(new Date());
        setLoading(false);

        console.log('[Lobby] Setting up realtime subscription...');
        setupRealtimeSubscription(lobby.id);

        console.log('[Lobby] Setting up lobby status subscription...');
        setupLobbyStatusSubscription(lobby.id);

        console.log('[Lobby] Setting up broadcast channel...');
        setupBroadcastChannel(lobby.id);

        console.log('[Lobby] Setting up polling fallback...');
        setupPollingFallback(lobby.id);

        console.log('[Lobby] Setting up subscription health check...');
        setupSubscriptionHealthCheck(lobby.id);

      } catch (err: any) {
        console.error('[Lobby] Initialization error:', err);
        if (!mounted) return;
        setError(err.message || 'Failed to load lobby');
        setLoading(false);
        setConnectionStatus('disconnected');
        Alert.alert('Error', err.message || 'Failed to load lobby');
      }
    };

    initializeLobby();

    return () => {
      mounted = false;
      console.log('[Lobby] Cleaning up...');

      if (channelRef.current) {
        console.log('[Lobby] Unsubscribing from realtime channel');
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      if (statusChannelRef.current) {
        console.log('[Lobby] Unsubscribing from status channel');
        statusChannelRef.current.unsubscribe();
        statusChannelRef.current = null;
      }

      if (pollIntervalRef.current) {
        console.log('[Lobby] Clearing polling interval');
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      if (broadcastChannelRef.current) {
        console.log('[Lobby] Unsubscribing from broadcast channel');
        broadcastChannelRef.current.unsubscribe();
        broadcastChannelRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        console.log('[Lobby] Clearing reconnect timeout');
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (subscriptionHealthCheckRef.current) {
        console.log('[Lobby] Clearing subscription health check');
        clearInterval(subscriptionHealthCheckRef.current);
        subscriptionHealthCheckRef.current = null;
      }
    };
  }, [code]);

  const setupRealtimeSubscription = (lobbyId: string) => {
    try {
      console.log('[Lobby] Creating realtime subscription for lobby:', lobbyId);

      const channel = subscribeLobbyPlayers(lobbyId, (payload) => {
        console.log('[Lobby] Realtime event received:', payload.eventType, payload);
        setConnectionStatus('connected');
        loadPlayers(lobbyId);
      });

      channel
        .on('system', {}, (payload: any) => {
          console.log('[Lobby] System event:', payload);
          if (payload.status === 'SUBSCRIBED') {
            console.log('[Lobby] Successfully subscribed to realtime updates');
            setConnectionStatus('connected');
          } else if (payload.status === 'CHANNEL_ERROR') {
            console.error('[Lobby] Channel error:', payload);
            setConnectionStatus('disconnected');
          }
        });

      channelRef.current = channel;
      console.log('[Lobby] Realtime subscription setup complete');

    } catch (err) {
      console.error('[Lobby] Error setting up realtime subscription:', err);
      setConnectionStatus('disconnected');
    }
  };

  const setupLobbyStatusSubscription = (lobbyId: string) => {
    try {
      console.log('[Lobby] Creating lobby status subscription for lobby:', lobbyId);

      const channel = subscribeLobbyStatus(lobbyId, (payload) => {
        console.log('[Lobby] Lobby status event received:', payload.eventType, payload);
        handleLobbyStatusChange(lobbyId);
      });

      channel
        .on('system', {}, (payload: any) => {
          console.log('[Lobby] Status channel system event:', payload);
          if (payload.status === 'SUBSCRIBED') {
            console.log('[Lobby] Successfully subscribed to lobby status updates');
          } else if (payload.status === 'CHANNEL_ERROR') {
            console.error('[Lobby] Status channel error:', payload);
          }
        });

      statusChannelRef.current = channel;
      console.log('[Lobby] Lobby status subscription setup complete');

    } catch (err) {
      console.error('[Lobby] Error setting up lobby status subscription:', err);
    }
  };

  const handleLobbyStatusChange = async (lobbyId: string) => {
    try {
      console.log('[Lobby] Checking lobby status...');
      const lobby = await getLobbyById(lobbyId);

      if (lobby && lobby.status === 'playing') {
        console.log('[Lobby] Game has started! Navigating to game...');
        await navigateToGame(lobbyId);
      }
    } catch (error: any) {
      console.error('[Lobby] Error handling lobby status change:', error);
    }
  };

  const navigateToGame = async (lobbyId: string) => {
    try {
      setStarting(true);
      console.log('[Lobby] Fetching game for lobby:', lobbyId);

      let game = await getGameByLobby(lobbyId);

      if (!game) {
        console.log('[Lobby] Game not found, retrying in 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        game = await getGameByLobby(lobbyId);
      }

      if (game) {
        console.log('[Lobby] Game found, navigating:', game.id);
        router.replace(`/game/${game.id}?playerId=${playerId}`);
      } else {
        console.error('[Lobby] Game not found after retry');
        Alert.alert('Error', 'Could not find the game. Please try again.');
        setStarting(false);
      }
    } catch (error: any) {
      console.error('[Lobby] Error navigating to game:', error);
      Alert.alert('Error', error.message || 'Failed to join game');
      setStarting(false);
    }
  };

  const setupBroadcastChannel = (lobbyId: string) => {
    try {
      console.log('[Lobby] Creating broadcast channel for lobby:', lobbyId);

      const { supabase } = require('../../services/supabase');

      const channel = supabase
        .channel(`broadcast:${lobbyId}`, {
          config: {
            broadcast: { self: false },
          },
        })
        .on('broadcast', { event: 'game-start' }, (payload: any) => {
          console.log('[Lobby] Broadcast event received - game starting!', payload);
          if (payload.payload?.lobbyId === lobbyId) {
            console.log('[Lobby] Broadcast confirms game start, navigating...');
            navigateToGame(lobbyId);
          }
        })
        .subscribe((status: string) => {
          console.log('[Lobby] Broadcast channel status:', status);
        });

      broadcastChannelRef.current = channel;
      console.log('[Lobby] Broadcast channel setup complete');
    } catch (err) {
      console.error('[Lobby] Error setting up broadcast channel:', err);
    }
  };

  const setupPollingFallback = (lobbyId: string) => {
    console.log('[Lobby] Setting up aggressive polling fallback (every 1 second)');

    pollIntervalRef.current = setInterval(async () => {
      console.log('[Lobby] Polling for updates...');
      await loadPlayers(lobbyId);

      const lobby = await getLobbyById(lobbyId).catch(() => null);
      if (lobby && lobby.status === 'playing') {
        console.log('[Lobby] Polling detected game started');
        await navigateToGame(lobbyId);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    }, 1000);
  };

  const setupSubscriptionHealthCheck = (lobbyId: string) => {
    console.log('[Lobby] Setting up subscription health check (every 5 seconds)');

    subscriptionHealthCheckRef.current = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastUpdate = lastUpdate ? now - lastUpdate.getTime() : 0;

      if (timeSinceLastUpdate > 10000) {
        console.warn('[Lobby] Subscription may be stale, reconnecting...');
        setConnectionStatus('disconnected');
        reconnectSubscriptions(lobbyId);
      }
    }, 5000);
  };

  const reconnectSubscriptions = (lobbyId: string) => {
    console.log('[Lobby] Reconnecting subscriptions...');

    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    if (statusChannelRef.current) {
      statusChannelRef.current.unsubscribe();
      statusChannelRef.current = null;
    }

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.unsubscribe();
      broadcastChannelRef.current = null;
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('[Lobby] Attempting to reconnect...');
      setupRealtimeSubscription(lobbyId);
      setupLobbyStatusSubscription(lobbyId);
      setupBroadcastChannel(lobbyId);
    }, 1000);
  };

  const loadPlayers = async (lobbyId?: string) => {
    try {
      const id = lobbyId || lobbyData?.id;
      if (!id) {
        console.warn('[Lobby] No lobby ID available for loading players');
        return;
      }

      console.log('[Lobby] Loading players for lobby:', id);
      const lobbyPlayers = await getLobbyPlayers(id);
      console.log('[Lobby] Players loaded:', lobbyPlayers);

      setPlayers(lobbyPlayers);
      setLastUpdate(new Date());

      if (connectionStatus === 'connecting') {
        setConnectionStatus('connected');
      }
    } catch (error: any) {
      console.error('[Lobby] Error loading players:', error);
      setConnectionStatus('disconnected');
    }
  };

  const handleRefresh = async () => {
    console.log('[Lobby] Manual refresh requested');
    if (lobbyData?.id) {
      await loadPlayers(lobbyData.id);
    }
  };

  const handleShare = async () => {
    try {
      const link = generateLobbyLink(code);
      await Share.share({
        message: `Join my Climax game! Use code: ${code}\n\n${link}`,
      });
    } catch (error) {
      console.error('[Lobby] Error sharing:', error);
    }
  };

  const handleStartGame = async () => {
    if (players.length < 2) {
      Alert.alert('Error', 'You need at least 2 players to start');
      return;
    }

    setStarting(true);

    try {
      console.log('[Lobby] Starting game with players:', players);

      const gamePlayers: Player[] = players.map((p, index) => ({
        id: p.player_id,
        name: p.player_name,
        type: 'human',
        score: 0,
        currentBet: null,
        tricksWon: 0,
        hand: [],
        isConnected: true,
      }));

      while (gamePlayers.length < lobbyData.max_players) {
        const aiPlayer: Player = {
          id: `ai-${gamePlayers.length}`,
          name: getAIName(gamePlayers.length),
          type: 'ai',
          score: 0,
          currentBet: null,
          tricksWon: 0,
          hand: [],
          isConnected: true,
        };
        gamePlayers.push(aiPlayer);
      }

      const deck = shuffleDeck(createDeck());
      const roundSequence = generateRoundSequence(gamePlayers.length);
      const cardsPerPlayer = roundSequence[0];
      const hands = dealCards(deck, gamePlayers.length, cardsPerPlayer);

      gamePlayers.forEach((player, index) => {
        player.hand = hands[index];
      });

      const leadSuitCard = drawLeadSuitCard(deck, gamePlayers.length * cardsPerPlayer);

      const dealerIndex = Math.floor(Math.random() * gamePlayers.length);
      console.log('[Lobby] Game setup - Dealer index:', dealerIndex);
      const startingPlayerIndex = (dealerIndex + 1) % gamePlayers.length;
      console.log('[Lobby] Starting player index:', startingPlayerIndex);
      console.log('[Lobby] Players:', gamePlayers.map((p, i) => `[${i}] ${p.name} (${p.id})`).join(', '));

      const gameState: GameState = {
        id: '',
        lobbyId: lobbyData.id,
        players: gamePlayers,
        currentRound: {
          roundNumber: 1,
          cardsPerPlayer,
          leadSuitCard,
          currentTrick: {
            cards: [],
            winnerId: null,
            leadSuit: null,
          },
          completedTricks: [],
          bets: {},
          tricksWon: {},
          dealerIndex,
        },
        currentPlayerIndex: startingPlayerIndex,
        phase: 'betting',
        roundSequence,
        currentSequenceIndex: 0,
        deck,
        startedAt: new Date(),
      };

      console.log('[Lobby] Creating game...');
      const game = await createGame(lobbyData.id, gameState);
      console.log('[Lobby] Game created:', game.id);

      console.log('[Lobby] Updating lobby status to playing...');
      await updateLobbyStatus(lobbyData.id, 'playing');
      console.log('[Lobby] Lobby status updated to playing');

      console.log('[Lobby] Broadcasting game start message...');
      if (broadcastChannelRef.current) {
        await broadcastChannelRef.current.send({
          type: 'broadcast',
          event: 'game-start',
          payload: { lobbyId: lobbyData.id, gameId: game.id },
        });
        console.log('[Lobby] Broadcast message sent');
      }

      console.log('[Lobby] Waiting 500ms to ensure broadcast propagation...');
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('[Lobby] Navigating host to game...');
      router.replace(`/game/${game.id}?playerId=${playerId}`);
    } catch (error: any) {
      console.error('[Lobby] Error starting game:', error);
      Alert.alert('Error', error.message || 'Failed to start game');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading lobby...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return COLORS.success;
      case 'connecting':
        return COLORS.warning;
      case 'disconnected':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Lobby</Text>
        <Text style={styles.code}>{code}</Text>

        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {lastUpdate && (
            <Text style={styles.lastUpdateText}>
              Updated {Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s ago
            </Text>
          )}
        </View>

        <View style={styles.playersSection}>
          <View style={styles.playersSectionHeader}>
            <Text style={styles.sectionTitle}>
              Players ({players.length}/{lobbyData?.max_players || 6})
            </Text>
            <Button title="↻" onPress={handleRefresh} variant="outline" style={styles.refreshButton} />
          </View>

          {players.length === 0 && (
            <View style={styles.noPlayersContainer}>
              <Text style={styles.noPlayersText}>No players in lobby yet</Text>
              <Text style={styles.noPlayersSubtext}>Share the invite link to get started</Text>
            </View>
          )}

          {players.map((player, index) => (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.playerAvatar}>
                <Text style={styles.playerAvatarText}>{player.player_name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>
                  {player.player_name}
                  {player.player_id === playerId && ' (You)'}
                </Text>
                {player.player_id === lobbyData?.host_id && <Text style={styles.hostBadge}>Host</Text>}
              </View>
              <View style={[styles.connectionIndicator, { backgroundColor: player.is_connected ? COLORS.success : COLORS.error }]} />
            </View>
          ))}

          {players.length < (lobbyData?.max_players || 6) && players.length > 0 && (
            <View style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>Waiting for players...</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Button title="Share Invite Link" onPress={handleShare} variant="outline" style={styles.actionButton} />

          {isHost === 'true' && (
            <Button
              title={`Start Game (${players.length}/2+ players)`}
              onPress={handleStartGame}
              loading={starting}
              disabled={starting || players.length < 2}
              style={styles.actionButton}
            />
          )}

          <Button title="Leave Lobby" onPress={() => router.back()} variant="secondary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  code: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.accent,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: SPACING.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  lastUpdateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  playersSection: {
    marginBottom: SPACING.xl,
  },
  playersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  refreshButton: {
    minWidth: 50,
    paddingHorizontal: SPACING.md,
  },
  noPlayersContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  noPlayersText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  noPlayersSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  playerAvatarText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  hostBadge: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptySlot: {
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptySlotText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    marginTop: 'auto',
  },
  actionButton: {
    marginBottom: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});
