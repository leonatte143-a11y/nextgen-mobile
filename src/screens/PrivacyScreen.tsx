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
        We collect your name, email, phone, and location to fulfil bookings, connect you with Service Partners
        and Shops, and improve your experience across KAIRO.
      </Text>
      <Text style={styles.h2}>Marketplace & Chat</Text>
      <Text style={styles.p}>
        For P2P Marketplace and Super-Chat features, your messages are shared with the relevant Buyer/Seller or
        Service Partner, and with KAIRO Admin for support and safety moderation. Personal phone numbers are kept
        private in chat until you choose to share contact details.
      </Text>
      <Text style={styles.h2}>Your Choices</Text>
      <Text style={styles.p}>
        You can manage notification preferences in Settings at any time. Contact privacy@kairo.com for data
        access, correction, or deletion requests.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { padding: spacing.lg, paddingTop: 48, paddingBottom: spacing.xl },
  back: { marginBottom: spacing.md },
  h1: { fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
  h2: { fontSize: 15, fontWeight: '800', color: colors.charcoal, marginTop: spacing.lg, marginBottom: spacing.sm },
  p: { lineHeight: 22, color: colors.grey },
});
