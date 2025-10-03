import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import Button from '../components/Button';
import { joinLobby } from '../services/lobbyService';

export default function JoinLobbyScreen() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!lobbyCode.trim() || lobbyCode.trim().length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-character lobby code');
      return;
    }

    setLoading(true);

    try {
      const playerId = `player-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const lobby = await joinLobby(lobbyCode.trim().toUpperCase(), playerId, playerName.trim());

      router.replace(`/lobby/${lobby.code}?playerId=${playerId}&playerName=${encodeURIComponent(playerName.trim())}&isHost=false`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join lobby');
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={COLORS.backgroundGradient as any} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Image
            source={require('../assets/images/ChatGPT Image Oct 3, 2025, 08_50_05 PM.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Join Lobby</Text>

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

          <Text style={styles.label}>Lobby Code</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={lobbyCode}
            onChangeText={(text) => setLobbyCode(text.toUpperCase())}
            placeholder="ABC123"
            placeholderTextColor={COLORS.textSecondary}
            maxLength={6}
            autoCapitalize="characters"
          />

          <Button title="Join Lobby" onPress={handleJoin} loading={loading} disabled={loading || !playerName.trim() || lobbyCode.trim().length !== 6} style={styles.joinButton} />

          <Button title="Back" onPress={() => router.back()} variant="outline" />
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
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 140,
    marginBottom: SPACING.lg,
    opacity: 0.9,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    backgroundColor: 'rgba(15, 61, 46, 0.4)',
    borderWidth: 2,
    borderColor: COLORS.highlight,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  codeInput: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 4,
    color: COLORS.gold,
  },
  joinButton: {
    marginBottom: SPACING.md,
  },
});
