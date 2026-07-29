import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../constants/theme';
import type { RootStackParamList, MainTabScreenProps } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ShopsRentalsMainScreen(_props: MainTabScreenProps<'Store'>) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Shops, Materials & Rentals</Text>
        <Text style={styles.sub}>NEXGEN Market · nearby verified vendors</Text>
      </View>

      <View style={styles.cards}>
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Shop', { initialTab: 'shops' })}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="storefront-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Shops</Text>
          <Text style={styles.cardSub}>Nearby hardware, electrical & building supplies</Text>
          <View style={styles.cardArrow}>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </View>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Shop', { initialTab: 'materials' })}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="cube-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Materials & Rentals</Text>
          <Text style={styles.cardSub}>Buy, sell, or rent tools, equipment & supplies</Text>
          <View style={styles.cardArrow}>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { padding: spacing.lg, paddingBottom: spacing.md },
  title: { fontSize: 22, fontWeight: '800', color: colors.navy },
  sub: { color: colors.grey, marginTop: 4, fontSize: 13 },
  cards: { padding: spacing.lg, gap: spacing.lg, flex: 1 },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: 20, fontWeight: '900', color: colors.navy },
  cardSub: { color: colors.grey, marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: spacing.md },
  cardArrow: { position: 'absolute', right: spacing.md, top: spacing.md },
});
