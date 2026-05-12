import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../constants/theme';
import { NexgenTextInput } from '../components/NexgenTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { apiService } from '../services/apiService';
import { BASE_URL } from '../config/api';
import type { RootStackParamList } from '../navigation/types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'PartnerLogin'> };

const RESEND_SEC = 60;

export function PartnerLoginScreen({ navigation }: Props) {
  const { loginPartner } = useAuth();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLength, setOtpLength] = useState(6);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [conn, setConn] = useState<'unknown' | 'ok' | 'fail'>('unknown');
  const [resend, setResend] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const validPhone = phone.replace(/\D/g, '').length === 10;

  const startResendTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setResend(RESEND_SEC);
    intervalRef.current = setInterval(() => {
      setResend((s) => {
        if (s <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    setErr('');
    setDevOtpHint('');
    setLoading(true);
    try {
      const r = await authService.requestOtp(phone.replace(/\D/g, ''));
      if (!r.ok) setErr(r.message);
      else {
        setOtpSent(true);
        setOtpLength(r.otpLength ?? 6);
        setOtpCode('');
        startResendTimer();
        if (__DEV__ && r.debugOtp) {
          setDevOtpHint(`Dev: OTP ${r.debugOtp} (server OTP_DEBUG_RESPONSE)`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setErr('');
    setLoading(true);
    try {
      const code = otpCode.replace(/\D/g, '').slice(0, otpLength);
      const r = await loginPartner(phone.replace(/\D/g, ''), code);
      if (!r.ok) setErr(r.message ?? 'Could not sign in.');
      else navigation.replace('PartnerHome');
    } finally {
      setLoading(false);
    }
  };

  const otpComplete = otpCode.replace(/\D/g, '').length === otpLength;

  const testConnection = async () => {
    setErr('');
    setConn('unknown');
    try {
      await apiService.health();
      setConn('ok');
    } catch (e: unknown) {
      setConn('fail');
      const msg = e instanceof Error ? e.message : 'Network request failed';
      setErr(msg);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.h1}>Partner Login</Text>
      <Text style={styles.sub}>Request an OTP on your registered mobile, then enter the code.</Text>
      <NexgenTextInput
        prefix="+91"
        placeholder="10-digit mobile"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
        editable={!otpSent}
      />
      {otpSent ? (
        <NexgenTextInput
          label={`${otpLength}-digit code`}
          placeholder={`Enter ${otpLength}-digit OTP`}
          keyboardType="number-pad"
          maxLength={otpLength}
          value={otpCode}
          onChangeText={(t) => setOtpCode(t.replace(/\D/g, '').slice(0, otpLength))}
        />
      ) : null}
      {devOtpHint ? <Text style={styles.devHint}>{devOtpHint}</Text> : null}
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <Text style={styles.baseUrl}>API: {BASE_URL}</Text>
      <Pressable onPress={testConnection} style={styles.testConn}>
        <Text style={styles.testConnTxt}>
          Test connection {conn === 'ok' ? '✓' : conn === 'fail' ? '✕' : ''}
        </Text>
      </Pressable>
      <PrimaryButton
        title={otpSent ? 'Verify & Login' : 'Get OTP'}
        onPress={otpSent ? verify : sendOtp}
        disabled={!validPhone || (otpSent && !otpComplete)}
        loading={loading}
      />
      {otpSent ? (
        <Pressable disabled={resend > 0} onPress={sendOtp} style={styles.resend}>
          <Text style={[styles.resendTxt, resend > 0 && styles.resendDis]}>
            {resend > 0 ? `Resend OTP in 0:${resend.toString().padStart(2, '0')}` : 'Resend OTP'}
          </Text>
        </Pressable>
      ) : null}
      <Text style={styles.registerLink} onPress={() => navigation.navigate('PartnerRegister')}>
        New partner? Register here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, padding: spacing.lg, paddingTop: 48 },
  h1: { fontSize: 22, fontWeight: '800' },
  sub: { color: colors.grey, marginVertical: spacing.md },
  err: { color: colors.error, marginBottom: spacing.sm },
  devHint: { color: colors.grey, fontSize: 12, marginBottom: spacing.sm },
  baseUrl: { color: colors.grey, fontSize: 12, marginBottom: spacing.sm },
  testConn: { alignSelf: 'flex-start', marginBottom: spacing.md },
  testConnTxt: { color: colors.primary, fontWeight: '700' },
  resend: { marginTop: spacing.md, alignItems: 'center' },
  resendTxt: { color: colors.primary, fontWeight: '600' },
  resendDis: { color: colors.grey },
  registerLink: { marginTop: spacing.md, color: colors.primary, fontWeight: '700' },
});
