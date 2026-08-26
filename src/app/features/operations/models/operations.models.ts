export type OperationsSummary = Record<string, number>;
export type OperationsRow = Record<string, unknown>;

export interface OperationsResource {
  key: string;
  label: string;
  icon: string;
  resource: string;
  description: string;
}

export interface OperationsAction {
  key: string;
  label: string;
  method: 'POST' | 'PATCH';
  path: string;
  requiresId?: boolean;
  permissions?: PermissionCode[];
  sample: Record<string, unknown>;
}
import { PermissionCode } from '../../../core/auth/auth.models';
