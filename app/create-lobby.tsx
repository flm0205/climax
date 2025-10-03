import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import Header from '../components/Header';
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
    <LinearGradient colors={COLORS.backgroundGradient as any} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header />
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
              <Text style={styles.title}>Create Lobby</Text>
              <Text style={styles.subtitle}>Set up a new online game</Text>

              <View style={styles.form}>
                <Input
                  label="Your Name"
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholder="Enter your name"
                  maxLength={20}
                  autoFocus
                />

                <Text style={styles.label}>Max Players</Text>
                <View style={styles.playerCountContainer}>
                  {[2, 3, 4, 5, 6].map((count) => (
                    <TouchableOpacity
                      key={count}
                      onPress={() => setMaxPlayers(count)}
                      activeOpacity={0.8}
                      style={styles.playerButtonWrapper}
                    >
                      <LinearGradient
                        colors={
                          maxPlayers === count
                            ? COLORS.goldGradient
                            : ['rgba(226, 178, 58, 0.1)', 'rgba(226, 178, 58, 0.05)']
                        }
                        style={[
                          styles.playerButton,
                          maxPlayers === count && styles.playerButtonSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.playerButtonText,
                            maxPlayers === count && styles.playerButtonTextSelected,
                          ]}
                        >
                          {count}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>

                <Button
                  title="Create Lobby"
                  onPress={handleCreate}
                  loading={loading}
                  disabled={loading || !playerName.trim()}
                  style={styles.createButton}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
    fontStyle: 'italic',
  },
  form: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    letterSpacing: 0.5,
  },
  playerCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  playerButtonWrapper: {
    flex: 1,
  },
  playerButton: {
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
    ...SHADOWS.medium,
  },
  playerButtonSelected: {
    borderWidth: 3,
    borderColor: COLORS.goldLight,
    ...SHADOWS.goldGlow,
  },
  playerButtonText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.gold,
  },
  playerButtonTextSelected: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.primaryDark,
  },
  createButton: {
    marginTop: SPACING.lg,
  },
});
