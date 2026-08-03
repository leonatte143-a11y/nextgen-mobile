import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../constants/theme';
import { NexgenTextInput } from '../components/NexgenTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };

export function RegisterScreen({ navigation }: Props) {
  const { registerUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await registerUser({
        firstName,
        lastName,
        email,
        phone: phone.replace(/\D/g, '').slice(0, 10),
      });
      navigation.replace('UserLogin');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not save profile.';
      Alert.alert('Registration failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const ok = firstName.length > 1 && phone.replace(/\D/g, '').length === 10 && acceptedTerms;

  return (
    <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
      <Text style={styles.h1}>Create account</Text>
      <Text style={styles.sub}>Save your profile, then sign in with the OTP sent to your mobile.</Text>
      <NexgenTextInput label="First name" value={firstName} onChangeText={setFirstName} />
      <NexgenTextInput label="Last name" value={lastName} onChangeText={setLastName} />
      <NexgenTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <NexgenTextInput
        label="Phone"
        prefix="+91"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
      />
      <Pressable style={styles.termsRow} onPress={() => setAcceptedTerms((v) => !v)}>
        <Ionicons name={acceptedTerms ? 'checkbox' : 'square-outline'} size={22} color={colors.primary} />
        <Text style={styles.termsTxt}>
          I agree to the KAIRO{' '}
          <Text style={styles.termsLink} onPress={() => navigation.navigate('Terms')}>
            Terms and Conditions
          </Text>
        </Text>
      </Pressable>
      <PrimaryButton title="Save & go to Login" onPress={save} disabled={!ok} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: spacing.lg, paddingTop: 48, backgroundColor: colors.white, flexGrow: 1 },
  h1: { fontSize: 22, fontWeight: '800', color: colors.charcoal },
  sub: { color: colors.grey, marginBottom: spacing.lg, marginTop: spacing.sm },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  termsTxt: { flex: 1, color: colors.charcoal, fontSize: 13 },
  termsLink: { color: colors.primary, fontWeight: '700' },
});
