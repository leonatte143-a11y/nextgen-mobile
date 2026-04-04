import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
    } finally {
      setLoading(false);
    }
  };

  const ok = firstName.length > 1 && phone.replace(/\D/g, '').length === 10;

  return (
    <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
      <Text style={styles.h1}>Create account</Text>
      <Text style={styles.sub}>Mock registration — then sign in with OTP (1234).</Text>
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
      <PrimaryButton title="Save & go to Login" onPress={save} disabled={!ok} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: spacing.lg, paddingTop: 48, backgroundColor: colors.white, flexGrow: 1 },
  h1: { fontSize: 22, fontWeight: '800', color: colors.charcoal },
  sub: { color: colors.grey, marginBottom: spacing.lg, marginTop: spacing.sm },
});
