import { UserRole } from '../../../core/auth/auth.models';

export type MessageStatus = 'ENVIADO' | 'LEIDO';

export interface MessagingUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: UserRole[];
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessagingUserSummary;
  recipient: MessagingUserSummary;
  content: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  readAt: string | null;
}

export interface Conversation {
  id: string;
  otherParticipant: MessagingUserSummary;
  lastMessagePreview: string | null;
  lastMessageFromCurrentUser: boolean;
  unreadCount: number;
  lastMessageAt: string;
}

export interface ConversationDetail {
  id: string;
  currentUser: MessagingUserSummary;
  otherParticipant: MessagingUserSummary;
  messages: Message[];
  unreadCount: number;
  lastMessageAt: string;
}

export interface SendMessageRequest {
  recipientUserId: string;
  content: string;
}
