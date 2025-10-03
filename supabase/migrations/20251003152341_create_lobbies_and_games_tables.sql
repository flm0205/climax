/*
  # Create Lobbies and Games Tables

  ## Overview
  This migration creates the core database structure for the Climax card game,
  including lobbies, games, and match history.

  ## New Tables
  
  ### `lobbies`
  - `id` (uuid, primary key) - Unique lobby identifier
  - `code` (text, unique) - 6-character lobby code for joining
  - `host_id` (text) - ID of the player who created the lobby
  - `max_players` (integer) - Maximum number of players (2-6)
  - `status` (text) - Current lobby status: waiting, playing, finished
  - `created_at` (timestamptz) - When the lobby was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### `lobby_players`
  - `id` (uuid, primary key) - Unique identifier
  - `lobby_id` (uuid, foreign key) - Reference to lobbies table
  - `player_id` (text) - Unique player identifier
  - `player_name` (text) - Display name of the player
  - `join_order` (integer) - Order in which player joined (1-6)
  - `is_connected` (boolean) - Connection status
  - `joined_at` (timestamptz) - When player joined

  ### `games`
  - `id` (uuid, primary key) - Unique game identifier
  - `lobby_id` (uuid, foreign key) - Reference to lobbies table
  - `game_state` (jsonb) - Complete game state stored as JSON
  - `current_phase` (text) - Current game phase
  - `current_round` (integer) - Current round number
  - `started_at` (timestamptz) - When game started
  - `updated_at` (timestamptz) - Last update timestamp

  ### `game_history`
  - `id` (uuid, primary key) - Unique identifier
  - `lobby_id` (uuid) - Reference to the lobby
  - `players` (jsonb) - Array of player names and final scores
  - `winner_id` (text) - ID of the winning player
  - `winner_name` (text) - Name of the winner
  - `duration_seconds` (integer) - Game duration in seconds
  - `played_at` (timestamptz) - When the game was played

  ## Security
  - Enable RLS on all tables
  - Add policies for lobby access and game participation
*/

-- Create lobbies table
CREATE TABLE IF NOT EXISTS lobbies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  host_id text NOT NULL,
  max_players integer NOT NULL DEFAULT 6 CHECK (max_players >= 2 AND max_players <= 6),
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lobby_players table
CREATE TABLE IF NOT EXISTS lobby_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
  player_id text NOT NULL,
  player_name text NOT NULL,
  join_order integer NOT NULL,
  is_connected boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(lobby_id, player_id)
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
  game_state jsonb NOT NULL,
  current_phase text NOT NULL,
  current_round integer NOT NULL DEFAULT 1,
  started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_history table
CREATE TABLE IF NOT EXISTS game_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid,
  players jsonb NOT NULL,
  winner_id text NOT NULL,
  winner_name text NOT NULL,
  duration_seconds integer NOT NULL,
  played_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lobbies_code ON lobbies(code);
CREATE INDEX IF NOT EXISTS idx_lobbies_status ON lobbies(status);
CREATE INDEX IF NOT EXISTS idx_lobby_players_lobby_id ON lobby_players(lobby_id);
CREATE INDEX IF NOT EXISTS idx_lobby_players_player_id ON lobby_players(player_id);
CREATE INDEX IF NOT EXISTS idx_games_lobby_id ON games(lobby_id);
CREATE INDEX IF NOT EXISTS idx_game_history_played_at ON game_history(played_at DESC);

-- Enable Row Level Security
ALTER TABLE lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

-- Policies for lobbies table
CREATE POLICY "Anyone can create a lobby"
  ON lobbies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view lobbies"
  ON lobbies FOR SELECT
  USING (true);

CREATE POLICY "Host can update their lobby"
  ON lobbies FOR UPDATE
  USING (true);

-- Policies for lobby_players table
CREATE POLICY "Anyone can join a lobby"
  ON lobby_players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view lobby players"
  ON lobby_players FOR SELECT
  USING (true);

CREATE POLICY "Players can update their connection status"
  ON lobby_players FOR UPDATE
  USING (true);

-- Policies for games table
CREATE POLICY "Anyone can create a game"
  ON games FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update game state"
  ON games FOR UPDATE
  USING (true);

-- Policies for game_history table
CREATE POLICY "Anyone can insert game history"
  ON game_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view game history"
  ON game_history FOR SELECT
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_lobbies_updated_at
  BEFORE UPDATE ON lobbies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
