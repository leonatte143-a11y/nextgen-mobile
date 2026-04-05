import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../constants/theme';
import { NexgenTextInput } from '../components/NexgenTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { partnerService } from '../services/partnerService';
import type { RootStackParamList } from '../navigation/types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'PartnerRegister'> };

export function PartnerRegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length > 2 && phone.replace(/\D/g, '').length === 10 && bankName.trim().length > 2 && bankAccount.trim().length > 3;

  const register = async () => {
    setLoading(true);
    try {
      await partnerService.updateProfile({
        name: name.trim(),
        phone: phone.replace(/\D/g, '').slice(0, 10),
        bankName: bankName.trim(),
        bankAccount: bankAccount.trim(),
        skills: ['Fan Repair', 'Switchboard Fix'],
        categories: ['Electrician', 'Home Repair'],
      });
      Alert.alert('Partner onboarding saved', 'Your profile is ready. Please login with OTP 1234.');
      navigation.replace('PartnerLogin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
      <Text style={styles.h1}>Partner Onboarding</Text>
      <Text style={styles.sub}>Register as a service partner with mock onboarding data.</Text>
      <NexgenTextInput label="Full name" value={name} onChangeText={setName} />
      <NexgenTextInput
        label="Mobile"
        prefix="+91"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
      />
      <NexgenTextInput label="Bank name" value={bankName} onChangeText={setBankName} />
      <NexgenTextInput label="Account number" value={bankAccount} onChangeText={setBankAccount} />
      <PrimaryButton title="Save onboarding" onPress={register} disabled={!canSubmit} loading={loading} />
      <View style={styles.footer}>
        <Text style={styles.note}>After save, login using the same mobile number and OTP 1234.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: spacing.lg, paddingTop: 48, backgroundColor: colors.white, flexGrow: 1 },
  h1: { fontSize: 22, fontWeight: '800', color: colors.charcoal },
  sub: { color: colors.grey, marginBottom: spacing.lg, marginTop: spacing.sm },
  footer: { marginTop: spacing.lg },
  note: { color: colors.grey, fontSize: 13, lineHeight: 20 },
});
