import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SECTIONS = [
  {
    title: '1. The Role of KAIRO',
    body: 'KAIRO is an intermediary platform. We facilitate connections between service providers (Electricians, Nurses, etc.), shop owners, and P2P sellers. KAIRO is not a party to the actual contract between the User and the Service Partner or Seller. We do not provide the services ourselves, nor do we own the materials listed in the Marketplace.',
  },
  {
    title: '2. User & Partner Obligations',
    body: 'Verification: Service Partners listed as "Verified" have undergone background checks. However, Users are encouraged to exercise their own discretion.\n\nAccuracy: Users must provide accurate location and service details. If you use the "Custom Requirement" description box, you acknowledge that KAIRO moderates this information for safety and compliance.\n\nProhibited Activity: You may not use the app to facilitate illegal transactions, harassment, or to solicit services outside of the KAIRO payment/contracting ecosystem.',
  },
  {
    title: '3. Marketplace, Rentals, & P2P Sales',
    body: 'P2P Marketplace: KAIRO provides a platform for selling leftover materials (tiles, sand, bricks) and renting tools. We are not responsible for the condition or quality of items sold between neighbors.\n\nRentals & Deposits: For rental transactions (e.g., machinery), the platform may facilitate a security deposit. Users agree that KAIRO’s role is to act as a neutral technology provider. Disputes regarding condition or damage must be resolved between the Buyer and Seller.\n\nOLX-Style Listings: Items posted for sale must be owned by the poster. Any listing found to be fraudulent or selling stolen goods will be immediately removed, and the user banned.',
  },
  {
    title: '4. Booking, Payments, & Cancellations',
    body: 'Work Lifecycle: Users must provide the "Work Done OTP" only after the service is fully completed to their satisfaction.\n\nPayment: KAIRO enables various payment options. Users are obligated to complete the payment via the platform or agreed methods before submitting a review.\n\nSafety: In the event of an emergency (e.g., Ambulance request), KAIRO provides an SOS feature. You acknowledge that KAIRO is not an emergency medical service and we do not guarantee response times.',
  },
  {
    title: '5. Staff, Employees, & Admin Operations',
    body: 'Access Control: Staff members are granted access to specific Admin modules (HR, Marketing, Support) based on their role. Misuse of platform data or administrative privileges is strictly prohibited and subject to immediate termination.\n\nPayroll: Staff salary payments are processed on a monthly basis independent of service commissions.',
  },
  {
    title: '6. Notifications & Marketing',
    body: 'Opt-in: By using the app, you agree to receive transactional and promotional notifications.\n\nPreferences: You can manage notification preferences in "Settings." Promotions have set expiration dates, after which they are no longer valid.',
  },
  {
    title: '7. Limitation of Liability',
    body: 'KAIRO is not liable for any direct or indirect damages resulting from the use of our app, the conduct of service providers, or the quality of goods purchased in the P2P marketplace. Use of the app is at your own risk.',
  },
  {
    title: '8. Changes to Terms',
    body: 'KAIRO reserves the right to modify these terms at any time. Significant changes will be notified via the App Notification Hub. Continued use of the app constitutes acceptance of the updated terms.',
  },
];

export function TermsScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
      </Pressable>
      <Text style={styles.h1}>Terms & Conditions</Text>
      <Text style={styles.meta}>Last updated: June 27, 2026</Text>
      <Text style={styles.intro}>
        Welcome to KAIRO. By accessing our platform, you agree to these Terms. KAIRO operates as a hyperlocal
        marketplace connecting Users with Service Partners, Shops, and Peer-to-Peer (P2P) Marketplace Sellers.
      </Text>
      {SECTIONS.map((s) => (
        <React.Fragment key={s.title}>
          <Text style={styles.h2}>{s.title}</Text>
          <Text style={styles.p}>{s.body}</Text>
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { padding: spacing.lg, paddingTop: 48, paddingBottom: spacing.xl },
  back: { marginBottom: spacing.md },
  h1: { fontSize: 22, fontWeight: '800' },
  meta: { color: colors.grey, marginVertical: spacing.md },
  intro: { lineHeight: 22, color: colors.charcoal, marginBottom: spacing.lg },
  h2: { fontSize: 15, fontWeight: '800', color: colors.charcoal, marginTop: spacing.lg, marginBottom: spacing.sm },
  p: { lineHeight: 22, color: colors.grey },
});
