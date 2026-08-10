import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PartnerSettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { logoutPartner } = useAuth();

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.body, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.section}>Preferences</Text>
      <NavRow icon="globe-outline" label="Language" onPress={() => navigation.navigate('Language')} />

      <Text style={styles.section}>Support</Text>
      <NavRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => navigation.navigate('Privacy')} />
      <NavRow icon="document-text-outline" label="Terms of Service" onPress={() => navigation.navigate('Terms')} />
      <NavRow icon="alert-circle-outline" label="Report an Issue" onPress={() => navigation.navigate('Conversations', { role: 'partner' })} />
      <View style={styles.versionRow}>
        <Text style={styles.versionTxt}>KAIRO Partner v{APP_VERSION}</Text>
      </View>

      <Text style={styles.section}>Actions</Text>
      <PrimaryButton
        title="Logout"
        variant="danger"
        onPress={async () => {
          await logoutPartner();
          navigation.reset({ index: 0, routes: [{ name: 'UserLogin' }] });
        }}
      />
    </ScrollView>
  );
}

function NavRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
      <Text style={styles.rowTxt}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.grey} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
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
  versionRow: { alignItems: 'center', paddingVertical: spacing.md },
  versionTxt: { color: colors.grey, fontSize: 12 },
});
