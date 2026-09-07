import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';
import { usePartner } from '../context/PartnerContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'PartnerPendingApproval'>;

/** Shown right after registration (static copy, navigated to with `fresh: true`) and as the
 * persistent dashboard gate for any partner whose verificationStatus isn't yet 'Verified'
 * (rendered inline by PartnerHomeScreen as a plain component — pass `fresh={false}` there). */
export function PartnerPendingApprovalScreen({ fresh: freshProp }: { fresh?: boolean } = {}) {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const fresh = freshProp ?? route.params?.fresh;
  const { profile, refreshPartner } = usePartner();
  const [refreshing, setRefreshing] = useState(false);

  const rejected = !fresh && profile?.verificationStatus === 'Rejected';

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPartner();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.root}>
      <Ionicons
        name={rejected ? 'close-circle-outline' : 'hourglass-outline'}
        size={64}
        color={rejected ? colors.error : colors.primary}
      />
      <Text style={styles.title}>{rejected ? 'Application Rejected' : 'Pending'}</Text>
      <Text style={styles.subtitle}>
        {rejected
          ? 'Your application was not approved. Please contact KAIRO support for details.'
          : 'Your profile is under review. Please wait for Admin Approval before accessing your dashboard.'}
      </Text>
      {fresh ? (
        <PrimaryButton title="Go to Login" onPress={() => navigation.replace('PartnerLogin')} style={styles.btn} />
      ) : (
        <PrimaryButton
          title={refreshing ? 'Checking…' : 'Refresh status'}
          onPress={onRefresh}
          loading={refreshing}
          style={styles.btn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.white },
  title: { fontSize: 22, fontWeight: '900', color: colors.charcoal, marginTop: spacing.lg },
  subtitle: { color: colors.grey, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  btn: { marginTop: spacing.xl, alignSelf: 'stretch' },
});
