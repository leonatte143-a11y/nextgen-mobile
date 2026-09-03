import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';
import { PartnerTabs } from '../navigation/PartnerTabs';
import { usePartner } from '../context/PartnerContext';
import { PartnerPendingApprovalScreen } from './PartnerPendingApprovalScreen';
import { ScreenLoader } from '../components/ScreenLoader';

export function PartnerHomeScreen() {
  const { profile, isLoading } = usePartner();

  if (isLoading && !profile) return <ScreenLoader />;

  // Re-checked on every app open/resume since PartnerContext refreshes on mount/token-change —
  // a still-pending or rejected partner is locked out of the dashboard until an admin approves.
  if (profile && profile.verificationStatus !== 'Verified') {
    return <PartnerPendingApprovalScreen fresh={false} />;
  }

  return (
    <View style={styles.root}>
      <PartnerTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
