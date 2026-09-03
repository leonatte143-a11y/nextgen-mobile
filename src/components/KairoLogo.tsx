import React from 'react';
import { Image, StyleSheet } from 'react-native';

export function KairoLogo({ size = 32, style }: { size?: number; style?: object }) {
  return (
    <Image
      source={require('../../assets/kairo_icon.jpeg')}
      style={[{ width: size, height: size, borderRadius: size * 0.28 }, styles.img, style]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  img: { backgroundColor: '#FFFFFF' },
});
