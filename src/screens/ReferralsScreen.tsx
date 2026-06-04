import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ReferralsScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const code = user?.referralCode?.trim() || '';

  const copy = async () => {
    if (!code) {
      Alert.alert('Referral code', 'Your referral code is loading. Pull to refresh your profile.');
      return;
    }
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied', `${code} copied to clipboard.`);
  };

  const share = async () => {
    if (!code) return;
    await Share.share({
      message: `Join NEXGEN with my code ${code} and get 30% off your first booking!`,
    });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Refer & Earn</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.codeBox}>
        <Text style={styles.code}>{code || 'Loading…'}</Text>
        <View style={styles.btnRow}>
          <PrimaryButton title="Copy" variant="outline" onPress={() => void copy()} />
          <View style={{ width: spacing.sm }} />
          <PrimaryButton title="Share" onPress={() => void share()} />
        </View>
      </View>
      <View style={styles.row2}>
        <View style={styles.cell}>
          <Text style={styles.big}>—</Text>
          <Text style={styles.lab}>Friends invited</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.big}>—</Text>
          <Text style={styles.lab}>Rewards earned</Text>
        </View>
      </View>
      <Text style={styles.rule}>• Friends get 30% OFF first booking.</Text>
      <Text style={styles.rule}>• You earn ₹500 per successful referral.</Text>
      <Text style={styles.rule}>• Your code is unique to your account.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { padding: spacing.lg, paddingTop: 48 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { fontSize: 18, fontWeight: '800' },
  codeBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  code: { fontSize: 22, fontWeight: '900', color: colors.charcoal, marginBottom: spacing.md },
  btnRow: { flexDirection: 'row' },
  row2: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  cell: {
    flex: 1,
    backgroundColor: colors.greyLight,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  big: { fontSize: 20, fontWeight: '800', color: colors.primary },
  lab: { fontSize: 12, color: colors.grey, marginTop: 4 },
  rule: { color: colors.grey, marginBottom: spacing.sm },
});
