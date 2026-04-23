import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { colors, radius, spacing } from '../constants/theme';
import { useFavorites, type FavoritePartner } from '../context/FavoritesContext';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MyFavoritesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { favorites, toggleFavorite } = useFavorites();

  const renderItem = ({ item }: { item: FavoritePartner }) => (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <View style={styles.avatar}>
          <Text style={styles.av}>{item.name[0]}</Text>
        </View>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.serviceId })}
        >
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>
            ★ {item.rating.toFixed(1)} · {item.jobsCompleted} jobs
          </Text>
        </Pressable>
        <Pressable
          hitSlop={10}
          onPress={() =>
            void toggleFavorite({
              partnerId: item.partnerId,
              name: item.name,
              rating: item.rating,
              jobsCompleted: item.jobsCompleted,
              serviceId: item.serviceId,
            })
          }
        >
          <Ionicons name="heart" size={24} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );

  if (favorites.length === 0) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.top}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
          </Pressable>
          <Text style={styles.title}>My Favorites</Text>
          <View style={{ width: 24 }} />
        </View>
        <EmptyState
          icon="❤️"
          title="No favorites yet"
          subtitle="Tap the heart on a service partner card to save them here."
          actionLabel="Browse services"
          onAction={() => navigation.navigate('AllServices')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>My Favorites</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(x) => x.partnerId}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: insets.bottom + spacing.xl }}
        renderItem={renderItem}
      />
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
  title: { fontSize: 18, fontWeight: '800' },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  av: { fontSize: 18, fontWeight: '800', color: colors.primary },
  name: { fontSize: 16, fontWeight: '800', color: colors.charcoal },
  sub: { color: colors.grey, marginTop: 2, fontSize: 13 },
});
