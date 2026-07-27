import { apiService } from './apiService';

export type ChatRole = 'user' | 'partner';

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderType: 'user' | 'partner' | 'admin';
  senderId?: string | null;
  message: string;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  userId?: string | null;
  partnerId?: string | null;
  bookingId?: string | null;
  status: string;
};

function basePath(role: ChatRole) {
  return role === 'user' ? '/api/v1/users/support/chat' : '/api/v1/partners/support/chat';
}

export const chatService = {
  startOrGetConversation(role: ChatRole, bookingId?: string) {
    return apiService.post<{ conversation: ChatConversation; messages: ChatMessage[] }>(
      basePath(role),
      bookingId ? { bookingId } : {},
      role,
    );
  },

  sendMessage(role: ChatRole, conversationId: string, message: string) {
    return apiService.post<ChatMessage>(`${basePath(role)}/${conversationId}/messages`, { message }, role);
  },
};
