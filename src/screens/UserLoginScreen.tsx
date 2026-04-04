import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../constants/theme';
import { NexgenTextInput } from '../components/NexgenTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import type { RootStackParamList } from '../navigation/types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'UserLogin'> };

export function UserLoginScreen({ navigation }: Props) {
  const { loginUser } = useAuth();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [resend, setResend] = useState(30);
  const refs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

  const validPhone = phone.replace(/\D/g, '').length === 10;

  const sendOtp = async () => {
    setErr('');
    setLoading(true);
    try {
      const r = await authService.requestOtp(phone.replace(/\D/g, ''));
      if (!r.ok) setErr(r.message);
      else {
        setOtpSent(true);
        setResend(30);
        setTimeout(() => refs[0].current?.focus(), 100);
        const iv = setInterval(() => setResend((s) => (s <= 0 ? 0 : s - 1)), 1000);
        setTimeout(() => clearInterval(iv), 31000);
      }
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setErr('');
    setLoading(true);
    try {
      const code = otp.join('');
      const ok = await loginUser(phone.replace(/\D/g, ''), code);
      if (!ok) setErr('Invalid OTP. Mock: use 1234');
      else navigation.replace('MainTabs');
    } finally {
      setLoading(false);
    }
  };

  const onOtpChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 3) refs[i + 1].current?.focus();
  };

  return (
    <View style={styles.root}>
      <View style={styles.logo}>
        <Text style={styles.logoN}>N</Text>
      </View>
      <Text style={styles.title}>NEXGEN</Text>
      <Text style={styles.h1}>Login</Text>
      <Text style={styles.sub}>Enter your mobile number to get started.</Text>
      <NexgenTextInput
        prefix="+91"
        placeholder="Enter 10-digit mobile number"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
        editable={!otpSent}
      />
      {otpSent ? (
        <View style={styles.otpRow}>
          {otp.map((d, i) => (
            <TextInput
              key={i}
              ref={refs[i]}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={d}
              onChangeText={(t) => onOtpChange(i, t)}
            />
          ))}
        </View>
      ) : null}
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <PrimaryButton
        title={otpSent ? 'Verify & Login' : 'Get OTP'}
        onPress={otpSent ? verify : sendOtp}
        disabled={!validPhone}
        loading={loading}
      />
      {otpSent ? (
        <Pressable disabled={resend > 0} onPress={sendOtp} style={styles.resend}>
          <Text style={[styles.resendTxt, resend > 0 && styles.resendDis]}>
            {resend > 0 ? `Resend OTP in 0:${resend.toString().padStart(2, '0')}` : 'Resend OTP'}
          </Text>
        </Pressable>
      ) : null}
      <Pressable onPress={() => navigation.navigate('Register')} style={styles.link}>
        <Text style={styles.linkTxt}>New user? Register</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('PartnerLogin')} style={styles.link}>
        <Text style={styles.linkTxt}>Login as Service Partner</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, padding: spacing.lg, paddingTop: 48 },
  logo: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoN: { fontSize: 32, fontWeight: '900', color: colors.white },
  title: { textAlign: 'center', fontSize: 20, fontWeight: '800', color: colors.charcoal, marginTop: spacing.sm },
  h1: { fontSize: 22, fontWeight: '800', marginTop: spacing.xl },
  sub: { color: colors.grey, marginBottom: spacing.lg },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.lg, justifyContent: 'center' },
  otpBox: {
    width: 48,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
  err: { color: colors.error, marginBottom: spacing.sm },
  resend: { marginTop: spacing.md, alignItems: 'center' },
  resendTxt: { color: colors.primary, fontWeight: '600' },
  resendDis: { color: colors.grey },
  link: { marginTop: spacing.md, alignItems: 'center' },
  linkTxt: { color: colors.primary, fontWeight: '600' },
});
