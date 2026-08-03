import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../constants/theme';
import { KairoTextInput } from '../components/KairoTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { apiService } from '../services/apiService';
import { BASE_URL } from '../config/api';
import { SHOW_DEBUG_OTP, logOtpEvent } from '../config/debug';
import type { RootStackParamList } from '../navigation/types';
import { getCurrentCoords, requestLocationPermission } from '../services/locationService';
import { userService } from '../services/userService';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'UserLogin'> };

const RESEND_SEC = 60;

export function UserLoginScreen({ navigation }: Props) {
  const { loginUser } = useAuth();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLength, setOtpLength] = useState(6);
  const [otpDigits, setOtpDigits] = useState<string[]>([]);
  const otpRefs = useRef<Array<TextInput | null>>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [conn, setConn] = useState<'unknown' | 'ok' | 'fail'>('unknown');

  useEffect(() => {
    if (otpSent && otpDigits.length >= otpLength) {
      otpRefs.current[0]?.focus();
    }
  }, [otpSent, otpDigits.length, otpLength]);
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
      logOtpEvent('Requesting OTP', { phone: phone.replace(/\D/g, '') });
      const r = await authService.requestOtp(phone.replace(/\D/g, ''));
      if (!r.ok) {
        logOtpEvent('OTP request failed', { message: r.message });
        setErr(r.message);
      } else {
        logOtpEvent('OTP received', { hasDebugOtp: !!r.debugOtp, expiresInSec: r.expiresInSec });
        const length = r.otpLength ?? 6;
        setOtpSent(true);
        setOtpLength(length);
        setOtpDigits(Array(length).fill(''));
        startResendTimer();
        // Show debug OTP if:
        // 1. Backend returned it (most important for staging)
        // 2. Env var enabled it (EXPO_PUBLIC_SHOW_DEBUG_OTP=1)
        // 3. Dev mode (__DEV__)
        if (r.debugOtp && (SHOW_DEBUG_OTP || r.debugOtp)) {
          logOtpEvent('Displaying debug OTP', { debugOtp: r.debugOtp });
          setDevOtpHint(`🧪 Test OTP: ${r.debugOtp}`);
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
      const code = otpDigits.join('').replace(/\D/g, '').slice(0, otpLength);
      const r = await loginUser(phone.replace(/\D/g, ''), code);
      if (!r.ok) {
        setErr(r.message ?? 'Could not verify OTP.');
      } else {
        const locOk = await requestLocationPermission();
        if (locOk) {
          const coords = await getCurrentCoords();
          if (coords) {
            try {
              await userService.updateProfile({
                latitude: coords.latitude,
                longitude: coords.longitude,
              });
            } catch {
              /* non-blocking */
            }
          }
        }
        navigation.replace('MainTabs');
      }
    } finally {
      setLoading(false);
    }
  };

  const otpComplete = otpDigits.join('').replace(/\D/g, '').length === otpLength;

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

  const editPhone = () => {
    setOtpSent(false);
    setOtpDigits([]);
    setDevOtpHint('');
    setErr('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
      <View style={styles.logo}>
        <Text style={styles.logoN}>K</Text>
      </View>
      <Text style={styles.title}>KAIRO</Text>
      <Text style={styles.h1}>Login</Text>
      <Text style={styles.sub}>Enter your mobile number. We will send a one-time code.</Text>
      <KairoTextInput
        prefix="+91"
        placeholder="Enter 10-digit mobile number"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
        editable={!otpSent}
      />
      {otpSent ? (
        <View style={styles.otpWrap}>
          <Text style={styles.otpLabel}>{`${otpLength}-digit code`}</Text>
          <View style={styles.otpRow}>
            {Array.from({ length: otpLength }).map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  otpRefs.current[index] = ref;
                }}
                style={styles.otpDigit}
                keyboardType="number-pad"
                maxLength={1}
                value={otpDigits[index] ?? ''}
                onChangeText={(digit) => {
                  const cleaned = digit.replace(/\D/g, '');
                  setOtpDigits((prev) => {
                    const next = [...prev];
                    next[index] = cleaned;
                    return next;
                  });
                  if (cleaned && index < otpLength - 1) {
                    otpRefs.current[index + 1]?.focus();
                  }
                }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
                    otpRefs.current[index - 1]?.focus();
                  }
                }}
                returnKeyType={index === otpLength - 1 ? 'done' : 'next'}
              />
            ))}
          </View>
        </View>
      ) : null}
      {devOtpHint ? (
        <View style={styles.debugOtpBox}>
          <Text style={styles.debugOtpLabel}>Testing OTP</Text>
          <Text style={styles.debugOtpCode}>{devOtpHint}</Text>
        </View>
      ) : null}
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
      <Pressable onPress={() => navigation.navigate('Register')} style={styles.link}>
        <Text style={styles.linkTxt}>New User</Text>
      </Pressable>
      {otpSent ? (
        <Pressable onPress={editPhone} style={styles.wrongNum}>
          <Text style={styles.wrongNumTxt}>Wrong number? Edit</Text>
        </Pressable>
      ) : null}
      <Pressable onPress={() => navigation.navigate('PartnerLogin')} style={styles.link}>
        <Text style={styles.linkTxt}>Login as Service Partner</Text>
      </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  root: { flexGrow: 1, backgroundColor: colors.white, padding: spacing.lg, paddingTop: 48 },
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
  err: { color: colors.error, marginBottom: spacing.sm },
  devHint: { color: colors.grey, fontSize: 12, marginBottom: spacing.sm },
  debugOtpBox: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: '#FFF8E7',
    marginBottom: spacing.md,
  },
  debugOtpLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  debugOtpCode: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
  },
  baseUrl: { color: colors.grey, fontSize: 12, marginBottom: spacing.sm },
  testConn: { alignSelf: 'flex-start', marginBottom: spacing.md },
  testConnTxt: { color: colors.primary, fontWeight: '700' },
  otpWrap: { marginBottom: spacing.md },
  otpLabel: { fontSize: 13, color: colors.grey, marginBottom: spacing.sm, fontWeight: '600' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  otpDigit: {
    width: 50,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 18,
    color: colors.charcoal,
    backgroundColor: colors.white,
  },
  resend: { marginTop: spacing.md, alignItems: 'center' },
  resendTxt: { color: colors.primary, fontWeight: '600' },
  resendDis: { color: colors.grey },
  link: { marginTop: spacing.md, alignItems: 'center' },
  linkTxt: { color: colors.primary, fontWeight: '600' },
  wrongNum: { marginTop: spacing.sm, alignItems: 'center' },
  wrongNumTxt: { color: colors.grey, fontWeight: '600', fontSize: 13 },
});
