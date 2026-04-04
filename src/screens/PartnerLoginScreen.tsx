import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../constants/theme';
import { NexgenTextInput } from '../components/NexgenTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import type { RootStackParamList } from '../navigation/types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'PartnerLogin'> };

export function PartnerLoginScreen({ navigation }: Props) {
  const { loginPartner } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const go = async () => {
    setErr('');
    setLoading(true);
    try {
      await authService.requestOtp(phone.replace(/\D/g, ''));
      const ok = await loginPartner(phone.replace(/\D/g, ''), otp);
      if (!ok) setErr('Use 10-digit phone and OTP 1234 (mock).');
      else navigation.replace('PartnerHome');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.h1}>Partner Login</Text>
      <Text style={styles.sub}>Same mock OTP flow. Use 1234 after Get OTP.</Text>
      <NexgenTextInput
        prefix="+91"
        placeholder="Mobile"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
      />
      <NexgenTextInput
        placeholder="OTP (1234)"
        keyboardType="number-pad"
        maxLength={4}
        value={otp}
        onChangeText={setOtp}
      />
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <PrimaryButton title="Get OTP & Login" onPress={go} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, padding: spacing.lg, paddingTop: 48 },
  h1: { fontSize: 22, fontWeight: '800' },
  sub: { color: colors.grey, marginVertical: spacing.md },
  err: { color: colors.error, marginBottom: spacing.sm },
});
