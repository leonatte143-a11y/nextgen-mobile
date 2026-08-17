import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ServiceTile = {
  id: string;
  title: string;
  subtitle: string;
  footnote?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent: string;
  onPress: (nav: Nav) => void;
};

const SERVICES: ServiceTile[] = [
  {
    id: 'lab',
    title: 'Diagnostics',
    subtitle: 'Blood sample collection',
    icon: 'flask-outline',
    accent: colors.trustTeal,
    onPress: (nav) => nav.navigate('PremiumPartnerFeed', { title: 'Diagnostics', searchQuery: 'lab blood sample diagnostics' }),
  },
  {
    id: 'physio',
    title: 'Physiotherapists',
    subtitle: 'Recovery care',
    icon: 'body-outline',
    accent: colors.primary,
    onPress: (nav) => nav.navigate('PremiumPartnerFeed', { title: 'Physiotherapists', searchQuery: 'physiotherapist' }),
  },
  {
    id: 'clinics',
    title: 'Hospitals / Clinics',
    subtitle: 'Doctor appointments',
    icon: 'business-outline',
    accent: colors.trustTeal,
    onPress: (nav) => nav.navigate('PremiumPartnerFeed', { title: 'Hospitals / Clinics', searchQuery: 'doctor clinic hospital RMP PMP consultation' }),
  },
  {
    id: 'nurse',
    title: 'Home Nurses',
    subtitle: 'Patient care at home',
    icon: 'heart-outline',
    accent: colors.emergency,
    onPress: (nav) => nav.navigate('ServiceList', { bucketId: 'life_health', title: 'Home Nurses', searchQuery: 'nursing patient care' }),
  },
  {
    id: 'yoga',
    title: 'Gym & Yoga',
    subtitle: 'Personal trainers',
    footnote: 'Centers and Trainers',
    icon: 'barbell-outline',
    accent: colors.primary,
    onPress: (nav) => nav.navigate('PremiumPartnerFeed', { title: 'Gym & Yoga', searchQuery: 'yoga fitness gym' }),
  },
  {
    id: 'baby',
    title: 'Baby Sitters',
    subtitle: 'Trusted nannies',
    icon: 'happy-outline',
    accent: colors.trustTeal,
    onPress: (nav) => nav.navigate('ServiceList', { bucketId: 'life_health', title: 'Baby Sitters', searchQuery: 'babysitter nanny' }),
  },
  {
    id: 'astro',
    title: 'Astrologers',
    subtitle: 'Vastu experts',
    icon: 'planet-outline',
    accent: colors.navy,
    onPress: (nav) => nav.navigate('ServiceList', { bucketId: 'life_health', title: 'Astrologers', searchQuery: 'astrologer vastu' }),
  },
  {
    id: 'ambulance',
    title: 'Ambulance',
    subtitle: '1-tap SOS dispatch',
    icon: 'medkit',
    accent: colors.emergency,
    onPress: (nav) => nav.navigate('ServiceList', { bucketId: 'life_health', title: 'Ambulance', searchQuery: 'ambulance emergency transport driver' }),
  },
];

export function HealthcareEmergenciesScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Health & Care</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {SERVICES.map((s) => (
          <Pressable key={s.id} style={styles.card} onPress={() => s.onPress(navigation)}>
            <View style={[styles.iconCircle, { backgroundColor: `${s.accent}18` }]}>
              <Ionicons name={s.icon} size={26} color={s.accent} />
            </View>
            <Text style={styles.cardTitle}>{s.title}</Text>
            {s.footnote ? <Text style={styles.cardFootnote}>{s.footnote}</Text> : null}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.white, fontWeight: '800', fontSize: 17 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardFootnote: { fontSize: 10, color: colors.grey, marginTop: 2, textAlign: 'center' },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: { fontWeight: '800', color: colors.navy, textAlign: 'center', fontSize: 13 },
});
