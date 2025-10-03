import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import Button from '../components/Button';
import { createLobby } from '../services/lobbyService';
import { generateLobbyLink } from '../utils/lobby';

export default function CreateLobbyScreen() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);

    try {
      const playerId = `player-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const lobby = await createLobby(playerId, playerName.trim(), maxPlayers);

      router.replace(`/lobby/${lobby.code}?playerId=${playerId}&playerName=${encodeURIComponent(playerName.trim())}&isHost=true`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create lobby');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Lobby</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textSecondary}
            maxLength={20}
            autoFocus
          />

          <Text style={styles.label}>Max Players</Text>
          <View style={styles.playerCountContainer}>
            {[2, 3, 4, 5, 6].map((count) => (
              <Button
                key={count}
                title={count.toString()}
                onPress={() => setMaxPlayers(count)}
                variant={maxPlayers === count ? 'primary' : 'outline'}
                style={styles.playerButton}
              />
            ))}
          </View>

          <Button title="Create Lobby" onPress={handleCreate} loading={loading} disabled={loading || !playerName.trim()} style={styles.createButton} />

          <Button title="Back" onPress={() => router.back()} variant="outline" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  playerCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  playerButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    minHeight: 50,
  },
  createButton: {
    marginBottom: SPACING.md,
  },
});
