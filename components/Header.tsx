import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Menu } from 'lucide-react-native';
import { COLORS, SPACING, SHADOWS, FONT_SIZES } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderProps {
  showBack?: boolean;
  showMenu?: boolean;
  transparent?: boolean;
}

export default function Header({ showBack = true, showMenu = true, transparent = false }: HeaderProps) {
  const router = useRouter();

  const handleLogoPress = () => {
    if (router.canGoBack()) {
      router.push('/');
    }
  };

  const handleMenuPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <LinearGradient
      colors={transparent ? ['rgba(4, 43, 18, 0.0)', 'rgba(4, 43, 18, 0.0)'] : ['rgba(4, 43, 18, 0.95)', 'rgba(4, 43, 18, 0.85)']}
      style={[styles.header, transparent && styles.headerTransparent]}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={handleLogoPress} style={styles.logoContainer} activeOpacity={0.8}>
          <Text style={styles.logo}>CLIMAX</Text>
        </TouchableOpacity>

        {showMenu && (
          <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton} activeOpacity={0.7}>
            <View style={styles.menuIconContainer}>
              <Menu size={24} color={COLORS.gold} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.borderBottom} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.medium,
  },
  headerTransparent: {
    shadowOpacity: 0,
    elevation: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flex: 1,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(226, 178, 58, 0.15)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignSelf: 'flex-start',
  },
  logo: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.gold,
    fontWeight: '800',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  menuButton: {
    marginLeft: SPACING.md,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(226, 178, 58, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.gold,
    opacity: 0.4,
  },
});
