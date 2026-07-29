import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
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
import { SHOW_DEBUG_OTP } from '../config/debug';
import { logAuth } from '../lib/devLog';
import { MAIN_CATEGORIES } from '../data/serviceCatalog';
import type { RootStackParamList } from '../navigation/types';

const ALL_PARTNER_SERVICES = Array.from(
  new Set(MAIN_CATEGORIES.flatMap((category) => category.subServices.map((service) => service.title))),
);

const ID_TYPES = ['Aadhaar', 'PAN', 'Driving License', 'Voter ID'] as const;
type IdType = (typeof ID_TYPES)[number];

const REGISTRATION_FEE = 49;

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'PartnerRegister'> };

export function PartnerRegisterFlowScreen({ navigation }: Props) {
  const [step, setStep] = useState<'details' | 'payment'>('details');

  // Step 1 — Profile & KYC
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLength, setOtpLength] = useState(6);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [workLocation, setWorkLocation] = useState('');
  const [pincode, setPincode] = useState('');
  const [idType, setIdType] = useState<IdType | null>(null);
  const [idTypeOpen, setIdTypeOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');

  const [paying, setPaying] = useState(false);

  const sendOtp = async () => {
    const digits = phone.replace(/\D/g, '').slice(0, 10);
    if (digits.length !== 10) {
      Alert.alert('Phone', 'Enter 10 digits first.');
      return;
    }
    setOtpSending(true);
    setDevOtpHint('');
    try {
      const r = await authService.requestOtp(digits);
      if (!r.ok) {
        Alert.alert('OTP', r.message || 'Could not send OTP.');
        return;
      }
      setOtpVisible(true);
      setOtpVerified(false);
      setOtpLength(r.otpLength ?? 6);
      setOtpCode('');
      if (r.debugOtp && (SHOW_DEBUG_OTP || r.debugOtp)) {
        setDevOtpHint(`🧪 Test OTP: ${r.debugOtp}`);
      }
      logAuth('partner_register_otp_sent', { phoneLast4: digits.slice(-4), otpLength: r.otpLength });
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    const digits = phone.replace(/\D/g, '').slice(0, 10);
    if (otpCode.length !== otpLength) return;
    setOtpVerifying(true);
    try {
      const r = await authService.verifyOtp(digits, otpCode);
      if (!r.ok) {
        Alert.alert('OTP', r.message || 'Incorrect OTP. Try again.');
        return;
      }
      setOtpVerified(true);
    } finally {
      setOtpVerifying(false);
    }
  };

  const canProceed =
    name.trim().length > 1 &&
    phone.length === 10 &&
    otpVerified &&
    selectedCategories.length > 0 &&
    workLocation.trim().length > 1 &&
    pincode.trim().length >= 6 &&
    !!idType &&
    acceptedTerms;

  const onNext = () => {
    if (!otpVerified) {
      Alert.alert('Verify mobile', 'Please verify your mobile number with OTP first.');
      return;
    }
    if (!acceptedTerms) {
      Alert.alert('Terms required', 'Please accept NEXGEN terms and conditions to continue.');
      return;
    }
    if (!canProceed) {
      Alert.alert('Incomplete', 'Please fill in all the required fields.');
      return;
    }
    setStep('payment');
  };

  const completeRegistration = async () => {
    setPaying(true);
    const digits = phone.replace(/\D/g, '').slice(0, 10);
    try {
      // Mock payment capture — replace with a real gateway (Razorpay/PayU/etc.) integration.
      await new Promise((resolve) => setTimeout(resolve, 900));

      const profile = await partnerService.applyOnboarding({
        phone: digits,
        name: name.trim(),
        serviceCategory: selectedCategories[0],
        categories: selectedCategories,
        workLocation: workLocation.trim(),
        skills: [...selectedCategories, `pin:${pincode.trim()}`, `idType:${idType}`],
      });
      logAuth('partner_register_saved', { partnerId: profile.id, phoneLast4: digits.slice(-4) });
      Alert.alert(
        'NEXGEN Partner',
        'Registration and payment complete. On the partner login screen, request an OTP to sign in.',
      );
      navigation.replace('PartnerLogin');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not save registration.';
      logAuth('partner_register_failed', { message: msg });
      Alert.alert('Registration failed', msg);
    } finally {
      setPaying(false);
    }
  };

  if (step === 'payment') {
    return (
      <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Complete Registration</Text>
        <View style={styles.payCard}>
          <Ionicons name="card-outline" size={40} color={colors.primary} />
          <Text style={styles.payTitle}>One-time registration fee</Text>
          <Text style={styles.paySub}>
            To activate your NEXGEN Partner account and start receiving job requests, complete the
            one-time registration payment below.
          </Text>
          <Text style={styles.payAmount}>₹{REGISTRATION_FEE}</Text>
        </View>
        <PrimaryButton
          title={paying ? 'Processing payment…' : `Pay ₹${REGISTRATION_FEE} to complete registration`}
          onPress={completeRegistration}
          loading={paying}
        />
        <Pressable onPress={() => setStep('details')} style={styles.back} disabled={paying}>
          <Text style={styles.backTxt}>Back</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
      <Text style={styles.h1}>Step 1 — Profile & KYC</Text>

      <NexgenTextInput label="Full Name" value={name} onChangeText={setName} />

      <NexgenTextInput
        label="Mobile Number"
        prefix="+91"
        value={phone}
        keyboardType="number-pad"
        maxLength={10}
        onChangeText={(v) => {
          setPhone(v.replace(/\D/g, '').slice(0, 10));
          setOtpVerified(false);
          setOtpVisible(false);
        }}
      />
      <Pressable onPress={sendOtp} disabled={otpSending || phone.length !== 10} style={styles.otpLink}>
        <Text style={styles.otpLinkTxt}>{otpSending ? 'Sending OTP…' : 'Send OTP'}</Text>
      </Pressable>
      {otpVisible ? (
        <View style={styles.otpRow}>
          <View style={{ flex: 1 }}>
            <NexgenTextInput
              label={`${otpLength}-digit OTP`}
              value={otpCode}
              keyboardType="number-pad"
              maxLength={otpLength}
              onChangeText={(v) => {
                setOtpCode(v.replace(/\D/g, '').slice(0, otpLength));
                setOtpVerified(false);
              }}
            />
          </View>
          {otpVerified ? (
            <View style={styles.otpVerifiedBadge}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <Text style={styles.otpVerifiedTxt}>Verified</Text>
            </View>
          ) : (
            <Pressable
              style={styles.otpVerifyBtn}
              onPress={verifyOtp}
              disabled={otpVerifying || otpCode.length !== otpLength}
            >
              <Text style={styles.otpVerifyTxt}>{otpVerifying ? 'Checking…' : 'Verify'}</Text>
            </Pressable>
          )}
        </View>
      ) : null}
      {devOtpHint ? (
        <View style={styles.debugOtpBox}>
          <Text style={styles.debugOtpLabel}>Testing OTP</Text>
          <Text style={styles.debugOtpCode}>{devOtpHint}</Text>
        </View>
      ) : null}

      <Text style={styles.lab}>Service Categories</Text>
      <Pressable style={styles.dropdown} onPress={() => setCategoriesOpen(true)}>
        <Text style={styles.dropdownTxt} numberOfLines={1}>
          {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Select the services you offer'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.grey} />
      </Pressable>

      <NexgenTextInput label="Work Location" value={workLocation} onChangeText={setWorkLocation} />

      <NexgenTextInput
        label="Pincode"
        value={pincode}
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={(v) => setPincode(v.replace(/\D/g, '').slice(0, 6))}
      />

      <Text style={styles.lab}>ID Type</Text>
      <Pressable style={styles.dropdown} onPress={() => setIdTypeOpen(true)}>
        <Text style={styles.dropdownTxt}>{idType ?? 'Select an ID type'}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.grey} />
      </Pressable>

      <Pressable style={styles.termsRow} onPress={() => setAcceptedTerms((v) => !v)}>
        <Ionicons name={acceptedTerms ? 'checkbox' : 'square-outline'} size={22} color={colors.primary} />
        <Text style={styles.termsTxt}>Please accept NEXGEN terms and conditions to continue.</Text>
      </Pressable>

      <PrimaryButton title="Next" onPress={onNext} disabled={!canProceed} />

      <Modal visible={categoriesOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select service categories</Text>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.chips}>
                {ALL_PARTNER_SERVICES.map((option) => {
                  const selected = selectedCategories.includes(option);
                  return (
                    <Pressable
                      key={option}
                      style={[styles.chip, selected && styles.chipOn]}
                      onPress={() =>
                        setSelectedCategories((prev) =>
                          prev.includes(option) ? prev.filter((c) => c !== option) : [...prev, option],
                        )
                      }
                    >
                      <Text style={[styles.chipTxt, selected && styles.chipOnTxt]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <PrimaryButton title="Done" onPress={() => setCategoriesOpen(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={idTypeOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select ID type</Text>
            {ID_TYPES.map((option) => (
              <Pressable
                key={option}
                style={styles.idOption}
                onPress={() => {
                  setIdType(option);
                  setIdTypeOpen(false);
                }}
              >
                <Text style={styles.idOptionTxt}>{option}</Text>
                {idType === option ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
              </Pressable>
            ))}
            <Pressable style={styles.modalCancel} onPress={() => setIdTypeOpen(false)}>
              <Text style={styles.modalCancelTxt}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: spacing.lg, paddingTop: 40, backgroundColor: colors.white, flexGrow: 1 },
  h1: { fontSize: 20, fontWeight: '800', color: colors.charcoal, marginBottom: spacing.lg },
  lab: { fontSize: 14, fontWeight: '600', color: colors.grey, marginTop: spacing.md, marginBottom: 8 },
  otpLink: { marginBottom: spacing.md },
  otpLinkTxt: { color: colors.primary, fontWeight: '700' },
  otpRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  otpVerifyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  otpVerifyTxt: { color: colors.white, fontWeight: '700' },
  otpVerifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  otpVerifiedTxt: { color: colors.success, fontWeight: '700', fontSize: 12 },
  debugOtpBox: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: '#FFF8E7',
    marginBottom: spacing.md,
  },
  debugOtpLabel: { fontSize: 12, fontWeight: '600', color: colors.primary, marginBottom: spacing.xs },
  debugOtpCode: { fontSize: 20, fontWeight: '700', color: colors.primary, letterSpacing: 4 },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.greyLight,
  },
  dropdownTxt: { flex: 1, color: colors.charcoal, fontWeight: '600' },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  termsTxt: { flex: 1, color: colors.charcoal, fontSize: 13 },
  back: { marginTop: spacing.lg, alignItems: 'center' },
  backTxt: { color: colors.primary, fontWeight: '700' },
  payCard: {
    alignItems: 'center',
    backgroundColor: colors.orangeTint,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  payTitle: { fontSize: 17, fontWeight: '800', color: colors.navy, marginTop: spacing.sm },
  paySub: { color: colors.charcoal, textAlign: 'center', lineHeight: 20 },
  payAmount: { fontSize: 36, fontWeight: '900', color: colors.primary, marginTop: spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.lg },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: spacing.md },
  modalScroll: { marginBottom: spacing.md },
  modalCancel: { padding: spacing.md, alignItems: 'center' },
  modalCancelTxt: { color: colors.grey, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.greyLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.orangeTint, borderColor: colors.primary },
  chipTxt: { fontSize: 13, fontWeight: '600', color: colors.charcoal },
  chipOnTxt: { color: colors.primary, fontWeight: '800' },
  idOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  idOptionTxt: { fontSize: 15, color: colors.charcoal, fontWeight: '600' },
});
