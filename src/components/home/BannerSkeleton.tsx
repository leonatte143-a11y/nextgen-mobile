import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

const WIDTH = Dimensions.get('window').width - spacing.md * 2;
const DEFAULT_HEIGHT = 160;

export function BannerSkeleton({ height = DEFAULT_HEIGHT }: { height?: number }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.75, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.box, { opacity, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  box: {
    width: WIDTH,
    height: DEFAULT_HEIGHT,
    borderRadius: radius.lg,
    backgroundColor: colors.greyLight,
  },
});
