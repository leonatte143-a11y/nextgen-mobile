import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KairoTextInput } from '../components/KairoTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import type { Booking } from '../mock/types';
import type { RootStackParamList } from '../navigation/types';
import { bookingService } from '../services/bookingService';
import { supportService } from '../services/supportService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FAQ = [
  { q: 'Booking Issues', a: 'Partner late, reschedule, or cancel before 2h for a full refund.' },
  { q: 'Payments & Refunds', a: 'Failed UPI, wallet credits, and settlement timelines.' },
  { q: 'KAIRO Wallet', a: 'Use reward points at checkout as a discount.' },
  { q: 'Safety & Quality', a: 'Report a partner directly from your booking details.' },
];

export function SupportScreen() {
  const navigation = useNavigation<Nav>();
  const [subject, setSubject] = useState('Report an issue with my booking');
  const [description, setDescription] = useState('');
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null);
  const [completedOrders, setCompletedOrders] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [ticketLoading, setTicketLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingBookings(true);
        const bookings = await bookingService.getBookings();
        const completed = bookings.filter((b) => b.status === 'completed').slice(0, 5);
        if (mounted) {
          setCompletedOrders(completed);
          if (bookings.length > 0) {
            setLatestBooking(bookings[0]);
            setSubject(`Issue with ${bookings[0].serviceName}`);
          }
        }
      } catch {
        // ignore, keep support screen available
      } finally {
        if (mounted) setLoadingBookings(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateTicket = async () => {
    if (!subject.trim()) {
      Alert.alert('Subject required', 'Please describe the issue in one line.');
      return;
    }

    try {
      setTicketLoading(true);
      await supportService.createTicket({
        bookingId: latestBooking?.id,
        subject: subject.trim(),
        description: description.trim(),
      });
      Alert.alert('Ticket created', 'Your support request has been submitted. Our team will reach out soon.');
      setDescription('');
    } catch (error) {
      Alert.alert('Unable to submit', String(error));
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <View style={[styles.hero, { paddingTop: 48 }]}> 
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.h1}>How can we help you?</Text>
        <KairoTextInput
          placeholder="Search (e.g. refund, partner late)"
          style={styles.searchInner}
        />
      </View>
      <View style={styles.quick}>
        <Quick
          icon="chatbubbles-outline"
          label="Chat"
          onPress={() => Linking.openURL('mailto:support@kairo.com?subject=Live%20chat%20support')}
        />
        <Quick icon="call-outline" label="Call" onPress={() => Linking.openURL('tel:9876543210')} />
        <Quick
          icon="mail-outline"
          label="Email"
          onPress={() => Linking.openURL('mailto:support@kairo.com')}
        />
      </View>
      <Text style={styles.section}>FAQ</Text>
      {FAQ.map((f) => (
        <View key={f.q} style={styles.faq}>
          <View style={styles.faqRow}>
            <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
            <Text style={styles.faqQ}>{f.q}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.grey} />
          </View>
          <Text style={styles.faqA}>{f.a}</Text>
        </View>
      ))}
      <Text style={styles.section}>Issues with previous orders</Text>
      {completedOrders.length === 0 ? (
        <Text style={styles.noBooking}>No completed orders yet.</Text>
      ) : (
        completedOrders.map((b) => (
          <Pressable
            key={b.id}
            style={styles.issue}
            onPress={() => setSubject(`Issue with ${b.serviceName} (${b.id})`)}
          >
            <View>
              <Text style={styles.issueTxt}>{b.serviceName}</Text>
              <Text style={styles.issueSub}>Completed · {b.id}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.grey} />
          </Pressable>
        ))
      )}
      <View style={styles.legalRow}>
        <Pressable onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.legalLink}>Terms & Conditions</Text>
        </Pressable>
        <Text style={styles.legalDot}>·</Text>
        <Pressable onPress={() => navigation.navigate('Privacy')}>
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Pressable>
      </View>
      <Text style={styles.section}>Report an issue</Text>
      {loadingBookings ? (
        <Text style={styles.loading}>Checking your latest bookings…</Text>
      ) : latestBooking ? (
        <View style={styles.issue}>
          <View>
            <Text style={styles.issueTxt}>{latestBooking.serviceName}</Text>
            <Text style={styles.issueSub}>Booking ID: {latestBooking.id}</Text>
          </View>
          <Text style={styles.issueStatus}>Active</Text>
        </View>
      ) : (
        <Text style={styles.noBooking}>No recent bookings found. You can still submit a support request.</Text>
      )}
      <Text style={styles.label}>Subject</Text>
      <KairoTextInput
        placeholder="Short summary (e.g. partner late, refund request)"
        value={subject}
        onChangeText={setSubject}
      />
      <Text style={styles.label}>Details</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describe the issue and any relevant details."
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <PrimaryButton
        title="Submit Ticket"
        onPress={handleCreateTicket}
        loading={ticketLoading}
      />
      <Pressable style={styles.sos} onPress={() => Linking.openURL('tel:112')}>
        <Text style={styles.sosTxt}>SOS / Emergency</Text>
      </Pressable>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Quick({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.qItem} onPress={onPress}>
      <View style={styles.qCircle}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.qLab}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.white },
  body: { paddingBottom: spacing.xl, paddingHorizontal: spacing.md },
  hero: { backgroundColor: colors.primary, padding: spacing.lg, paddingBottom: spacing.xl },
  back: { marginBottom: spacing.md },
  h1: { color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
  searchInner: { backgroundColor: colors.white },
  quick: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -spacing.lg, paddingHorizontal: spacing.md },
  qItem: { alignItems: 'center', flex: 1 },
  qCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  qLab: { marginTop: spacing.sm, fontWeight: '600', fontSize: 12 },
  section: { fontWeight: '800', marginTop: spacing.xl, marginBottom: spacing.sm, marginHorizontal: spacing.md },
  faq: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  faqRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  faqQ: { flex: 1, fontWeight: '700' },
  faqA: { color: colors.grey, fontSize: 13, marginTop: spacing.sm, lineHeight: 20 },
  issue: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  issueTxt: { fontWeight: '700', fontSize: 15, marginBottom: spacing.xs },
  issueSub: { color: colors.grey, fontSize: 12 },
  issueStatus: { fontWeight: '700', color: colors.primary },
  noBooking: { marginHorizontal: spacing.md, color: colors.grey, marginBottom: spacing.md },
  loading: { marginHorizontal: spacing.md, color: colors.grey, marginBottom: spacing.md },
  label: { fontWeight: '700', marginTop: spacing.lg, color: colors.charcoal },
  textArea: {
    minHeight: 120,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    textAlignVertical: 'top',
  },
  sos: {
    marginVertical: spacing.lg,
    backgroundColor: colors.error,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  sosTxt: { color: colors.white, fontWeight: '800', padding: spacing.md },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  legalLink: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  legalDot: { color: colors.grey },
});
