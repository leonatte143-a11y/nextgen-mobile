import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubCategoryGrid } from '../components/home/SubCategoryGrid';
import { colors, spacing } from '../constants/theme';
import { getMainCategory, type SubServiceItem } from '../data/serviceCatalog';
import { catalogService } from '../services/catalogService';
import { ScreenLoader } from '../components/ScreenLoader';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'CategoryServices'>;

export function CategoryServicesScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const insets = useSafeAreaInsets();
  const [navigating, setNavigating] = useState(false);

  const category = getMainCategory(route.params.categoryId);

  React.useEffect(() => {
    if (route.params.categoryId === 'life_health') {
      navigation.replace('HealthcareEmergencies');
    }
  }, [navigation, route.params.categoryId]);
  const filtered = useMemo(() => category?.subServices ?? [], [category]);

  const onSubPress = async (item: SubServiceItem) => {
    if (!category || navigating) return;
    setNavigating(true);
    try {
      const results = await catalogService.searchServices(item.searchQuery);
      const inBucket = results.filter((s) => s.bucketId === category.bucketId);
      const match = inBucket[0] ?? results[0];
      if (match) {
        navigation.navigate('ServiceProviders', { serviceId: match.id });
        return;
      }
      navigation.navigate('ServiceList', {
        bucketId: category.bucketId,
        title: item.title,
        searchQuery: item.searchQuery,
      });
    } finally {
      setNavigating(false);
    }
  };

  if (!category) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Text style={styles.err}>Category not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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

      {navigating ? <ScreenLoader /> : null}
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No services available.</Text>
      ) : (
        <SubCategoryGrid
          items={filtered}
          onItemPress={(item) => void onSubPress(item)}
          wideIds={category.id === 'professional_education' ? ['pe_eng', 'pe_super', 'pe_teacher'] : undefined}
        />
      )}
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  empty: { textAlign: 'center', color: colors.grey, marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  err: { padding: spacing.lg, color: colors.error },
});
