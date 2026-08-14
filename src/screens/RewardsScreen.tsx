import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import { REFERRAL_APP_LINK } from '../constants/referral';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function RewardsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const referralCode = user?.referralCode ?? '';

  const shareMessage = () =>
    referralCode
      ? `Join me on KAIRO using my referral code ${referralCode} and we both get rewarded! Download the app: ${REFERRAL_APP_LINK}`
      : `Join me on KAIRO - Book trusted local service partners in minutes! Download the app: ${REFERRAL_APP_LINK}`;

  const copyCode = async () => {
    if (!referralCode) return;
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareCode = () => {
    Share.share({ message: shareMessage() }).catch(() => {
      // ignore share cancellation
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Refer & Earn</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="gift" size={48} color={colors.white} />
        </View>
        <Text style={styles.heading}>Invite friends, earn rewards</Text>
        <Text style={styles.sub}>
          Share your referral code — when a friend signs up and books their first service, you both get rewarded.
        </Text>

        {user?.rewardPoints != null ? (
          <View style={styles.pointsCard}>
            <Text style={styles.pointsNum}>{user.rewardPoints}</Text>
            <Text style={styles.pointsLab}>Reward points earned</Text>
          </View>
        ) : null}

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your referral code</Text>
          <Text style={styles.codeValue}>{referralCode || '—'}</Text>
          <View style={styles.actionsRow}>
            <Pressable style={styles.actionBtn} onPress={copyCode} disabled={!referralCode}>
              <Ionicons name="copy-outline" size={18} color={colors.primary} />
              <Text style={styles.actionTxt}>{copied ? 'Copied' : 'Copy'}</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.actionBtnFilled]} onPress={shareCode}>
              <Ionicons name="share-social-outline" size={18} color={colors.white} />
              <Text style={[styles.actionTxt, styles.actionTxtFilled]}>Share</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  title: { fontSize: 18, fontWeight: '800' },
  body: { flex: 1, alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xl },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heading: { fontSize: 20, fontWeight: '800', color: colors.charcoal, textAlign: 'center' },
  sub: { fontSize: 14, color: colors.grey, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  pointsCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.orangeTint,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  pointsNum: { fontSize: 24, fontWeight: '900', color: colors.primary },
  pointsLab: { fontSize: 12, color: colors.charcoal, marginTop: 2 },
  codeCard: {
    marginTop: spacing.xl,
    width: '100%',
    backgroundColor: colors.greyLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  codeLabel: { fontSize: 13, color: colors.grey, fontWeight: '600' },
  codeValue: { fontSize: 26, fontWeight: '900', color: colors.charcoal, letterSpacing: 2, marginTop: spacing.xs },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, width: '100%' },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  actionBtnFilled: { backgroundColor: colors.primary },
  actionTxt: { fontWeight: '700', color: colors.primary },
  actionTxtFilled: { color: colors.white },
});
