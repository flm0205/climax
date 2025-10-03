import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import { useNetworkStatus } from '../services/networkService';
import { hasActiveOfflineGame } from '../services/offlineGameService';
import Button from '../components/Button';

export default function HomeScreen() {
  const router = useRouter();
  const networkStatus = useNetworkStatus();
  const isOnline = networkStatus === 'online';
  const [hasOfflineGame, setHasOfflineGame] = useState(false);

  useEffect(() => {
    checkOfflineGame();
  }, []);

  const checkOfflineGame = async () => {
    const hasGame = await hasActiveOfflineGame();
    setHasOfflineGame(hasGame);
  };

  return (
    <LinearGradient colors={COLORS.backgroundGradient as any} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <LinearGradient
                colors={[COLORS.gold, COLORS.goldLight, COLORS.gold] as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.titleGradient}
              >
                <Text style={styles.title}>CLIMAX</Text>
              </LinearGradient>
            </View>
            <Text style={styles.subtitle}>Italian Card Game</Text>

            <View style={styles.statusBadge}>
              <View style={[styles.statusIndicator, isOnline ? styles.statusOnline : styles.statusOffline]} />
              <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>

          <View style={styles.menu}>
            {hasOfflineGame && (
              <View style={styles.resumeContainer}>
                <Text style={styles.resumeTitle}>Continue Playing</Text>
                <Button
                  title="Resume Offline Game"
                  onPress={() => router.push('/offline-game')}
                  variant="primary"
                  style={styles.resumeButton}
                />
              </View>
            )}

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Online Multiplayer</Text>
            </View>

            <Button
              title="Create Online Lobby"
              onPress={() => router.push('/create-lobby')}
              style={styles.menuButton}
              disabled={!isOnline}
            />

            <Button
              title="Join Online Lobby"
              onPress={() => router.push('/join-lobby')}
              variant="secondary"
              style={styles.menuButton}
              disabled={!isOnline}
            />

            <View style={styles.divider} />

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Play Offline</Text>
            </View>

            <Button
              title="Play vs AI"
              onPress={() => router.push('/offline-setup')}
              variant="primary"
              style={styles.menuButton}
            />

            <Button
              title="Match History"
              onPress={() => router.push('/history')}
              variant="outline"
              style={styles.menuButton}
            />

            <View style={styles.infoBox}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] as any}
                style={styles.infoBoxGradient}
              >
                <Text style={styles.infoTitle}>How to Play</Text>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>●</Text>
                  <Text style={styles.infoText}>2-6 players with Neapolitan cards</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>●</Text>
                  <Text style={styles.infoText}>Bet on tricks you'll win each round</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>●</Text>
                  <Text style={styles.infoText}>Match your bet exactly to score points</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>●</Text>
                  <Text style={styles.infoText}>Watch the Lead Suit - it beats all others!</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
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
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  titleContainer: {
    marginBottom: SPACING.md,
  },
  titleGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
  },
  title: {
    fontSize: FONT_SIZES.xxxl + 24,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  statusOnline: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  statusOffline: {
    backgroundColor: COLORS.disabled,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  menu: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  resumeContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.success,
    ...SHADOWS.medium,
  },
  resumeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.successLight,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  resumeButton: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    marginVertical: SPACING.md,
  },
  sectionTitleText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.gold,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  menuButton: {
    marginBottom: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.lg,
  },
  infoBox: {
    marginTop: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.medium,
  },
  infoBoxGradient: {
    padding: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  infoBullet: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gold,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
