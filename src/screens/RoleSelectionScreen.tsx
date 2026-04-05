import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'RoleSelection'> };

export function RoleSelectionScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.logo}>
        <Text style={styles.logoN}>N</Text>
      </View>
      <Text style={styles.title}>NEXGEN</Text>
      <Text style={styles.h1}>Welcome</Text>
      <Text style={styles.sub}>Choose your role to continue</Text>
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Continue as User"
          onPress={() => navigation.replace('UserLogin')}
          style={styles.button}
        />
        <PrimaryButton
          title="Continue as Service Partner"
          onPress={() => navigation.replace('PartnerLogin')}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, padding: spacing.lg, paddingTop: 48, alignItems: 'center', justifyContent: 'center' },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoN: { fontSize: 40, fontWeight: '900', color: colors.white },
  title: { fontSize: 24, fontWeight: '800', color: colors.charcoal, marginBottom: spacing.sm },
  h1: { fontSize: 28, fontWeight: '800', marginBottom: spacing.xs },
  sub: { color: colors.grey, marginBottom: spacing.xl, textAlign: 'center' },
  buttonContainer: { width: '100%', gap: spacing.md },
  button: { marginVertical: 0 },
});