import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import Button from '../components/Button';
import { getPlayerProfile, savePlayerProfile } from '../services/offlineStorage';
import { createOfflineGame } from '../services/offlineGameService';

export default function OfflineSetupScreen() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [numPlayers, setNumPlayers] = useState(4);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlayerProfile();
  }, []);

  const loadPlayerProfile = async () => {
    const profile = await getPlayerProfile();
    if (profile) {
      setPlayerName(profile.name);
    }
  };

  const handleStartGame = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);

    try {
      await savePlayerProfile({
        name: playerName.trim(),
        gamesPlayed: 0,
        gamesWon: 0,
      });

      const gameState = await createOfflineGame(playerName.trim(), numPlayers);
      router.replace(`/offline-game`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start game');
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={COLORS.backgroundGradient as any} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Play vs AI</Text>
          <Text style={styles.description}>Challenge computer opponents offline</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textMuted}
              maxLength={20}
              autoFocus
            />

            <Text style={styles.label}>Number of Players</Text>
            <View style={styles.playerCountContainer}>
              {[2, 3, 4, 5, 6].map((count) => (
                <Button
                  key={count}
                  title={count.toString()}
                  onPress={() => setNumPlayers(count)}
                  variant={numPlayers === count ? 'primary' : 'outline'}
                  style={styles.playerButton}
                />
              ))}
            </View>

            <View style={styles.aiInfo}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] as any}
                style={styles.aiInfoGradient}
              >
                <Text style={styles.aiInfoText}>
                  You'll play against {numPlayers - 1} AI opponent{numPlayers > 2 ? 's' : ''}
                </Text>
                <Text style={styles.aiInfoSubtext}>AI players have different strategies and difficulty levels</Text>
              </LinearGradient>
            </View>

            <Button
              title="Start Game"
              onPress={handleStartGame}
              loading={loading}
              disabled={loading || !playerName.trim()}
              style={styles.startButton}
            />

            <Button title="Back to Menu" onPress={() => router.back()} variant="outline" />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
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
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  playerCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    gap: SPACING.xs,
  },
  playerButton: {
    flex: 1,
    minHeight: 54,
  },
  aiInfo: {
    marginBottom: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.highlight,
  },
  aiInfoGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  aiInfoText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  aiInfoSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  startButton: {
    marginBottom: SPACING.md,
  },
});
