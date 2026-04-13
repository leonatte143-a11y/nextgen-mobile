import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePartner } from '../context/PartnerContext';
import { colors, radius, spacing } from '../constants/theme';
import type { PartnerStackParamList } from '../navigation/partnerStackTypes';

type Props = NativeStackScreenProps<PartnerStackParamList, 'PartnerRequestDetail'>;

export function PartnerRequestDetailScreen({ route, navigation }: Props) {
  const { requests, acceptRequest, rejectRequest, startJob, completeJob } = usePartner();
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
      <View style={styles.buttonRow}>
        {request.status === 'new' ? (
          <>
            <Pressable style={[styles.button, styles.rejectButton]} onPress={handleReject}>
              <Text style={styles.rejectText}>Reject</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.acceptButton]} onPress={handleAccept}>
              <Text style={styles.acceptText}>Accept</Text>
            </Pressable>
          </>
        ) : request.status === 'pending' ? (
          <Pressable style={[styles.button, styles.acceptButton]} onPress={handleStart}>
            <Text style={styles.acceptText}>Start Job</Text>
          </Pressable>
        ) : request.status === 'in_progress' ? (
          <Pressable style={[styles.button, styles.acceptButton]} onPress={handleComplete}>
            <Text style={styles.acceptText}>Finish Job</Text>
          </Pressable>
        ) : (
          <Text style={styles.statusText}>This request is {request.status}.</Text>
        )}
      </View>
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
});
