import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'PartnerHome'> };

export function PartnerHomeScreen({ navigation }: Props) {
  const { logoutPartner } = useAuth();
  const [online, setOnline] = useState(true);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.head}>
        <View>
          <Text style={styles.welcome}>Welcome, Phani</Text>
          <Text style={styles.sub}>Service Partner Panel</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avText}>P</Text>
        </View>
      </View>
      <View style={styles.rowSwitch}>
        <Text style={styles.switchLabel}>{online ? 'Online' : 'Offline'}</Text>
        <Switch value={online} onValueChange={setOnline} trackColor={{ true: colors.primary }} />
      </View>
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>4.8 ★</Text>
          <Text style={styles.statLab}>Top Rated</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>₹1,250</Text>
          <Text style={styles.statLab}>Today</Text>
        </View>
      </View>
      <View style={styles.orangeCard}>
        <Text style={styles.ocTitle}>03 New Requests</Text>
        <Text style={styles.ocSub}>Tap to accept / reject (mock)</Text>
      </View>
      <View style={styles.whiteCard}>
        <Text style={styles.wcTitle}>02 Pending</Text>
      </View>
      <View style={styles.greyCard}>
        <Text style={styles.gcTitle}>45 Completed</Text>
      </View>
      <Text style={styles.section}>Recent</Text>
      <View style={styles.item}>
        <Ionicons name="construct-outline" size={20} color={colors.primary} />
        <Text style={styles.itemTxt}>Fan Repair @ Main Road — Pending</Text>
      </View>
      <Pressable
        style={styles.out}
        onPress={async () => {
          await logoutPartner();
          navigation.replace('UserLogin');
        }}
      >
        <Text style={styles.outTxt}>Logout partner</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  content: { padding: spacing.lg, paddingTop: 48 },
  head: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: { color: colors.white, fontSize: 20, fontWeight: '800' },
  sub: { color: colors.orangeTint, marginTop: 4 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avText: { color: colors.white, fontWeight: '800', fontSize: 20 },
  rowSwitch: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  switchLabel: { fontWeight: '700', fontSize: 16 },
  stats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.md,
    elevation: 1,
  },
  statVal: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statLab: { color: colors.grey, marginTop: 4 },
  orangeCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  ocTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  ocSub: { color: colors.orangeTint, marginTop: 4 },
  whiteCard: {
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  wcTitle: { fontWeight: '800', fontSize: 16 },
  greyCard: {
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  gcTitle: { fontWeight: '800' },
  section: { marginTop: spacing.lg, fontWeight: '800', fontSize: 16 },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  itemTxt: { color: colors.charcoal },
  out: { marginTop: spacing.xl, alignItems: 'center', padding: spacing.md },
  outTxt: { color: colors.error, fontWeight: '700' },
});
