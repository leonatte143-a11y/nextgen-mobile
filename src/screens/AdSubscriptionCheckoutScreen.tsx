import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AdSubscriptionCheckout'>;

const PLAN_LABELS: Record<'image' | 'video', string> = {
  image: 'Image Banner',
  video: 'Video Banner',
};

export function AdSubscriptionCheckoutScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const [submitting, setSubmitting] = useState(false);

  const durationLabel = `${params.durationValue} ${params.durationUnit === 'months' ? 'month' : 'day'}${
    params.durationValue === 1 ? '' : 's'
  }`;

  const onContinue = () => {
    setSubmitting(true);
    Alert.alert(
      'Subscription activated',
      `Your ${PLAN_LABELS[params.planId]} campaign for ${params.businessName} is now live for ${durationLabel}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setSubmitting(false);
            navigation.popToTop();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>KAIRO Subscription</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Business</Text>
            <Text style={styles.rowValue}>{params.businessName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Plan</Text>
            <Text style={styles.rowValue}>{PLAN_LABELS[params.planId]}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Duration</Text>
            <Text style={styles.rowValue}>{durationLabel}</Text>
          </View>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total amount</Text>
          <Text style={styles.totalAmount}>₹{params.totalAmount.toLocaleString('en-IN')}</Text>
        </View>

        <PrimaryButton title="Continue" onPress={onContinue} loading={submitting} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: { color: colors.white, fontWeight: '800', fontSize: 17 },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.grey, fontWeight: '600' },
  rowValue: { color: colors.charcoal, fontWeight: '800' },
  totalCard: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalLabel: { color: colors.grey, fontWeight: '600' },
  totalAmount: { fontSize: 30, fontWeight: '900', color: colors.primary, marginTop: 4 },
});
