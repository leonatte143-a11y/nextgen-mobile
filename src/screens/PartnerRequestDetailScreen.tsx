import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveTrackingAdBanner } from '../components/LiveTrackingAdBanner';
import { usePartner } from '../context/PartnerContext';
import { colors, radius, spacing } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { partnerService } from '../services/partnerService';
import type { PartnerStackParamList } from '../navigation/PartnerStackTypes';

type Props = NativeStackScreenProps<PartnerStackParamList, 'PartnerRequestDetail'>;

const CANCEL_REASONS = [
  'Customer unreachable',
  'Vehicle/transport issue',
  'Personal emergency',
  'Wrong address / out of service area',
  'Other',
];

export function PartnerRequestDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    requests,
    markArrived,
    markWorkDone,
    completeJob,
    requestHeavyWorkEstimate,
    declineHeavyWorkEstimate,
    cancelActiveJobWithFee,
    refreshPartner,
  } = usePartner();
  const [estimateOpen, setEstimateOpen] = useState(false);
  const [extraLabor, setExtraLabor] = useState('0');
  const [materialCost, setMaterialCost] = useState('0');
  const [description, setDescription] = useState('Partner recommended motor replacement');
  const [endOtpOpen, setEndOtpOpen] = useState(false);
  const [endOtpInput, setEndOtpInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [confirmingCash, setConfirmingCash] = useState(false);
  const [cancelReasonOpen, setCancelReasonOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const request = requests.find((item) => item.id === route.params.requestId);

  const handleArrived = async () => {
    if (!request) return;
    setActionLoading(true);
    const ok = await markArrived(request.id);
    setActionLoading(false);
    if (!ok) {
      Alert.alert('Error', 'Could not mark arrival. Please try again.');
      return;
    }
    Alert.alert('Arrival confirmed', 'The job has started. Complete the work, then tap Work Done.');
  };

  const handleWorkDone = async () => {
    if (!request) return;
    setActionLoading(true);
    const ok = await markWorkDone(request.id);
    setActionLoading(false);
    if (!ok) {
      Alert.alert('Error', 'Could not mark work as done. Please try again.');
      return;
    }
    Alert.alert('Work marked done', 'Ask the customer for their completion OTP, then tap Complete Job.');
  };

  const handleComplete = async () => {
    if (!request) return;
    if (!endOtpInput.trim()) {
      Alert.alert('Completion OTP required', 'Ask the customer for their completion OTP.');
      return;
    }
    setActionLoading(true);
    const ok = await completeJob(request.id, endOtpInput.trim());
    setActionLoading(false);
    if (!ok) {
      Alert.alert('Invalid OTP', 'The completion OTP did not match. Ask the customer for the end OTP shown in the app.');
      return;
    }
    setEndOtpOpen(false);
    setEndOtpInput('');
    Alert.alert('Job completed', 'The work is finished and earnings are updated.');
    navigation.goBack();
  };

  const handleConfirmCashReceived = async () => {
    if (!request) return;
    setConfirmingCash(true);
    try {
      await partnerService.confirmCashReceived(request.id);
      await refreshPartner();
    } catch {
      Alert.alert('Error', 'Could not confirm cash received. Please try again.');
    } finally {
      setConfirmingCash(false);
    }
  };

  const callCustomer = () => {
    const digits = String(request?.customerPhone || '').replace(/\D/g, '');
    if (digits.length < 10) {
      Alert.alert('Unavailable', 'Customer phone number is not available.');
      return;
    }
    Linking.openURL(`tel:+91${digits.slice(-10)}`);
  };

  const handleSubmitEstimate = async () => {
    if (!request) return;
    const labor = Number(extraLabor) || 0;
    const material = Number(materialCost) || 0;
    if (labor <= 0 && material <= 0) {
      Alert.alert('Invalid estimate', 'Please add at least one extra charge.');
      return;
    }
    setActionLoading(true);
    await requestHeavyWorkEstimate(request.id, {
      extraLabor: labor,
      materialCost: material,
      description: description.trim(),
    });
    setActionLoading(false);
    setEstimateOpen(false);
    Alert.alert('Estimate sent', 'Customer will receive the revised quote and approve the extra charge.');
  };

  const handleDeclineEstimate = async () => {
    if (!request) return;
    Alert.alert(
      'Confirm cancellation',
      'Customer declined the heavy-work quote. A ₹50 visiting fee will be secured for you.',
      [
        { text: 'Keep waiting', style: 'cancel' },
        {
          text: 'Mark cancelled',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            await declineHeavyWorkEstimate(request.id);
            setActionLoading(false);
            Alert.alert('Secured fee', '₹45 has been credited to your wallet for the visit.');
            navigation.goBack();
          },
        },
      ],
    );
  };

  const submitCancelWithReason = async () => {
    if (!request || canceling) return;
    const reason = cancelReason.trim();
    if (!reason) {
      Alert.alert('Reason required', 'Please provide a reason for cancelling this job.');
      return;
    }
    setCanceling(true);
    try {
      await cancelActiveJobWithFee(request.id, reason);
      setCancelReasonOpen(false);
      Alert.alert('Cancelled', '₹50 Visiting Fee credited to your wallet (mock).');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not cancel (mock).');
    } finally {
      setCanceling(false);
    }
  };

  if (!request) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Request not found</Text>
      </View>
    );
  }

  const quote = request.heavyWorkEstimate;
  const isCancelled = request.status === 'cancelled';
  const canCancelActive = request.status === 'pending' || request.status === 'in_progress';

  const statusLabel = useMemo(() => {
    if (isCancelled) return 'Cancelled by customer';
    if (quote?.status === 'pending_user_approval') return 'Quote pending approval';
    return request.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }, [isCancelled, quote?.status, request.status]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]}
    >
      <View style={styles.map}>
        <Ionicons name="navigate-outline" size={32} color={colors.grey} />
        <Text style={styles.mapLabel}>Navigating to customer</Text>
        <Text style={styles.mapSub}>
          {request.distanceKm != null ? `${request.distanceKm} km away` : 'Live location will appear here'}
        </Text>
      </View>

      <LiveTrackingAdBanner />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.sectionText}>{statusLabel}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service</Text>
        <Text style={styles.sectionText}>{request.serviceName}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <Text style={styles.sectionText}>{request.customerName}</Text>
        <Text style={styles.sectionText}>{request.address}</Text>
        <View style={styles.customerActionsRow}>
          {request.customerPhone ? (
            <Pressable onPress={callCustomer} style={styles.callUserBtn}>
              <Text style={styles.callUserTxt}>Call User</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() =>
              navigation.navigate('Chat', {
                role: 'partner',
                bookingId: request.id,
                otherPartyName: request.customerName,
              })
            }
            style={styles.chatUserBtn}
          >
            <Text style={styles.chatUserTxt}>Chat with Customer</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timing</Text>
        <Text style={styles.sectionText}>{request.scheduledAt}</Text>
      </View>
      {request.lineItems?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booked services</Text>
          {request.lineItems.map((li) => (
            <Text key={li.id || li.title} style={styles.sectionText}>
              {li.title} × {li.quantity} — ₹{li.lineTotal}
            </Text>
          ))}
        </View>
      ) : null}
      {request.extraServices?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extra Service</Text>
          {request.extraServices.map((extra) => (
            <Text key={extra.id} style={styles.sectionText}>
              + {extra.name} • ₹{extra.price}
            </Text>
          ))}
        </View>
      ) : null}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.sectionText}>{request.notes || '—'}</Text>
      </View>
      {request.customRequirements ? (
        <View style={styles.customReqBox}>
          <Text style={styles.customReqTitle}>Custom requirements</Text>
          <Text style={styles.customReqText}>{request.customRequirements}</Text>
        </View>
      ) : null}
      {quote ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Heavy Work Quote</Text>
          <Text style={styles.sectionText}>{quote.description}</Text>
          <Text style={styles.sectionText}>Labour ₹{quote.extraLabor}</Text>
          <Text style={styles.sectionText}>Materials ₹{quote.materialCost}</Text>
          <Text style={[styles.sectionText, styles.quoteTotal]}>Total extra ₹{quote.totalExtra}</Text>
          <Text style={styles.hintText}>
            If the customer declines, mark the job cancelled and secure your visiting fee.
          </Text>
        </View>
      ) : null}
      <Pressable
        style={styles.directionButton}
        onPress={() =>
          Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(request.address)}`,
          )
        }
      >
        <Text style={styles.directionText}>Open Directions</Text>
      </Pressable>
      <View style={canCancelActive ? styles.actionCol : styles.buttonRow}>
        {request.status === 'pending' ? (
          <Pressable
            style={[styles.inProgAction, styles.acceptButton]}
            onPress={handleArrived}
            disabled={actionLoading}
          >
            <Text style={styles.acceptText}>I've Arrived</Text>
          </Pressable>
        ) : request.status === 'in_progress' ? (
          <>
            <Pressable
              style={[styles.inProgAction, styles.editQuoteButton]}
              onPress={() => setEstimateOpen(true)}
              disabled={actionLoading || quote?.status === 'pending_user_approval'}
            >
              <Text style={styles.acceptText}>Heavy work quote</Text>
            </Pressable>
            {request.workDoneRequested ? (
              <Pressable
                style={[styles.inProgAction, styles.acceptButton]}
                onPress={() => setEndOtpOpen(true)}
                disabled={actionLoading}
              >
                <Text style={styles.acceptText}>Complete Job</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.inProgAction, styles.acceptButton]}
                onPress={handleWorkDone}
                disabled={actionLoading}
              >
                <Text style={styles.acceptText}>Work Done</Text>
              </Pressable>
            )}
          </>
        ) : isCancelled ? (
          <Text style={styles.statusText}>This request was cancelled by the customer.</Text>
        ) : request.status === 'completed' && request.paymentStatus === 'awaiting_partner_confirmation' ? (
          <Pressable
            style={[styles.inProgAction, styles.acceptButton]}
            onPress={handleConfirmCashReceived}
            disabled={confirmingCash}
          >
            <Text style={styles.acceptText}>Confirm Cash Received</Text>
          </Pressable>
        ) : (
          <Text style={styles.statusText}>This request is {request.status}.</Text>
        )}
      </View>
      {canCancelActive ? (
        <Pressable
          style={[styles.button, styles.cancelBtn, { marginTop: spacing.sm }]}
          onPress={() => {
            if (canceling) return;
            setCancelReason('');
            setCancelReasonOpen(true);
          }}
          disabled={canceling || actionLoading}
        >
          <Text style={styles.cancelBtnTxt}>Cancel job</Text>
        </Pressable>
      ) : null}
      {quote?.status === 'pending_user_approval' ? (
        <Pressable style={styles.declineButton} onPress={handleDeclineEstimate} disabled={actionLoading}>
          <Text style={styles.declineText}>Mark as declined by customer</Text>
        </Pressable>
      ) : null}

      <Modal visible={estimateOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.modalCard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Text style={styles.modalTitle}>Heavy Work Estimate</Text>
            <Text style={styles.modalSub}>Send a revised quote for extra labor or parts.</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={extraLabor}
              onChangeText={setExtraLabor}
              placeholder="Extra labour ₹"
            />
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={materialCost}
              onChangeText={setMaterialCost}
              placeholder="Material cost ₹"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setEstimateOpen(false)}>
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </Pressable>
              <PrimaryButton
                title="Send quote"
                onPress={handleSubmitEstimate}
                loading={actionLoading}
                style={styles.modalSave}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={cancelReasonOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.modalCard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Text style={styles.modalTitle}>Why are you cancelling?</Text>
            <Text style={styles.modalSub}>A reason is required before this job can be cancelled.</Text>
            <View style={styles.cancelReasonChips}>
              {CANCEL_REASONS.map((reasonOption) => (
                <Pressable
                  key={reasonOption}
                  style={[styles.cancelReasonChip, cancelReason === reasonOption && styles.cancelReasonChipOn]}
                  onPress={() => setCancelReason(reasonOption)}
                >
                  <Text
                    style={[
                      styles.cancelReasonChipTxt,
                      cancelReason === reasonOption && styles.cancelReasonChipTxtOn,
                    ]}
                  >
                    {reasonOption}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Type or edit the reason here"
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setCancelReasonOpen(false)}>
                <Text style={styles.modalCancelTxt}>Back</Text>
              </Pressable>
              <PrimaryButton
                title="Confirm cancellation"
                onPress={submitCancelWithReason}
                loading={canceling}
                style={styles.modalSave}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={endOtpOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter Completion OTP</Text>
            <Text style={styles.modalSub}>Ask the customer for the completion OTP after work is done.</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={endOtpInput}
              onChangeText={setEndOtpInput}
              placeholder="4-digit completion OTP"
              maxLength={8}
            />
            <PrimaryButton title="Verify & complete" onPress={handleComplete} loading={actionLoading} />
            <Pressable onPress={() => setEndOtpOpen(false)} style={styles.modalX}>
              <Text style={styles.modalXT}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.greyLight },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  map: {
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  mapLabel: { fontWeight: '800', color: colors.charcoal },
  mapSub: { color: colors.grey, fontSize: 12 },
  section: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: 14, color: colors.grey, fontWeight: '700', marginBottom: spacing.xs },
  sectionText: { fontSize: 16, color: colors.charcoal, marginTop: spacing.xs },
  callUserBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.orangeTint,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  callUserTxt: { color: colors.primary, fontWeight: '800' },
  customerActionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  chatUserBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  chatUserTxt: { color: colors.white, fontWeight: '800' },
  quoteTotal: { marginTop: spacing.sm, fontWeight: '800' },
  hintText: { marginTop: spacing.sm, color: colors.primary, fontSize: 13, lineHeight: 20 },
  customReqBox: {
    backgroundColor: colors.orangeTint,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  customReqTitle: { fontSize: 14, color: colors.primary, fontWeight: '800', marginBottom: spacing.xs },
  customReqText: { fontSize: 15, color: colors.charcoal, lineHeight: 22 },
  buttonRow: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  actionCol: { marginTop: spacing.lg, width: '100%', gap: spacing.sm },
  directionButton: { backgroundColor: colors.primary, padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.md, alignItems: 'center' },
  directionText: { color: colors.white, fontWeight: '700' },
  button: { flex: 1, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  rejectButton: { backgroundColor: colors.greyLight },
  acceptButton: { backgroundColor: colors.primary },
  editQuoteButton: { backgroundColor: colors.orangeTint },
  inProgAction: { width: '100%', padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  cancelBtn: { backgroundColor: colors.greyLight, width: '100%', padding: spacing.md },
  cancelBtnTxt: { color: colors.error, fontWeight: '800' },
  declineButton: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.warning, alignItems: 'center' },
  rejectText: { color: colors.charcoal, fontWeight: '700' },
  acceptText: { color: colors.white, fontWeight: '700' },
  declineText: { color: colors.white, fontWeight: '700' },
  statusText: { textAlign: 'center', color: colors.grey, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  title: { fontSize: 18, fontWeight: '800' },
  modalX: { marginTop: spacing.md, alignItems: 'center' },
  modalXT: { color: colors.primary, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.lg },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, elevation: 4 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: spacing.sm },
  modalSub: { color: colors.grey, marginBottom: spacing.md },
  input: { borderRadius: radius.md, backgroundColor: colors.greyLight, padding: spacing.md, marginBottom: spacing.sm },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  modalCancel: { justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  modalCancelTxt: { color: colors.charcoal, fontWeight: '700' },
  modalSave: { flex: 1 },
  cancelReasonChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  cancelReasonChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.greyLight,
  },
  cancelReasonChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  cancelReasonChipTxt: { color: colors.charcoal, fontSize: 13, fontWeight: '600' },
  cancelReasonChipTxtOn: { color: colors.white },
});
