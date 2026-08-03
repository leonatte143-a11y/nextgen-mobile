import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CLINIC_MENU = [
  { id: 'checkup', title: 'General Checkup', price: 500 },
  { id: 'blood', title: 'Blood Test', price: 300 },
  { id: 'child', title: 'Child Specialist', price: 800 },
];

export function ClinicBookingScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>(['checkup']);
  const [dateSlot, setDateSlot] = useState('June 5, 10:00 AM');

  const total = useMemo(
    () => CLINIC_MENU.reduce((sum, item) => (selected.includes(item.id) ? sum + item.price : sum), 0),
    [selected],
  );

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const book = () => {
    if (!selected.length) {
      Alert.alert('Select a service', 'Choose at least one clinic service.');
      return;
    }
    navigation.navigate('ServiceList', {
      bucketId: 'life_health',
      title: 'Clinics & Doctors',
      searchQuery: 'doctor clinic',
    });
    Alert.alert('Slot saved', `Requested: ${dateSlot}. Pick a verified clinic partner next.`);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Clinics & Consultations</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.section}>Select services</Text>
        {CLINIC_MENU.map((item) => {
          const on = selected.includes(item.id);
          return (
            <Pressable key={item.id} style={[styles.row, on && styles.rowOn]} onPress={() => toggle(item.id)}>
              <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? colors.primary : colors.grey} />
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowPrice}>₹{item.price}</Text>
            </Pressable>
          );
        })}
        <Text style={styles.section}>Date & time slot</Text>
        <TextInput
          style={styles.input}
          value={dateSlot}
          onChangeText={setDateSlot}
          placeholder="e.g. June 5, 10:00 AM"
        />
        <Text style={styles.total}>Estimated total: ₹{total}</Text>
        <PrimaryButton title="Find clinic partner" onPress={book} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
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
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  section: { fontWeight: '800', color: colors.white, marginTop: spacing.md, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowOn: { borderColor: colors.primary, backgroundColor: colors.orangeTint },
  rowTitle: { flex: 1, fontWeight: '600', color: colors.charcoal },
  rowPrice: { fontWeight: '800', color: colors.primary },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 15,
    color: colors.charcoal,
  },
  total: { fontWeight: '800', color: colors.primary, fontSize: 18, marginVertical: spacing.lg },
});
