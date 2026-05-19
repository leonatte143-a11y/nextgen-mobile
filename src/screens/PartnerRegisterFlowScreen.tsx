import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NexgenTextInput } from '../components/NexgenTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import { authService } from '../services/authService';
import { partnerService } from '../services/partnerService';
import { logAuth } from '../lib/devLog';
import type { RootStackParamList } from '../navigation/types';

const CATS = [
  'Electrician',
  'Plumber',
  'Drivers',
  'Home Repair',
] as const;
const LOCATIONS = [
  'Rajahmundry',
  'Guntur',
] as const;

const Q10 = [
  { q: 'NEXGEN service fee to partner is always shown to customer as?', o: ['GST 18%', '10% only', 'Hidden', '0%'] as const, a: 0 },
  { q: 'Before job start, who confirms OTP on site?', o: ['Customer & partner', 'Only partner', 'Admin only', 'Nobody'] as const, a: 0 },
  { q: 'Cancellations with visiting fee to wallet are?', o: ['UI mock only', 'Real cash', 'Paid daily', 'Never'] as const, a: 0 },
  { q: 'Payout threshold is (mock topic)?', o: ['On wallet screen', 'Instant always', 'Never', '1 year'] as const, a: 0 },
  { q: 'RMP in app refers to (mock context)?', o: ['Rural med practitioner', 'Racing', 'Rental', 'Random'] as const, a: 0 },
  { q: 'Geo-fence in partner app (mock) controls?', o: ['Job radius', 'App theme', 'Battery', 'Call recording'] as const, a: 0 },
  { q: 'Verified badge is shown to?', o: ['Users', 'Nobody', 'Only you', 'Govt only'] as const, a: 0 },
  { q: 'Mock wallet credit here is for?', o: ['Demo', 'Lawsuit', 'Loans', 'Laundry'] as const, a: 0 },
  { q: 'Academy pass score is required at least?', o: ['8/10 (mock rule)', '0/10', '2/10', '10/10 or fail'] as const, a: 0 },
  { q: 'Partner registration flow ends with?', o: ['Go to partner login', 'Uninstall', 'Reboot phone', 'Pay ₹5000'] as const, a: 0 },
] as const;

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'PartnerRegister'> };

