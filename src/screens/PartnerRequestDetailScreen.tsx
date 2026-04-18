import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePartner } from '../context/PartnerContext';
import { colors, radius, spacing } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import type { PartnerStackParamList } from '../navigation/partnerStackTypes';

type Props = NativeStackScreenProps<PartnerStackParamList, 'PartnerRequestDetail'>;

export function PartnerRequestDetailScreen({ route, navigation }: Props) {
  const {
    requests,
    acceptRequest,
    rejectRequest,
    startJob,
    completeJob,
    requestHeavyWorkEstimate,
    declineHeavyWorkEstimate,
  } = usePartner();
  const [estimateOpen, setEstimateOpen] = useState(false);
  const [extraLabor, setExtraLabor] = useState('0');
  const [materialCost, setMaterialCost] = useState('0');
  const [description, setDescription] = useState('Partner recommended motor replacement');
  const [actionLoading, setActionLoading] = useState(false);

  const request = requests.find((item) => item.id === route.params.requestId);

  const handleAccept = async () => {
    setActionLoading(true);
    await acceptRequest(request!.id);
    setActionLoading(false);
    navigation.goBack();
  };

  const handleReject = async () => {
    setActionLoading(true);
    await rejectRequest(request!.id);
    setActionLoading(false);
    navigation.goBack();
  };

  const handleStart = async () => {
    setActionLoading(true);
    await startJob(request!.id);
    setActionLoading(false);
    Alert.alert('Job started', 'You can now navigate to the customer and complete the work.');
    navigation.goBack();
  };

  const handleComplete = async () => {
    setActionLoading(true);
    await completeJob(request!.id);
    setActionLoading(false);
    Alert.alert('Job completed', 'The work is finished and earnings are updated.');
    navigation.goBack();
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

  if (!request) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Request not found</Text>
      </View>
    );
  }

  const quote = request.heavyWorkEstimate;
  const isCancelled = request.status === 'cancelled';

  const statusLabel = useMemo(() => {
    if (isCancelled) return 'Cancelled by customer';
    if (quote?.status === 'pending_user_approval') return 'Quote pending approval';
    return request.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }, [isCancelled, quote?.status, request.status]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
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
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timing</Text>
        <Text style={styles.sectionText}>{request.scheduledAt}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price & Commission</Text>
        <Text style={styles.sectionText}>Customer paid ₹{request.amount}</Text>
        <Text style={styles.sectionText}>NEXGEN commission ₹{request.commission}</Text>
        <Text style={styles.sectionText}>Your share ₹{request.partnerShare}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job OTP</Text>
        <Text style={styles.sectionText}>{request.startOtp}</Text>
      </View>
      {request.extraServices?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extra Service</Text>
          {request.extraServices.map((extra) => (
            <Text key={extra.id} style={styles.sectionText}>+ {extra.name} • ₹{extra.price}</Text>
          ))}
        </View>
      ) : null}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.sectionText}>{request.notes}</Text>
      </View>
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
      {request.visitingFee ? (
        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Visiting fee secured</Text>
          <Text style={styles.sectionText}>₹{request.visitingFee} charged to customer.</Text>
          <Text style={styles.sectionText}>₹45 credited to your wallet in mock flow.</Text>
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
      <View style={styles.buttonRow}>
        {request.status === 'new' ? (
          <>
            <Pressable style={[styles.button, styles.rejectButton]} onPress={handleReject} disabled={actionLoading}>
              <Text style={styles.rejectText}>Reject</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.acceptButton]} onPress={handleAccept} disabled={actionLoading}>
              <Text style={styles.acceptText}>Accept</Text>
            </Pressable>
          </>
        ) : request.status === 'pending' ? (
          <Pressable style={[styles.button, styles.acceptButton]} onPress={handleStart} disabled={actionLoading}>
            <Text style={styles.acceptText}>Start Job</Text>
          </Pressable>
        ) : request.status === 'in_progress' ? (
          <>
            <Pressable style={[styles.button, styles.editQuoteButton]} onPress={() => setEstimateOpen(true)} disabled={actionLoading || quote?.status === 'pending_user_approval'}>
              <Text style={styles.acceptText}>Update Estimate</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.acceptButton]} onPress={handleComplete} disabled={actionLoading}>
              <Text style={styles.acceptText}>Finish Job</Text>
            </Pressable>
          </>
        ) : isCancelled ? (
          <Text style={styles.statusText}>This request was cancelled by the customer.</Text>
        ) : (
          <Text style={styles.statusText}>This request is {request.status}.</Text>
        )}
      </View>
      {quote?.status === 'pending_user_approval' ? (
        <Pressable style={styles.declineButton} onPress={handleDeclineEstimate} disabled={actionLoading}>
          <Text style={styles.declineText}>Mark as declined by customer</Text>
        </Pressable>
      ) : null}

      <Modal visible={estimateOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
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
              <PrimaryButton title="Send quote" onPress={handleSubmitEstimate} loading={actionLoading} style={styles.modalSave} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  section: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: 14, color: colors.grey, fontWeight: '700', marginBottom: spacing.xs },
  sectionText: { fontSize: 16, color: colors.charcoal, marginTop: spacing.xs },
  quoteTotal: { marginTop: spacing.sm, fontWeight: '800' },
  hintText: { marginTop: spacing.sm, color: colors.orange, fontSize: 13, lineHeight: 20 },
  statusCard: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  buttonRow: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  directionButton: { backgroundColor: colors.primary, padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.md, alignItems: 'center' },
  directionText: { color: colors.white, fontWeight: '700' },
  button: { flex: 1, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  rejectButton: { backgroundColor: colors.greyLight },
  acceptButton: { backgroundColor: colors.primary },
  editQuoteButton: { backgroundColor: colors.orangeTint },
  declineButton: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.warning, alignItems: 'center' },
  rejectText: { color: colors.charcoal, fontWeight: '700' },
  acceptText: { color: colors.white, fontWeight: '700' },
  declineText: { color: colors.white, fontWeight: '700' },
  statusText: { textAlign: 'center', color: colors.grey, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  title: { fontSize: 18, fontWeight: '800' },
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
});
