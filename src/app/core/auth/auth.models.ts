export type UserRole = 'ADMIN' | 'CONSERJERIA' | 'RESIDENTE';
export type PermissionCode =
  | 'visits.read'
  | 'visits.create'
  | 'visits.update'
  | 'packages.read'
  | 'packages.create'
  | 'packages.update'
  | 'bookings.read'
  | 'bookings.create'
  | 'bookings.update'
  | 'properties.read'
  | 'properties.manage'
  | 'residents.read'
  | 'residents.manage'
  | 'units.read'
  | 'units.manage'
  | 'parking.read'
  | 'parking.manage'
  | 'storages.read'
  | 'storages.manage'
  | 'messaging.read'
  | 'messaging.create'
  | 'notifications.read'
  | 'concierge.dashboard.read'
  | 'users.read'
  | 'users.manage'
  | 'roles.read'
  | 'permissions.read'
  | 'admin.dashboard.read'
  | 'audit.read';

export const PERMISSIONS = {
  VISITS_READ: 'visits.read',
  VISITS_CREATE: 'visits.create',
  VISITS_UPDATE: 'visits.update',
  PACKAGES_READ: 'packages.read',
  PACKAGES_CREATE: 'packages.create',
  PACKAGES_UPDATE: 'packages.update',
  BOOKINGS_READ: 'bookings.read',
  BOOKINGS_CREATE: 'bookings.create',
  BOOKINGS_UPDATE: 'bookings.update',
  PROPERTIES_READ: 'properties.read',
  PROPERTIES_MANAGE: 'properties.manage',
  RESIDENTS_READ: 'residents.read',
  RESIDENTS_MANAGE: 'residents.manage',
  UNITS_READ: 'units.read',
  UNITS_MANAGE: 'units.manage',
  PARKING_READ: 'parking.read',
  PARKING_MANAGE: 'parking.manage',
  STORAGES_READ: 'storages.read',
  STORAGES_MANAGE: 'storages.manage',
  MESSAGING_READ: 'messaging.read',
  MESSAGING_CREATE: 'messaging.create',
  NOTIFICATIONS_READ: 'notifications.read',
  CONCIERGE_DASHBOARD_READ: 'concierge.dashboard.read',
  USERS_READ: 'users.read',
  USERS_MANAGE: 'users.manage',
  ROLES_READ: 'roles.read',
  PERMISSIONS_READ: 'permissions.read',
  ADMIN_DASHBOARD_READ: 'admin.dashboard.read',
  AUDIT_READ: 'audit.read',
} as const;

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  roles: UserRole[];
  permissions: PermissionCode[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}
