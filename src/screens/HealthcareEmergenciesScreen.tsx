import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SERVICES = [
  {
    id: 'ambulance',
    title: 'Ambulance / Emergency',
    subtitle: '1-tap SOS dispatch',
    icon: 'medkit' as const,
    accent: colors.emergency,
    route: 'AmbulanceSos' as const,
  },
  {
    id: 'clinics',
    title: 'Clinics / Doctor Visit',
    subtitle: 'Schedule appointments',
    icon: 'business' as const,
    accent: colors.trustTeal,
    route: 'ClinicBooking' as const,
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
        <Text style={styles.headerTitle}>Healthcare & Emergencies</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.grid}>
        {SERVICES.map((s) => (
          <Pressable
            key={s.id}
            style={styles.card}
            onPress={() => navigation.navigate(s.route)}
          >
            <View style={[styles.iconCircle, { backgroundColor: `${s.accent}18` }]}>
              <Ionicons name={s.icon} size={32} color={s.accent} />
            </View>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardSub}>{s.subtitle}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.navy,
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
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: { fontWeight: '800', color: colors.navy, textAlign: 'center', fontSize: 14 },
  cardSub: { color: colors.grey, fontSize: 12, marginTop: 4, textAlign: 'center' },
});
