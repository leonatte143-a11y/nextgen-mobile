import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';
import type { PartnerStackParamList } from '../../navigation/PartnerStackTypes';

const ORANGE = '#FF8C00';

type Props = {
  todayEarnings: number;
  pendingCount: number;
  newCount: number;
  /** Lifetime successful jobs (spec: Completed History). */
  lifetimeCompleted: number;
  nexgenPoints: number;
};

export function PartnerCommandGrid({
  todayEarnings,
  pendingCount,
  newCount,
  lifetimeCompleted,
  nexgenPoints,
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
      <View style={styles.row2}>
        <Pressable
          style={styles.card}
          onPress={() => (navigation as any).navigate('Earnings')}
        >
          <Ionicons name="cash-outline" size={22} color={ORANGE} />
          <Text style={styles.val}>₹{todayEarnings}</Text>
          <Text style={styles.lab}>{"Today's Earnings"}</Text>
        </Pressable>
        <Pressable style={styles.card} onPress={() => (navigation as any).navigate('Requests')}>
          <Ionicons name="time-outline" size={22} color={ORANGE} />
          <Text style={styles.val}>{pendingCount}</Text>
          <Text style={styles.lab}>Pending Works</Text>
        </Pressable>
      </View>

      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Pressable style={styles.wide} onPress={() => (navigation as any).navigate('Requests')}>
          <Text style={styles.wideTitle}>NEW REQUESTS</Text>
          <Text style={styles.wideCount}>{String(newCount).padStart(2, '0')}</Text>
          <Text style={styles.wideSub}>Tap to review and accept</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.row2}>
        <Pressable
          style={styles.card}
          onPress={() => (navigation as any).navigate('MyServices')}
        >
          <Ionicons name="pricetag-outline" size={22} color={ORANGE} />
          <Text style={styles.labSm}>My Services</Text>
        </Pressable>
        <Pressable style={styles.card} onPress={() => (navigation as any).navigate('Requests')}>
          <Ionicons name="checkmark-done-outline" size={22} color={ORANGE} />
          <Text style={styles.val}>{lifetimeCompleted}</Text>
          <Text style={styles.lab}>Completed History</Text>
        </Pressable>
      </View>

      <View style={styles.nexRow} accessibilityLabel="NEXGEN points balance">
        <Ionicons name="ribbon-outline" size={24} color={ORANGE} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.nexTitle}>NEXGEN Points</Text>
          <Text style={styles.nexVal}>{nexgenPoints} pts</Text>
        </View>
        <Ionicons name="trophy-outline" size={22} color={colors.grey} />
      </View>
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
