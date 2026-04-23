import React, { useState } from 'react';
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
import type { PartnerStackParamList } from '../navigation/PartnerStackTypes';

type Props = NativeStackScreenProps<PartnerStackParamList, 'PartnerRequestDetail'>;

export function PartnerRequestDetailScreen({ route, navigation }: Props) {
  const { requests, acceptRequest, rejectRequest, startJob, completeJob, submitEstimateUpdate, cancelActiveJobWithFee } =
    usePartner();
  const [estOpen, setEstOpen] = useState(false);
  const [estVal, setEstVal] = useState('');
  const [canceling, setCanceling] = useState(false);
  const request = requests.find((item) => item.id === route.params.requestId);

  if (!request) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Request not found</Text>
      </View>
    );
  }

  const handleAccept = async () => {
    await acceptRequest(request.id);
    navigation.goBack();
  };

  const handleReject = async () => {
    await rejectRequest(request.id);
    navigation.goBack();
  };

  const handleStart = async () => {
    await startJob(request.id);
    Alert.alert('Job started', 'You can now navigate to the customer and complete the work.');
    navigation.goBack();
  };

  const handleComplete = async () => {
    await completeJob(request.id);
    Alert.alert('Job completed', 'The work is finished and earnings are updated.');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
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
      {request.pendingEstimateAmount != null ? (
        <View style={styles.pendBox}>
          <Text style={styles.pendT}>Waiting for user approval (mock) — new estimate ₹{request.pendingEstimateAmount}</Text>
        </View>
      ) : null}
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
      <Pressable style={styles.directionButton} onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(request.address)}`)}>
        <Text style={styles.directionText}>Open Directions</Text>
      </Pressable>
      <View style={request.status === 'new' ? styles.buttonRow : styles.actionCol}>
        {request.status === 'new' ? (
          <>
            <Pressable style={[styles.button, styles.rejectButton]} onPress={handleReject}>
              <Text style={styles.rejectText}>Reject</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.acceptButton]} onPress={handleAccept}>
              <Text style={styles.acceptText}>Accept</Text>
            </Pressable>
          </>
        ) : request.status === 'pending' || request.status === 'in_progress' ? (
          <View style={styles.inProgCol}>
            <Pressable
              style={[styles.button, styles.estimateBtn]}
              onPress={() => {
                setEstVal(String(request.amount));
                setEstOpen(true);
              }}
            >
              <Text style={styles.estimateBtnTxt}>🛠️ Update Estimate</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.cancelBtn]}
              onPress={async () => {
                if (canceling) return;
                Alert.alert(
                  request.status === 'in_progress' ? 'Cancel job' : 'Cancel',
                  'A ₹50 visiting fee (mock) will be credited to your wallet. Continue?',
                  [
                    { text: 'No', style: 'cancel' },
                    {
                      text: 'Yes',
                      onPress: async () => {
                        setCanceling(true);
                        try {
                          await cancelActiveJobWithFee(request.id);
                          Alert.alert('Cancelled', '₹50 Visiting Fee credited to your wallet (mock).');
                          navigation.goBack();
                        } catch {
                          Alert.alert('Error', 'Could not cancel (mock).');
                        } finally {
                          setCanceling(false);
                        }
                      },
                    },
                  ],
                );
              }}
            >
              <Text style={styles.cancelBtnTxt}>Cancel job</Text>
            </Pressable>
            {request.status === 'pending' ? (
              <Pressable style={[styles.button, styles.acceptButton]} onPress={handleStart}>
                <Text style={styles.acceptText}>Start Job</Text>
              </Pressable>
            ) : (
              <Pressable style={[styles.button, styles.acceptButton]} onPress={handleComplete}>
                <Text style={styles.acceptText}>Finish Job</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <Text style={styles.statusText}>This request is {request.status}.</Text>
        )}
      </View>
      <Modal visible={estOpen} animationType="slide" transparent>
        <View style={styles.modalRoot}>
          <View style={styles.modalCard}>
            <Text style={styles.modalH}>Update estimate (mock)</Text>
            <Text style={styles.modalP}>The customer will need to accept the new amount in-app (mock flow).</Text>
            <TextInput
              value={estVal}
              onChangeText={setEstVal}
              keyboardType="number-pad"
              style={styles.inp}
              placeholder="Revised price (₹)"
            />
            <PrimaryButton
              title="Submit for approval"
              onPress={async () => {
                const n = Math.max(0, Math.floor(parseFloat(estVal) || 0));
                if (!n) {
                  Alert.alert('Amount', 'Enter a valid number.');
                  return;
                }
                await submitEstimateUpdate(request.id, n);
                setEstOpen(false);
                Alert.alert('Sent', 'Waiting for user approval (mock). The customer will see the revised estimate in their app.');
              }}
            />
            <Pressable onPress={() => setEstOpen(false)} style={styles.modalX}>
              <Text style={styles.modalXT}>Close</Text>
            </Pressable>
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
  buttonRow: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  directionButton: { backgroundColor: colors.primary, padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.md, alignItems: 'center' },
  directionText: { color: colors.white, fontWeight: '700' },
  button: { flex: 1, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  rejectButton: { backgroundColor: colors.greyLight },
  acceptButton: { backgroundColor: colors.primary },
  rejectText: { color: colors.charcoal, fontWeight: '700' },
  acceptText: { color: colors.white, fontWeight: '700' },
  statusText: { textAlign: 'center', color: colors.grey, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  title: { fontSize: 18, fontWeight: '800' },
  pendBox: { backgroundColor: colors.orangeTint, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.primary },
  pendT: { fontWeight: '700', color: colors.charcoal, fontSize: 13 },
  actionCol: { marginTop: spacing.lg, width: '100%', gap: spacing.sm },
  inProgCol: { width: '100%', gap: spacing.sm },
  estimateBtn: { backgroundColor: colors.orangeTint, borderWidth: 1, borderColor: colors.primary, width: '100%', flex: undefined, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  estimateBtnTxt: { color: colors.primary, fontWeight: '800' },
  cancelBtn: { backgroundColor: colors.greyLight, width: '100%', flex: undefined, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  cancelBtnTxt: { color: colors.error, fontWeight: '800' },
  modalRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: spacing.lg },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg },
  modalH: { fontSize: 18, fontWeight: '800' },
  modalP: { color: colors.grey, marginTop: 8, marginBottom: spacing.md, fontSize: 13 },
  inp: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: 16, marginBottom: spacing.md },
  modalX: { marginTop: spacing.md, alignItems: 'center' },
  modalXT: { color: colors.primary, fontWeight: '700' },
});
