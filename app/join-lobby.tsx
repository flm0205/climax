import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
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

              <Button
                title="Join Lobby"
                onPress={handleJoin}
                loading={loading}
                disabled={loading || !playerName.trim() || lobbyCode.trim().length !== 6}
                style={styles.joinButton}
              />

              <Button title="Back" onPress={() => router.back()} variant="outline" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
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
  codeInput: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 4,
  },
  joinButton: {
    marginBottom: SPACING.md,
  },
});
