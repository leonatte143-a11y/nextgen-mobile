import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'BookingSuccess'>;

export function BookingSuccessScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();

  return (
    <View style={styles.root}>
      <Text style={styles.tick}>✓</Text>
      <Text style={styles.h1}>Booking Confirmed!</Text>
      <Text style={styles.sub}>Partner is on the way.</Text>
      <View style={styles.btn}>
        <PrimaryButton
          title="Track booking"
          variant="inverse"
          onPress={() => navigation.replace('LiveBooking', { bookingId: route.params.bookingId })}
        />
      </View>
      <Pressable
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
        style={({ pressed }) => [styles.linkHome, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.linkHomeTxt}>Back to home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  tick: { fontSize: 72, color: colors.white, fontWeight: '900' },
  h1: { fontSize: 24, fontWeight: '800', color: colors.white, marginTop: spacing.lg },
  sub: { color: colors.orangeTint, marginTop: spacing.sm },
  btn: { marginTop: spacing.xl, alignSelf: 'stretch' },
  linkHome: { marginTop: spacing.lg, padding: spacing.md },
  linkHomeTxt: { color: colors.white, fontWeight: '700', textDecorationLine: 'underline' },
});
