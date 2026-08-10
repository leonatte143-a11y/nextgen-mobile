import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import { PrimaryButton } from '../components/PrimaryButton';
import { KairoTextInput } from '../components/KairoTextInput';
import { colors, radius, spacing } from '../constants/theme';
import { chatService, type ChatMessage } from '../services/chatService';
import { supportService } from '../services/supportService';
import { apiService } from '../services/apiService';
import { useChatSocket } from '../hooks/useChatSocket';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'Conversations'>;

type LinkedTicket = {
  id: string;
  subject: string;
  status: string;
  priority?: string;
} | null;

const TICKET_STATUS_COLOR: Record<string, string> = {
  open: colors.warning,
  in_progress: colors.warning,
  resolved: colors.success,
  closed: colors.grey,
  frozen: colors.error,
};

/** Single entry point for User/Partner <-> KAIRO support: merges the old separate
 * "Support" ticket-form screen and "Chat" support conversation into one screen with a
 * simple Chat / Report an Issue toggle, both backed by the same underlying support
 * relationship (SupportConversation, optionally linked to a SupportTicket). */
export function ConversationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const role = route.params?.role ?? 'user';

  const [tab, setTab] = useState<'chat' | 'report'>('chat');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ticket, setTicket] = useState<LinkedTicket>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const onSocketMessage = useCallback(
    (evt: { conversationId: string; message: ChatMessage }) => {
      if (evt.conversationId !== conversationId) return;
      setMessages((prev) => (prev.some((m) => m.id === evt.message.id) ? prev : [...prev, evt.message]));
    },
    [conversationId],
  );
  const { joinRoom } = useChatSocket(role, onSocketMessage);

  const loadConversation = useCallback(async () => {
    // General (non-booking) support conversation — same data source the old Support/Chat
    // screens used, now surfaced together with any linked ticket's status.
    const result = (await chatService.startOrGetConversation(role)) as {
      conversation: { id: string };
      messages: ChatMessage[];
      ticket?: LinkedTicket;
    };
    setConversationId(result.conversation.id);
    setMessages(result.messages);
    setTicket(result.ticket ?? null);
    joinRoom(result.conversation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        await loadConversation();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (tab === 'chat' && messages.length) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, tab]);

  const handleSend = async () => {
    if (!conversationId || !draft.trim()) return;
    const text = draft.trim();
    setDraft('');
    setSending(true);
    try {
      const row = await chatService.sendMessage(role, conversationId, text);
      setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
    } finally {
      setSending(false);
    }
  };

  const handleSubmitTicket = async () => {
    if (!subject.trim()) {
      Alert.alert('Subject required', 'Please describe the issue in one line.');
      return;
    }
    setSubmittingTicket(true);
    try {
      if (role === 'partner') {
        await apiService.post('/api/v1/partners/support/tickets', { subject: subject.trim(), description: description.trim() }, 'partner');
      } else {
        await supportService.createTicket({ subject: subject.trim(), description: description.trim() });
      }
      setSubject('');
      setDescription('');
      await loadConversation();
      setTab('chat');
      Alert.alert('Ticket created', 'Your support request has been submitted. Our team will reach out soon.');
    } catch (e) {
      Alert.alert('Unable to submit', e instanceof Error ? e.message : String(e));
    } finally {
      setSubmittingTicket(false);
    }
  };

  if (loading) return <ScreenLoader />;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top}
    >
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>KAIRO Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabRow}>
        <Pressable style={[styles.tabBtn, tab === 'chat' && styles.tabBtnActive]} onPress={() => setTab('chat')}>
          <Text style={[styles.tabTxt, tab === 'chat' && styles.tabTxtActive]}>Chat</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, tab === 'report' && styles.tabBtnActive]} onPress={() => setTab('report')}>
          <Text style={[styles.tabTxt, tab === 'report' && styles.tabTxtActive]}>Report an Issue</Text>
        </Pressable>
      </View>

      {ticket ? (
        <View style={styles.ticketBanner}>
          <View style={[styles.ticketDot, { backgroundColor: TICKET_STATUS_COLOR[ticket.status] || colors.grey }]} />
          <Text style={styles.ticketTxt} numberOfLines={1}>
            Ticket: {ticket.subject} · {ticket.status.replace('_', ' ')}
          </Text>
        </View>
      ) : null}

      {tab === 'chat' ? (
        <>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={<Text style={styles.empty}>Say hello — our support team will respond here.</Text>}
            renderItem={({ item }) => {
              const mine = item.senderType === role;
              return (
                <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : null]}>
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    {item.senderType === 'admin' ? <Text style={styles.adminTag}>KAIRO Support</Text> : null}
                    <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.message}</Text>
                    <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
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
        </>
      ) : (
        <View style={styles.reportBody}>
          <Text style={styles.label}>Subject</Text>
          <KairoTextInput
            placeholder="Short summary (e.g. partner late, refund request)"
            value={subject}
            onChangeText={setSubject}
          />
          <Text style={styles.label}>Details</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue and any relevant details."
            placeholderTextColor={colors.grey}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <PrimaryButton title="Submit support ticket" onPress={handleSubmitTicket} loading={submittingTicket} />
        </View>
      )}
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
  tabRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
    backgroundColor: colors.greyLight,
  },
  tabBtnActive: { backgroundColor: colors.primary },
  tabTxt: { fontWeight: '700', color: colors.charcoal },
  tabTxtActive: { color: colors.white },
  ticketBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.orangeTint,
  },
  ticketDot: { width: 8, height: 8, borderRadius: 4 },
  ticketTxt: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.charcoal },
  list: { padding: spacing.md, flexGrow: 1 },
  empty: { textAlign: 'center', color: colors.grey, marginTop: spacing.xl },
  bubbleRow: { marginBottom: spacing.sm, alignItems: 'flex-start' },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.greyLight,
  },
  bubbleMine: { backgroundColor: colors.primary },
  bubbleTheirs: { backgroundColor: colors.greyLight },
  bubbleText: { color: colors.charcoal, fontSize: 15 },
  bubbleTextMine: { color: colors.white },
  bubbleTime: { color: colors.grey, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.8)' },
  adminTag: { fontSize: 10, fontWeight: '800', color: colors.primary, marginBottom: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.greyLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.charcoal,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.grey },
  reportBody: { flex: 1, padding: spacing.lg },
  label: { fontWeight: '700', marginBottom: spacing.sm, color: colors.charcoal },
  textArea: {
    minHeight: 120,
    backgroundColor: colors.greyLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    textAlignVertical: 'top',
    color: colors.charcoal,
  },
});
