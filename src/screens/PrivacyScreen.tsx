import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PrivacyScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
      </Pressable>
      <Text style={styles.h1}>Privacy Policy</Text>
      <Text style={styles.p}>
        We collect name, email, phone, and location to fulfil bookings and improve experience. Contact
        privacy@nexgen.com for deletion requests.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { padding: spacing.lg, paddingTop: 48 },
  back: { marginBottom: spacing.md },
  h1: { fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
  p: { lineHeight: 22, color: colors.charcoal },
});
