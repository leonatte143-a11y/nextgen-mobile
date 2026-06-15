import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import { emergencyService } from '../services/emergencyService';
import { getCurrentCoords } from '../services/locationService';

export function AmbulanceSosScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const triggerSos = async () => {
    setLoading(true);
    try {
      const coords = await getCurrentCoords();
      if (!coords) {
        Alert.alert('Location needed', 'Enable GPS so dispatch can find you.');
        return;
      }
      const res = await emergencyService.triggerSos(coords);
      const phone = res.dispatchPhone?.replace(/\D/g, '') || '108';
      void Linking.openURL(`tel:+91${phone}`);
      Alert.alert(
        'Emergency alert sent',
        'Your live location was shared with nearby ambulance partners. The dialer is opening now.',
      );
    } catch (e) {
      Alert.alert('SOS failed', e instanceof Error ? e.message : 'Please try again or call 108.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Emergency Ambulance</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.body}>
        <Ionicons name="medkit" size={64} color={colors.emergency} />
        <Text style={styles.title}>Immediate medical transport</Text>
        <Text style={styles.sub}>
          Tap below to call dispatch and silently share your live GPS with the nearest ambulance partner.
          No cart or promo codes — built for emergencies.
        </Text>
        <Pressable
          style={[styles.sosBtn, loading && styles.sosBtnDisabled]}
          onPress={() => void triggerSos()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.sosEmoji}>🚨</Text>
              <Text style={styles.sosTxt}>SOS — TAP TO CALL AMBULANCE</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.white, fontWeight: '800', fontSize: 17 },
  body: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: colors.navy, marginTop: spacing.lg, textAlign: 'center' },
  sub: { color: colors.slate, textAlign: 'center', marginTop: spacing.md, lineHeight: 22 },
  sosBtn: {
    marginTop: spacing.xl,
    width: '100%',
    backgroundColor: colors.emergency,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  sosBtnDisabled: { opacity: 0.7 },
  sosEmoji: { fontSize: 22 },
  sosTxt: { color: colors.white, fontWeight: '900', fontSize: 16 },
});
