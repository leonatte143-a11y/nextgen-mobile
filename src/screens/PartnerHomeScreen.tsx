import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';
import { PartnerTabs } from '../navigation/PartnerTabs';

export function PartnerHomeScreen() {
  return (
    <View style={styles.root}>
      <PartnerTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
