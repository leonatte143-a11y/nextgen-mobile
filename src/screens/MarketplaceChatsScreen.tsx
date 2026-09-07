import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { marketplaceService } from '../services/marketplaceService';
import type { MarketplaceConversationSummary } from '../types/marketplace';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MarketplaceChatsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [conversations, setConversations] = useState<MarketplaceConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await marketplaceService.listMyConversations('user');
      setConversations(rows);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) return <ScreenLoader />;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>Chats</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={<Text style={styles.empty}>No conversations yet.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() =>
              navigation.navigate('MarketplaceChat', {
                conversationId: item.id,
                otherPartyName: item.listingTitle,
              })
            }
          >
            {item.listingPhoto ? (
              <Image source={{ uri: item.listingPhoto }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbFallback]}>
                <Ionicons name="image-outline" size={20} color={colors.grey} />
              </View>
            )}
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle} numberOfLines={1}>{item.listingTitle}</Text>
              <Text style={styles.rowMsg} numberOfLines={1}>{item.lastMessage || 'Say hello to get started.'}</Text>
            </View>
            <Text style={styles.rowRole}>{item.role === 'seller' ? 'Selling' : 'Buying'}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 16, fontWeight: '800', flex: 1, textAlign: 'center' },
  list: { padding: spacing.md, flexGrow: 1 },
  empty: { textAlign: 'center', color: colors.grey, marginTop: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumb: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.greyLight },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1 },
  rowTitle: { fontWeight: '700', color: colors.charcoal, fontSize: 14 },
  rowMsg: { color: colors.grey, fontSize: 12, marginTop: 2 },
  rowRole: { color: colors.primary, fontWeight: '700', fontSize: 11 },
});
