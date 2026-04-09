export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'DELIVERY'
  | 'VISIT_CHECKIN'
  | 'VISIT_CHECKOUT'
  | 'MESSAGE_SENT';

export interface AuditActor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuditLogItem {
  id: string;
  entityType: string;
  entityId: string | null;
  action: AuditAction;
  summary: string;
  actor: AuditActor | null;
  occurredAt: string;
  previousData: string | null;
  newData: string | null;
  contextData: string | null;
}

export interface AuditFilters {
  entityType?: string;
  action?: AuditAction | '';
  search?: string;
}
