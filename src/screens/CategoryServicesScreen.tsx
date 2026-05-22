import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubCategoryGrid } from '../components/home/SubCategoryGrid';
import { colors, radius, spacing } from '../constants/theme';
import { filterSubServices, getMainCategory, type SubServiceItem } from '../data/serviceCatalog';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'CategoryServices'>;

export function CategoryServicesScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const category = getMainCategory(route.params.categoryId);
  const filtered = useMemo(
    () => (category ? filterSubServices(category.subServices, search) : []),
    [category, search],
  );

  const onSubPress = (item: SubServiceItem) => {
    if (!category) return;
    navigation.navigate('ServiceList', {
      bucketId: category.bucketId,
      title: item.title,
      searchQuery: item.searchQuery,
    });
  };

  if (!category) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Text style={styles.err}>Category not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {category.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={20} color={colors.grey} />
        <TextInput
          style={styles.searchIn}
          placeholder="Search services..."
          placeholderTextColor={colors.grey}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 ? (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={colors.grey} />
          </Pressable>
        ) : null}
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.empty}>No services match your search.</Text>
      ) : (
        <SubCategoryGrid items={filtered} onItemPress={onSubPress} />
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchIn: { flex: 1, paddingVertical: spacing.md, fontSize: 15, color: colors.charcoal },
  empty: { textAlign: 'center', color: colors.grey, marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  err: { padding: spacing.lg, color: colors.error },
});
