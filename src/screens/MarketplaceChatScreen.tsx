import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLoader } from '../components/ScreenLoader';
import { colors, radius, spacing } from '../constants/theme';
import { marketplaceService } from '../services/marketplaceService';
import { useChatSocket } from '../hooks/useChatSocket';
import type { MarketplaceConversation, MarketplaceMessage } from '../types/marketplace';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'MarketplaceChat'>;

const ROLE = 'user' as const;

export function MarketplaceChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { listingId, otherPartyName } = route.params;

  const [conversation, setConversation] = useState<MarketplaceConversation | null>(null);
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sharing, setSharing] = useState(false);
  const listRef = useRef<FlatList<MarketplaceMessage>>(null);

  const onSocketMessage = useCallback(
    (evt: { conversationId: string; message: MarketplaceMessage }) => {
      if (!conversation || evt.conversationId !== conversation.id) return;
      setMessages((prev) => (prev.some((m) => m.id === evt.message.id) ? prev : [...prev, evt.message]));
    },
    [conversation],
  );
  const { joinRoom } = useChatSocket(ROLE, onSocketMessage);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { conversation: conv, messages: msgs } = await marketplaceService.startOrGetConversation(
          ROLE,
          listingId,
        );
        if (!active) return;
        setConversation(conv);
        setMessages(msgs);
        joinRoom(conv.id);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  useEffect(() => {
    if (messages.length) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const isSeller = conversation ? conversation.sellerRole === ROLE : false;

  const handleSend = async () => {
    if (!conversation || !draft.trim()) return;
    const text = draft.trim();
    setDraft('');
    setSending(true);
    try {
      const row = await marketplaceService.sendMessage(ROLE, conversation.id, text);
      setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
    } finally {
      setSending(false);
    }
  };

  const handleShareContact = async () => {
    if (!conversation) return;
    setSharing(true);
    try {
      const { conversation: updated, message } = await marketplaceService.shareContact(ROLE, conversation.id);
      setConversation(updated);
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    } finally {
      setSharing(false);
    }
  };

  if (loading || !conversation) return <ScreenLoader />;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{otherPartyName || 'Chat'}</Text>
        <View style={{ width: 24 }} />
      </View>
      {!conversation.contactShared ? (
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.grey} />
          <Text style={styles.privacyTxt}>Phone numbers are hidden until the seller shares contact.</Text>
        </View>
      ) : null}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={<Text style={styles.empty}>Say hello to get started.</Text>}
        renderItem={({ item }) => {
          const mine = item.senderType === ROLE;
          return (
            <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : null]}>
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.message}</Text>
                <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
      />
      {isSeller && !conversation.contactShared ? (
        <Pressable style={styles.shareBtn} onPress={handleShareContact} disabled={sharing}>
          <Ionicons name="call-outline" size={16} color={colors.white} />
          <Text style={styles.shareBtnTxt}>{sharing ? 'Sharing…' : 'Share Contact'}</Text>
        </Pressable>
      ) : null}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          placeholderTextColor={colors.grey}
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <Pressable
          style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!draft.trim() || sending}
        >
          <Ionicons name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.greyLight,
  },
  privacyTxt: { color: colors.grey, fontSize: 11 },
  list: { padding: spacing.md, flexGrow: 1 },
  empty: { textAlign: 'center', color: colors.grey, marginTop: spacing.xl },
  bubbleRow: { marginBottom: spacing.sm, alignItems: 'flex-start' },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.greyLight },
  bubbleMine: { backgroundColor: colors.primary },
  bubbleTheirs: { backgroundColor: colors.greyLight },
  bubbleText: { color: colors.charcoal, fontSize: 15 },
  bubbleTextMine: { color: colors.white },
  bubbleTime: { color: colors.grey, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.8)' },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.trustTeal,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  shareBtnTxt: { color: colors.white, fontWeight: '800', fontSize: 13 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, maxHeight: 100, backgroundColor: colors.greyLight, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 15, color: colors.charcoal },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: colors.grey },
});
