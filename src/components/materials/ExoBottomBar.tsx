import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../../constants/theme';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ITEMS = [
  { key: 'home', label: 'Home', icon: 'home-outline' as const },
  { key: 'chats', label: 'Chats', icon: 'chatbubble-outline' as const },
  { key: 'sell', label: '', icon: 'add' as const },
  { key: 'myads', label: 'My Ads', icon: 'pricetags-outline' as const },
  { key: 'account', label: 'Account', icon: 'person-outline' as const },
];

export function ExoBottomBar() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const onPress = (key: string) => {
    switch (key) {
      case 'home':
<<<<<<< HEAD
        navigation.navigate('Home' as never);
        break;
      case 'account':
        navigation.navigate('Profile' as never);
=======
        navigation.getParent()?.navigate('Home' as never);
        break;
      case 'account':
        navigation.getParent()?.navigate('Profile' as never);
>>>>>>> 6ccd495c76401a8f3fadeea32d010ad09a813778
        break;
      case 'sell':
        navigation.navigate('PostListing');
        break;
      case 'chats':
        navigation.navigate('MarketplaceChats');
        break;
      case 'myads':
        navigation.navigate('MyMarketplaceListings');
        break;
    }
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {ITEMS.map((item) =>
        item.key === 'sell' ? (
          <Pressable key={item.key} style={styles.sellWrap} onPress={() => onPress(item.key)}>
            <View style={styles.sellFab}>
              <Ionicons name="add" size={28} color={colors.white} />
            </View>
            <Text style={styles.sellLabel}>Sell</Text>
          </Pressable>
        ) : (
          <Pressable key={item.key} style={styles.item} onPress={() => onPress(item.key)}>
            <Ionicons name={item.icon} size={22} color={colors.grey} />
            <Text style={styles.itemLabel}>{item.label}</Text>
          </Pressable>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  item: { alignItems: 'center', gap: 2, minWidth: 56 },
  itemLabel: { fontSize: 11, color: colors.grey, fontWeight: '600' },
  sellWrap: { alignItems: 'center', marginTop: -28 },
  sellFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  sellLabel: { fontSize: 11, color: colors.primary, fontWeight: '800', marginTop: 2 },
});
