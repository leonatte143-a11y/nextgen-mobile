import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function RewardsScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const pts = user?.rewardPoints ?? 0;
  const rupees = (pts / 10).toFixed(2);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Rewards & Wallet</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.banner}>
        <Text style={styles.pts}>{pts}</Text>
        <Text style={styles.sub}>points</Text>
        <Text style={styles.rupees}>≈ ₹{rupees} wallet value</Text>
      </View>
      <Text style={styles.h2}>How rewards work</Text>
      <Text style={styles.step}>1. Book services — earn 10 points per ₹100 spent.</Text>
      <Text style={styles.step}>2. Points credit automatically after completion.</Text>
      <Text style={styles.step}>3. Redeem as discount on your next booking.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { padding: spacing.lg, paddingTop: 48 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { fontSize: 18, fontWeight: '800' },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  pts: { fontSize: 44, fontWeight: '900', color: colors.white },
  sub: { color: colors.orangeTint, fontWeight: '600' },
  rupees: { color: colors.white, marginTop: spacing.sm, fontSize: 16 },
  h2: { fontWeight: '800', fontSize: 16, marginBottom: spacing.sm },
  step: { color: colors.grey, marginBottom: spacing.sm, lineHeight: 22 },
});