export function PartnerRegisterFlowScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  // Step 0 — KYC
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLength, setOtpLength] = useState(6);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [category, setCategory] = useState<typeof CATS[number]>(CATS[0]);
  const [workLocation, setWorkLocation] = useState<typeof LOCATIONS[number]>(LOCATIONS[0]);
  const [idType, setIdType] = useState<'Aadhaar' | 'Voter ID'>('Aadhaar');
  const [idNo, setIdNo] = useState('');
  const [idFront, setIdFront] = useState(false);
  const [idBack, setIdBack] = useState(false);
  const [selfie, setSelfie] = useState(false);
  // Step 1 — legal
  const [addr, setAddr] = useState('');
  const [pin, setPin] = useState('');
  const [exp, setExp] = useState('0–1 yrs');
  const [dl, setDl] = useState('');
  const [pcc, setPcc] = useState(false);
  const [bName, setBName] = useState('');
  const [bAcc, setBAcc] = useState('');
  const [bIfsc, setBIfsc] = useState('');
  // Step 2 — skills
  const [certFile, setCertFile] = useState(false);
  const [certNo, setCertNo] = useState('');
  // Academy
  const [qIdx, setQIdx] = useState(0);
  const [qScore, setQScore] = useState(0);
  const [qAns, setQAns] = useState<number | null>(null);
  const [videoSeen, setVideoSeen] = useState(false);
  const [saving, setSaving] = useState(false);

  const needsDl = category === 'Drivers';
  const quizPass = qIdx >= Q10.length ? qScore >= 8 : null;

  const sendOtp = async () => {
    const digits = phone.replace(/\D/g, '').slice(0, 10);
    if (digits.length !== 10) {
      Alert.alert('Phone', 'Enter 10 digits first.');
      return;
    }
    setOtpSending(true);
    try {
      const r = await authService.requestOtp(digits);
      if (!r.ok) {
        Alert.alert('OTP', r.message || 'Could not send OTP.');
        return;
      }
      setOtpVisible(true);
      setOtpLength(r.otpLength ?? 6);
      setOtpCode('');
      logAuth('partner_register_otp_sent', { phoneLast4: digits.slice(-4), otpLength: r.otpLength });
    } finally {
      setOtpSending(false);
    }
  };

  const onQuizPick = (idx: number) => {
    setQAns(idx);
  };

  const onQuizNext = () => {
    if (qAns === null) return;
    if (Q10[qIdx].a === qAns) setQScore((s) => s + 1);
    if (qIdx < Q10.length - 1) {
      setQIdx((i) => i + 1);
      setQAns(null);
    } else {
      setQIdx((i) => i + 1);
    }
  };

  const canNext0 =
    name.trim().length > 1 &&
    phone.length === 10 &&
    (otpVisible ? otpCode.replace(/\D/g, '').length === otpLength : true) &&
    idNo.length > 3 &&
    idFront &&
    idBack &&
    selfie;

  const canNext1 =
    addr.length > 4 && pin.length >= 6 && bName.length > 2 && bAcc.length > 4 && bIfsc.length > 8;
  if (needsDl && !dl) {
    // handled in button disabled: !needsDl || dl
  }
  const canNext2 = certFile && certNo.length > 2;
  const canNext3 = videoSeen && qIdx >= Q10.length && quizPass === true;

  const finish = async () => {
    if (!canNext0 || !canNext1 || !canNext2 || !canNext3) {
      Alert.alert('Incomplete', 'Check all required fields (mock).');
      return;
    }
    if (quizPass !== true) {
      Alert.alert('Academy', 'You need 8/10. Retry quiz (mock).');
      setQIdx(0);
      setQScore(0);
      setQAns(null);
      return;
    }
    setSaving(true);
    const digits = phone.replace(/\D/g, '').slice(0, 10);
    try {
      const profile = await partnerService.applyOnboarding({
        phone: digits,
        name: name.trim(),
        serviceCategory: category,
        categories: [category],
        primaryCity: workLocation,
        skills: [
          category,
          certNo,
          `exp:${exp}`,
          `addr:${addr.slice(0, 80)}`,
          `pin:${pin}`,
          ...(needsDl && dl ? [`DL:${dl}`] : []),
        ],
        bankName: `${bName} · IFSC ${bIfsc}`,
        bankAccount: bAcc,
        trainingProgress: 100,
      });
      logAuth('partner_register_saved', { partnerId: profile.id, phoneLast4: digits.slice(-4) });
      Alert.alert(
        'NEXGEN Partner',
        'Registration saved. On the partner login screen, request an OTP to sign in.',
      );
      navigation.replace('PartnerLogin');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not save registration.';
      logAuth('partner_register_failed', { message: msg });
      Alert.alert('Registration failed', msg);
    } finally {
      setSaving(false);
    }
  };

  if (step === 0) {
    return (
      <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Step 1 — Profile and KYC</Text>
        <NexgenTextInput label="Name" value={name} onChangeText={setName} />
        <NexgenTextInput
          label="Phone"
          prefix="+91"
          value={phone}
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
        />
        <Pressable onPress={sendOtp} disabled={otpSending} style={styles.otpLink}>
          <Text style={styles.otpLinkTxt}>{otpSending ? 'Sending OTP…' : 'Send OTP to verify mobile'}</Text>
        </Pressable>
        {otpVisible ? (
          <NexgenTextInput
            label={`${otpLength}-digit OTP`}
            value={otpCode}
            keyboardType="number-pad"
            maxLength={otpLength}
            onChangeText={(t) => setOtpCode(t.replace(/\D/g, '').slice(0, otpLength))}
          />
        ) : null}
        <Text style={styles.lab}>Service category</Text>
        <View style={styles.chips}>
          {CATS.map((c) => (
            <Pressable key={c} style={[styles.chip, category === c && styles.chipOn]} onPress={() => setCategory(c)}>
              <Text style={[styles.chipTxt, category === c && styles.chipOnTxt]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.lab}>Work location</Text>
        <View style={styles.chips}>
          {LOCATIONS.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, workLocation === c && styles.chipOn]}
              onPress={() => setWorkLocation(c)}
            >
              <Text style={[styles.chipTxt, workLocation === c && styles.chipOnTxt]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.lab}>ID type</Text>
        <View style={styles.chips}>
          {(['Aadhaar', 'Voter ID'] as const).map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, idType === c && styles.chipOn]}
              onPress={() => setIdType(c as 'Aadhaar' | 'Voter ID')}
            >
              <Text style={[styles.chipTxt, idType === c && styles.chipOnTxt]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <NexgenTextInput label="ID number" value={idNo} onChangeText={setIdNo} />
        <Pressable style={styles.file} onPress={() => setIdFront((x) => !x)}>
          <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
          <Text style={styles.fileTxt}>Upload ID front (mock) {idFront ? ' — saved' : ''}</Text>
        </Pressable>
        <Pressable style={styles.file} onPress={() => setIdBack((x) => !x)}>
          <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
          <Text style={styles.fileTxt}>Upload ID back (mock) {idBack ? ' — saved' : ''}</Text>
        </Pressable>
        <Pressable style={styles.file} onPress={() => setSelfie((x) => !x)}>
          <Ionicons name="camera-outline" size={20} color={colors.primary} />
          <Text style={styles.fileTxt}>Live selfie (mock camera) {selfie ? ' — saved' : ''}</Text>
        </Pressable>
        <PrimaryButton
          title="Next"
          onPress={() => (canNext0 ? setStep(1) : Alert.alert('KYC', 'Complete required field markers.'))}
          disabled={!canNext0}
        />
      </ScrollView>
    );
  }

  if (step === 1) {
    return (
      <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Step 2 — Professional and legal</Text>
        <NexgenTextInput label="Address" value={addr} onChangeText={setAddr} multiline />
        <NexgenTextInput
          label="Pincode"
          value={pin}
          keyboardType="number-pad"
          maxLength={6}
          onChangeText={setPin}
        />
        <Text style={styles.lab}>Experience</Text>
        <View style={styles.chips}>
          {['0–1 yrs', '1–3 yrs', '3+ yrs'].map((e) => (
            <Pressable
              key={e}
              style={[styles.chip, exp === e && styles.chipOn]}
              onPress={() => setExp(e)}
            >
              <Text style={[styles.chipTxt, exp === e && styles.chipOnTxt]}>{e}</Text>
            </Pressable>
          ))}
        </View>
        {needsDl ? (
          <NexgenTextInput
            label="Driving license number"
            value={dl}
            onChangeText={setDl}
          />
        ) : null}
        <Pressable style={styles.file} onPress={() => setPcc((x) => !x)}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <Text style={styles.fileTxt}>PCC upload (mock) {pcc ? ' — saved' : ''}</Text>
        </Pressable>
        <NexgenTextInput label="Account holder" value={bName} onChangeText={setBName} />
        <NexgenTextInput label="Account number" value={bAcc} onChangeText={setBAcc} keyboardType="number-pad" />
        <NexgenTextInput label="IFSC" value={bIfsc} onChangeText={setBIfsc} autoCapitalize="characters" />
        <Text style={styles.noteRed}>A ₹1 verification (mock) will be done on your account.</Text>
        <PrimaryButton
          title="Next"
          onPress={() => {
            if (needsDl && !dl.trim()) {
              Alert.alert('License', 'Driving category requires license number (mock).');
              return;
            }
            if (!canNext1) {
              Alert.alert('Form', 'Fill address, pincode, bank (mock).');
              return;
            }
            setStep(2);
          }}
        />
        <Pressable onPress={() => setStep(0)} style={styles.back}>
          <Text style={styles.backTxt}>Back</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (step === 2) {
    return (
      <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Step 3 — Skills and certification</Text>
        <Pressable style={styles.file} onPress={() => setCertFile((x) => !x)}>
          <Ionicons name="ribbon-outline" size={20} color={colors.primary} />
          <Text style={styles.fileTxt}>Certificate file (mock) {certFile ? ' — saved' : ''}</Text>
        </Pressable>
        <NexgenTextInput label="Certificate number" value={certNo} onChangeText={setCertNo} />
        <PrimaryButton
          title="Next — NEXGEN Academy"
          onPress={() => (canNext2 ? setStep(3) : Alert.alert('Certificate', 'Upload + number (mock).'))}
          disabled={!canNext2}
        />
        <Pressable onPress={() => setStep(1)} style={styles.back}>
          <Text style={styles.backTxt}>Back</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // Academy
  if (step === 3) {
    return (
      <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>NEXGEN Academy</Text>
        <View style={styles.videoPh}>
          <Ionicons name="play" size={40} color={colors.primary} />
          <Text style={styles.videoTxt}>Product training video (placeholder)</Text>
          <PrimaryButton
            title={videoSeen ? 'Marked as watched' : 'Mark as watched (mock)'}
            variant="outline"
            onPress={() => setVideoSeen(true)}
          />
        </View>
        {qIdx < Q10.length && videoSeen ? (
          <View style={styles.quiz}>
            <Text style={styles.qHead}>
              Q{qIdx + 1}/10 (need 8+ correct)
            </Text>
            <Text style={styles.qTxt}>{Q10[qIdx].q}</Text>
            {Q10[qIdx].o.map((op, oi) => (
              <Pressable
                key={op}
                style={[styles.opt, qAns === oi && styles.optOn]}
                onPress={() => onQuizPick(oi)}
              >
                <Text style={styles.optTxt}>{op}</Text>
              </Pressable>
            ))}
            <PrimaryButton
              title={qIdx < Q10.length - 1 ? 'Next question' : 'Finish quiz'}
              onPress={onQuizNext}
              disabled={qAns === null}
            />
          </View>
        ) : !videoSeen ? (
          <Text style={styles.hint}>Watch the short video to unlock the quiz (mock gate).</Text>
        ) : (
          <View style={styles.end}>
            <Text style={styles.hint}>Score: {qScore} / 10 {quizPass ? ' — pass' : ' — fail'}</Text>
            <PrimaryButton
              title="Complete registration (mock save)"
              onPress={finish}
              loading={saving}
              disabled={!canNext3}
            />
            {!quizPass ? (
              <PrimaryButton
                title="Retry quiz"
                variant="outline"
                onPress={() => {
                  setQIdx(0);
                  setQScore(0);
                  setQAns(null);
                }}
              />
            ) : null}
            <Pressable onPress={() => setStep(2)} style={styles.back}>
              <Text style={styles.backTxt}>Back</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  root: { padding: spacing.lg, paddingTop: 40, backgroundColor: colors.white, flexGrow: 1 },
  h1: { fontSize: 20, fontWeight: '800', color: colors.charcoal, marginBottom: spacing.lg },
  lab: { fontSize: 14, fontWeight: '600', color: colors.grey, marginTop: spacing.md, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.full, backgroundColor: colors.greyLight, borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.orangeTint, borderColor: colors.primary },
  chipTxt: { fontSize: 13, fontWeight: '600' },
  chipOnTxt: { color: colors.primary, fontWeight: '800' },
  otpRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg, justifyContent: 'center' },
  otpBox: { width: 40, height: 44, borderWidth: 1, borderColor: colors.primary, textAlign: 'center', fontSize: 20, fontWeight: '800', borderRadius: radius.sm },
  otpLink: { marginBottom: spacing.md },
  otpLinkTxt: { color: colors.primary, fontWeight: '700' },
  file: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: radius.md, padding: spacing.md },
  fileTxt: { color: colors.charcoal, fontWeight: '600' },
  noteRed: { color: colors.error, fontSize: 12, marginBottom: spacing.lg, fontStyle: 'italic' },
  back: { marginTop: spacing.lg, alignItems: 'center' },
  backTxt: { color: colors.primary, fontWeight: '700' },
  videoPh: { minHeight: 200, backgroundColor: colors.orangeTint, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, marginBottom: spacing.lg, gap: spacing.md },
  videoTxt: { fontWeight: '600', color: colors.charcoal, textAlign: 'center' },
  quiz: { marginTop: spacing.lg, gap: spacing.md },
  qHead: { fontWeight: '800' },
  qTxt: { fontSize: 15, fontWeight: '600' },
  opt: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginTop: 8 },
  optOn: { borderColor: colors.primary, backgroundColor: colors.orangeTint },
  optTxt: { color: colors.charcoal },
  hint: { textAlign: 'center', color: colors.grey, margin: spacing.lg },
  end: { gap: spacing.md },
});
