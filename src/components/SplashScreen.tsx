import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing } from '../constants/theme';

const SPLASH_ORANGE = colors.primary;

type Props = {
  onAnimationComplete?: () => void;
};

/**
 * Branded launch view — no navigation; parent screen handles routing after auth hydrate.
 */
export function SplashScreenView({ onAnimationComplete }: Props) {
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(brandTranslateY, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    ]);

    entrance.start(({ finished }) => {
      if (finished) onAnimationComplete?.();
    });
  }, [logoOpacity, logoScale, brandOpacity, brandTranslateY, onAnimationComplete]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Text style={styles.logoLetter}>N</Text>
        </Animated.View>
        <Animated.View
          style={{
            opacity: brandOpacity,
            transform: [{ translateY: brandTranslateY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.brand}>KAIRO</Text>
          <Text style={styles.tagline}>Verified Professionals at Your Doorstep</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SPLASH_ORANGE,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoLetter: {
    fontSize: 112,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -4,
    includeFontPadding: false,
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 4,
    textAlign: 'center',
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
