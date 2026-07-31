import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import type { PartnerStackParamList } from '../../navigation/PartnerStackTypes';

const ORANGE = '#FF8C00';

type Props = {
  pendingCount: number;
  newCount: number;
  /** Lifetime successful jobs (spec: Completed History). */
  lifetimeCompleted: number;
};

export function PartnerCommandGrid({
  pendingCount,
  newCount,
  lifetimeCompleted,
}: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<PartnerStackParamList>>();
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.grid}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Pressable style={styles.wide} onPress={() => (navigation as any).navigate('Requests')}>
          <Text style={styles.wideTitle}>NEW REQUESTS</Text>
          <Text style={styles.wideCount}>{String(newCount).padStart(2, '0')}</Text>
          <Text style={styles.wideSub}>Tap to review and accept</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.row2}>
        <Pressable style={styles.card} onPress={() => (navigation as any).navigate('PartnerEnquiry')}>
          <Ionicons name="help-buoy-outline" size={22} color={ORANGE} />
          <Text style={styles.lab}>Enquiry</Text>
        </Pressable>
        <Pressable style={styles.card} onPress={() => (navigation as any).navigate('Requests')}>
          <Ionicons name="chatbubbles-outline" size={22} color={ORANGE} />
          <Text style={styles.lab}>Chat</Text>
        </Pressable>
      </View>

      <View style={styles.row2}>
        <Pressable style={styles.card} onPress={() => (navigation as any).navigate('Requests')}>
          <Ionicons name="time-outline" size={22} color={ORANGE} />
          <Text style={styles.val}>{pendingCount}</Text>
          <Text style={styles.lab}>Pending Works</Text>
        </Pressable>
        <Pressable style={styles.card} onPress={() => (navigation as any).navigate('Requests')}>
          <Ionicons name="checkmark-done-outline" size={22} color={ORANGE} />
          <Text style={styles.val}>{lifetimeCompleted}</Text>
          <Text style={styles.lab}>Completed History</Text>
        </Pressable>
      </View>

      <Pressable style={styles.galleryBtn} onPress={() => (navigation as any).navigate('PartnerGallery')}>
        <Ionicons name="images-outline" size={22} color={colors.white} />
        <Text style={styles.galleryBtnTxt}>Manage Gallery Photos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.md, marginTop: spacing.sm },
  row2: { flexDirection: 'row', gap: spacing.md },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: ORANGE,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  galleryBtnTxt: { color: colors.white, fontWeight: '800', fontSize: 15 },
  nexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: ORANGE,
  },
  nexTitle: { fontWeight: '800', color: colors.charcoal, fontSize: 16 },
  nexVal: { color: colors.grey, fontSize: 12, marginTop: 2 },
  val: { fontSize: 20, fontWeight: '900', color: colors.charcoal, marginTop: 4 },
  lab: { color: colors.grey, fontSize: 12, marginTop: 4, fontWeight: '600' },
  labSm: { color: colors.charcoal, fontSize: 12, marginTop: 6, fontWeight: '700' },
  wide: {
    backgroundColor: ORANGE,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  wideTitle: { color: colors.white, fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  wideCount: { color: colors.white, fontSize: 32, fontWeight: '900', marginTop: 4 },
  wideSub: { color: colors.orangeTint, fontSize: 12, marginTop: 4, fontWeight: '600' },
});
