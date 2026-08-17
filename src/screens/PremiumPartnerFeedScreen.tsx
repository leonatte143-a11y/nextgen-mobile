import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { PremiumPartnerFeed } from '../components/health/PremiumPartnerFeed';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, spacing } from '../constants/theme';
import { catalogService } from '../services/catalogService';
import { getCoordsIfPermitted } from '../services/locationService';
import type { PartnerSummary } from '../mock/types';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'PremiumPartnerFeed'>;

export function PremiumPartnerFeedScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const insets = useSafeAreaInsets();
  const [partners, setPartners] = useState<PartnerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const coords = await getCoordsIfPermitted();
        const matches = await catalogService.searchServices(route.params.searchQuery);
        const partnerLists = await Promise.all(
          matches.slice(0, 3).map((m) => catalogService.getServicePartners(m.id, coords)),
        );
        const seen = new Set<string>();
        const merged: PartnerSummary[] = [];
        for (const list of partnerLists) {
          for (const p of list ?? []) {
            if (seen.has(p.id)) continue;
            seen.add(p.id);
            merged.push(p);
          }
        }
        setPartners(merged);
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.searchQuery]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{route.params.title}</Text>
        <View style={{ width: 24 }} />
      </View>
      {loading ? (
        <ScreenLoader />
      ) : partners.length === 0 ? (
        <EmptyState
          icon="✨"
          title="No partners available for this category right now."
          subtitle="Please check back later."
          actionLabel="Back"
          onAction={() => navigation.goBack()}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          <PremiumPartnerFeed partners={partners} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greyLight },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: colors.charcoal },
  list: { paddingVertical: spacing.md },
});
