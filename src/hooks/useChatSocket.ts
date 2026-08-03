import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { BASE_URL } from '../config/api';
import { authStorageKeys } from '../context/AuthContext';
import type { ChatRole } from '../services/chatService';

type MessageEvent<TMessage> = { conversationId: string; message: TMessage };

/** Connects to the KAIRO Socket.IO server so messages between two chat participants
 * sync in real time without polling. Generic over message shape so both the Support
 * Chat (User/Partner/Admin) and the P2P Marketplace chat can share this hook. */
export function useChatSocket<TMessage = unknown>(
  role: ChatRole,
  onMessage: (evt: MessageEvent<TMessage>) => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const joinedRef = useRef<Set<string>>(new Set());
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let cancelled = false;
    let socket: Socket | null = null;
    const joined = joinedRef.current;

    (async () => {
      const key = role === 'user' ? authStorageKeys.userToken : authStorageKeys.partnerToken;
      const token = await AsyncStorage.getItem(key);
      if (!token || cancelled) return;

      socket = io(BASE_URL, {
        path: '/socket.io',
        auth: { token, role },
        transports: ['websocket'],
      });
      socketRef.current = socket;
      socket.on('message:new', (evt: MessageEvent<TMessage>) => onMessageRef.current(evt));
    })();

    return () => {
      cancelled = true;
      socket?.disconnect();
      socketRef.current = null;
      joined.clear();
    };
  }, [role]);

  const joinRoom = (conversationId: string) => {
    if (!conversationId || joinedRef.current.has(conversationId)) return;
    socketRef.current?.emit('join_conversation', conversationId);
    joinedRef.current.add(conversationId);
  };

  return { joinRoom };
}
