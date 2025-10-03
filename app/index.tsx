import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import { useNetworkStatus } from '../services/networkService';
import { hasActiveOfflineGame } from '../services/offlineGameService';
import Button from '../components/Button';
import CompactLogo from '../components/CompactLogo';

export default function HomeScreen() {
  const router = useRouter();
  const networkStatus = useNetworkStatus();
  const isOnline = networkStatus === 'online';
  const [hasOfflineGame, setHasOfflineGame] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

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
            <View style={styles.logoContainer}>
              <CompactLogo size="large" />
            </View>
            <Text style={styles.tagline}>The Original Italian Trick-Taking Card Game</Text>

            <View style={styles.statusBadge}>
              <View style={[styles.statusIndicator, isOnline ? styles.statusOnline : styles.statusOffline]} />
              <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline Mode'}</Text>
            </View>
          </View>

          <View style={styles.menu}>
            {hasOfflineGame && (
              <View style={styles.resumeContainer}>
                <LinearGradient
                  colors={['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.1)']}
                  style={styles.resumeGradient}
                >
                  <Text style={styles.resumeTitle}>Continue Playing</Text>
                  <Button
                    title="Resume Game"
                    onPress={() => router.push('/offline-game')}
                    variant="primary"
                    style={styles.resumeButton}
                  />
                </LinearGradient>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionTitle}>Online Multiplayer</Text>
                <View style={styles.sectionLine} />
              </View>

              <Button
                title="Create Lobby"
                onPress={() => router.push('/create-lobby')}
                variant="primary"
                style={styles.menuButton}
                disabled={!isOnline}
              />

              <Button
                title="Join Lobby"
                onPress={() => router.push('/join-lobby')}
                variant="secondary"
                style={styles.menuButton}
                disabled={!isOnline}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionTitle}>Play Offline</Text>
                <View style={styles.sectionLine} />
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
            </View>

            <TouchableOpacity
              onPress={() => setShowHowToPlay(!showHowToPlay)}
              activeOpacity={0.8}
              style={styles.howToPlayHeader}
            >
              <LinearGradient
                colors={['rgba(226, 178, 58, 0.15)', 'rgba(226, 178, 58, 0.05)']}
                style={styles.howToPlayHeaderGradient}
              >
                <Text style={styles.howToPlayTitle}>How to Play</Text>
                {showHowToPlay ? (
                  <ChevronUp size={24} color={COLORS.gold} />
                ) : (
                  <ChevronDown size={24} color={COLORS.gold} />
                )}
              </LinearGradient>
            </TouchableOpacity>

            {showHowToPlay && (
              <View style={styles.howToPlayContent}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
                  style={styles.howToPlayGradient}
                >
                  <View style={styles.ruleItem}>
                    <View style={styles.ruleBullet}>
                      <Text style={styles.ruleBulletText}>1</Text>
                    </View>
                    <Text style={styles.ruleText}>2-6 players with Neapolitan cards</Text>
                  </View>
                  <View style={styles.ruleItem}>
                    <View style={styles.ruleBullet}>
                      <Text style={styles.ruleBulletText}>2</Text>
                    </View>
                    <Text style={styles.ruleText}>Bet on tricks you'll win each round</Text>
                  </View>
                  <View style={styles.ruleItem}>
                    <View style={styles.ruleBullet}>
                      <Text style={styles.ruleBulletText}>3</Text>
                    </View>
                    <Text style={styles.ruleText}>Match your bet exactly to score points</Text>
                  </View>
                  <View style={styles.ruleItem}>
                    <View style={styles.ruleBullet}>
                      <Text style={styles.ruleBulletText}>4</Text>
                    </View>
                    <Text style={styles.ruleText}>Watch the Lead Suit - it beats all others!</Text>
                  </View>
                </LinearGradient>
              </View>
            )}
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
    paddingTop: SPACING.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoContainer: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textBeige,
    fontStyle: 'italic',
    letterSpacing: 1,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(226, 178, 58, 0.3)',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  statusOnline: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 5,
  },
  statusOffline: {
    backgroundColor: COLORS.disabled,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  menu: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  resumeContainer: {
    marginBottom: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.success,
    ...SHADOWS.large,
  },
  resumeGradient: {
    padding: SPACING.xl,
  },
  resumeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.successLight,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resumeButton: {
    marginTop: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  sectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.gold,
    opacity: 0.3,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.gold,
    textAlign: 'center',
    letterSpacing: 1.5,
    marginHorizontal: SPACING.lg,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  menuButton: {
    marginBottom: SPACING.md,
  },
  howToPlayHeader: {
    marginTop: SPACING.lg,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.gold,
    ...SHADOWS.medium,
  },
  howToPlayHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  howToPlayTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  howToPlayContent: {
    marginTop: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226, 178, 58, 0.2)',
  },
  howToPlayGradient: {
    padding: SPACING.xl,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  ruleBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.small,
  },
  ruleBulletText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  ruleText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontWeight: '500',
  },
});
