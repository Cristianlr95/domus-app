export type NotificationType = 'PACKAGE_RECEIVED' | 'VISIT_REGISTERED' | 'MESSAGE_RECEIVED' | 'SYSTEM_EVENT';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  referenceType: string | null;
  referenceId: string | null;
  route: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationUnreadCount {
  unreadCount: number;
}
