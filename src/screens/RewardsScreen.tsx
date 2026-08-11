import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function RewardsScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Rewards & Wallet</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="gift-outline" size={56} color={colors.primary} />
        </View>
        <Text style={styles.heading}>Rewards — Coming Soon</Text>
        <Text style={styles.sub}>We're building something exciting. Check back soon!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: 48,
  },
  title: { fontSize: 18, fontWeight: '800' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  iconWrap: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heading: { fontSize: 20, fontWeight: '800', color: colors.charcoal, textAlign: 'center' },
  sub: { fontSize: 14, color: colors.grey, textAlign: 'center', marginTop: spacing.sm },
});
