import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { getCurrentCoords, requestLocationPermission } from '../services/locationService';
import { userService } from '../services/userService';

const STORAGE_KEY = 'kairo_saved_addresses';

type SavedAddress = { id: string; label: string; line: string; latitude?: number; longitude?: number };

export function SavedAddressesScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, refreshProfile } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [label, setLabel] = useState('Home');
  const [line, setLine] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const load = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setAddresses(JSON.parse(raw) as SavedAddress[]);
      } catch {
        setAddresses([]);
      }
    } else if (user?.address) {
      setAddresses([{ id: 'default', label: 'Home', line: user.address }]);
    }
  }, [user?.address]);

  useEffect(() => {
    void load();
  }, [load]);

  const persist = async (next: SavedAddress[]) => {
    setAddresses(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addAddress = async () => {
    if (!line.trim()) {
      Alert.alert('Address required', 'Enter a full address line.');
      return;
    }
    const next = [
      ...addresses,
      {
        id: `addr_${Date.now()}`,
        label: label.trim() || 'Saved',
        line: line.trim(),
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
      },
    ];
    await persist(next);
    if (next.length === 1) {
      await userService.updateProfile({ address: line.trim() });
      await refreshProfile();
    }
    setLine('');
    setCoords(null);
    Alert.alert('Saved', 'Address added.');
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const ok = await requestLocationPermission();
      if (!ok) return;
      const c = await getCurrentCoords();
      if (c) setCoords(c);
      else Alert.alert('Location unavailable', 'Could not fetch your current location. Try again.');
    } finally {
      setLocating(false);
    }
  };

  const remove = (id: string) => {
    Alert.alert('Remove address?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => void persist(addresses.filter((a) => a.id !== id)),
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>Saved Addresses</Text>
        <View style={{ width: 24 }} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.body}>
        {addresses.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>{a.label}</Text>
              <Text style={styles.cardLine}>{a.line}</Text>
              {a.latitude != null && a.longitude != null ? (
                <View style={styles.pinRow}>
                  <Ionicons name="location" size={12} color={colors.primary} />
                  <Text style={styles.pinTxt}>Pinned location saved</Text>
                </View>
              ) : null}
            </View>
            <Pressable onPress={() => remove(a.id)}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </Pressable>
          </View>
        ))}
        <Text style={styles.section}>Add new address</Text>
        <TextInput style={styles.input} placeholder="Label (Home, Office)" value={label} onChangeText={setLabel} />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Full address"
          value={line}
          onChangeText={setLine}
          multiline
        />
        <Pressable style={styles.locBtn} onPress={() => void useMyLocation()} disabled={locating}>
          <Ionicons name="locate-outline" size={18} color={colors.primary} />
          <Text style={styles.locTxt}>
            {locating ? 'Fetching location…' : coords ? 'Location pin added ✓' : 'Use my current location as pin'}
          </Text>
        </Pressable>
        <PrimaryButton title="Save address" onPress={() => void addAddress()} />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  title: { flex: 1, textAlign: 'center', color: colors.white, fontWeight: '800', fontSize: 17 },
  body: { padding: spacing.md, paddingBottom: spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardLabel: { fontWeight: '800', color: colors.navy },
  cardLine: { color: colors.slate, marginTop: 4, fontSize: 14 },
  pinRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  pinTxt: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  section: { fontWeight: '800', color: colors.navy, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  locBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  locTxt: { color: colors.primary, fontWeight: '700' },
});
