import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { logoutUser } = useAuth();
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  const [c, setC] = useState(false);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.section}>Notifications</Text>
      <Row label="Booking updates" value={a} onChange={setA} />
      <Row label="Special offers" value={b} onChange={setB} />
      <Row label="App updates" value={c} onChange={setC} />
      <PrimaryButton title="Manage payment methods" variant="outline" onPress={() => {}} />
      <View style={{ height: spacing.lg }} />
      <PrimaryButton
        title="Logout"
        variant="danger"
        onPress={async () => {
          await logoutUser();
          navigation.reset({ index: 0, routes: [{ name: 'UserLogin' }] });
        }}
      />
    </ScrollView>
  );
}

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowTxt}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { padding: spacing.lg, paddingTop: 48 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { fontSize: 18, fontWeight: '800' },
  section: { fontWeight: '800', marginBottom: spacing.sm, marginTop: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  rowTxt: { fontWeight: '600', flex: 1 },
});
