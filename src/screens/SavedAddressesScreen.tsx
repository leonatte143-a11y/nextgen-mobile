import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

const STORAGE_KEY = 'nexgen_saved_addresses';

type SavedAddress = { id: string; label: string; line: string };

export function SavedAddressesScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, refreshProfile } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [label, setLabel] = useState('Home');
  const [line, setLine] = useState('');

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
    const next = [...addresses, { id: `addr_${Date.now()}`, label: label.trim() || 'Saved', line: line.trim() }];
    await persist(next);
    if (next.length === 1) {
      await userService.updateProfile({ address: line.trim() });
      await refreshProfile();
    }
    setLine('');
    Alert.alert('Saved', 'Address added.');
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
      <ScrollView contentContainerStyle={styles.body}>
        {addresses.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>{a.label}</Text>
              <Text style={styles.cardLine}>{a.line}</Text>
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
        <PrimaryButton title="Save address" onPress={() => void addAddress()} />
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
  cardLabel: { fontWeight: '800', color: colors.white },
  cardLine: { color: colors.slate, marginTop: 4, fontSize: 14 },
  section: { fontWeight: '800', color: colors.white, marginTop: spacing.lg, marginBottom: spacing.sm },
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
});
